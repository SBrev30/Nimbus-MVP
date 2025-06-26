import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Settings, HelpCircle } from 'lucide-react';
import { userService, UserProfile } from '../../services/userService';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const profile = await userService.getCurrentUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return '?';
    
    const email = user.email || '';
    const name = userProfile?.fullName || user.user_metadata?.full_name || email.split('@')[0];
    
    if (!name) return '?';
    
    const parts = name.split(' ');
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#A5F7AC] text-gray-900 font-medium hover:bg-[#A5F7AC]/80 transition-colors shadow-sm"
        title={userProfile?.fullName || user?.email || 'User menu'}
      >
        {getInitials()}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            {userProfile && (
              <p className="text-xs text-green-600 mt-1">
                {userProfile.aiCreditsRemaining.toLocaleString()} AI credits
              </p>
            )}
          </div>
          
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Account Settings
          </a>
          
          <a
            href="#"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help & Support
          </a>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}