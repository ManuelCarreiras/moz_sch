from flask_restful import Resource
from flask import Response, request, send_file, g
from models.resource import ResourceModel
from models.school_year import SchoolYearModel
from models.subject import SubjectModel
from models.teacher import TeacherModel
from utils.auth_middleware import require_any_role, require_role
from utils.minio_service import get_minio_service
import json
from io import BytesIO
from werkzeug.utils import secure_filename
import os


class ResourceResource(Resource):
    """
    Resource Resource - Manage educational resources
    Teachers can upload resources, students can download them
    """

    @require_any_role(['admin', 'teacher', 'student', 'secretary'])
    def get(self, resource_id=None):
        """
        GET /resource - Get all resources (with filters by year and subject)
        GET /resource/<resource_id> - Get specific resource
        Query params: school_year_id, subject_id
        """
        if resource_id:
            # Get specific resource
            resource = ResourceModel.find_by_id(resource_id)
            if not resource:
                return {'message': 'Resource not found'}, 404
            
            # Enhance resource data with related information
            resource_data = resource.json_with_relations()
            
            return {'resource': resource_data}, 200
        
        # Get all resources with optional filters
        school_year_id = request.args.get('school_year_id')
        subject_id = request.args.get('subject_id')
        year_level_id = request.args.get('year_level_id')
        
        # If year_level_id is provided, get its level_order and find all year levels with same order
        year_level_ids_to_filter = None
        if year_level_id:
            from models.year_level import YearLevelModel
            selected_year_level = YearLevelModel.find_by_id(year_level_id)
            if selected_year_level:
                # Find all year levels with the same level_order (e.g., all "1st" variants: 1st A, 1st B, etc.)
                year_levels_with_same_order = YearLevelModel.find_by_level_order(selected_year_level.level_order)
                year_level_ids_to_filter = [str(yl._id) for yl in year_levels_with_same_order]
        
        # Apply filters
        if school_year_id and subject_id and year_level_ids_to_filter:
            # Filter by school year, subject, and any year level with matching level_order
            resources = ResourceModel.find_by_school_year_and_subject(school_year_id, subject_id)
            resources = [r for r in resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
        elif school_year_id and subject_id:
            resources = ResourceModel.find_by_school_year_and_subject(school_year_id, subject_id)
        elif school_year_id:
            resources = ResourceModel.find_by_school_year_id(school_year_id)
        elif subject_id:
            resources = ResourceModel.find_by_subject_id(subject_id)
        elif year_level_ids_to_filter:
            # Filter by any year level with matching level_order
            all_resources = ResourceModel.find_all()
            resources = [r for r in all_resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
        else:
            resources = ResourceModel.find_all()
        
        # Apply additional year_level filter if needed (for cases where we have multiple filters)
        if year_level_ids_to_filter and not (school_year_id and subject_id and year_level_ids_to_filter):
            resources = [r for r in resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
        
        # Enhance each resource with related info
        enhanced_resources = []
        for resource in resources:
            resource_data = resource.json_with_relations()
            enhanced_resources.append(resource_data)
        
        return {
            'resources': enhanced_resources,
            'count': len(enhanced_resources)
        }, 200

    @require_any_role(['admin', 'teacher'])
    def post(self):
        """
        POST /resource - Upload a new resource
        Teachers can only upload resources for their subjects
        """
        # Check if file is present in request
        if 'file' not in request.files:
            return {'message': 'No file provided'}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {'message': 'No file selected'}, 400
        
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description', '')
        school_year_id = request.form.get('school_year_id')
        subject_id = request.form.get('subject_id')
        year_level_id = request.form.get('year_level_id') or None  # Optional field
        
        # Validate required fields
        if not title:
            return {'message': 'Title is required'}, 400
        if not school_year_id:
            return {'message': 'School year ID is required'}, 400
        if not subject_id:
            return {'message': 'Subject ID is required'}, 400
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        is_admin = g.admin if hasattr(g, 'admin') else False
        
        # For teachers, find their teacher record; admins can upload without teacher record
        teacher = None
        if user_role == 'teacher' and username:
            teacher = TeacherModel.find_by_username(username)
            if not teacher:
                return {'message': 'Teacher not found'}, 404
        
        # Validate references exist
        school_year = SchoolYearModel.find_by_id(school_year_id)
        if not school_year:
            return {'message': 'School year not found'}, 404
        
        subject = SubjectModel.find_by_id(subject_id)
        if not subject:
            return {'message': 'Subject not found'}, 404
        
        # Teachers can only upload resources for subjects they teach
        # (Admin can upload for any subject)
        if user_role == 'teacher' and teacher:
            # Check if teacher teaches this subject (you may need to implement this check)
            # For now, we'll allow teachers to upload for any subject
            # You can add validation based on teacher_department or class assignments
            pass
        
        try:
            # Get file info
            original_filename = secure_filename(file.filename)
            mime_type = file.content_type
            
            # Upload file to MINIO
            minio = get_minio_service()
            file_path, file_size = minio.upload_file(
                file.stream,
                original_filename,
                school_year_id,
                subject_id,
                year_level_id
            )
            
            # Create resource record in database
            # For admins, uploaded_by can be None; for teachers, use their teacher ID
            uploaded_by_id = teacher._id if teacher else None
            
            new_resource = ResourceModel(
                title=title,
                description=description,
                file_name=original_filename,
                file_path=file_path,
                file_size=file_size,
                mime_type=mime_type,
                school_year_id=school_year_id,
                subject_id=subject_id,
                uploaded_by=uploaded_by_id,
                year_level_id=year_level_id
            )
            new_resource.save_to_db()
            
            response = {
                'success': True,
                'message': 'Resource uploaded successfully',
                'resource': new_resource.json_with_relations()
            }
            return Response(json.dumps(response), 201, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error uploading resource: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def put(self):
        """
        PUT /resource - Update resource metadata
        Teachers can only update their own resources
        """
        data = request.get_json()
        
        if not data or '_id' not in data:
            return {'message': 'Resource ID is required'}, 400
        
        resource = ResourceModel.find_by_id(data['_id'])
        
        if not resource:
            return {'message': 'Resource not found'}, 404
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        
        # Teachers can only update their own resources (admin can update any)
        if user_role == 'teacher' and username:
            teacher = TeacherModel.find_by_username(username)
            if teacher and resource.uploaded_by and str(resource.uploaded_by) != str(teacher._id):
                return {'message': 'You can only update your own resources'}, 403
        
        try:
            # Update fields
            if 'title' in data:
                resource.title = data['title']
            if 'description' in data:
                resource.description = data['description']
            
            resource.save_to_db()
            
            response = {
                'success': True,
                'message': 'Resource updated successfully',
                'resource': resource.json_with_relations()
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error updating resource: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')

    @require_any_role(['admin', 'teacher'])
    def delete(self, resource_id):
        """
        DELETE /resource/<resource_id> - Delete resource
        Teachers can only delete their own resources
        """
        resource = ResourceModel.find_by_id(resource_id)
        
        if not resource:
            return {'message': 'Resource not found'}, 404
        
        # Get authenticated user
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        
        # Teachers can only delete their own resources (admin can delete any)
        if user_role == 'teacher' and username:
            teacher = TeacherModel.find_by_username(username)
            if teacher and resource.uploaded_by and str(resource.uploaded_by) != str(teacher._id):
                return {'message': 'You can only delete your own resources'}, 403
        
        try:
            # Delete file from MINIO
            minio = get_minio_service()
            minio.delete_file(resource.file_path)
            
            # Delete resource record from database
            resource.delete_from_db()
            
            response = {
                'success': True,
                'message': 'Resource deleted successfully'
            }
            return Response(json.dumps(response), 200, mimetype='application/json')
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error deleting resource: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class ResourceDownloadResource(Resource):
    """
    Resource Download Resource - Download resources
    Students and teachers can download resources
    """

    @require_any_role(['admin', 'teacher', 'student', 'secretary'])
    def get(self, resource_id):
        """
        GET /resource/<resource_id>/download - Download a resource file
        """
        resource = ResourceModel.find_by_id(resource_id)
        
        if not resource:
            return {'message': 'Resource not found'}, 404
        
        try:
            # Download file from MINIO
            minio = get_minio_service()
            file_data, metadata = minio.download_file(resource.file_path)
            
            # Create file-like object
            file_obj = BytesIO(file_data)
            
            # Return file with appropriate headers
            file_obj.seek(0)  # Reset to beginning
            return send_file(
                file_obj,
                mimetype=resource.mime_type or metadata.get('content_type', 'application/octet-stream'),
                as_attachment=True,
                download_name=resource.file_name
            )
        
        except Exception as e:
            response = {
                'success': False,
                'message': f'Error downloading resource: {str(e)}'
            }
            return Response(json.dumps(response), 500, mimetype='application/json')


class TeacherResourceResource(Resource):
    """
    Teacher Resource Resource - Get resources uploaded by authenticated teacher or admin
    """

    @require_any_role(['admin', 'teacher'])
    def get(self):
        """
        GET /resource/teacher - Get all resources uploaded by authenticated teacher or admin
        Query params: school_year_id, subject_id
        """
        username = g.username if hasattr(g, 'username') else None
        user_role = g.role if hasattr(g, 'role') else None
        
        if not username:
            return {'message': 'Authentication required'}, 401
        
        # Get query parameters
        school_year_id = request.args.get('school_year_id')
        subject_id = request.args.get('subject_id')
        year_level_id = request.args.get('year_level_id')
        
        # If year_level_id is provided, get its level_order and find all year levels with same order
        year_level_ids_to_filter = None
        if year_level_id:
            from models.year_level import YearLevelModel
            selected_year_level = YearLevelModel.find_by_id(year_level_id)
            if selected_year_level:
                # Find all year levels with the same level_order (e.g., all "1st" variants: 1st A, 1st B, etc.)
                year_levels_with_same_order = YearLevelModel.find_by_level_order(selected_year_level.level_order)
                year_level_ids_to_filter = [str(yl._id) for yl in year_levels_with_same_order]
        
        # If admin, return all resources
        if user_role == 'admin':
            if school_year_id and subject_id and year_level_ids_to_filter:
                resources = ResourceModel.find_by_school_year_and_subject(school_year_id, subject_id)
                resources = [r for r in resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
            elif school_year_id and subject_id:
                resources = ResourceModel.find_by_school_year_and_subject(school_year_id, subject_id)
            elif school_year_id:
                resources = ResourceModel.find_by_school_year_id(school_year_id)
            elif subject_id:
                resources = ResourceModel.find_by_subject_id(subject_id)
            elif year_level_ids_to_filter:
                all_resources = ResourceModel.find_all()
                resources = [r for r in all_resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
            else:
                resources = ResourceModel.find_all()
            
            # Apply additional year_level filter if needed
            if year_level_ids_to_filter and not (school_year_id and subject_id and year_level_ids_to_filter):
                resources = [r for r in resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
        else:
            # If teacher, return only their resources
            teacher = TeacherModel.find_by_username(username)
            if not teacher:
                return {'message': 'Teacher not found'}, 404
            
            # Filter by teacher
            all_resources = ResourceModel.find_by_uploaded_by(teacher._id)
            
            # Apply additional filters
            if school_year_id and subject_id and year_level_ids_to_filter:
                resources = [r for r in all_resources if str(r.school_year_id) == school_year_id and str(r.subject_id) == subject_id and r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
            elif school_year_id and subject_id:
                resources = [r for r in all_resources if str(r.school_year_id) == school_year_id and str(r.subject_id) == subject_id]
            elif school_year_id:
                resources = [r for r in all_resources if str(r.school_year_id) == school_year_id]
            elif subject_id:
                resources = [r for r in all_resources if str(r.subject_id) == subject_id]
            elif year_level_ids_to_filter:
                resources = [r for r in all_resources if r.year_level_id and str(r.year_level_id) in year_level_ids_to_filter]
            else:
                resources = all_resources
        
        # Enhance each resource with related info
        enhanced_resources = []
        for resource in resources:
            resource_data = resource.json_with_relations()
            enhanced_resources.append(resource_data)
        
        return {
            'resources': enhanced_resources,
            'count': len(enhanced_resources)
        }, 200

