/**
 * Configuración de la API
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
};

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  // Rutas públicas
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Rutas protegidas
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MY_SESSIONS: '/my-sessions',
  
  // Rutas de administración
  ADMIN: {
    USERS: '/admin/users',
    ROLES: '/admin/roles',
    PERMISSIONS: '/admin/permissions',
    SESSIONS: '/admin/sessions',
    RESOURCES: '/admin/resources',
  },
};

/**
 * Mensajes de la aplicación
 */
export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login successful',
    LOGOUT: 'Logged out successfully',
    REGISTER: 'Registration successful',
    UPDATE: 'Updated successfully',
    CREATE: 'Created successfully',
    DELETE: 'Deleted successfully',
    PASSWORD_RESET_REQUEST: 'Password reset email sent',
    PASSWORD_RESET: 'Password reset successfully',
  },
  ERROR: {
    LOGIN: 'Login failed',
    LOGOUT: 'Logout failed',
    REGISTER: 'Registration failed',
    UPDATE: 'Update failed',
    CREATE: 'Creation failed',
    DELETE: 'Deletion failed',
    FETCH: 'Failed to fetch data',
    NETWORK: 'Network error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Server error occurred',
    VALIDATION: 'Please check your input and try again',
  },
  CONFIRM: {
    DELETE: 'Are you sure you want to delete this item?',
    LOGOUT: 'Are you sure you want to logout?',
  },
  INFO: {
    LOADING: 'Loading...',
    NO_DATA: 'No data available',
    EMPTY_LIST: 'No items found',
  },
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
};

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
};

/**
 * User/resource states
 */
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  VERIFIED: 'verified',
  UNVERIFIED: 'unverified',
  SUSPENDED: 'suspended',
};

/**
 * Reglas de validación de formularios
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  FULL_NAME_MAX_LENGTH: 100,
  
  // Mensajes de validación
  MESSAGES: {
    REQUIRED: 'This field is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: `Password must be at least 8 characters long`,
    USERNAME_TOO_SHORT: `Username must be at least 3 characters long`,
    USERNAME_TOO_LONG: `Username cannot exceed 50 characters`,
  },
};

/**
 * Claves de almacenamiento local
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme_preference',
};

/**
 * Configuración de UI
 */
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  
  // Breakpoints (coinciden con Tailwind CSS)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
  },
}; 