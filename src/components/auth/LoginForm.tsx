import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

// Nimbus Note Logo Component (from Sidebar)
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

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const { signIn, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error: signInError } = await signIn(email, password);
    
    if (!signInError) {
      // Successfully signed in, will be handled by auth state change
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setResetEmailSent(true);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setForgotPasswordError(
        error.message || 'Failed to send reset email. Please try again.'
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setForgotEmail('');
    setForgotPasswordError('');
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <NimbusLogo />
          </div>
          
          {!resetEmailSent ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {forgotPasswordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{forgotPasswordError}</span>
                </div>
              )}
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4e00]"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotPasswordLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>
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
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 text-sm">
                  We've sent a password reset link to <strong>{forgotEmail}</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 text-sm mb-2">What's next?</h3>
                <ol className="text-blue-800 text-sm space-y-1">
                  <li>1. Check your email inbox (and spam folder)</li>
                  <li>2. Click the "Reset Password" link in the email</li>
                  <li>3. Create a new password</li>
                  <li>4. Sign in with your new password</li>
                </ol>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleForgotPassword({ preventDefault: () => {} } as React.FormEvent)}
                  disabled={forgotPasswordLoading}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {forgotPasswordLoading ? 'Sending...' : 'Resend Email'}
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="inline-flex items-center gap-2 text-[#ff4e00] hover:underline text-sm mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <NimbusLogo />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4e00]"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff4e00]"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#ff4e00] focus:ring-[#ff4e00] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#ff4e00] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="text-[#ff4e00] hover:underline" onClick={() => window.location.hash = '#signup'}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
