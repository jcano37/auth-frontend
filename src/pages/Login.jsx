import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/ui';
import { VALIDATION } from '../constants';
import Logo from '../components/Logo';

/**
 * Login page
 * Handles user authentication and redirection
 */
const Login = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();
  
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after login
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  /**
   * Handles login form submission
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the context
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={true} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Campo Username/Email */}
            <div>
              <label htmlFor="username" className="sr-only">
                Username or Email
              </label>
              <input
                {...register('username', { 
                  required: 'Username or email is required',
                  minLength: {
                    value: VALIDATION.USERNAME_MIN_LENGTH,
                    message: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`
                  }
                })}
                type="text"
                className="form-input rounded-t-md rounded-b-none"
                placeholder="Username or Email"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: VALIDATION.PASSWORD_MIN_LENGTH,
                    message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
                  }
                })}
                type="password"
                className="form-input rounded-t-none rounded-b-md"
                placeholder="Password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="border-white" text="" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 