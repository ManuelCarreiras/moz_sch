# Santa Isabel Escola - Portal Escolar

A modern React + TypeScript frontend for the Santa Isabel Escola school management system.

## 🎯 Overview

This is the frontend application for the Santa Isabel Escola school management portal, providing a clean and responsive interface for managing students, teachers, classes, and academic schedules.

## ✨ Features

### Landing Page
- **Responsive Design**: Adapts to all screen sizes from mobile to ultra-wide monitors
- **School Branding**: Features the official Santa Isabel Escola logo and watermark
- **Portal Access**: Login modal with Admin, Teacher, and Student portal options
- **Modern UI**: Dark theme with blue accents and smooth animations

### Technical Features
- **React 19** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **CSS Grid & Flexbox** for responsive layouts
- **Viewport Units** for true responsive scaling
- **Docker** containerization for production deployment

## 🛠 Technology Stack

- **Frontend**: React 19.1.1, TypeScript 5.8.3
- **Build Tool**: Vite with Rolldown
- **Styling**: CSS3 with CSS Grid, Flexbox, and custom properties
- **Containerization**: Docker with Nginx for production serving
- **Development**: ESLint, TypeScript strict mode

## 🚀 Quick Start

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
# Build and run with Docker Compose
docker-compose up -d --build

# Access the application
# Frontend: http://localhost:3000
# API: http://localhost:5000
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

### Environment Variables
- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:5000`)

### Build Configuration
- **TypeScript**: Strict mode enabled
- **ESLint**: React and TypeScript rules
- **Vite**: Optimized for production with code splitting

## 📝 Development Notes

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

## 🤝 Contributing

1. Follow TypeScript strict mode guidelines
2. Use the established responsive design system
3. Maintain the dark theme aesthetic
4. Test across all responsive breakpoints
5. Ensure accessibility standards

## 📞 Support

For technical support or questions about the Santa Isabel Escola portal:
- Check the API documentation
- Review the responsive design guidelines
- Test across different screen sizes

---

**Santa Isabel Escola** - Empowering education through technology.