# Santa Isabel Escola - Portal Escolar

A modern React + TypeScript frontend for the Santa Isabel Escola school management system with AWS Cognito authentication.

## 🎯 Overview

This is the frontend application for the Santa Isabel Escola school management portal, providing a clean and responsive interface for managing students, teachers, classes, and academic schedules with secure authentication.

### 🎉 **Phase 3 & 4 Complete - Grading & Attendance (90%+)**

**✅ Assignment System**: Complete assignment creation, management, and tracking  
**✅ Grading System**: Full gradebook with 0-20 scale and weighted year averages  
**✅ Attendance System**: Teacher attendance taking and student attendance viewing  
**✅ Student Portal**: Assignments (list + calendar), Grades, Attendance, Schedule  
**✅ Teacher Portal**: Assignments, Gradebook, Attendance, My Classes  
**✅ Cascading Filters**: Year → Term → Subject → Class across all features  
**✅ UI/UX Excellence**: Dark theme, responsive design, intuitive workflows  

**🚀 Next Phase**: Admin Analytics & Reports (Grade reports, Attendance analytics, Parent portal)

## ✨ Features

### Authentication System
- **AWS Cognito Integration**: Secure user authentication with JWT tokens
- **Force Password Change Flow**: Handles NEW_PASSWORD_REQUIRED challenge for first-time student logins
- **Multi-Role Access**: Admin, Teacher, and Student portals with role-based navigation
- **Multiple Auth Methods**: API key, debug mode, device access, and Cognito JWT
- **Session Management**: Automatic token refresh and secure logout
- **Username-Based Authentication**: Extracts username from JWT tokens for student lookup

### Navigation & Routing
- **Client-Side Routing**: React Router DOM for seamless navigation
- **Landing Page**: `localhost:3000/landing` - School introduction and login access
- **Login Page**: `localhost:3000/login` - Dedicated authentication page
- **Admin Dashboard**: `localhost:3000/dashboard` - Administrative management interface
- **Student Portal**: `localhost:3000/student` - Student-specific features and tools
- **Teacher Portal**: `localhost:3000/teacher` - Teacher-specific features and tools
- **Guardian Portal**: `localhost:3000/guardian` - Guardian management and student assignments
- **Bidirectional Navigation**: Easy navigation between all portals

### Student Portal Features ✨
- **Student Assignments**: View all assignments with list and calendar views
  - List view with color-coded due dates (overdue, due soon, plenty of time)
  - Calendar view showing assignments on their due dates
  - Filter by year, subject, term, status
  - See score if graded, submission status
  - Navigate between months in calendar
- **Student Grades**: View academic performance
  - Year averages per subject (0-20 scale) with color-coded cards
  - Individual assignment grades table
  - Filter by subject and school year
  - See score, percentage, weight for each assignment
  - Performance indicators (Excellent, Good, Satisfactory, Needs Improvement)
- **Student Attendance**: Personal attendance tracking
  - Cascading filters: Year → Term → Subject
  - Statistics cards: Present, Absent, Late, Excused counts + Attendance Rate%
  - Attendance history table with dates and notes
  - Color-coded status badges
- **Student Schedule View**: Read-only timetable displaying enrolled classes
  - Grid-based timetable with days of week (Monday-Friday) as columns
  - Period rows with time intervals
  - Filter by school year and term (with smart cascading)
  - Terms automatically filter by selected school year
  - Auto-reset term selection when year changes
  - Clean UI with no redundant year labels
  - Persistent filter options - all years/terms remain visible for easy switching
  - Displays subject, teacher, period, and classroom information
  - Automatic authentication via JWT token (uses username lookup)
- **Student Management**: Create new students with full form validation (admin-only)
  - Email field required for Cognito user creation
  - API Integration: Direct integration with Flask backend (`POST /student`)
  - Automatically creates Cognito user with generated username
  - Form Handling: Complete student registration with required fields:
    - Given Name, Middle Name, Surname, Email
    - Date of Birth, Gender, Enrollment Date
- **Real-time Feedback**: Success/error messages and loading states
- **Modal Interface**: Clean, accessible form design

### Teacher Portal Features ✨
- **Assignment Management**: Create and manage assignments
  - Assignment creation wizard with cascading filters (Department → Subject → Year → Term → Class)
  - Current/upcoming year restriction
  - Assessment type selection (Homework, Quiz, Test, etc.)
  - Assignment list with hierarchical filters (Year, Subject, Class, Status)
  - Edit and delete operations
  - Auto-create student_assignment records on publish
- **Gradebook**: Enter and manage student grades
  - Cascading filters: Year → Term → Subject → Class → Assignment
  - Assignment selector dropdown
  - Vertical student list with grades
  - Click score cell to edit, Enter to save
  - Editable status dropdown (Not Submitted, Submitted, Graded, Late)
  - Auto-calculates year average (0-20 scale)
  - Weighted average based on assignment weights
- **Attendance**: Take and manage class attendance
  - Cascading filters: Year → Term → Subject → Class + Date picker
  - Student roster with all enrolled students
  - Status dropdown per student (Present, Absent, Late, Excused)
  - Notes field for each student
  - Bulk actions: Mark All Present / Mark All Absent
  - Live statistics: Attendance counts and rate percentage
  - Save button for bulk attendance submission
- **Teacher Schedule View**: Read-only timetable displaying assigned classes
  - Grid-based timetable showing all classes taught by the teacher
  - Filter by school year and term (with smart cascading)
  - Terms automatically filter by selected school year
  - Auto-reset term selection when year changes
  - Clean UI with no redundant year labels
  - Persistent filter options - all years/terms remain visible for easy switching
  - Displays subject, period, classroom, and class name information
  - Automatic authentication via JWT token (uses username lookup)
- **Teacher Management**: Create new teachers with full form validation (admin-only)
- **API Integration**: Direct integration with Flask backend (`POST /teacher`, `GET /teacher/schedule`)
- **Form Handling**: Complete teacher registration with required fields:
  - Given Name, Surname, Gender
  - Email Address, Phone Number
- **Cognito User Creation**: Automatically creates Cognito user with generated username (first initial + surname)
- **Real-time Feedback**: Success/error messages and loading states
- **Modal Interface**: Clean, accessible single-column form design
- **Consistent UI**: Matches student portal design and behavior
- **Role-Based Access**: "Create New Teacher" button only visible to admin users

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
    - **Subject Management**: Organize subjects by departments with integrated score range assignment
    - **Classroom Management**: Physical classroom and type administration
    - **Teacher Department Assignment**: Assign teachers to multiple departments
    - **School Year Management**: Complete academic year and grade level system
      - **Year Levels**: Manage grade levels with letters (A, B, C) and grades (1st-9th Grade)
      - **School Years**: Manage academic years (2026, 2027, etc.)
      - **Student Assignments**: Assign students to year levels and school years with combined format ("1st A", "2nd B")
  - **Academic Foundation**: Complete academic foundation management system with guided setup wizard
    - **Term Management**: Manage academic terms (semesters/quarters) with school year filtering
    - **Period Management**: Manage daily class periods and scheduling with school year filtering
    - **Score Range Management**: Manage grading scales and letter grades integrated with subject creation
    - **Tabbed Interface**: Unified management interface for all academic foundation components
    - **Smart Filtering**: School year filter on Period and Term management tables
    - **Classes Search**: Year and term filtering with cascading dropdowns
    - **Year Level Timetable**: Comprehensive filtering by grade, section, school year, and term
  - **Academic Setup Wizard** 🧙‍♂️: Comprehensive guided setup for academic infrastructure
    - **6-Step Process**: Welcome → Academic Years → Terms → Periods → Departments → Completion
    - **Auto-Generation**: Smart term date calculation and distribution
    - **Default Templates**: Pre-configured period schedules and department lists
    - **Progress Tracking**: Visual progress bar and step indicators
    - **Real-time Status**: Shows existing data and system configuration
    - **Validation**: Comprehensive form validation and error handling

### Landing Page
- **Responsive Design**: Adapts to all screen sizes from mobile to ultra-wide monitors
- **School Branding**: Features the official Santa Isabel Escola logo and watermark
- **Modern UI**: Dark theme with blue accents and smooth animations
- **Optimized Sizing**: Properly scaled elements for better user experience

### Technical Features
- **React 19** with TypeScript for type safety
- **AWS Amplify** for Cognito authentication
- **Force Password Change**: Complete NEW_PASSWORD_REQUIRED challenge flow
- **React Router DOM** for client-side routing
- **Vite** for fast development and optimized builds
- **CSS Grid & Flexbox** for responsive layouts
- **Viewport Units** for true responsive scaling
- **Docker** containerization for production deployment
- **API Integration**: Full backend connectivity with error handling
- **Student Schedule Component**: Grid-based timetable with smart year/term filtering
- **Teacher Schedule Component**: Grid-based timetable with smart year/term filtering
- **Filtering System**: Comprehensive cascading filters across all management interfaces

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
│   │   │   ├── SubjectTable.tsx (with integrated score range management)
│   │   │   ├── ClassroomManagement.tsx
│   │   │   ├── SchoolYearManagement.tsx
│   │   │   ├── YearLevelTable.tsx
│   │   │   ├── SchoolYearTable.tsx
│   │   │   ├── StudentYearLevelAssignment.tsx
│   │   │   ├── TermTable.tsx (with school year filtering)
│   │   │   ├── PeriodTable.tsx (with school year filtering)
│   │   │   ├── ScoreRangeTable.tsx
│   │   │   ├── AcademicFoundationManagement.tsx
│   │   │   ├── AcademicSetupWizard.tsx
│   │   │   ├── ClassesTable.tsx (with year/term filtering)
│   │   │   ├── YearLevelTimetable.tsx (with comprehensive filtering)
│   │   │   └── StudentClassEnrollment.tsx (with year/term filtering)
│   │   ├── Dashboard.tsx         # Main dashboard component
│   │   ├── Landing.tsx           # Landing page component
│   │   ├── Login.tsx             # Login page component
│   │   ├── LoginModal.tsx        # Modal login component (legacy)
│   │   ├── StudentDashboard.tsx  # Student portal component
│   │   ├── StudentSchedule.tsx  # Student schedule/timetable view (with smart filtering)
│   │   ├── TeacherDashboard.tsx  # Teacher portal component
│   │   ├── TeacherSchedule.tsx  # Teacher schedule/timetable view (with smart filtering)
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
- Force password change flow for NEW_PASSWORD_REQUIRED challenge
- Role-based access control (Admin, Teacher, Student)
- Multiple authentication methods for flexibility
- Username extraction from JWT tokens for student lookup

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
- Subject-score range integration with flexible assignment workflow
- Score range creation integrated into subject creation process
- Student schedule API integration (`GET /student/schedule`)
- Teacher schedule API integration (`GET /teacher/schedule`)
- Username-based student and teacher lookup for authentication
- Real-time API communication with Flask backend
- Consistent success/error notifications across all forms
- Consistent modal styling and form field widths across all interfaces
- Tabbed interface for academic foundation management
- Modal UI consistency fixes across all components
- Force password change flow for first-time student/teacher logins
- Smart filtering system: Cascading year/term filters across all management interfaces
- Filter persistence: All available years/terms remain visible for easy switching
- Auto-reset filters: Term selection resets when year changes for better UX
- Clean UI: Redundant year labels removed from term dropdowns when year is selected
- Comprehensive filtering: Applied to Period Table, Term Table, Classes Search, Student/Teacher Schedules, Year Level Timetable

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

---

## 📊 **Tomorrow's Plan - Phase 5: Admin Enhancements**

### **Priority 1: Admin Grade Management**
1. **Assessment Type Management Tab** - Admin interface to manage assessment types
2. **School-Wide Assignment View** - See all assignments across all classes
3. **Grade Analytics Dashboard** - School-wide statistics and reports
4. **Grade Distribution Charts** - Visual analytics per class/subject

### **Priority 2: Admin Attendance Management**
1. **Attendance Reports** - School-wide attendance statistics
2. **Truancy Tracking** - Identify students with excessive absences
3. **Attendance Analytics** - Charts and trends by class/period/day
4. **Export Functionality** - PDF/Excel export for reports

### **Priority 3: Parent/Guardian Portal**
1. **Grade Access** - Parents view their children's grades
2. **Attendance Access** - Parents view attendance records
3. **Assignment Access** - Parents see upcoming assignments
4. **Multi-Child Support** - Toggle between multiple children

### **Priority 4: Additional Enhancements**
1. **Notification System** - Email alerts for new grades/absences
2. **Report Card Generation** - PDF export with school branding
3. **Bulk Import/Export** - CSV/Excel for grades and attendance
4. **Performance Optimizations** - Caching, pagination, lazy loading

### **Nice-to-Have Features**
- Assignment submission (file upload)
- Grade comments/feedback UI
- Attendance calendar view
- Grade history/audit trail
- What-If grade calculator for students

---

**Santa Isabel Escola** - Empowering education through technology.