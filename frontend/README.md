# Santa Isabel Escola - Portal Escolar

A modern React + TypeScript frontend for the Santa Isabel Escola school management system with AWS Cognito authentication.

## 🎯 Overview

This is the frontend application for the Santa Isabel Escola school management portal, providing a clean and responsive interface for managing students, teachers, classes, and academic schedules with secure authentication.

## ✨ Features

### Authentication System
- **AWS Cognito Integration**: Secure user authentication with JWT tokens
- **Multi-Role Access**: Admin, Teacher, and Student portals with unified access (role restrictions temporarily disabled for development)
- **Multiple Auth Methods**: API key, debug mode, device access, and Cognito JWT
- **Session Management**: Automatic token refresh and secure logout

### Navigation & Routing
- **Client-Side Routing**: React Router DOM for seamless navigation
- **Landing Page**: `localhost:3000/landing` - School introduction and login access
- **Login Page**: `localhost:3000/login` - Dedicated authentication page
- **Admin Dashboard**: `localhost:3000/dashboard` - Administrative management interface
- **Student Portal**: `localhost:3000/student` - Student-specific features and tools
- **Teacher Portal**: `localhost:3000/teacher` - Teacher-specific features and tools
- **Guardian Portal**: `localhost:3000/guardian` - Guardian management and student assignments
- **Bidirectional Navigation**: Easy navigation between all portals

### Student Portal Features
- **Student Management**: Create new students with full form validation
- **API Integration**: Direct integration with Flask backend (`POST /student`)
- **Form Handling**: Complete student registration with required fields:
  - Given Name, Middle Name, Surname
  - Date of Birth, Gender, Enrollment Date
- **Real-time Feedback**: Success/error messages and loading states
- **Modal Interface**: Clean, accessible form design

### Teacher Portal Features
- **Teacher Management**: Create new teachers with full form validation
- **API Integration**: Direct integration with Flask backend (`POST /teacher`)
- **Form Handling**: Complete teacher registration with required fields:
  - Given Name, Surname, Gender
  - Email Address, Phone Number
- **Real-time Feedback**: Success/error messages and loading states
- **Modal Interface**: Clean, accessible single-column form design
- **Consistent UI**: Matches student portal design and behavior

### Guardian Portal Features
- **Guardian Management**: Create new guardians with full form validation
- **API Integration**: Direct integration with Flask backend (`POST /guardian`)
- **Multi-Student Assignment**: Assign one guardian to multiple students (one-to-many relationship)
- **Student Search**: Full name search with pagination for student selection
- **Guardian Search**: Search existing guardians by name, email, or phone
- **Relationship Types**: Standard guardian types (Mother, Father, Sister, Brother, Grandmother, Grandfather, Other)
- **Custom Relationships**: Specify custom relationship types when "Other" is selected
- **Pre-selection**: Newly created guardians are automatically pre-selected for assignment
- **Batch Assignment**: Assign guardian to multiple students with single operation
- **Modal Interface**: Wide modal with no horizontal scrolling for optimal UX

### Admin Dashboard Features
- **Overview Section**: Quick access to all portal features
- **Portal Access**: Direct navigation to Student, Teacher, and Guardian portals
- **Management Tools**: Access to Classes, Reports, and Settings
- **Student Management**: Full CRUD operations for student data
- **Teacher Management**: Complete teacher administration and creation
- **Guardian Management**: Complete guardian administration and student assignments
  - **Academic Setup**: Comprehensive academic structure management
    - **Department Management**: Create and manage academic departments
    - **Subject Management**: Organize subjects by departments
    - **Classroom Management**: Physical classroom and type administration
    - **Teacher Department Assignment**: Assign teachers to multiple departments
    - **School Year Management**: Complete academic year and grade level system
      - **Year Levels**: Manage grade levels with letters (A, B, C) and grades (1st-9th Grade)
      - **School Years**: Manage academic years (2026, 2027, etc.)
      - **Student Assignments**: Assign students to year levels and school years with combined format ("1st A", "2nd B")
  - **Academic Foundation**: Complete academic foundation management system
    - **Term Management**: Manage academic terms (semesters/quarters) with school year integration
    - **Period Management**: Manage daily class periods and scheduling with time-based organization
    - **Score Range Management**: Manage grading scales and letter grades (A, B, C, D, F)
    - **Tabbed Interface**: Unified management interface for all academic foundation components

### Landing Page
- **Responsive Design**: Adapts to all screen sizes from mobile to ultra-wide monitors
- **School Branding**: Features the official Santa Isabel Escola logo and watermark
- **Modern UI**: Dark theme with blue accents and smooth animations
- **Optimized Sizing**: Properly scaled elements for better user experience

### Technical Features
- **React 19** with TypeScript for type safety
- **AWS Amplify** for Cognito authentication
- **React Router DOM** for client-side routing
- **Vite** for fast development and optimized builds
- **CSS Grid & Flexbox** for responsive layouts
- **Viewport Units** for true responsive scaling
- **Docker** containerization for production deployment
- **API Integration**: Full backend connectivity with error handling

## 🛠 Technology Stack

- **Frontend**: React 19.1.1, TypeScript 5.8.3
- **Authentication**: AWS Amplify with Cognito
- **Routing**: React Router DOM 6.x
- **Build Tool**: Vite with Rolldown
- **Styling**: CSS3 with CSS Grid, Flexbox, and custom properties
- **API Integration**: Fetch API with error handling
- **Containerization**: Docker with Nginx for production serving
- **Development**: ESLint, TypeScript strict mode
- **Secrets Management**: Doppler for environment variables

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Doppler CLI (for secrets management)
- AWS Cognito User Pool and App Client

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Development
```bash
# Set Doppler token
export DOPPLER_TOKEN_TEMP="your_doppler_token"

# Build and run with Docker Compose
docker-compose up -d --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Database Admin: http://localhost:8080
```

## 📱 Responsive Design

The application uses a sophisticated responsive system:

- **Mobile**: < 640px - Single column layout, compact navigation
- **Tablet**: 640px - 1024px - Larger elements, multi-column features
- **Desktop**: 1024px - 1536px - Full layout with 3-column features grid
- **Ultra-wide**: > 1536px - Maximum scaling for large monitors

### Key Responsive Features
- **Logo Scaling**: `calc(2.5rem + 1vw)` to `calc(5rem + 2vw)`
- **Typography**: Viewport-based font scaling
- **Watermark**: Large background image showing half the tree on the right
- **Spacing**: Dynamic padding and margins using viewport units

## 🎨 Design System

### Color Palette
- **Background**: Dark blue gradient (`#0b1020` to `#070a15`)
- **Text**: Light blue-white (`#e8eefc`)
- **Primary**: Blue accent (`#4f7cff`)
- **Cards**: Dark blue (`#11182e`)
- **Borders**: Subtle blue (`#223055`)

### Typography Scale
- **XS**: `calc(0.75rem + 0.2vw)`
- **SM**: `calc(0.875rem + 0.3vw)`
- **Base**: `calc(1rem + 0.4vw)`
- **LG**: `calc(1.125rem + 0.5vw)`
- **XL**: `calc(1.25rem + 0.6vw)`
- **2XL**: `calc(1.5rem + 0.8vw)`
- **3XL**: `calc(1.875rem + 1vw)`
- **4XL**: `calc(2.25rem + 1.2vw)`
- **5XL**: `calc(3rem + 1.5vw)`
- **6XL**: `calc(3.75rem + 2vw)`

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── assets/                    # Images and static assets
│   │   ├── Santa_Isabel.png
│   │   └── Escola_marca_de_água.png
│   ├── components/                # React components
│   │   ├── admin/                # Admin dashboard components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── StudentsTable.tsx
│   │   │   ├── StudentWizard.tsx
│   │   │   ├── TeachersTable.tsx
│   │   │   ├── TeacherWizard.tsx
│   │   │   ├── SimpleGuardianWizard.tsx
│   │   │   ├── StudentGuardianAssignment.tsx
│   │   │   ├── TeacherDepartmentAssignment.tsx
│   │   │   ├── DepartmentTable.tsx
│   │   │   ├── SubjectTable.tsx
│   │   │   ├── ClassroomManagement.tsx
│   │   │   ├── SchoolYearManagement.tsx
│   │   │   ├── YearLevelTable.tsx
│   │   │   ├── SchoolYearTable.tsx
│   │   │   ├── StudentYearLevelAssignment.tsx
│   │   │   ├── TermTable.tsx
│   │   │   ├── PeriodTable.tsx
│   │   │   ├── ScoreRangeTable.tsx
│   │   │   ├── AcademicFoundationManagement.tsx
│   │   │   └── ClassesTable.tsx
│   │   ├── Dashboard.tsx         # Main dashboard component
│   │   ├── Landing.tsx           # Landing page component
│   │   ├── Login.tsx             # Login page component
│   │   ├── LoginModal.tsx        # Modal login component (legacy)
│   │   ├── StudentDashboard.tsx  # Student portal component
│   │   ├── TeacherDashboard.tsx  # Teacher portal component
│   │   └── GuardianDashboard.tsx # Guardian portal component
│   ├── contexts/                 # React contexts
│   │   └── AuthContext.tsx       # Authentication context
│   ├── services/                 # API and authentication services
│   │   ├── apiService.ts         # API communication
│   │   └── authService.ts        # Authentication service
│   ├── config/                   # Configuration files
│   │   └── auth.ts              # AWS Cognito configuration
│   ├── App.tsx                   # Main application component with routing
│   ├── App.css                   # Global styles and responsive system
│   └── main.tsx                  # Application entry point
├── public/                       # Static public assets
├── Dockerfile                    # Production Docker configuration
├── nginx.conf                    # Nginx configuration for serving
└── package.json                  # Dependencies and scripts
```

## 🐳 Production Deployment

### Docker Build
```bash
# Build the frontend image
docker build -t frontend .

# Run with environment variables
docker run -p 3000:80 \
  -e VITE_API_BASE_URL=http://your-api-url:5000 \
  frontend
```

### Docker Compose
The frontend is configured to work with the full stack:
- **Frontend**: Port 3000 (Nginx)
- **API**: Port 5000 (Flask)
- **Database**: Port 5432 (PostgreSQL)
- **Adminer**: Port 8080 (Database management)

## 🔧 Configuration

### Environment Variables (Doppler Secrets)
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

### Build Configuration
- **TypeScript**: Strict mode enabled
- **ESLint**: React and TypeScript rules
- **Vite**: Optimized for production with code splitting
- **AWS Amplify**: Cognito authentication configuration

## 📝 Development Notes

### Authentication Implementation
The authentication system uses:
- AWS Amplify for Cognito integration
- React Context for global auth state management
- JWT token handling with automatic refresh
- Role-based access control (Admin, Teacher, Student)
- Multiple authentication methods for flexibility

### Responsive Implementation
The responsive system uses:
- CSS Custom Properties for consistent spacing
- `clamp()` functions for fluid typography
- CSS Grid for layout structure
- Flexbox for component alignment
- Viewport units for true responsive scaling

### Asset Management
- Images are imported as React assets for proper bundling
- Vite handles optimization and caching
- Watermark uses React component for proper asset resolution

### API Integration
- Centralized API service with authentication headers
- Automatic JWT token injection
- Error handling and loading states
- TypeScript interfaces for type safety
- Student creation form with full validation
- Teacher creation form with full validation
- Guardian creation form with full validation
- Multi-student assignment with batch processing
- Teacher-department assignment with many-to-many relationships
- Academic structure management (departments, subjects, classrooms)
- School year and year level management with tabbed interface
- Student-year level assignment with combined format display
- Academic foundation management (terms, periods, score ranges)
- Real-time API communication with Flask backend
- Consistent success/error notifications across all forms
- Consistent modal styling and form field widths across all interfaces
- Tabbed interface for academic foundation management

### Navigation & Routing Implementation
- React Router DOM for client-side navigation
- Protected routes for authenticated users
- Public routes for landing and login pages
- Bidirectional navigation between portals
- Role-based route protection (currently disabled for development)

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Use the established responsive design system
3. Maintain the dark theme aesthetic
4. Test across all responsive breakpoints
5. Ensure accessibility standards
6. Follow authentication best practices
7. Test with different user roles

## 🐛 Troubleshooting

### Authentication Issues
- **Login not working**: Check Doppler secrets are set correctly
- **Cognito errors**: Verify User Pool ID and App Client ID
- **Token issues**: Check browser console for JWT errors
- **Permission denied**: Verify user is in correct Cognito group

### Development Issues
- **Build failures**: Check TypeScript errors and dependencies
- **Environment variables**: Ensure Doppler token is set
- **API connection**: Verify backend is running and accessible

## 📞 Support

For technical support or questions about the Santa Isabel Escola portal:
- Check the API documentation
- Review the authentication setup guide
- Test across different screen sizes
- Verify Doppler secrets configuration

---

**Santa Isabel Escola** - Empowering education through technology.