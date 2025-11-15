from flask import request, Response
from flask_restful import Resource
from models.student import StudentModel
from utils.auth_middleware import require_role
import json
import os
import logging
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
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


class StudentBulkImportResource(Resource):
    """
    Bulk import students from Excel file
    Expected Excel format:
    - Header row: given_name, middle_name, surname, date_of_birth, gender, enrollment_date, email
    - Data rows: student information matching the header
    """
    
    @require_role('admin')
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
                'middle_name': ['middle_name', 'middle name', 'middlename'],
                'surname': ['surname', 'last name', 'lastname', 'family name'],
                'date_of_birth': ['date_of_birth', 'date of birth', 'dob', 'birthdate'],
                'gender': ['gender', 'sex'],
                'enrollment_date': ['enrollment_date', 'enrollment date', 'enrolment_date', 'enrolment date', 'enrollment'],
                'email': ['email', 'email address', 'e-mail']
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
            students_created = []
            students_failed = []
            skipped_rows = []
            
            # Cognito setup (same as single student creation)
            user_pool_id = os.getenv('AWS_COGNITO_USERPOOL_ID')
            group_name = os.getenv('AWS_COGNITO_STUDENT_GROUP', 'student')
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
                    middle_name = str(row[column_indices['middle_name']].value or '').strip() if row[column_indices['middle_name']].value else None
                    surname = str(row[column_indices['surname']].value or '').strip()
                    date_of_birth_str = str(row[column_indices['date_of_birth']].value or '').strip()
                    gender = str(row[column_indices['gender']].value or '').strip()
                    enrollment_date_str = str(row[column_indices['enrollment_date']].value or '').strip()
                    email_val = row[column_indices['email']].value
                    email = str(email_val).strip() if email_val else None
                    if email == '':
                        email = None
                    
                    # Skip empty rows
                    if not given_name and not surname:
                        continue
                    
                    # Validate required fields
                    if not given_name or not surname or not date_of_birth_str or not gender or not enrollment_date_str:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': 'Missing required fields'
                        })
                        continue
                    
                    # Parse dates
                    date_of_birth = None
                    enrollment_date = None
                    
                    # Try parsing date_of_birth
                    cell_value_dob = row[column_indices['date_of_birth']].value
                    if cell_value_dob:
                        # Handle Excel date serial numbers or datetime objects
                        if isinstance(cell_value_dob, (int, float)):
                            try:
                                from openpyxl.utils.datetime import from_excel
                                date_of_birth = from_excel(cell_value_dob)
                            except Exception as e:
                                logging.warning(f"Error parsing Excel date serial for DOB row {row_idx}: {e}")
                                skipped_rows.append({
                                    'row': row_idx,
                                    'reason': f'Invalid date_of_birth format: {date_of_birth_str}'
                                })
                                continue
                        elif isinstance(cell_value_dob, datetime):
                            # Excel already parsed it as datetime
                            date_of_birth = cell_value_dob
                        else:
                            # Try parsing string dates
                            for date_format in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%Y/%m/%d']:
                                try:
                                    date_of_birth = datetime.strptime(date_of_birth_str, date_format)
                                    break
                                except:
                                    continue
                            if date_of_birth is None:
                                skipped_rows.append({
                                    'row': row_idx,
                                    'reason': f'Invalid date_of_birth format: {date_of_birth_str}'
                                })
                                continue
                    else:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': 'date_of_birth is empty'
                        })
                        continue
                    
                    # Try parsing enrollment_date
                    cell_value_enroll = row[column_indices['enrollment_date']].value
                    if cell_value_enroll:
                        # Handle Excel date serial numbers or datetime objects
                        if isinstance(cell_value_enroll, (int, float)):
                            try:
                                from openpyxl.utils.datetime import from_excel
                                enrollment_date = from_excel(cell_value_enroll)
                            except Exception as e:
                                logging.warning(f"Error parsing Excel date serial for enrollment row {row_idx}: {e}")
                                skipped_rows.append({
                                    'row': row_idx,
                                    'reason': f'Invalid enrollment_date format: {enrollment_date_str}'
                                })
                                continue
                        elif isinstance(cell_value_enroll, datetime):
                            # Excel already parsed it as datetime
                            enrollment_date = cell_value_enroll
                        else:
                            # Try parsing string dates
                            for date_format in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y', '%Y/%m/%d']:
                                try:
                                    enrollment_date = datetime.strptime(enrollment_date_str, date_format)
                                    break
                                except:
                                    continue
                            if enrollment_date is None:
                                skipped_rows.append({
                                    'row': row_idx,
                                    'reason': f'Invalid enrollment_date format: {enrollment_date_str}'
                                })
                                continue
                    else:
                        skipped_rows.append({
                            'row': row_idx,
                            'reason': 'enrollment_date is empty'
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
                    
                    # Check if student with same email already exists (if email provided)
                    if email:
                        existing_student = StudentModel.find_by_email(email)
                        if existing_student:
                            skipped_rows.append({
                                'row': row_idx,
                                'reason': f'Student with email {email} already exists'
                            })
                            continue
                    
                    # Create student
                    # Convert dates appropriately: date_of_birth is DateTime, enrollment_date is Date
                    enrollment_date_obj = enrollment_date.date() if enrollment_date else None
                    
                    new_student = StudentModel(
                        given_name=given_name,
                        middle_name=middle_name,
                        surname=surname,
                        date_of_birth=date_of_birth,
                        gender=gender,
                        enrollment_date=enrollment_date_obj,
                        email=email
                    )
                    try:
                        new_student.save_to_db()
                        logging.info(f"Successfully created student: {given_name} {surname} (row {row_idx})")
                    except Exception as db_error:
                        logging.error(f"Failed to save student to database (row {row_idx}): {str(db_error)}")
                        students_failed.append({
                            'row': row_idx,
                            'reason': f'Database error: {str(db_error)}'
                        })
                        continue
                    
                    # Create Cognito user if configured (same logic as single student creation)
                    cognito_result = None
                    if email and cognito:
                        try:
                            # Generate username from initials + surname
                            given_name_clean = given_name.strip()
                            middle_name_clean = middle_name.strip() if middle_name else ''
                            surname_clean = surname.strip()
                            
                            username_parts = []
                            if given_name_clean:
                                username_parts.append(given_name_clean[0].lower())
                            if middle_name_clean:
                                middle_words = middle_name_clean.split()
                                if middle_words:
                                    username_parts.append(middle_words[-1][0].lower())
                            if surname_clean:
                                username_parts.append(surname_clean.lower())
                            
                            unique_username = ''.join(username_parts) if username_parts else f"student_{uuid.uuid4().hex[:12]}"
                            
                            cognito.admin_create_user(
                                UserPoolId=user_pool_id,
                                Username=unique_username,
                                UserAttributes=[
                                    {'Name': 'email', 'Value': email},
                                    {'Name': 'email_verified', 'Value': 'true'},
                                ],
                                DesiredDeliveryMediums=['EMAIL']
                            )
                            
                            new_student.username = unique_username
                            new_student.save_to_db()
                            
                            try:
                                cognito.admin_add_user_to_group(
                                    UserPoolId=user_pool_id,
                                    Username=unique_username,
                                    GroupName=group_name
                                )
                            except ClientError as group_e:
                                try:
                                    cognito.admin_add_user_to_group(
                                        UserPoolId=user_pool_id,
                                        Username=email,
                                        GroupName=group_name
                                    )
                                except ClientError as email_e:
                                    logging.warning(f"Failed to add user to group: {group_e}, {email_e}")
                            
                            cognito_result = 'created'
                        except ClientError as e:
                            if getattr(e, 'response', {}).get('Error', {}).get('Code') == 'UsernameExistsException':
                                # User already exists, try to add to group
                                try:
                                    if unique_username:
                                        cognito.admin_add_user_to_group(
                                            UserPoolId=user_pool_id,
                                            Username=unique_username,
                                            GroupName=group_name
                                        )
                                except:
                                    try:
                                        cognito.admin_add_user_to_group(
                                            UserPoolId=user_pool_id,
                                            Username=email,
                                            GroupName=group_name
                                        )
                                    except:
                                        pass
                                new_student.username = unique_username
                                new_student.save_to_db()
                                cognito_result = 'exists'
                            else:
                                logging.warning(f"Cognito user creation failed: {e}")
                                cognito_result = 'error'
                        except Exception as e:
                            logging.warning(f"Cognito setup issue: {e}")
                            cognito_result = 'error'
                    
                    students_created.append({
                        'row': row_idx,
                        'student_id': str(new_student._id),
                        'name': f"{given_name} {surname}",
                        'email': email,
                        'cognito': cognito_result
                    })
                    
                except Exception as e:
                    logging.error(f"Error processing row {row_idx}: {str(e)}")
                    students_failed.append({
                        'row': row_idx,
                        'reason': str(e)
                    })
                    continue
            
            response = {
                'success': True,
                'message': f'Import completed. {len(students_created)} students created, {len(students_failed)} failed, {len(skipped_rows)} skipped.',
                'summary': {
                    'total_created': len(students_created),
                    'total_failed': len(students_failed),
                    'total_skipped': len(skipped_rows)
                },
                'created': students_created,
                'failed': students_failed,
                'skipped': skipped_rows
            }
            
            return Response(json.dumps(response), 200, mimetype='application/json')
            
        except Exception as e:
            logging.error(f"Error importing students: {str(e)}")
            response = {
                'success': False,
                'message': f'Error importing students: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

