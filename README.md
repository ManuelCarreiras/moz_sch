# Santa Isabel Escola - School Management System

A comprehensive full-stack school management system with React frontend, Flask API, and AWS Cognito authentication for managing students, teachers, classes, and academic schedules.

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

Santa Isabel Escola is a modern full-stack school management system designed for comprehensive educational administration. It features a React frontend with AWS Cognito authentication, a Flask REST API backend, and PostgreSQL database for managing students, teachers, classes, subjects, academic years, and various educational administrative tasks.

### 🚀 **Current Status: Phase 2 Complete (100%)**

✅ **Personnel Management** - Students, Teachers, Guardians fully operational  
✅ **Academic Foundation** - Complete academic structure setup with guided wizard  
✅ **Assignment Interfaces** - All relationship management interfaces complete  
✅ **UI/UX Excellence** - Consistent, responsive design across all components  

**Next Phase**: Academic Operations (Class Management, Enrollment, Grades)

## ✨ Features

### Core Functionality
- **Student Management**: Complete student lifecycle from enrollment to graduation with wizard-based creation
- **Teacher Management**: Teacher profiles, contact information, and department assignments with wizard interface
- **Guardian Management**: Guardian creation and student-guardian relationship management
- **Academic Structure**: Comprehensive academic foundation with year levels, terms, periods, and school years
- **Subject Management**: Academic subjects organized by departments with integrated grading scales
- **Score Ranges**: Flexible grading scales (A, B, C, etc.) linked to subjects
- **Classroom Management**: Physical classroom and facility administration with type classifications
- **Academic Setup Wizard**: Guided step-by-step setup for complete academic infrastructure
- **Assignment Interfaces**: Streamlined bulk assignment for teacher-department and student-year level relationships

### Authentication & Security
- **AWS Cognito Integration**: Secure user authentication with JWT tokens
- **Multi-Portal Access**: Admin, Teacher, and Student portals with unified access
- **Role-Based Routing**: Client-side navigation with protected routes (role restrictions temporarily disabled for development)
- **Multiple Auth Methods**: API key, debug mode, device access, and Cognito JWT
- **Session Management**: Automatic token refresh and secure logout

### Technical Features
- **Frontend**: React 19 with TypeScript, AWS Amplify, and React Router DOM
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: PostgreSQL with comprehensive relational design
- **Containerization**: Docker & Docker Compose
- **Secrets Management**: Doppler for secure environment variables
- **Testing**: Comprehensive test suite with pytest
- **CORS Support**: Full frontend-backend integration
- **Client-Side Routing**: Seamless navigation between portals
- **API Integration**: Real-time frontend-backend communication

## 🛠 Technology Stack

### Frontend
- **React 19.1.1** with TypeScript 5.8.3
- **AWS Amplify** for Cognito authentication
- **React Router DOM** for client-side routing
- **Vite** with Rolldown for fast builds
- **CSS Grid & Flexbox** for responsive design
- **Nginx** for production serving
- **Fetch API** for backend communication

### Backend
- **Flask 2.3.2** with Flask-RESTful
- **PostgreSQL** with SQLAlchemy ORM
- **AWS Cognito** for JWT authentication
- **Doppler** for secrets management
- **Gunicorn** for production WSGI server

### DevOps & Infrastructure
- **Docker & Docker Compose** for containerization
- **pytest** for testing
- **flake8** for code quality
- **Adminer** for database management

## 🏗 Architecture

The system follows a modular architecture with clear separation of concerns:

```
moz_sch/
├── api/                    # Backend API
│   ├── models/            # Database models
│   ├── resources/          # API endpoints
│   ├── tests/             # Test suite
│   ├── utils/             # Utilities (auth, JWT, email)
│   └── webPlatform_api.py # Main Flask application
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── services/      # API and auth services
│   │   └── config/        # Configuration files
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Container orchestration
└── README.md             # Project documentation
```

## 📊 Data Model

The system uses a comprehensive relational database design with the following key entities:

### Core Educational Entities
- **Students**: Personal information, enrollment dates, academic progress
- **Teachers**: Professional profiles, contact details, subject assignments
- **Subjects**: Academic courses organized by departments
- **Classes**: Scheduled courses with teacher, classroom, and time assignments

### Academic Structure
- **School Years**: Academic year management (2026, 2027, etc.) with start/end dates
- **Year Levels**: Grade level management with letters and grades (1st Grade A, 2nd Grade B, etc.)
- **Terms**: Academic periods within school years (semesters/quarters)
- **Periods**: Time slots for class scheduling (daily periods)
- **Score Ranges**: Grading scales and letter grades integrated with subject management

### Relationships & Tracking
- **Student-Year-Level**: Academic progression tracking with grade and level assignments
- **Student-Class**: Course enrollment and performance
- **Student-Guardian**: Family relationships and contact information
- **Teacher-Department**: Teacher assignments to academic departments
- **Class Scheduling**: Teacher, classroom, and time assignments

### Infrastructure
- **Departments**: Academic department organization
- **Classrooms**: Physical facilities with capacity and type classification
- **Subject-Score Range Integration**: Score ranges linked to subjects for flexible grading

## 🔌 API Endpoints

### Student Management
```
POST   /student              # Create new student (integrated with frontend form)
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
GET    /school_year          # Get all school years
GET    /school_year/<id>     # Get school year by ID
PUT    /school_year          # Update school year
DELETE /school_year/<id>     # Delete school year

POST   /year_level           # Create year level
GET    /year_level           # Get all year levels
GET    /year_level/<id>      # Get year level by ID
PUT    /year_level           # Update year level
DELETE /year_level/<id>      # Delete year level

POST   /term                 # Create term
GET    /term                 # Get all terms
GET    /term/<id>            # Get term by ID
PUT    /term                 # Update term
DELETE /term/<id>            # Delete term

POST   /period               # Create period
GET    /period               # Get all periods
GET    /period/<id>          # Get period by ID
PUT    /period               # Update period
DELETE /period/<id>          # Delete period

POST   /score_range          # Create score range
GET    /score_range          # Get all score ranges
GET    /score_range/<id>     # Get score range by ID
PUT    /score_range          # Update score range
DELETE /score_range/<id>     # Delete score range

POST   /subject              # Create subject
GET    /subject              # Get all subjects
GET    /subject/<id>         # Get subject by ID
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
POST   /student_year_level             # Create student-year level assignment
GET    /student_year_level             # Get all student-year level assignments
GET    /student_year_level/<id>        # Get assignment by ID
PUT    /student_year_level/<id>        # Update assignment
DELETE /student_year_level/<id>        # Delete assignment

GET    /student_year_level/level/<id>    # Get students by year level
GET    /student_year_level/year/<id>     # Get students by school year
GET    /student_year_level/student/<id>  # Get student's year level info

GET    /student_class/student/<id>       # Get student's classes
GET    /student_class/class/<id>         # Get class enrollment
```

### Infrastructure Management
```
POST   /department           # Create department
GET    /department           # Get all departments
GET    /department/<id>      # Get department by ID
PUT    /department           # Update department
DELETE /department/<id>      # Delete department

POST   /classroom            # Create classroom
GET    /classroom            # Get all classrooms
GET    /classroom/<id>       # Get classroom by ID
PUT    /classroom            # Update classroom
DELETE /classroom/<id>       # Delete classroom

POST   /classroom_types      # Create classroom type
GET    /classroom_types      # Get all classroom types
GET    /classroom_types/<id> # Get classroom type by ID
PUT    /classroom_types      # Update classroom type
DELETE /classroom_types/<id> # Delete classroom type
```

## 🚀 Setup & Installation

### Prerequisites
- Docker and Docker Compose
- Git
- Doppler CLI (for secrets management)
- AWS Cognito User Pool and App Client

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd moz_sch
   ```

2. **Set up Doppler secrets**
   ```bash
   # Install Doppler CLI
   # Add secrets to your Doppler project (see Configuration section)
   export DOPPLER_TOKEN_TEMP="your_doppler_token"
   ```

3. **Start the services**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify installation**
   ```bash
   # Check API
   curl http://localhost:5000/
   # Should return: {"status": "Sta API online!"}
   
   # Check Frontend
   open http://localhost:3000
   
   # Check Database Admin
   open http://localhost:8080
   ```

### Configuration (Doppler Secrets)

Add these secrets to your Doppler project:

```bash
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=santa_isabel_db
POSTGRES_HOST=postgres-db
POSTGRES_PORT=5432

# API Configuration
API_KEY=your_secure_api_key
DEBUG=true

# Cognito Configuration
AWS_COGNITO_USERPOOL_ID=eu-west-1_xxxxxxxxx
AWS_COGNITO_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_REGION_NAME=eu-west-1

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:5000
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
    "department_id": "department-uuid-here",
    "score_range_id": "score-range-uuid-here"
  }'
```

### Creating a Score Range

```bash
curl -X POST http://localhost:5000/score_range \
  -H "Content-Type: application/json" \
  -d '{
    "grade": "A",
    "min_score": 90,
    "max_score": 100
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
- **Frontend**: React application with Nginx (port 3000)
- **API**: Flask application with Gunicorn (port 5000)
- **PostgreSQL**: Database (port 5432)
- **Adminer**: Database management interface (port 8080)

### Authentication Flow

1. **User Access**: Users visit the frontend at `http://localhost:3000`
2. **Landing Page**: Users see the school portal introduction at `/landing`
3. **Login**: Users navigate to `/login` and authenticate via AWS Cognito
4. **Portal Navigation**: Users can access any portal:
   - **Admin Dashboard**: `/dashboard` - Administrative management
   - **Student Portal**: `/student` - Student features and management
   - **Teacher Portal**: `/teacher` - Teacher features and management
5. **Token Management**: JWT tokens are automatically managed
6. **API Access**: Authenticated requests include JWT tokens
7. **Bidirectional Navigation**: Easy navigation between all portals

### Current Development Status

- **Role Restrictions**: Temporarily disabled for development - any authenticated user can access all portals
- **Student Management**: Fully functional with frontend form integration
- **Navigation**: Complete bidirectional navigation between all portals
- **API Integration**: Student creation form directly connected to Flask backend

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

- Follow PEP 8 style guidelines for Python
- Follow TypeScript strict mode guidelines for React
- Write comprehensive tests for new features
- Update documentation for API changes
- Use meaningful commit messages
- Test authentication flows with different user roles

## 📝 License

[Add your license information here]

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Santa Isabel Escola** - Empowering education through technology with modern full-stack solutions.