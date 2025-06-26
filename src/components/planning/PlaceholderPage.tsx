import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white rounded-t-[17px]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md">
          <p className="text-blue-800 text-sm">
            This feature is coming soon! We're building powerful tools for {title.toLowerCase()}.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;