#!/usr/bin/env python3
"""Test the teacher schedule endpoint"""
import sys
sys.path.insert(0, 'api')

from models.teacher import TeacherModel
from models.class_model import ClassModel

# Find teacher
teacher = TeacherModel.find_by_username('mcarreiras')
if not teacher:
    print("ERROR: Teacher not found")
    sys.exit(1)

print(f"Found teacher: {teacher.given_name} {teacher.surname}")
print(f"Teacher ID: {teacher._id}")
print(f"Username: {teacher.username}")
print(f"Email: {teacher.email_address}")

# Get classes
classes = ClassModel.list_by_teacher_id(str(teacher._id))
print(f"\nNumber of classes: {len(classes)}")

for i, cls in enumerate(classes[:5], 1):
    print(f"\nClass {i}:")
    print(f"  ID: {cls._id}")
    print(f"  Name: {cls.class_name}")
    print(f"  Subject ID: {cls.subject_id}")
    print(f"  Term ID: {cls.term_id}")

