from flask import request, g, Response
from flask_restful import Resource
from models.student import StudentModel
import json
from utils.auth_middleware import require_role
import os
import logging
import uuid
try:
    import boto3
    from botocore.exceptions import ClientError
except Exception:
    boto3 = None
    ClientError = Exception


class StudentResource(Resource):
    @require_role('admin')
    def post(self):
        data = request.get_json()

        # if StudentModel.find_by_id(g.student):
        #     return {'message': 'Student already exists'}, 400
        if (
            not data.get('given_name')
            or not data.get('middle_name')
            or not data.get('surname')
            or not data.get('date_of_birth')
            or not data.get('gender')
            or not data.get('enrollment_date')
            or not data.get('email')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)

        new_student = StudentModel(**data)
        new_student.save_to_db()

        # Generate username FIRST (before Cognito operations) so it's always saved
        given_name = (data.get('given_name') or '').strip()
        middle_name = (data.get('middle_name') or '').strip()
        surname = (data.get('surname') or '').strip()
        
        username_parts = []
        if given_name:
            username_parts.append(given_name[0].lower())
        if middle_name:
            # Take first letter of last word (to skip articles like "de", "da", etc.)
            middle_words = middle_name.split()
            if middle_words:
                username_parts.append(middle_words[-1][0].lower())
        if surname:
            username_parts.append(surname.lower())
        
        unique_username = ''.join(username_parts) if username_parts else f"student_{uuid.uuid4().hex[:12]}"
        
        # Save username to database IMMEDIATELY (before Cognito operations)
        new_student.username = unique_username
        new_student.save_to_db()

        # Optionally create a Cognito user if email is provided and AWS is configured
        cognito_result = None
        email = data.get('email') or data.get('account_email')
        user_pool_id = os.getenv('AWS_COGNITO_USERPOOL_ID')
        group_name = os.getenv('AWS_COGNITO_STUDENT_GROUP', 'students')
        aws_region = os.getenv('AWS_REGION') or os.getenv('COGNITO_REGION_NAME', 'eu-west-1')

        if email and user_pool_id and boto3 is not None:
            try:
                cognito = boto3.client('cognito-idp', region_name=aws_region)
                
                logging.info(f"Creating Cognito user: username={unique_username}, email={email}, pool={user_pool_id}")
                
                try:
                    # Try to create user with email delivery first
                    cognito.admin_create_user(
                        UserPoolId=user_pool_id,
                        Username=unique_username,
                        UserAttributes=[
                            {'Name': 'email', 'Value': email},
                            {'Name': 'email_verified', 'Value': 'true'},
                        ],
                        DesiredDeliveryMediums=['EMAIL']
                    )
                    logging.info(f"Cognito user created successfully with email: {unique_username}")
                except ClientError as email_limit_error:
                    # If email limit exceeded, create user without sending email
                    if email_limit_error.response.get('Error', {}).get('Code') == 'LimitExceededException':
                        logging.warning(f"Email limit exceeded, creating user without email delivery: {unique_username}")
                        cognito.admin_create_user(
                            UserPoolId=user_pool_id,
                            Username=unique_username,
                            UserAttributes=[
                                {'Name': 'email', 'Value': email},
                                {'Name': 'email_verified', 'Value': 'true'},
                            ],
                            MessageAction='SUPPRESS'  # Suppress email to avoid limit
                        )
                        logging.info(f"Cognito user created successfully (email suppressed): {unique_username}")
                    else:
                        # Re-raise if it's a different error
                        raise
                
                # Add to student group - try unique_username first, fallback to email
                try:
                    cognito.admin_add_user_to_group(
                        UserPoolId=user_pool_id,
                        Username=unique_username,
                        GroupName=group_name
                    )
                    logging.info(f"User {unique_username} added to group '{group_name}'")
                except ClientError as group_e:
                    # If unique_username fails, try email (since it's an alias)
                    logging.warning(f"Failed to add user to group with username, trying email: {group_e}")
                    try:
                        cognito.admin_add_user_to_group(
                            UserPoolId=user_pool_id,
                            Username=email,
                            GroupName=group_name
                        )
                        logging.info(f"User {email} added to group '{group_name}' using email")
                    except ClientError as email_e:
                        logging.error(f"CRITICAL: Failed to add user to group '{group_name}' (tried both username and email): {group_e}, {email_e}")
                        # Don't fail the whole operation, but log it as an error
                cognito_result = 'created'
            except ClientError as e:
                error_code = getattr(e, 'response', {}).get('Error', {}).get('Code')
                error_message = getattr(e, 'response', {}).get('Error', {}).get('Message', str(e))
                
                logging.error(f"Cognito ClientError: Code={error_code}, Message={error_message}")
                
                if error_code == 'UsernameExistsException':
                    logging.info(f"User {unique_username} already exists in Cognito, adding to group")
                    try:
                        cognito = boto3.client('cognito-idp', region_name=aws_region)
                        # Username already saved above, just use it to add to group
                        try:
                            cognito.admin_add_user_to_group(
                                UserPoolId=user_pool_id,
                                Username=unique_username,
                                GroupName=group_name
                            )
                            logging.info(f"Existing user {unique_username} added to group '{group_name}'")
                        except Exception:
                            # Fallback to email if username doesn't work
                            try:
                                cognito.admin_add_user_to_group(
                                    UserPoolId=user_pool_id,
                                    Username=email,
                                    GroupName=group_name
                                )
                                logging.info(f"Existing user {email} added to group '{group_name}' using email")
                            except Exception as inner:
                                logging.error(f"CRITICAL: Add existing user to group failed (tried both username and email): {inner}")
                    except Exception as inner:
                        logging.error(f"CRITICAL: Failed to add existing user to group: {inner}")
                    cognito_result = 'exists'
                else:
                    logging.error(f"CRITICAL: Cognito user creation FAILED - Code: {error_code}, Message: {error_message}")
                    logging.error(f"Failed to create user: username={unique_username}, email={email}, pool={user_pool_id}")
                    # Re-raise the exception so we know it failed
                    raise Exception(f"Cognito user creation failed: {error_code} - {error_message}")
            except Exception as e:
                # Catch all other exceptions (like NoCredentialsError, network errors, etc.)
                error_msg = str(e)
                logging.error(f"CRITICAL: Cognito setup issue - {error_msg}")
                logging.error(f"Error type: {type(e).__name__}")
                # Re-raise so we know Cognito failed
                raise Exception(f"Cognito user creation failed: {error_msg}")
        elif email and boto3 is None:
            logging.warning("boto3 not available; skipping Cognito user creation")

        body = new_student.json()
        if cognito_result:
            body['cognito'] = cognito_result

        response = {
            'success': True,
            'message': body
        }
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific student by ID
            student = StudentModel.find_by_id(id)
            if student is None:
                response = {
                    'success': False,
                    'message': 'Student not found'
                }
                return Response(json.dumps(response), 404)
            response = {
                'success': True,
                'message': student.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all students or search by name
            given_name = request.args.get('given_name')
            middle_name = request.args.get('middle_name')
            surname = request.args.get('surname')
            
            if given_name or middle_name or surname:
                # Search by full name
                students = StudentModel.find_by_full_name(given_name, middle_name, surname)
            else:
                # Get all students
                students = StudentModel.find_all()
            
            students_list = [student.json_with_year_levels() for student in students]
            response = {
                'success': True,
                'message': students_list
            }
            return Response(json.dumps(response), 200)

    @require_role('admin')
    def put(self):
        data = request.get_json()
        id = data.get('_id')
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.update_entry(data)
        response = {
            'success': True,
            'message': student.json()
        }
        return Response(json.dumps(response), 200)

    @require_role('admin')
    def delete(self, id):
        student = StudentModel.find_by_id(id)

        if student is None:
            return {'message': 'Student not found'}, 404

        student.delete_by_id(id)
        return {'message': 'Student deleted'}, 200
