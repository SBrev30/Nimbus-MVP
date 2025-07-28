import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Nimbus Note Logo Component
const NimbusLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <svg 
        version="1.1" 
        viewBox="0 0 608.8 118" 
        className="h-8 w-auto text-gray-800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="currentColor" d="M73.1,74.5c-4-3.4-9.2-8-14.7-12.9l0,0C45,49.9,30.2,36.9,29.9,36.5c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H15.8
        c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V50.9l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1c0.6,0,0.4,0,0.6,0.1
        l0,0l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
        S48.6,100.3,48.6,94s1.5-6.2,3.9-8.3c2.4-2.1,0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9
        c0,12.6,10.7,22.7,24.1,22.7S85,106.4,85,94s-4.3-13.1-4.6-13.4c-0.3-0.3,0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L73.1,74.5z"/>
        <path fill="currentColor" d="M57,49.4c4,3.4,9.2,8,14.7,12.9l0,0C85.1,74.1,100,87,100.3,87.4c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
        v-48c0-1.2-1-2.2-2.2-2.2h-10V73l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L80.7,55.1l0,0l-4-3.4l0,0
        l-13.8-12L59.7,37c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6S81.5,23.6,81.5,30s-1.6,6.5-4,8.6l8.8,7.6c4.3-4.2,7-9.8,7-16.2
        c0-12.6-10.7-22.7-24.1-22.7S45.2,17.5,45.2,30s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L57,49.4z"/>
        <g>
          <path fill="currentColor" d="M150.8,35.9h9.1l22.2,34.6l3.4,6.2l-0.2-40.9h8.7v53h-9.1l-22.2-34.5l-3.4-6.5l0.2,41h-8.7V35.9z"/>
          <path fill="currentColor" d="M205.2,32.8h8.3v9.4h-8.3V32.8z M205.2,47.4h8.3v41.6h-8.3V47.4z"/>
          <path fill="currentColor" d="M224,47.4h8.3v5.3c2.7-4.3,6.8-6.4,11.7-6.4c5.5,0,9.7,2.4,11.7,7.2c2.7-4.8,7.3-7.2,12.7-7.2c8.2,0,13.5,5.1,13.5,14.9
          v27.8h-8.3V62.9c0-6-2.3-9.7-7.4-9.7c-5.6,0-9,5.5-9,11.3v24.4h-8.3V62.9c0-6-2.3-9.7-7.4-9.7c-5.6,0-9,5.5-9,11.3v24.4H224V47.4z"/>
          <path fill="currentColor" d="M292.4,88.9V32.8h8.3v19.4c2.7-3.8,6.6-5.9,11.3-5.9c10.9,0,17.6,8.2,17.6,21.8c0,14.1-6.8,21.9-17.6,21.9
          c-4.8,0-8.7-2-11.3-5.7v4.7H292.4z M300.8,68c0,9.5,3.7,14.9,10.2,14.9c6.6,0,10.1-5.2,10.1-14.9c0-9.4-3.7-14.7-10.1-14.7
          C304.3,53.3,300.8,58.5,300.8,68z"/>
          <path fill="currentColor" d="M364.4,47.4h8.3v41.6h-8.3v-5.6c-2.7,4.4-7.1,6.6-12.4,6.6c-8.5,0-13.8-5-13.8-14.8V47.4h8.3v26.1c0,6,2.5,9.6,8,9.6
          c6.1,0,9.8-5.5,9.8-11.3V47.4z"/>
          <path fill="currentColor" d="M416.4,76.9c0,7.9-7.1,13-17.2,13s-17.2-4.7-18.7-14.6h8.3c0.9,5.2,4.8,8.1,10.6,8.1c5.6,0,8.6-2.5,8.6-6
          c0-10.4-26.2-1.6-26.2-18.7c0-6.5,5.1-12.5,15.6-12.5c9.3,0,16.1,4.3,17.5,14.7h-8.3c-0.9-5.9-4.2-8-9.5-8c-4.6,0-7.3,2.3-7.3,5.4
          C389.8,68.9,416.4,60,416.4,76.9z"/>
          <path fill="currentColor" d="M440.6,35.9h9.1L472,70.5l3.4,6.2l-0.2-40.9h8.7v53h-9.1l-22.2-34.5l-3.4-6.5l0.2,41h-8.7V35.9z"/>
          <path fill="currentColor" d="M493,68.2c0-14.1,7.6-21.9,19.4-21.9c12.1,0,19.4,8.3,19.4,21.9c0,14-7.6,21.8-19.4,21.8C500.3,89.9,493,81.7,493,68.2z
          M523.3,68.2c0-9.5-3.9-14.9-10.9-14.9s-10.9,5.2-10.9,14.9c0,9.4,3.9,14.7,10.9,14.7C519.5,82.9,523.3,77.8,523.3,68.2z"/>
          <path fill="currentColor" d="M541.4,53.8h-5.6v-6.5h5.6v-9.6h8.3v9.6h9v6.5h-9v22.2c0,4.8,1.3,7,7.2,7h1.6v6.1c-0.9,0.5-2.9,0.8-5.2,0.8
          c-8.1,0-11.9-4.4-11.9-13.4V53.8z"/>
          <path fill="currentColor" d="M583.1,89.9c-12.2,0-19.7-8.2-19.7-21.8c0-14.1,7.5-21.9,19.3-21.9c12,0,19.3,8.1,19.3,21.5v2h-30.1
          c0.5,8.5,4.4,13.3,11.2,13.3c5.3,0,9-2.5,10.5-7.6h8.7C600,85,592.8,89.9,583.1,89.9z M572.1,64h21.2c-1-7-4.7-10.8-10.6-10.8
          C576.7,53.2,573.1,57,572.1,64z"/>
        </g>
      </svg>
    </div>
  );
};

interface ResetPasswordPageProps {
  onBackToLogin?: () => void;
}

export function ResetPasswordPage({ onBackToLogin }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if we have valid session from reset link
    const checkResetToken = async () => {
      try {
        // Check URL for reset token parameters
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');

        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            setError('Invalid or expired reset link. Please request a new password reset.');
            setTokenValid(false);
          } else if (data.session) {
            setTokenValid(true);
          } else {
            setError('Invalid reset link. Please request a new password reset.');
            setTokenValid(false);
          }
        } else {
          // Check if user is already authenticated (direct navigation)
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setTokenValid(true);
          } else {
            setError('No valid reset link found. Please request a new password reset.');
            setTokenValid(false);
          }
        }
      } catch (error) {
        console.error('Error validating reset token:', error);
        setError('An error occurred while validating your reset link.');
        setTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    checkResetToken();
  }, []);

  const validateForm = (): boolean => {
    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-redirect to login after success
      setTimeout(() => {
        if (onBackToLogin) {
          onBackToLogin();
        } else {
          window.location.href = '/';
        }
      }, 3000);

    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      window.location.href = '/';
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <NimbusLogo />
              <div className="mt-6">
                <div className="w-8 h-8 border-4 border-[#ff4e00] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Validating reset link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <NimbusLogo />
              <div className="mt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                <p className="text-gray-600 text-sm mb-6">{error}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Back to Sign In
                  </button>
                  <p className="text-xs text-gray-500">
                    You can request a new password reset from the sign-in page
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <NimbusLogo />
              <div className="mt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                <p className="text-gray-600 text-sm mb-6">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Continue to Sign In
                  </button>
                  <p className="text-xs text-gray-500">
                    Redirecting automatically in 3 seconds...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <NimbusLogo />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Set New Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password to secure your account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">Password Requirements:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• At least 8 characters long</li>
              <li>• At least one uppercase letter (A-Z)</li>
              <li>• At least one lowercase letter (a-z)</li>
              <li>• At least one number (0-9)</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#ff4e00] focus:border-[#ff4e00]"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-900 bg-[#ff4e00] hover:bg-[#ff4e00]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4e00] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleBackToLogin}
              className="inline-flex items-center gap-2 text-[#ff4e00] hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
