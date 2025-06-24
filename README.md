# 🖥️ Authentication Frontend

A modern, responsive React application providing a comprehensive administrative interface and user portal for the Authentication & Authorization system. Built with React 19, Tailwind CSS, and modern development practices.

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.10-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Features

### 🎨 Modern User Interface
- **Responsive Design**: Mobile-first approach that works on all devices
- **Tailwind CSS**: Beautiful, consistent styling with utility-first framework
- **Modern Components**: Reusable UI components with consistent design system
- **Loading States**: Smooth loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Dark Mode Ready**: Prepared for dark theme implementation

### 🔐 Authentication & Security
- **JWT Token Management**: Automatic token refresh and secure storage
- **Protected Routes**: Route-level authentication and authorization
- **Role-Based Access**: Different interfaces for users and admins
- **Session Management**: Real-time session monitoring and control
- **Secure Logout**: Complete session cleanup and token invalidation
- **Password Management**: Secure password reset and change workflows

### 👥 User Management Interface
- **User Dashboard**: Personal overview and account management
- **Profile Management**: Edit personal information and preferences
- **Session Control**: View and manage active sessions across devices
- **Password Management**: Change password with validation
- **Account Settings**: Comprehensive user preferences

### 🛡️ Administrative Features
- **User Administration**: Complete user management with creation and editing
- **Role Management**: Create and assign roles with permissions
- **Permission Control**: Fine-grained permission assignment interface
- **Session Monitoring**: System-wide session tracking and management
- **Company Management**: Multi-tenant company administration (root admin)
- **Integration Management**: External system integration configuration

### 🔗 Integration Management
- **API Key Management**: Generate and manage integration credentials
- **Webhook Configuration**: Set up and monitor webhook endpoints
- **Integration Types**: Support for OAuth2, API Key, and custom integrations
- **Secret Regeneration**: Secure API secret management interface
- **Real-Time Monitoring**: Live integration status and activity

### 📱 User Experience
- **Intuitive Navigation**: Clean, organized menu structure
- **Search & Filtering**: Quick access to users, roles, and permissions
- **Bulk Operations**: Efficient management of multiple items
- **Real-Time Updates**: Live data refresh and notifications
- **Responsive Tables**: Mobile-optimized data tables
- **Form Validation**: Client-side validation with helpful error messages

## 🏗️ Technology Stack

### Core Technologies
- **React**: 19.1.0 with modern hooks and patterns
- **Vite**: 6.3.5 for fast development and building
- **JavaScript/JSX**: Modern ES6+ features with JSX syntax
- **Tailwind CSS**: 4.1.10 for utility-first styling

### Key Dependencies
- **React Router DOM**: 7.6.2 for client-side routing
- **Axios**: 1.9.0 for HTTP client with interceptors
- **React Hook Form**: 7.57.0 for efficient form handling
- **Heroicons**: 2.2.0 for consistent iconography
- **JWT Decode**: 4.0.0 for token parsing

### Development Tools
- **ESLint**: Code linting and quality checks
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic vendor prefixes
- **Vite Plugins**: Hot module replacement and development tools

## 📱 Application Structure

### Public Pages
- **Login**: Secure authentication with remember me option
- **Forgot Password**: Password reset request and confirmation flow
- **Error Pages**: 404 and other error handling pages

### User Dashboard
- **Dashboard**: Personal overview with recent activity
- **Profile**: Edit personal information and account settings
- **My Sessions**: View and manage active sessions across devices
- **Settings**: User preferences and configuration

### Admin Interface
- **Users**: Complete user management with creation, editing, and role assignment
- **Roles**: Role management with permission assignment interface
- **Permissions**: Permission management with resource-action configuration
- **Sessions**: System-wide session monitoring and management
- **Companies**: Multi-tenant company management (root admin only)
- **Integrations**: External system integration management

### Shared Components
- **Layout**: Responsive layout with navigation and header
- **Tables**: Reusable data tables with sorting and pagination
- **Forms**: Consistent form components with validation
- **Modals**: Confirmation dialogs and detail modals
- **Alerts**: Success, error, and warning notifications
- **Loading**: Spinners and skeleton loading states

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18+ with npm or yarn
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Backend API**: The auth-backend service running

### Development Tools
- **Git**: Version control
- **VS Code**: Recommended editor with extensions
- **Browser DevTools**: For debugging and development

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd auth-frontend

# Verify project structure
ls -la
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create your environment file:

```bash
# Copy the environment template (if available)
cp .env.example .env.local

# Or create a new .env.local file
touch .env.local
```

Configure your environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Auth System
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Or using yarn
yarn dev
```

### 5. Access the Application

- **Frontend Application**: http://localhost:5173
- **Development Server**: Hot reload enabled
- **Network Access**: Available on your local network

### 6. Login with Admin Credentials

Use the admin credentials created in the backend:
- **Email**: admin@yourapp.com
- **Password**: SecurePassword123!

## 🎨 Component Library

### UI Components

#### Layout Components
- **`Layout`**: Main application layout with navigation
- **`ProtectedRoute`**: Route wrapper with authentication checks
- **`SuspenseFallback`**: Loading component for lazy-loaded routes

#### Form Components
- **`Input`**: Styled input fields with validation
- **`Button`**: Consistent button styling and states
- **`Select`**: Dropdown selection components
- **`Checkbox`**: Checkbox with label styling

#### Display Components
- **`Table`**: Responsive data tables with sorting
- **`Modal`**: Overlay modals for dialogs
- **`Alert`**: Notification and alert messages
- **`LoadingSpinner`**: Loading indicators
- **`ConfirmDialog`**: Confirmation dialogs

#### Utility Components
- **`Logo`**: Application logo component
- **`Avatar`**: User avatar display
- **`Badge`**: Status and category badges
- **`Pagination`**: Table pagination controls

### Page Components

#### Authentication Pages
```jsx
// Login page with form validation
<Login />

// Password reset flow
<ForgotPassword />
```

#### User Pages
```jsx
// User dashboard
<Dashboard />

// Profile management
<Profile />

// Session management
<MySessions />
```

#### Admin Pages
```jsx
// User management
<Users />

// Role and permission management
<Roles />
<Permissions />

// System monitoring
<Sessions />
<Companies />
<Integrations />
```

## 🔧 Development

### Project Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking (if TypeScript is added)
npm run type-check
```

### Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Make Changes**: Edit files in the `src/` directory

3. **Hot Reload**: Changes automatically reflect in the browser

4. **Test Features**: Use the browser and developer tools

5. **Lint Code**: Run linting before commits
   ```bash
   npm run lint
   ```

### Adding New Features

#### Creating a New Page
```jsx
// src/pages/NewPage.jsx
import React from 'react';
import Layout from '../components/Layout';

const NewPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">New Page</h1>
        {/* Page content */}
      </div>
    </Layout>
  );
};

export default NewPage;
```

#### Adding to Router
```jsx
// src/App.jsx
import NewPage from './pages/NewPage';

// Add route in the Routes component
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

#### Creating a Component
```jsx
// src/components/NewComponent.jsx
import React from 'react';

const NewComponent = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {title && (
        <h2 className="text-lg font-semibold p-4 border-b">
          {title}
        </h2>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default NewComponent;
```

## 🎨 Styling Guide

### Tailwind CSS Classes

#### Common Patterns
```css
/* Card styling */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

/* Button primary */
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
}

/* Input styling */
.input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}
```

#### Color Scheme
- **Primary**: Blue (blue-600, blue-700)
- **Success**: Green (green-600, green-700)
- **Warning**: Yellow (yellow-600, yellow-700)
- **Error**: Red (red-600, red-700)
- **Gray Scale**: Gray (gray-50 to gray-900)

#### Responsive Design
```jsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

// Hide/show on different screen sizes
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## 🧪 Testing

### Manual Testing

1. **Authentication Flow**:
   - Login with valid credentials
   - Login with invalid credentials
   - Logout functionality
   - Token refresh handling

2. **User Management**:
   - Create new users
   - Edit user profiles
   - Delete users
   - Role assignment

3. **Session Management**:
   - View active sessions
   - Revoke sessions
   - Session expiration handling

4. **Responsive Design**:
   - Test on mobile devices
   - Test on tablets
   - Test on desktop

### Browser Testing

Test the application in:
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version (macOS/iOS)
- **Edge**: Latest version

### Performance Testing

```bash
# Build and analyze bundle size
npm run build
npm run preview

# Check network performance in DevTools
# Lighthouse audit for performance, accessibility, SEO
```

## 🚀 Deployment

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Static Hosting

#### Netlify Deployment
```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Traditional Web Server
```bash
# After building, serve the dist/ directory
# Configure your web server to serve index.html for all routes (SPA)

# Nginx example
location / {
  try_files $uri $uri/ /index.html;
}
```

### Environment Variables for Production

```env
# Production API URL
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# Application settings
VITE_APP_NAME=Your Auth System
VITE_APP_VERSION=1.0.0

# Disable debug in production
VITE_DEBUG=false
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Build and run:

```bash
# Build Docker image
docker build -t auth-frontend .

# Run container
docker run -p 3000:80 auth-frontend
```

## 🔒 Security Considerations

### Frontend Security Best Practices

- **Token Storage**: Secure storage in localStorage with automatic cleanup
- **XSS Protection**: Input sanitization and Content Security Policy
- **CSRF Protection**: Built-in protection with token-based authentication
- **Secure Communication**: HTTPS in production
- **Environment Variables**: No sensitive data in client-side code

### Authentication Security

- **Token Validation**: Client-side token expiration checking
- **Automatic Refresh**: Transparent token renewal
- **Secure Logout**: Complete session cleanup
- **Route Protection**: Authentication checks on protected routes

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Use React Context for global state
4. **Styling**: Use Tailwind CSS utility classes
5. **Testing**: Add tests for new components
6. **Documentation**: Update README for new features

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/new-feature`)
3. **Make** your changes following the style guide
4. **Test** your changes thoroughly
5. **Commit** with descriptive messages
6. **Push** to your branch
7. **Open** a Pull Request with detailed description

### Code Review Checklist

- [ ] Code follows ESLint rules
- [ ] Components are responsive
- [ ] Accessibility considerations
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation updated

## 📖 Additional Resources

### Documentation
- **[React Documentation](https://reactjs.org/)**: Official React guide
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework
- **[Vite Documentation](https://vitejs.dev/)**: Build tool and dev server
- **[React Router](https://reactrouter.com/)**: Client-side routing

### Useful Tools
- **[React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/)**: Browser extension for debugging
- **[Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)**: VS Code extension
- **[ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)**: Code snippets

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the excellent framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast build tool
- **Heroicons**: For the beautiful icon set
- **Community**: For the open-source packages and tools

## 📞 Support

For frontend-specific support:
- **Issues**: Create an issue with the `frontend` label
- **Documentation**: Check this README and component documentation
- **Development**: Use browser DevTools for debugging
- **UI/UX Issues**: Report design and usability problems

---

**Built with ❤️ using React and modern web technologies** 