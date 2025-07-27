import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ArrowLeft } from 'lucide-react';

// Nimbus Note Icon Component (compact logo)
const NimbusIcon = () => {
  return (
    <svg 
      version="1.1" 
      id="Layer_1" 
      xmlns="http://www.w3.org/2000/svg" 
      xmlnsXlink="http://www.w3.org/1999/xlink" 
      x="0px" 
      y="0px"
      viewBox="0 0 107.5 112.6" 
      className="w-12 h-12 text-gray-800"
      xmlSpace="preserve"
    >
      <path 
        fill="currentColor" 
        d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5
        c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0
        l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
        s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7
        S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z"
      />
      <path 
        fill="currentColor" 
        d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
        v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4
        l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6
        c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z"
      />
    </svg>
  );
};

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Check URL hash for tab selection
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'signup') {
        setActiveTab('signup');
      } else if (hash === 'login') {
        setActiveTab('login');
      }
    };

    // Set initial tab based on hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleBackToLanding = () => {
    // Navigate back to landing page by reloading without auth
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb navigation */}
      <div className="absolute top-6 left-6">
        <button
          onClick={handleBackToLanding}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <NimbusIcon />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nimbus Note</h1>
          <p className="text-gray-600">Visual writing platform for storytellers</p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === 'login'
                  ? 'text-[#ff4e00] border-b-2 border-[#ff4e00]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('login');
                window.location.hash = 'login';
              }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-center text-sm font-medium ${
                activeTab === 'signup'
                  ? 'text-[#ff4e00] border-b-2 border-[#ff4e00]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setActiveTab('signup');
                window.location.hash = 'signup';
              }}
            >
              Sign Up
            </button>
          </div>
          
          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
