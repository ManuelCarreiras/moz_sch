from flask import request, Response
from flask_restful import Resource
from models.teacher import TeacherModel
from utils.auth_middleware import require_any_role
import json
import os
import logging
import uuid
try:
    import openpyxl
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False
try:
    import boto3
    from botocore.exceptions import ClientError
except Exception:
    boto3 = None
    ClientError = Exception


class TeacherBulkImportResource(Resource):
    """
    Bulk import teachers from Excel file
    Expected Excel format:
    - Header row: given_name, surname, gender, email_address, phone_number, year_start, academic_level, years_of_experience
    - Data rows: teacher information matching the header
    """
    
    @require_any_role(['admin', 'secretary'])
    def post(self):
        if not OPENPYXL_AVAILABLE:
            response = {
                'success': False,
                'message': 'Excel import functionality requires openpyxl library. Please install it.'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')
        
        # Check if file is present in request
        if 'file' not in request.files:
            response = {
                'success': False,
                'message': 'No file provided'
            }
            return Response(json.dumps(response), 400, mimetype='application/json')
        
        file = request.files['file']
        if file.filename == '':
            response = {
                'success': False,
                'message': 'No file selected'
            }
            return Response(json.dumps(response), 400, mimetype='application/json')
        
        # Validate file extension
        if not file.filename.lower().endswith(('.xlsx', '.xls')):
            response = {
                'success': False,
                'message': 'Invalid file type. Please upload an Excel file (.xlsx or .xls)'
            }
            return Response(json.dumps(response), 400, mimetype='application/json')
        
        try:
            # Load workbook
            workbook = openpyxl.load_workbook(file)
            sheet = workbook.active
            
            # Read header row
            headers = []
            for cell in sheet[1]:
                headers.append(cell.value.lower().strip() if cell.value else '')
            
            # Expected columns mapping
            expected_columns = {
                'given_name': ['given_name', 'given name', 'first name', 'firstname'],
                'surname': ['surname', 'last name', 'lastname', 'family name'],
                'gender': ['gender', 'sex'],
                'email_address': ['email_address', 'email address', 'email', 'e-mail'],
                'phone_number': ['phone_number', 'phone number', 'phone', 'mobile', 'telephone'],
                'year_start': ['year_start', 'year start', 'start year', 'joining year'],
                'academic_level': ['academic_level', 'academic level', 'level', 'degree', 'qualification'],
                'years_of_experience': ['years_of_experience', 'years of experience', 'experience years', 'experience']
            }
            
            # Find column indices
            column_indices = {}
            for field, aliases in expected_columns.items():
                for i, header in enumerate(headers):
                    if header in aliases:
                        column_indices[field] = i
                        break
                if field not in column_indices:
                    response = {
                        'success': False,
                        'message': f'Required column not found: {field}. Expected one of: {", ".join(aliases)}'
                    }
                    return Response(json.dumps(response), 400, mimetype='application/json')
            
            # Process data rows
            teachers_created = []
            teachers_failed = []
            skipped_rows = []
            
            # Cognito setup (same as single teacher creation)
            user_pool_id = os.getenv('AWS_COGNITO_USERPOOL_ID')
            group_name = os.getenv('AWS_COGNITO_TEACHER_GROUP', 'teachers')
            aws_region = os.getenv('AWS_REGION') or os.getenv('COGNITO_REGION_NAME', 'eu-west-1')
            cognito = None
            if boto3 is not None and user_pool_id:
                try:
                    cognito = boto3.client('cognito-idp', region_name=aws_region)
                except Exception as e:
                    logging.warning(f"Cognito setup issue: {e}")
            
            # Iterate through data rows (skip header row)
            for row_idx, row in enumerate(sheet.iter_rows(min_row=2, values_only=False), start=2):
                try:
                    # Extract values
                    given_name = str(row[column_indices['given_name']].value or '').strip()
                    surname = str(row[column_indices['surname']].value or '').strip()
                    gender = str(row[column_indices['gender']].value or '').strip()
                    email_val = row[column_indices['email_address']].value
                    email_address = str(email_val).strip() if email_val else None
                    if email_address == '':
                        email_address = None
                    phone_val = row[column_indices['phone_number']].value
                    phone_number = str(phone_val).strip() if phone_val else None
                    if phone_number == '':
                        phone_number = None
                    
                    year_start_val = row[column_indices['year_start']].value
                    academic_level_val = row[column_indices['academic_level']].value
                    years_of_experience_val = row[column_indices['years_of_experience']].value
                    
                    # Skip empty rows
                    if not given_name and not surname:
                        continue
                    
                    # Validate required fields
                    if not given_name or not surname or not gender or not email_address or not phone_number:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': 'Missing required fields (given_name, surname, gender, email_address, phone_number)'
                        })
                        continue
                    
                    # Parse and validate year_start
                    try:
                        year_start = int(float(year_start_val)) if year_start_val is not None else None
                        if year_start is None or year_start < 1900 or year_start > 2100:
                            skipped_rows.append({
                                'row': row_idx,
                                'reason': f'Invalid year_start: {year_start_val}. Expected a valid year (1900-2100)'
                            })
                            continue
                    except (TypeError, ValueError):
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': f'Invalid year_start: {year_start_val}. Expected an integer year'
                        })
                        continue
                    
                    # Parse and validate academic_level
                    academic_level = str(academic_level_val).strip() if academic_level_val else ''
                    if not academic_level:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': 'Missing required field: academic_level'
                        })
                        continue
                    
                    # Parse and validate years_of_experience
                    try:
                        years_of_experience = int(float(years_of_experience_val)) if years_of_experience_val is not None else None
                        if years_of_experience is None or years_of_experience < 0:
                            skipped_rows.append({
                                'row': row_idx,
                                'reason': f'Invalid years_of_experience: {years_of_experience_val}. Expected a non-negative integer'
                            })
                            continue
                    except (TypeError, ValueError):
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': f'Invalid years_of_experience: {years_of_experience_val}. Expected a non-negative integer'
                        })
                        continue
                    
                    # Validate gender
                    gender_upper = gender.upper()
                    if gender_upper not in ['MALE', 'FEMALE', 'M', 'F']:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': f'Invalid gender: {gender}. Expected: Male, Female, M, or F'
                        })
                        continue
                    
                    # Normalize gender
                    if gender_upper in ['M', 'MALE']:
                        gender = 'Male'
                    else:
                        gender = 'Female'
                    
                    # Check if teacher with same email already exists
                    existing_teacher = TeacherModel.find_by_email(email_address)
                    if existing_teacher:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': f'Teacher with email {email_address} already exists'
                        })
                        continue
                    
                    # Create teacher
                    new_teacher = TeacherModel(
                        given_name=given_name,
                        surname=surname,
                        gender=gender,
                        email_address=email_address,
                        phone_number=phone_number,
                        year_start=year_start,
                        academic_level=academic_level,
                        years_of_experience=years_of_experience
                    )
                    
                    try:
                        new_teacher.save_to_db()
                        logging.info(f"Successfully created teacher: {given_name} {surname} (row {row_idx})")
                    except Exception as db_error:
                        logging.error(f"Failed to save teacher to database (row {row_idx}): {str(db_error)}")
                        teachers_failed.append({
                            'row': row_idx,
                            'reason': f'Database error: {str(db_error)}'
                        })
                        continue
                    
                    # Generate username FIRST (before Cognito operations) so it's always saved
                    given_name_clean = given_name.strip()
                    surname_clean = surname.strip()
                    
                    username_parts = []
                    if given_name_clean:
                        username_parts.append(given_name_clean[0].lower())
                    if surname_clean:
                        username_parts.append(surname_clean.lower())
                    
                    unique_username = ''.join(username_parts) if username_parts else f"teacher_{uuid.uuid4().hex[:12]}"
                    
                    # Save username to database IMMEDIATELY (before Cognito operations)
                    new_teacher.username = unique_username
                    new_teacher.save_to_db()
                    
                    # Create Cognito user if configured (same logic as single teacher creation)
                    cognito_result = None
                    if email_address and cognito:
                        try:
                            logging.info(f"Creating Cognito user: username={unique_username}, email={email_address}, pool={user_pool_id}")
                            
                            try:
                                # Try to create user with email delivery first
                                cognito.admin_create_user(
                                    UserPoolId=user_pool_id,
                                    Username=unique_username,
                                    UserAttributes=[
                                        {'Name': 'email', 'Value': email_address},
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
                                            {'Name': 'email', 'Value': email_address},
                                            {'Name': 'email_verified', 'Value': 'true'},
                                        ],
                                        MessageAction='SUPPRESS'  # Suppress email to avoid limit
                                    )
                                    logging.info(f"Cognito user created successfully (email suppressed): {unique_username}")
                                else:
                                    # Re-raise if it's a different error
                                    raise
                            
                            try:
                                cognito.admin_add_user_to_group(
                                    UserPoolId=user_pool_id,
                                    Username=unique_username,
                                    GroupName=group_name
                                )
                                logging.info(f"User {unique_username} added to group '{group_name}'")
                            except ClientError as group_e:
                                logging.warning(f"Failed to add user to group with username, trying email: {group_e}")
                                try:
                                    cognito.admin_add_user_to_group(
                                        UserPoolId=user_pool_id,
                                        Username=email_address,
                                        GroupName=group_name
                                    )
                                    logging.info(f"User {email_address} added to group '{group_name}' using email")
                                except ClientError as email_e:
                                    logging.error(f"CRITICAL: Failed to add user to group '{group_name}' (tried both username and email): {group_e}, {email_e}")
                            
                            cognito_result = 'created'
                        except ClientError as e:
                            error_code = getattr(e, 'response', {}).get('Error', {}).get('Code')
                            error_message = getattr(e, 'response', {}).get('Error', {}).get('Message', str(e))
                            
                            logging.error(f"Cognito ClientError: Code={error_code}, Message={error_message}")
                            
                            if error_code == 'UsernameExistsException':
                                logging.info(f"User {unique_username} already exists in Cognito, adding to group")
                                # Username already saved above, just use it to add to group
                                try:
                                    cognito.admin_add_user_to_group(
                                        UserPoolId=user_pool_id,
                                        Username=unique_username,
                                        GroupName=group_name
                                    )
                                    logging.info(f"Existing user {unique_username} added to group '{group_name}'")
                                except Exception:
                                    try:
                                        cognito.admin_add_user_to_group(
                                            UserPoolId=user_pool_id,
                                            Username=email_address,
                                            GroupName=group_name
                                        )
                                        logging.info(f"Existing user {email_address} added to group '{group_name}' using email")
                                    except Exception as inner:
                                        logging.error(f"CRITICAL: Add existing user to group failed (tried both username and email): {inner}")
                                cognito_result = 'exists'
                            else:
                                logging.error(f"CRITICAL: Cognito user creation FAILED - Code: {error_code}, Message: {error_message}")
                                logging.error(f"Failed to create user: username={unique_username}, email={email_address}, pool={user_pool_id}")
                                cognito_result = 'error'
                        except Exception as e:
                            logging.warning(f"Cognito setup issue: {e}")
                            cognito_result = 'error'
                    
                    teachers_created.append({
                        'row': row_idx,
                        'teacher_id': str(new_teacher._id),
                        'name': f"{given_name} {surname}",
                        'email': email_address,
                        'cognito': cognito_result
                    })
                    
                except Exception as e:
                    logging.error(f"Error processing row {row_idx}: {str(e)}")
                    teachers_failed.append({
                        'row': row_idx,
                        'reason': str(e)
                    })
                    continue
            
            response = {
                'success': True,
                'message': f'Import completed. {len(teachers_created)} teachers created, {len(teachers_failed)} failed, {len(skipped_rows)} skipped.',
                'summary': {
                    'total_created': len(teachers_created),
                    'total_failed': len(teachers_failed),
                    'total_skipped': len(skipped_rows)
                },
                'created': teachers_created,
                'failed': teachers_failed,
                'skipped': skipped_rows
            }
            
            return Response(json.dumps(response), 200, mimetype='application/json')
            
        except Exception as e:
            logging.error(f"Error importing teachers: {str(e)}")
            response = {
                'success': False,
                'message': f'Error importing teachers: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

