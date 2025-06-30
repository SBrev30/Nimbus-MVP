import { Send, Paperclip, AlertCircle, CheckCircle, X } from 'lucide-react';
import { HelpLayout } from './HelpLayout';

interface SupportInquiry {
  email: string;
  name: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  attachments: File[];
}

interface AskQuestionPageProps {
  activeView: string;
  onNavigate?: (view: string) => void;
}

export function AskQuestionPage({ activeView, onNavigate }: AskQuestionPageProps) {
  const [formData, setFormData] = useState<SupportInquiry>({
    email: 'user@example.com', // This would be pre-filled from user's account
    name: 'John Doe', // This would be pre-filled from user's profile
    category: '',
    subject: '',
    description: '',
    priority: 'normal',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'technical', label: 'Technical Issue', description: 'Bug reports, performance problems, errors' },
    { value: 'account', label: 'Account & Billing', description: 'Subscription, payments, account settings' },
    { value: 'features', label: 'Feature Question', description: 'How to use specific features' },
    { value: 'ai', label: 'AI Features', description: 'AI assistance, credits, model settings' },
    { value: 'import-export', label: 'Import/Export', description: 'Notion, Word, file format issues' },
    { value: 'collaboration', label: 'Collaboration', description: 'Sharing, permissions, team features' },
    { value: 'canvas', label: 'Visual Canvas', description: 'Infinite canvas, nodes, visual tools' },
    { value: 'general', label: 'General Inquiry', description: 'Other questions not covered above' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', description: 'General question, no urgency' },
    { value: 'normal', label: 'Normal', description: 'Standard inquiry' },
    { value: 'high', label: 'High', description: 'Blocking issue, affects work' }
  ];

  const handleInputChange = (field: keyof SupportInquiry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    // Validate file size and count
    const validFiles = files.filter(file => file.size <= maxSize);
    const totalFiles = formData.attachments.length + validFiles.length;

    if (validFiles.length !== files.length) {
      setErrors(prev => ({ ...prev, attachments: 'Some files exceed 10MB limit and were not added.' }));
    }

    if (totalFiles > maxFiles) {
      setErrors(prev => ({ ...prev, attachments: `Maximum ${maxFiles} files allowed.` }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Please provide more details (at least 10 characters)';
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
      // Collect system info for debugging
      const systemInfo = {
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Create form data for submission
      const submissionData = {
        ...formData,
        systemInfo,
        ticketId: `WB-${Date.now()}` // Generate ticket ID
      };

      // Here you would normally send to your backend API
      // For demo purposes, we'll simulate the API call
      console.log('Submitting support inquiry:', submissionData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setErrors({ submit: 'Failed to submit inquiry. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedCategoryInfo = () => {
    return categories.find(cat => cat.value === formData.category);
  };

  if (isSubmitted) {
    return (
      <HelpLayout
        activeView={activeView}
        onNavigate={onNavigate}
        title="Question Submitted"
        description="Your support inquiry has been received"
        showBackButton
        showBreadcrumb={false}
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-inter">
            Thank you for contacting us!
          </h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-900 mb-2 font-inter">Your inquiry has been submitted</h3>
            <p className="text-green-800 font-inter mb-4">
              We've received your question about "{formData.subject}" and our support team will respond within 24 hours.
            </p>
            <div className="text-sm text-green-700 font-inter">
              <p><strong>Ticket ID:</strong> WB-{Date.now()}</p>
              <p><strong>Category:</strong> {getSelectedCategoryInfo()?.label}</p>
              <p><strong>Priority:</strong> {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
              <h4 className="font-semibold text-blue-900 mb-2 font-inter">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1 font-inter">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• Our support team will review your inquiry</li>
                <li>• We'll respond with a solution or follow-up questions</li>
                <li>• Check your email for updates on your ticket</li>
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
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    email: 'user@example.com',
                    name: 'John Doe',
                    category: '',
                    subject: '',
                    description: '',
                    priority: 'normal',
                    attachments: []
                  });
                }}
                className="px-4 py-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 text-white rounded-lg transition-colors font-inter font-medium"
              >
                Ask Another Question
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
  title="Ask a Question"
  description="Get help from our support team"
  showBackButton
>
      <div className="max-w-2xl mx-auto">
        {/* Introduction */}
        <div className="bg-[#e8ddc1] border border-[#e8ddc1] rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2 font-inter">Before you ask...</h3>
          <p className="text-gray-700 font-inter mb-3">
            Check our Help Topics for quick answers to common questions. If you can't find what you're looking for, we're here to help!
          </p>
          <button
            onClick={() => onNavigate?.('help-topics')}
            className="text-sm text-gray-700 hover:text-gray-900 underline font-inter"
          >
            Browse Help Topics →
          </button>
        </div>

        {/* Support Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                required
              />
              <p className="text-xs text-[#889096] mt-1 font-inter">We'll use this to respond to your inquiry</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
                required
              />
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.category === category.value
                      ? 'border-[#ff4e00] bg-[#ff4e00]/10'
                      : 'border-[#C6C5C5] hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900 font-inter">{category.label}</div>
                  <div className="text-xs text-[#889096] font-inter">{category.description}</div>
                </label>
              ))}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1 font-inter">{errors.category}</p>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Priority Level
            </label>
            <div className="flex gap-3">
              {priorities.map((priority) => (
                <label
                  key={priority.value}
                  className={`flex-1 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priority === priority.value
                      ? 'border-[#ff4e00] bg-[#ff4e00]/10'
                      : 'border-[#C6C5C5] hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'normal' | 'high')}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900 text-center font-inter">{priority.label}</div>
                  <div className="text-xs text-[#889096] text-center font-inter">{priority.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief description of your question"
              className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
              `
}
            {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief description of your question"
              className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter"
              required
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1 font-inter">{errors.subject}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Please provide as much detail as possible. Include steps to reproduce if reporting a bug."
              rows={6}
              className="w-full px-3 py-2 border border-[#C6C5C5] rounded-lg focus:ring-2 focus:ring-[#ff4e00] focus:border-[#ff4e00] transition-colors font-inter resize-none"
              required
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-red-500 text-sm font-inter">{errors.description}</p>
              )}
              <p className="text-xs text-[#889096] font-inter ml-auto">
                {formData.description.length} characters
              </p>
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2 font-inter">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-[#C6C5C5] rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.gif,.pdf,.txt,.doc,.docx"
                onChange={handleFileAttachment}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Paperclip className="w-8 h-8 text-[#889096] mx-auto mb-2" />
                <p className="text-sm text-gray-900 font-inter">
                  Click to upload files or drag and drop
                </p>
                <p className="text-xs text-[#889096] mt-1 font-inter">
                  PNG, JPG, PDF, TXT, DOC up to 10MB each (max 5 files)
                </p>
              </label>
            </div>

            {/* Attached Files */}
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-[#889096]" />
                      <span className="text-sm text-gray-900 font-inter">{file.name}</span>
                      <span className="text-xs text-[#889096] font-inter">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attachments && (
              <p className="text-red-500 text-sm mt-1 font-inter">{errors.attachments}</p>
            )}
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
                className="flex-1 px-4 py-2 border border-[#C6C5C5] rounded-lg hover:bg-gray-50 transition-colors font-inter"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#ff4e00] hover:bg-[#ff4e00]/80 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-inter font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Question
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
