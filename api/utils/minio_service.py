import os
import logging
from minio import Minio
from minio.error import S3Error
from werkzeug.utils import secure_filename
import uuid
from datetime import timedelta

logger = logging.getLogger(__name__)


class MinioService:
    """
    Service class for MINIO operations
    Handles file upload, download, and deletion
    """
    
    def __init__(self):
        # Get MINIO configuration from environment variables
        self.endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000')
        self.access_key = os.getenv('MINIO_ACCESS_KEY', 'minioadmin')
        self.secret_key = os.getenv('MINIO_SECRET_KEY', 'minioadmin')
        self.bucket_name = os.getenv('MINIO_BUCKET_NAME', 'resources')
        self.secure = os.getenv('MINIO_SECURE', 'false').lower() == 'true'
        
        # Initialize MINIO client
        try:
            self.client = Minio(
                self.endpoint,
                access_key=self.access_key,
                secret_key=self.secret_key,
                secure=self.secure
            )
            # Ensure bucket exists
            self._ensure_bucket_exists()
        except Exception as e:
            logger.error(f"Failed to initialize MINIO client: {str(e)}")
            raise
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {str(e)}")
            raise
    
    def upload_file(self, file_obj, original_filename, school_year_id, subject_id, year_level_id=None):
        """
        Upload a file to MINIO
        
        Args:
            file_obj: File-like object to upload
            original_filename: Original filename from user
            school_year_id: School year UUID
            subject_id: Subject UUID
            year_level_id: Year level UUID (optional)
            
        Returns:
            tuple: (file_path, file_size) where file_path is the path in MINIO
        """
        try:
            # Generate unique filename to avoid collisions
            file_extension = os.path.splitext(original_filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Create path: school_year_id/subject_id/year_level_id/filename (if year_level_id provided)
            # or school_year_id/subject_id/filename (if no year_level_id)
            if year_level_id:
                secure_path = f"{school_year_id}/{subject_id}/{year_level_id}/{unique_filename}"
            else:
                secure_path = f"{school_year_id}/{subject_id}/{unique_filename}"
            
            # Get file size
            file_obj.seek(0, 2)  # Seek to end
            file_size = file_obj.tell()
            file_obj.seek(0)  # Reset to beginning
            
            # Get content type
            content_type = self._get_content_type(original_filename)
            
            # Upload to MINIO
            self.client.put_object(
                self.bucket_name,
                secure_path,
                file_obj,
                length=file_size,
                content_type=content_type
            )
            
            logger.info(f"File uploaded successfully: {secure_path}")
            return secure_path, file_size
            
        except S3Error as e:
            logger.error(f"Error uploading file to MINIO: {str(e)}")
            raise Exception(f"Failed to upload file: {str(e)}")
    
    def download_file(self, file_path):
        """
        Download a file from MINIO
        
        Args:
            file_path: Path to file in MINIO bucket
            
        Returns:
            tuple: (file_data, metadata) where file_data is bytes and metadata is dict
        """
        try:
            # Get object from MINIO
            response = self.client.get_object(self.bucket_name, file_path)
            
            # Read file data
            file_data = response.read()
            metadata = {
                'content_type': response.headers.get('Content-Type'),
                'content_length': response.headers.get('Content-Length'),
                'last_modified': response.headers.get('Last-Modified')
            }
            
            response.close()
            response.release_conn()
            
            return file_data, metadata
            
        except S3Error as e:
            logger.error(f"Error downloading file from MINIO: {str(e)}")
            if e.code == 'NoSuchKey':
                raise Exception(f"File not found: {file_path}")
            raise Exception(f"Failed to download file: {str(e)}")
    
    def delete_file(self, file_path):
        """
        Delete a file from MINIO
        
        Args:
            file_path: Path to file in MINIO bucket
        """
        try:
            self.client.remove_object(self.bucket_name, file_path)
            logger.info(f"File deleted successfully: {file_path}")
        except S3Error as e:
            logger.error(f"Error deleting file from MINIO: {str(e)}")
            if e.code == 'NoSuchKey':
                logger.warning(f"File not found for deletion: {file_path}")
                # Don't raise error if file doesn't exist (idempotent delete)
                return
            raise Exception(f"Failed to delete file: {str(e)}")
    
    def get_presigned_url(self, file_path, expires_in_days=7):
        """
        Generate a presigned URL for temporary file access
        
        Args:
            file_path: Path to file in MINIO bucket
            expires_in_days: Number of days until URL expires (default: 7)
            
        Returns:
            str: Presigned URL
        """
        try:
            expires = timedelta(days=expires_in_days)
            url = self.client.presigned_get_object(self.bucket_name, file_path, expires=expires)
            return url
        except S3Error as e:
            logger.error(f"Error generating presigned URL: {str(e)}")
            raise Exception(f"Failed to generate presigned URL: {str(e)}")
    
    def file_exists(self, file_path):
        """
        Check if a file exists in MINIO
        
        Args:
            file_path: Path to file in MINIO bucket
            
        Returns:
            bool: True if file exists, False otherwise
        """
        try:
            self.client.stat_object(self.bucket_name, file_path)
            return True
        except S3Error as e:
            if e.code == 'NoSuchKey':
                return False
            raise
    
    def _get_content_type(self, filename):
        """Get content type based on file extension"""
        extension = os.path.splitext(filename)[1].lower()
        content_types = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.txt': 'text/plain',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.zip': 'application/zip',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
        }
        return content_types.get(extension, 'application/octet-stream')


# Global instance - lazy initialization
_minio_service_instance = None

def get_minio_service():
    """Get or create MINIO service instance (lazy initialization)"""
    global _minio_service_instance
    if _minio_service_instance is None:
        try:
            _minio_service_instance = MinioService()
        except Exception as e:
            logger.error(f"Failed to initialize MINIO service: {str(e)}")
            raise
    return _minio_service_instance

