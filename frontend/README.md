# Moz School Frontend - School Management Dashboard

A modern React-based frontend application for the Moz School Management System, providing intuitive dashboards for students, teachers, and administrators.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles & Dashboards](#user-roles--dashboards)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development](#development)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

Moz School Frontend is a React TypeScript application that provides comprehensive dashboards for managing school operations. It serves as the user interface for students, teachers, and administrators to interact with the Moz School API backend.

## ✨ Features

### Core Functionality
- **Multi-Role Dashboard System**: Tailored interfaces for students, teachers, and administrators
- **Student Portal**: Academic progress tracking, class schedules, grade viewing
- **Teacher Portal**: Class management, student roster, grade entry, attendance tracking
- **Admin Portal**: Complete system management, user administration, academic structure setup
- **Real-time Updates**: Live data synchronization with backend API
- **Responsive Design**: Mobile-first approach with modern UI/UX

### Technical Features
- **Modern React**: Built with React 18+ and TypeScript
- **State Management**: Redux Toolkit for global state management
- **Routing**: React Router for navigation
- **UI Components**: Material-UI or Ant Design component library
- **Authentication**: JWT-based authentication with role-based access control
- **API Integration**: Axios for HTTP requests with interceptors
- **Form Handling**: React Hook Form with validation
- **Testing**: Jest and React Testing Library

## 🏠 Landing Page & Authentication

### Landing Page
**Purpose**: Welcome page and authentication gateway

**Key Features**:
- **Welcome Screen**: School branding and system overview
- **Authentication Options**: Login with Cognito user groups
- **Role-Based Redirects**: Automatic routing based on user group membership
- **System Information**: Quick overview of available features

**Authentication Flow**:
1. User visits landing page
2. Clicks login button
3. Redirected to Cognito hosted UI
4. After authentication, redirected back to frontend
5. Frontend checks user group membership
6. Redirects to appropriate dashboard (Student/Teacher/Admin)

### Cognito Integration
- **User Groups**: Students, Teachers, Admins
- **Hosted UI**: AWS Cognito authentication interface
- **JWT Tokens**: Access and ID tokens for API authentication
- **Role Mapping**: Cognito groups mapped to application roles

## 👥 User Roles & Dashboards

### 🎓 Student Dashboard
**Purpose**: Academic self-service portal for students

**Key Features**:
- **Academic Overview**
  - Current year level and enrollment status
  - Academic progress summary
  - Upcoming assignments and exams
- **Class Schedule**
  - Weekly timetable view
  - Subject and teacher information
  - Classroom locations
- **Grade Center**
  - Current grades by subject
  - Grade history and trends
  - Assignment feedback
- **Profile Management**
  - Personal information updates
  - Contact details management
  - Guardian information

**Available Actions**:
- View academic progress
- Check class schedules
- Access grades and feedback
- Update personal information
- View guardian contacts

### 👨‍🏫 Teacher Dashboard
**Purpose**: Classroom management and student interaction portal

**Key Features**:
- **Class Management**
  - Assigned classes and subjects
  - Student roster per class
  - Class schedule overview
- **Student Tracking**
  - Student performance monitoring
  - Attendance tracking
  - Grade entry and management
- **Academic Tools**
  - Assignment creation and management
  - Grade book functionality
  - Student progress reports
- **Communication**
  - Student contact information
  - Guardian communication tools
  - Announcement posting

**Available Actions**:
- Manage class rosters
- Enter and update grades
- Track student attendance
- Create assignments
- Generate progress reports
- Communicate with guardians

### 🔧 Admin Dashboard
**Purpose**: Complete system administration and oversight

**Key Features**:
- **User Management**
  - Student enrollment and management
  - Teacher account administration
  - Guardian account management
  - User role assignments
- **Academic Structure**
  - School year management
  - Year level configuration
  - Subject and department setup
  - Term and period management
- **Class Administration**
  - Class creation and scheduling
  - Teacher assignments
  - Classroom allocation
  - Capacity management
- **System Configuration**
  - Department management
  - Classroom types and facilities
  - Score range definitions
  - System settings

**Available Actions**:
- Full CRUD operations on all entities
- Bulk data import/export
- System configuration
- User role management
- Academic structure setup
- Reporting and analytics

## 🛠 Technology Stack

- **Frontend Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **UI Library**: Material-UI (MUI) or Ant Design
- **HTTP Client**: Axios
- **Form Management**: React Hook Form
- **Validation**: Yup or Zod
- **Styling**: CSS Modules or Styled Components
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm

## 🏗 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── student/        # Student dashboard pages
│   │   ├── teacher/        # Teacher dashboard pages
│   │   └── admin/          # Admin dashboard pages
│   ├── services/          # API service layer
│   │   ├── api/           # API endpoints
│   │   ├── auth/          # Authentication service
│   │   └── types/          # TypeScript types
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── middleware/     # Custom middleware
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── constants/         # Application constants
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── tests/                 # Test files
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see main README.md)

### Quick Start

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   ```
   http://localhost:3000
   ```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Moz School
VITE_APP_VERSION=1.0.0
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests
npm run test:coverage   # Run tests with coverage
npm run test:watch      # Run tests in watch mode

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier

# Type Checking
npm run type-check      # Run TypeScript compiler
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/dashboard-component
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   npm run test
   ```

3. **Ensure code quality**
   ```bash
   npm run lint:fix
   npm run format
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add student dashboard component"
   git push origin feature/dashboard-component
   ```

## 🔌 API Integration

### Service Layer Structure

```typescript
// services/api/studentService.ts
export const studentService = {
  getStudent: (id: string) => api.get(`/student/${id}`),
  createStudent: (data: CreateStudentRequest) => api.post('/student', data),
  updateStudent: (data: UpdateStudentRequest) => api.put('/student', data),
  deleteStudent: (id: string) => api.delete(`/student/${id}`),
};

// services/api/teacherService.ts
export const teacherService = {
  getTeacher: (id: string) => api.get(`/teacher/${id}`),
  createTeacher: (data: CreateTeacherRequest) => api.post('/teacher', data),
  updateTeacher: (data: UpdateTeacherRequest) => api.put('/teacher', data),
  deleteTeacher: (id: string) => api.delete(`/teacher/${id}`),
};
```

### API Endpoints Mapping

| Frontend Feature | Backend Endpoint | Method |
|------------------|------------------|---------|
| Student Profile | `/student/<id>` | GET |
| Create Student | `/student` | POST |
| Update Student | `/student` | PUT |
| Delete Student | `/student/<id>` | DELETE |
| Teacher Profile | `/teacher/<id>` | GET |
| Class Schedule | `/class/<id>` | GET |
| Student Classes | `/student_class/student/<id>` | GET |
| Year Level Info | `/student_year_level/student/<id>` | GET |

## 🔐 Authentication

### Cognito Authentication Flow

1. **Login Process**
   - User clicks login on landing page
   - Redirected to AWS Cognito hosted UI
   - User authenticates with Cognito
   - Cognito returns JWT tokens (Access + ID tokens)
   - Tokens stored securely in browser
   - Tokens included in subsequent API requests

2. **Role-Based Access Control**
   - Cognito user groups determine application roles
   - Frontend checks group membership from JWT claims
   - Routes protected based on user group
   - API requests include role validation
   - Automatic redirect to appropriate dashboard

3. **Token Management**
   - Cognito handles token refresh automatically
   - Logout clears tokens and redirects to Cognito
   - Token expiration handled by Cognito SDK
   - Secure token storage using Cognito best practices

### Protected Routes

```typescript
// Route protection example
<Route path="/student/*" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentDashboard />
  </ProtectedRoute>
} />

<Route path="/teacher/*" element={
  <ProtectedRoute allowedRoles={['teacher']}>
    <TeacherDashboard />
  </ProtectedRoute>
} />

<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## 🐳 Deployment

### Production Build

```bash
# Build for production
npm run build

# The build output will be in the 'dist' directory
```

### Docker Deployment

The frontend includes a multi-stage Dockerfile that follows the same pattern as your backend:

```dockerfile
# Multi-stage build for React frontend
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

The frontend is integrated into your main `docker-compose.yml`:

```yaml
frontend:
  image: frontend
  container_name: frontend
  build:
    context: ./frontend
    dockerfile: ./Dockerfile
  ports:
    - "3000:80"
  restart: always
  depends_on:
    - api
```

### Development with Docker

For development with hot reload, use the development compose file:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Access frontend at http://localhost:3000
# Access API at http://localhost:5000
# Access database admin at http://localhost:8080
```

### Environment Configuration

```bash
# Production environment variables
VITE_API_BASE_URL=https://api.mozschool.com
VITE_APP_NAME=Moz School
VITE_APP_VERSION=1.0.0
```

## 🧪 Testing

### Test Structure

```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { StudentDashboard } from '../StudentDashboard';

describe('StudentDashboard', () => {
  it('renders student information correctly', () => {
    render(<StudentDashboard student={mockStudent} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Testing Strategy

- **Unit Tests**: Individual component testing
- **Integration Tests**: API service testing
- **E2E Tests**: Complete user flow testing
- **Accessibility Tests**: WCAG compliance testing

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Design Principles

- **Mobile-First**: Design for mobile devices first
- **Progressive Enhancement**: Enhance for larger screens
- **Touch-Friendly**: Appropriate touch targets (44px minimum)
- **Accessibility**: WCAG 2.1 AA compliance

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Follow ESLint configuration
   - Use Prettier for formatting
   - Write meaningful commit messages
   - Follow conventional commits

2. **Component Development**
   - Use TypeScript for type safety
   - Write comprehensive tests
   - Document component props
   - Follow accessibility guidelines

3. **State Management**
   - Use Redux Toolkit for global state
   - Keep local state minimal
   - Use custom hooks for reusable logic

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For frontend-specific support:
- Check the component documentation
- Review the API integration guide
- Test with the backend API
- Create an issue for bugs or feature requests

---

**Moz School Frontend** - Modern, intuitive, and accessible school management interface.