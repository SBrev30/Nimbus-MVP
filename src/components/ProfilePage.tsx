import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Calendar, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfilePageProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage({ activeView, onNavigate }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>('');

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: ''
  });

  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user:', userError);
        setErrors({ profile: 'Failed to load user data' });
        return;
      }

      if (!user) {
        setErrors({ profile: 'No user found' });
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error loading profile:', profileError);
        setErrors({ profile: 'Failed to load profile data' });
        return;
      }

      // Combine user and profile data
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || '',
        avatar_url: profileData?.avatar_url || user.user_metadata?.avatar_url,
        created_at: user.created_at,
        updated_at: profileData?.updated_at || user.created_at
      };

      setProfile(userProfile);
      setProfileForm({
        full_name: userProfile.full_name,
        email: userProfile.email
      });

    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      setErrors({ profile: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePasswordInputChange = (field: keyof PasswordChangeForm, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setSaving(true);
    setErrors({});
    setSuccess('');

    try {
      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        email: profileForm.email,
        data: {
          full_name: profileForm.full_name
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Update or insert profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: profile?.id,
          full_name: profileForm.full_name,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      setSuccess('Profile updated successfully!');
      
      // Reload profile data
      await loadProfile();

    } catch (error: any) {
      console.error('Error updating profile:', error);
      setErrors({ 
        profile: error.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setChangingPassword(true);
    setErrors({});
    setSuccess('');

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        throw error;
      }

      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);

    } catch (error: any) {
      console.error('Error changing password:', error);
      setErrors({ 
        password: error.message || 'Failed to change password. Please try again.' 
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-[#e8ddc1] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-inter">Profile Settings</h1>
              <p className="text-gray-600 font-inter">Manage your account information and security settings</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 font-inter">{success}</p>
          </div>
        )}

        {/* Profile Error */}
        {errors.profile && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-inter">{errors.profile}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 font-inter">Profile Information</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 font-inter">
                <Calendar className="w-4 h-4" />
                <span>Member since {new Date(profile?.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => handleProfileInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1 font-inter">{errors.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                    placeholder="Enter your email address"
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 font-inter">{errors.email}</p>
                  )}
                  <p className="text-xs text-[#889096] mt-1 font-inter">
                    Changing your email will require verification
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('settings')}
                    className="px-4 py-2 border border-[#C6C5C5] rounded-lg hover:bg-gray-50 transition-colors font-inter"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 font-inter">Security Settings</h2>
                <p className="text-sm text-gray-600 font-inter">Manage your password and account security</p>
              </div>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>

            {!showPasswordForm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 font-inter">Password</h3>
                    <p className="text-sm text-gray-600 font-inter">Last updated: Never</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="inline-flex items-center gap-2 text-[#ff4e00] hover:text-[#ff4e00]/80 font-medium transition-colors font-inter"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="bg-[#e8ddc1] border border-[#e8ddc1] rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 font-inter">Change Password</h3>
                  <p className="text-gray-700 font-inter text-sm">
                    Choose a strong password that's at least 6 characters long and includes a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                        placeholder="Enter your current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1 font-inter">{errors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                        placeholder="Enter your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-sm mt-1 font-inter">{errors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                        placeholder="Confirm your new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1 font-inter">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {errors.password && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 font-inter">{errors.password}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                      }}
                      className="px-4 py-2 border border-[#C6C5C5] rounded-lg hover:bg-gray-50 transition-colors font-inter"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="inline-flex items-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                    >
                      {changingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 font-inter">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">User ID</label>
                <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border">{profile?.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Account Created</label>
                <p className="text-sm text-gray-900 font-inter">
                  {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Last Updated</label>
                <p className="text-sm text-gray-900 font-inter">
                  {new Date(profile?.updated_at || profile?.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">Account Status</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 font-inter">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
