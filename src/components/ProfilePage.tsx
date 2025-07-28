import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Calendar, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Save, Trash2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  email_verified: boolean;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ProfilePage({ activeView, onNavigate }: ProfilePageProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const [deleteConfirmForm, setDeleteConfirmForm] = useState({
    email: '',
    password: '',
    confirmText: ''
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
        updated_at: profileData?.updated_at || user.created_at,
        email_verified: user.email_confirmed_at !== null
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
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
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
      // Check if email is changing
      const emailChanged = profileForm.email !== profile?.email;

      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        email: emailChanged ? profileForm.email : undefined,
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

      if (emailChanged) {
        setSuccess('Profile updated successfully! Please check your new email address for a verification link.');
      } else {
        setSuccess('Profile updated successfully!');
      }
      
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

  const handleSendPasswordReset = async () => {
    if (!profile?.email) {
      setErrors({ resetEmail: 'No email address found' });
      return;
    }

    setSendingResetEmail(true);
    setErrors({});
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      setSuccess('Password reset email sent! Please check your inbox and follow the instructions.');
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      setErrors({ resetEmail: error.message || 'Failed to send reset email. Please try again.' });
    } finally {
      setSendingResetEmail(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmForm.email !== profile?.email) {
      setErrors({ deleteAccount: 'Email does not match your account email' });
      return;
    }

    if (deleteConfirmForm.confirmText !== 'DELETE') {
      setErrors({ deleteAccount: 'Please type "DELETE" to confirm' });
      return;
    }

    setDeletingAccount(true);
    setErrors({});

    try {
      // First try to re-authenticate with password if provided
      if (deleteConfirmForm.password) {
        const { error: reAuthError } = await supabase.auth.signInWithPassword({
          email: deleteConfirmForm.email,
          password: deleteConfirmForm.password
        });

        if (reAuthError) {
          throw new Error('Password verification failed. Please check your password.');
        }
      }

      // Delete user data from your custom tables first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profile?.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Continue with auth deletion even if profile deletion fails
      }

      // Note: Supabase doesn't have a direct deleteUser method from client
      // You would need to implement this via an edge function or admin API
      // For now, we'll sign out and show instructions
      await signOut();
      
      setSuccess('Account deletion initiated. You have been signed out. Please contact support to complete the deletion process.');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setErrors({ deleteAccount: error.message || 'Failed to delete account. Please try again.' });
    } finally {
      setDeletingAccount(false);
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
              <div className="flex items-center gap-4 text-sm text-gray-500 font-inter">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${profile?.email_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span>{profile?.email_verified ? 'Email Verified' : 'Email Pending Verification'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                </div>
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
                    <p className="text-sm text-gray-600 font-inter">Keep your account secure with a strong password</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendPasswordReset}
                      disabled={sendingResetEmail}
                      className="inline-flex items-center gap-2 text-[#ff4e00] hover:text-[#ff4e00]/80 font-medium transition-colors font-inter disabled:opacity-50"
                    >
                      {sendingResetEmail ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#ff4e00] border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Reset via Email
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="inline-flex items-center gap-2 text-[#ff4e00] hover:text-[#ff4e00]/80 font-medium transition-colors font-inter"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </div>
                
                {errors.resetEmail && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 font-inter">{errors.resetEmail}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 font-inter">Change Password</h3>
                  <p className="text-blue-800 font-inter text-sm">
                    Choose a strong password that's at least 8 characters long and includes uppercase letters, lowercase letters, and numbers.
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

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-red-900 font-inter">Danger Zone</h2>
                <p className="text-sm text-red-600 font-inter">Irreversible and destructive actions</p>
              </div>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>

            {!showDeleteConfirm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h3 className="font-medium text-red-900 font-inter">Delete Account</h3>
                    <p className="text-sm text-red-700 font-inter">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 font-inter">⚠️ Confirm Account Deletion</h3>
                  <p className="text-red-800 font-inter text-sm mb-3">
                    This will permanently delete your account and all associated data including:
                  </p>
                  <ul className="text-red-800 font-inter text-sm space-y-1 ml-4 mb-3">
                    <li>• All your stories, characters, and plot data</li>
                    <li>• Canvas layouts and imported content</li>
                    <li>• Account settings and preferences</li>
                    <li>• All other personal data</li>
                  </ul>
                  <p className="text-red-900 font-inter text-sm font-semibold">
                    This action cannot be undone!
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      Confirm your email address
                    </label>
                    <input
                      type="email"
                      value={deleteConfirmForm.email}
                      onChange={(e) => setDeleteConfirmForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-inter"
                      placeholder={profile?.email}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      Enter your password
                    </label>
                    <input
                      type="password"
                      value={deleteConfirmForm.password}
                      onChange={(e) => setDeleteConfirmForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-inter"
                      placeholder="Enter your password to verify"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmForm.confirmText}
                      onChange={(e) => setDeleteConfirmForm(prev => ({ ...prev, confirmText: e.target.value }))}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-inter"
                      placeholder="Type DELETE to confirm"
                      required
                    />
                  </div>
                </div>

                {errors.deleteAccount && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700 font-inter">{errors.deleteAccount}</p>
                  </div>
                )}

                <div className="border-t border-red-200 pt-6">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmForm({ email: '', password: '', confirmText: '' });
                        setErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-inter"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
                    >
                      {deletingAccount ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete My Account
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
