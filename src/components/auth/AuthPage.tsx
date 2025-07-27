import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ArrowLeft } from 'lucide-react';

// Nimbus Note Logo Component (from Sidebar)
const NimbusLogo = () => {
  return (
    <div className="flex items-center space-x-3">
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
            <NimbusLogo />
          </div>
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
