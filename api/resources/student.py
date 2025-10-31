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

        # Optionally create a Cognito user if email is provided and AWS is configured
        cognito_result = None
        email = data.get('email') or data.get('account_email')
        user_pool_id = os.getenv('AWS_COGNITO_USERPOOL_ID')
        group_name = os.getenv('AWS_COGNITO_STUDENT_GROUP', 'student')
        aws_region = os.getenv('AWS_REGION') or os.getenv('COGNITO_REGION_NAME', 'eu-west-1')

        if email and user_pool_id and boto3 is not None:
            try:
                cognito = boto3.client('cognito-idp', region_name=aws_region)
                # Generate username from initials + surname (e.g., "Maria de Jesus Carreiras" -> "mjcarreiras")
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
                
                cognito.admin_create_user(
                    UserPoolId=user_pool_id,
                    Username=unique_username,
                    UserAttributes=[
                        {'Name': 'email', 'Value': email},
                        {'Name': 'email_verified', 'Value': 'true'},
                    ],
                    DesiredDeliveryMediums=['EMAIL']
                    # Removed MessageAction='SUPPRESS' so Cognito sends welcome email with temporary password
                )
                
                # Save username to student record
                new_student.username = unique_username
                new_student.save_to_db()
                # Add to student group - try unique_username first, fallback to email
                try:
                    cognito.admin_add_user_to_group(
                        UserPoolId=user_pool_id,
                        Username=unique_username,
                        GroupName=group_name
                    )
                except ClientError as group_e:
                    # If unique_username fails, try email (since it's an alias)
                    try:
                        cognito.admin_add_user_to_group(
                            UserPoolId=user_pool_id,
                            Username=email,
                            GroupName=group_name
                        )
                    except ClientError as email_e:
                        logging.warning(f"Failed to add user to group '{group_name}' (tried both username and email): {group_e}, {email_e}")
                cognito_result = 'created'
            except ClientError as e:
                if getattr(e, 'response', {}).get('Error', {}).get('Code') == 'UsernameExistsException':
                    try:
                        cognito = boto3.client('cognito-idp', region_name=aws_region)
                        # Generate the same username format to try adding to group
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
                        
                        generated_username = ''.join(username_parts) if username_parts else None
                        
                        # Save username to student record if user already exists
                        if generated_username:
                            new_student.username = generated_username
                            new_student.save_to_db()
                        
                        # Try generated username first (if available), then email
                        if generated_username:
                            try:
                                cognito.admin_add_user_to_group(
                                    UserPoolId=user_pool_id,
                                    Username=generated_username,
                                    GroupName=group_name
                                )
                            except Exception:
                                # Fallback to email if generated username doesn't work
                                try:
                                    cognito.admin_add_user_to_group(
                                        UserPoolId=user_pool_id,
                                        Username=email,
                                        GroupName=group_name
                                    )
                                except Exception as inner:
                                    logging.warning(f"Add existing user to group failed (tried both username and email): {inner}")
                        else:
                            # If no generated username, try email directly
                            try:
                                cognito.admin_add_user_to_group(
                                    UserPoolId=user_pool_id,
                                    Username=email,
                                    GroupName=group_name
                                )
                            except Exception as inner:
                                logging.warning(f"Add existing user to group failed (email only): {inner}")
                    except Exception as inner:
                        logging.warning(f"Add existing user to group failed: {inner}")
                    cognito_result = 'exists'
                else:
                    logging.warning(f"Cognito user creation failed: {e}")
                    cognito_result = 'error'
            except Exception as e:
                # Catch all other exceptions (like NoCredentialsError)
                logging.warning(f"Cognito setup issue (missing credentials?): {e}")
                cognito_result = 'error'
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
