# Santa Isabel Escola - Portal Escolar

A modern React + TypeScript frontend for the Santa Isabel Escola school management system with AWS Cognito authentication.

## 🎯 Overview

This is the frontend application for the Santa Isabel Escola school management portal, providing a clean and responsive interface for managing students, teachers, classes, and academic schedules with secure authentication.

## ✨ Features

### Authentication System
- **AWS Cognito Integration**: Secure user authentication with JWT tokens
- **Role-Based Access**: Admin, Teacher, and Student portals with different permissions
- **Multiple Auth Methods**: API key, debug mode, device access, and Cognito JWT
- **Session Management**: Automatic token refresh and secure logout

### Landing Page
- **Responsive Design**: Adapts to all screen sizes from mobile to ultra-wide monitors
- **School Branding**: Features the official Santa Isabel Escola logo and watermark
- **Portal Access**: Login modal with Admin, Teacher, and Student portal options
- **Modern UI**: Dark theme with blue accents and smooth animations

### Technical Features
- **React 19** with TypeScript for type safety
- **AWS Amplify** for Cognito authentication
- **Vite** for fast development and optimized builds
- **CSS Grid & Flexbox** for responsive layouts
- **Viewport Units** for true responsive scaling
- **Docker** containerization for production deployment

## 🛠 Technology Stack

- **Frontend**: React 19.1.1, TypeScript 5.8.3
- **Authentication**: AWS Amplify with Cognito
- **Build Tool**: Vite with Rolldown
- **Styling**: CSS3 with CSS Grid, Flexbox, and custom properties
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
│   ├── assets/           # Images and static assets
│   │   ├── Santa_Isabel.png
│   │   └── Escola_marca_de_água.png
│   ├── App.tsx          # Main application component
│   ├── App.css          # Global styles and responsive system
│   └── main.tsx         # Application entry point
├── public/              # Static public assets
├── Dockerfile          # Production Docker configuration
├── nginx.conf          # Nginx configuration for serving
└── package.json        # Dependencies and scripts
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