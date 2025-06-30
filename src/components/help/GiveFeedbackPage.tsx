import React, { useState } from 'react';
import { 
  Star, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Palette,
  Zap,
  BookOpen
} from 'lucide-react';
import { HelpLayout } from './HelpLayout';

interface FeedbackData {
  feedbackType: 'feature' | 'ux' | 'performance' | 'content';
  overallRating: number;
  specificRatings: {
    writing: number;
    canvas: number;
    ai: number;
    navigation: number;
    performance: number;
  };
  detailedFeedback: string;
  contactInfo?: {
    email: string;
    name: string;
  };
  isAnonymous: boolean;
}

interface GiveFeedbackPageProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

export function GiveFeedbackPage({ activeView, onNavigate }: GiveFeedbackPageProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    feedbackType: 'ux',
    overallRating: 0,
    specificRatings: {
      writing: 0,
      canvas: 0,
      ai: 0,
      navigation: 0,
      performance: 0
    },
    detailedFeedback: '',
    contactInfo: {
      email: 'user@example.com', // Pre-filled from user account
      name: 'John Doe' // Pre-filled from user profile
    },
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const Types = [
    {
      value: 'feature',
      label: 'Feature Requests',
      description: 'New features or enhancements you\'d like to see',
      icon: <Lightbulb className="w-5 h-5" />
    },
    {
      value: 'ux',
      label: 'User Experience',
      description: 'Interface design, workflow improvements, usability',
      icon: <Palette className="w-5 h-5" />
    },
    {
      value: 'performance',
      label: 'Performance',
      description: 'Speed, responsiveness, technical issues',
      icon: <Zap className="w-5 h-5" />
    },
    {
      value: 'content',
      label: 'Content & Resources',
      description: 'Help docs, tutorials, onboarding experience',
      icon: <BookOpen className="w-5 h-5" />
    }
  ];

  const ratingCategories = [
    {
      key: 'writing' as keyof typeof feedbackData.specificRatings,
      label: 'Writing Experience',
      description: 'Editor, formatting, auto-save'
    },
    {
      key: 'canvas' as keyof typeof feedbackData.specificRatings,
      label: 'Visual Canvas',
      description: 'Infinite canvas, nodes, visual tools'
    },
    {
      key: 'ai' as keyof typeof feedbackData.specificRatings,
      label: 'AI Features',
      description: 'AI assistance, suggestions, credits'
    },
    {
      key: 'navigation' as keyof typeof feedbackData.specificRatings,
      label: 'Navigation',
      description: 'Sidebar, menus, finding features'
    },
    {
      key: 'performance' as keyof typeof feedbackData.specificRatings,
      label: 'Performance',
      description: 'Speed, loading times, responsiveness'
    }
  ];

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    size = 'md',
    readonly = false 
  }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
  }) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange?.(star)}
            disabled={readonly}
            className={`${sizeClasses[size]} ${readonly ? '' : 'hover:scale-110'} transition-all duration-150 ${
              readonly ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <Star
              className={`w-full h-full ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleFeedbackTypeChange = (type: string) => {
    setFeedbackData(prev => ({ 
      ...prev, 
      feedbackType: type as FeedbackData['feedbackType'] 
    }));
  };

  const handleSpecificRatingChange = (
    category: keyof typeof feedbackData.specificRatings, 
    rating: number
  ) => {
    setFeedbackData(prev => ({
      ...prev,
      specificRatings: {
        ...prev.specificRatings,
        [category]: rating
      }
    }));
  };

  const handleAnonymousToggle = (isAnonymous: boolean) => {
    setFeedbackData(prev => ({
      ...prev,
      isAnonymous,
      contactInfo: isAnonymous ? undefined : {
        email: 'user@example.com',
        name: 'John Doe'
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (feedbackData.overallRating === 0) {
      newErrors.overallRating = 'Please provide an overall rating';
    }
    if (!feedbackData.detailedFeedback.trim()) {
      newErrors.detailedFeedback = 'Please share your feedback';
    }
    if (feedbackData.detailedFeedback.trim().length < 10) {
      newErrors.detailedFeedback = 'Please provide more details (at least 10 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Add metadata
      const submissionData = {
        ...feedbackData,
        submissionDate: new Date().toISOString(),
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        feedbackId: `FB-${Date.now()}`
      };

      // Here you would normally send to your backend API
      console.log('Submitting feedback:', submissionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setErrors({ submit: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageRating = () => {
    const ratings = Object.values(feedbackData.specificRatings).filter(r => r > 0);
    if (ratings.length === 0) return 0;
    return Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10;
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFeedbackData({
      feedbackType: 'ux',
      overallRating: 0,
      specificRatings: {
        writing: 0,
        canvas: 0,
        ai: 0,
        navigation: 0,
        performance: 0
      },
      detailedFeedback: '',
      contactInfo: {
        email: 'user@example.com',
        name: 'John Doe'
      },
      isAnonymous: false
    });
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <HelpLayout
        activeView={activeView}
        onNavigate={onNavigate}
        title="Feedback Submitted"
        description="Thank you for helping us improve Nimbus Note"
        showBackButton
        showBreadcrumb={false}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-inter">
            Thank you for your feedback!
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800 font-inter mb-4">
              Your feedback helps us make Nimbus Note better for everyone. We really appreciate you taking the time to share your thoughts.
            </p>
            <div className="text-sm text-green-700 font-inter">
              <p><strong>Feedback Type:</strong> {Types.find(t => t.value === feedbackData.feedbackType)?.label}</p>
              <p><strong>Overall Rating:</strong> {feedbackData.overallRating}/5 stars</p>
              {getAverageRating() > 0 && (
                <p><strong>Average Feature Rating:</strong> {getAverageRating()}/5 stars</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-semibold text-blue-900 mb-2 font-inter">What's next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 font-inter">
                <li>• Our product team will review your feedback</li>
                <li>• Popular suggestions influence our roadmap</li>
                <li>• We may reach out for clarification if needed</li>
                <li>• Check our updates for new features you suggested</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => onNavigate?.('help-topics')}
                className="px-4 py-2 border border-[#C6C5C5] rounded-lg hover:bg-gray-50 transition-colors font-inter"
              >
                Browse Help Topics
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors font-inter font-medium"
              >
                Give More Feedback
              </button>
            </div>
          </div>
        </div>
      </HelpLayout>
    );
  }

  return (
  <HelpLayout
    activeView={activeView}
    onNavigate={onNavigate}
    title="Give Feedback"
    description="Help us improve Nimbus Note with your insights"
    showBackButton
    showBreadcrumb={false}
  >
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-[#e8ddc1] border border-[#e8ddc1] rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2 font-inter">Help Shape Nimbus Note</h3>
        <p className="text-gray-700 font-inter">
          Your feedback directly influences our product development. Share your experience, suggest new features, or let us know how we can improve.
        </p>
      </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Feedback Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">
              What type of feedback do you have?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Types.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    feedbackData.feedbackType === type.value
                      ? 'border-[#ff4e00] bg-[#ff4e00]/10'
                      : 'border-[#C6C5C5] hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={type.value}
                    checked={feedbackData.feedbackType === type.value}
                    onChange={(e) => handleFeedbackTypeChange(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start gap-3">
                    <span className="text-[#ff4e00]">{type.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900 font-inter">{type.label}</div>
                      <div className="text-sm text-[#889096] font-inter">{type.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Overall Rating */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">
              Overall, how would you rate Nimbus Note?
            </h3>
            <div className="flex items-center gap-4">
              <StarRating
                rating={feedbackData.overallRating}
                onRatingChange={(rating) => {
                  setFeedbackData(prev => ({ ...prev, overallRating: rating }));
                  if (errors.overallRating) {
                    setErrors(prev => ({ ...prev, overallRating: '' }));
                  }
                }}
                size="lg"
              />
              <span className="text-sm text-[#889096] font-inter">
                {feedbackData.overallRating > 0 && `${feedbackData.overallRating}/5 stars`}
              </span>
            </div>
            {errors.overallRating && (
              <p className="text-red-500 text-sm mt-2 font-inter">{errors.overallRating}</p>
            )}
          </div>

          {/* Specific Feature Ratings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">
              Rate specific features (optional)
            </h3>
            <div className="space-y-4">
              {ratingCategories.map((category) => (
                <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 font-inter">{category.label}</div>
                    <div className="text-sm text-[#889096] font-inter">{category.description}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StarRating
                      rating={feedbackData.specificRatings[category.key]}
                      onRatingChange={(rating) => handleSpecificRatingChange(category.key, rating)}
                    />
                    <span className="text-xs text-[#889096] w-8 font-inter">
                      {feedbackData.specificRatings[category.key] > 0 && feedbackData.specificRatings[category.key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Feedback */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">
              Tell us more about your experience
            </h3>
            <textarea
              value={feedbackData.detailedFeedback}
              onChange={(e) => {
                setFeedbackData(prev => ({ ...prev, detailedFeedback: e.target.value }));
                if (errors.detailedFeedback) {
                  setErrors(prev => ({ ...prev, detailedFeedback: '' }));
                }
              }}
              placeholder="What do you love about Nimbus Note? What could be improved? Any specific features you'd like to see?"
              rows={6}
              className="w-full px-4 py-3 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              {errors.detailedFeedback && (
                <p className="text-red-500 text-sm font-inter">{errors.detailedFeedback}</p>
              )}
              <p className="text-xs text-[#889096] font-inter ml-auto">
                {feedbackData.detailedFeedback.length} characters
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-inter">
              Contact Information
            </h3>
            
            <div className="space-y-4">
              {/* Anonymous Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feedbackData.isAnonymous}
                    onChange={(e) => handleAnonymousToggle(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-colors flex items-center justify-center ${
                    feedbackData.isAnonymous
                      ? 'bg-[#ff4e00] border-[#ff4e00]'
                      : 'border-[#C6C5C5]'
                  }`}>
                    {feedbackData.isAnonymous && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 font-inter">
                    Submit feedback anonymously
                  </span>
                </label>
              </div>

              {/* Contact Fields (when not anonymous) */}
              {!feedbackData.isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2 font-inter">
                      Email
                    </label>
                    <input
                      type="email"
                      value={feedbackData.contactInfo?.email || ''}
                      onChange={(e) => setFeedbackData(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo!,
                          email: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2 font-inter">
                      Name
                    </label>
                    <input
                      type="text"
                      value={feedbackData.contactInfo?.name || ''}
                      onChange={(e) => setFeedbackData(prev => ({
                        ...prev,
                        contactInfo: {
                          ...prev.contactInfo!,
                          name: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-inter"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-blue-700 font-inter">
                      We may contact you for follow-up questions or to let you know when your suggestion is implemented.
                    </p>
                  </div>
                </div>
              )}

              {feedbackData.isAnonymous && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-[#889096] font-inter">
                    Your feedback will be submitted anonymously. We won't be able to follow up with you directly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="border-t border-[#C6C5C5] pt-6">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 font-inter">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onNavigate?.('help')}
                className="flex-1 px-4 py-3 border border-[#C6C5C5] rounded-lg hover:bg-gray-50 transition-colors font-inter"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-inter font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </HelpLayout>
  );
}
