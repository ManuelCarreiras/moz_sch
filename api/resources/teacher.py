from flask import request, Response
from flask_restful import Resource
from models.teacher import TeacherModel
from models.department import DepartmentModel
from utils.auth_middleware import require_role
import json
import os
import logging
import uuid
from uuid import UUID
try:
    import boto3
    from botocore.exceptions import ClientError
except Exception:
    boto3 = None
    ClientError = Exception


class TeacherResource(Resource):
    @require_role('admin')
    def post(self):
        data = request.get_json()

        # if TeacherModel.find_by_id(g.professor):
        #     return {'message': 'Professor already exists'}, 400
        if (
            not data.get('given_name')
            or not data.get('surname')
            or not data.get('gender')
            or not data.get('email_address')
            or not data.get('phone_number')
        ):
            response = {
                'success': False,
                'message': 'Missing required fields'
            }
            return Response(json.dumps(response), 400)

        # Remove department_id from teacher creation - will be handled separately
        teacher_data = {k: v for k, v in data.items() if k != 'department_id'}
        new_professor: TeacherModel = TeacherModel(**teacher_data)
        new_professor.save_to_db()

        # Optionally create a Cognito user if email is provided and AWS is configured
        cognito_result = None
        email = data.get('email_address')
        user_pool_id = os.getenv('AWS_COGNITO_USERPOOL_ID')
        group_name = os.getenv('AWS_COGNITO_TEACHER_GROUP', 'teachers')
        aws_region = os.getenv('AWS_REGION') or os.getenv('COGNITO_REGION_NAME', 'eu-west-1')

        if email and user_pool_id and boto3 is not None:
            try:
                cognito = boto3.client('cognito-idp', region_name=aws_region)
                # Generate username from first initial + surname (e.g., "John Smith" -> "jsmith")
                given_name = (data.get('given_name') or '').strip()
                surname = (data.get('surname') or '').strip()
                
                username_parts = []
                if given_name:
                    username_parts.append(given_name[0].lower())
                if surname:
                    username_parts.append(surname.lower())
                
                unique_username = ''.join(username_parts) if username_parts else f"teacher_{uuid.uuid4().hex[:12]}"
                
                cognito.admin_create_user(
                    UserPoolId=user_pool_id,
                    Username=unique_username,
                    UserAttributes=[
                        {'Name': 'email', 'Value': email},
                        {'Name': 'email_verified', 'Value': 'true'},
                    ],
                    DesiredDeliveryMediums=['EMAIL']
                )
                
                # Save username to teacher record
                new_professor.username = unique_username
                new_professor.save_to_db()
                
                # Add to teachers group - try unique_username first, fallback to email
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
                        surname = (data.get('surname') or '').strip()
                        
                        username_parts = []
                        if given_name:
                            username_parts.append(given_name[0].lower())
                        if surname:
                            username_parts.append(surname.lower())
                        
                        generated_username = ''.join(username_parts) if username_parts else None
                        
                        # Save username to teacher record if user already exists
                        if generated_username:
                            new_professor.username = generated_username
                            new_professor.save_to_db()
                        
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

        response = {
            'success': True,
            'message': new_professor.json()
        }
        if cognito_result:
            response['message']['cognito'] = cognito_result
        return Response(json.dumps(response), 201)

    def get(self, id=None):
        if id:
            # Get specific teacher by ID
            professor = TeacherModel.find_by_id(UUID(id))

            if professor is None:
                return {'message': 'Professor not found'}, 404

            response = {
                'success': True,
                'message': professor.json()
            }
            return Response(json.dumps(response), 200)
        else:
            # Get all teachers with department information
            professors = TeacherModel.find_all()
            professors_list = []
            for professor in professors:
                professor_data = professor.json_with_departments()
                professors_list.append(professor_data)
            
            response = {
                'success': True,
                'message': professors_list
            }
            return Response(json.dumps(response), 200)

    @require_role('admin')
    def put(self):
        data = request.get_json()
        id = data.get('_id')

        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        # Remove department_id from update - will be handled separately
        teacher_data = {k: v for k, v in data.items() if k != 'department_id'}
        professor.update_entry(teacher_data)
        response = {
            'success': True,
            'message': professor.json()
        }
        return Response(json.dumps(response), 200)

    @require_role('admin')
    def delete(self, id):
        professor = TeacherModel.find_by_id(id)

        if professor is None:
            return {'message': 'Professor not found'}, 404

        professor.delete_by_id(id)
        return {'message': 'Professor deleted'}, 200
