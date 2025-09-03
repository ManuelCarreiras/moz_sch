# Moz School API - School Management System

A comprehensive REST API for managing school administration, student records, teacher information, class scheduling, and academic tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Moz School API is a Flask-based REST API designed to handle comprehensive school management operations. It provides endpoints for managing students, teachers, classes, subjects, academic years, and various educational administrative tasks.

## ✨ Features

### Core Functionality
- **Student Management**: Complete student lifecycle from enrollment to graduation
- **Teacher Management**: Teacher profiles, contact information, and assignments
- **Class Management**: Course scheduling, classroom assignments, and teacher allocations
- **Academic Structure**: Year levels, terms, periods, and school year management
- **Subject Management**: Academic subjects organized by departments
- **Guardian Management**: Student guardian relationships and contact information
- **Grade Tracking**: Student performance monitoring and score management
- **Classroom Management**: Physical classroom and facility administration

### Technical Features
- RESTful API design with standard HTTP methods
- PostgreSQL database with SQLAlchemy ORM
- JWT-based authentication
- Docker containerization
- Comprehensive testing suite
- CORS support for frontend integration

## 🛠 Technology Stack

- **Backend**: Flask 2.3.2, Flask-RESTful
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Containerization**: Docker & Docker Compose
- **Testing**: pytest, pytest-cov
- **Code Quality**: flake8
- **Frontend**: React with TypeScript (separate repository)

## 🏗 Architecture

The system follows a modular architecture with clear separation of concerns:

```
moz_school/
├── api/                    # Backend API
│   ├── models/            # Database models
│   ├── resources/          # API endpoints
│   ├── tests/             # Test suite
│   ├── utils/             # Utilities
│   └── webPlatform_api.py # Main application
├── frontend/              # React frontend
└── docker-compose.yml     # Container orchestration
```

## 📊 Data Model

The system uses a comprehensive relational database design with the following key entities:

### Core Educational Entities
- **Students**: Personal information, enrollment dates, academic progress
- **Teachers**: Professional profiles, contact details, subject assignments
- **Subjects**: Academic courses organized by departments
- **Classes**: Scheduled courses with teacher, classroom, and time assignments

### Academic Structure
- **School Years**: Academic year definitions with start/end dates
- **Terms**: Academic periods within school years
- **Year Levels**: Grade levels (e.g., Grade 1, Grade 2)
- **Periods**: Time slots for class scheduling

### Relationships & Tracking
- **Student-Year-Level**: Academic progression tracking
- **Student-Class**: Course enrollment and performance
- **Student-Guardian**: Family relationships and contact information
- **Class Scheduling**: Teacher, classroom, and time assignments

### Infrastructure
- **Departments**: Academic department organization
- **Classrooms**: Physical facilities with capacity and type classification
- **Score Ranges**: Grading scale definitions

## 🔌 API Endpoints

### Student Management
```
POST   /student              # Create new student
GET    /student/<id>         # Get student by ID
PUT    /student              # Update student
DELETE /student/<id>         # Delete student
```

### Teacher Management
```
POST   /teacher              # Create new teacher
GET    /teacher/<id>         # Get teacher by ID
PUT    /teacher              # Update teacher
DELETE /teacher/<id>         # Delete teacher
```

### Academic Structure
```
POST   /school_year          # Create school year
GET    /school_year/<id>     # Get school year
PUT    /school_year          # Update school year
DELETE /school_year/<id>     # Delete school year

POST   /year_level           # Create year level
GET    /year_level/<id>      # Get year level
PUT    /year_level           # Update year level
DELETE /year_level/<id>      # Delete year level

POST   /subject              # Create subject
GET    /subject/<id>         # Get subject
PUT    /subject              # Update subject
DELETE /subject/<id>         # Delete subject
```

### Class Management
```
POST   /class                # Create class
GET    /class/<id>           # Get class
PUT    /class                # Update class
DELETE /class/<id>           # Delete class
```

### Student Academic Tracking
```
GET    /student_year_level/level/<id>    # Get students by year level
GET    /student_year_level/year/<id>     # Get students by school year
GET    /student_year_level/student/<id>  # Get student's year level info

GET    /student_class/student/<id>       # Get student's classes
GET    /student_class/class/<id>         # Get class enrollment
```

### Infrastructure Management
```
POST   /department           # Create department
GET    /department/<id>      # Get department
PUT    /department           # Update department
DELETE /department/<id>      # Delete department

POST   /classroom_types      # Create classroom type
GET    /classroom_types/<id> # Get classroom type
PUT    /classroom_types      # Update classroom type
DELETE /classroom_types/<id> # Delete classroom type
```

## 🚀 Setup & Installation

### Prerequisites
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moz_school
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Verify installation**
   ```bash
   curl http://localhost:5000/
   # Should return: {"status": "Scale4Audit API online!"}
   ```

### Environment Variables

Create a `.env` file with the following variables:

```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=moz_school
POSTGRES_HOST=postgres-db
POSTGRES_PORT=5432
API_KEY=your_api_key
DEBUG=False
```

## 📖 Usage Examples

### Creating a Student

```bash
curl -X POST http://localhost:5000/student \
  -H "Content-Type: application/json" \
  -d '{
    "given_name": "John",
    "middle_name": "Michael",
    "surname": "Doe",
    "date_of_birth": "2010-05-15T00:00:00",
    "gender": "Male",
    "enrollment_date": "2023-09-01"
  }'
```

### Creating a Teacher

```bash
curl -X POST http://localhost:5000/teacher \
  -H "Content-Type: application/json" \
  -d '{
    "given_name": "Jane",
    "surname": "Smith",
    "gender": "Female",
    "email_address": "jane.smith@school.edu",
    "phone_number": "+1234567890"
  }'
```

### Creating a Subject

```bash
curl -X POST http://localhost:5000/subject \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "Mathematics",
    "department_id": "department-uuid-here"
  }'
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
docker-compose exec api pytest

# Run tests with coverage
docker-compose exec api pytest --cov=.

# Run specific test file
docker-compose exec api pytest tests/test_student.py
```

### Test Structure

Tests are organized by entity:
- `test_student.py` - Student management tests
- `test_teacher.py` - Teacher management tests
- `test_school_year.py` - Academic year tests
- `test_year_level.py` - Year level tests

## 🐳 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy with proper environment variables**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Services

The system runs the following services:
- **API**: Flask application (port 5000)
- **PostgreSQL**: Database (port 5432)
- **Adminer**: Database management interface (port 8080)

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   docker-compose exec api pytest
   ```
5. **Submit a pull request**

### Code Standards

- Follow PEP 8 style guidelines
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📝 License

[Add your license information here]

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Moz School API** - Empowering educational institutions with comprehensive management solutions.