import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface HelpSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function HelpSearch({ 
  onSearch, 
  placeholder = "Search help topics...", 
  className = "" 
}: HelpSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearchSubmit} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#889096]" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-[#e8ddc1] rounded-lg focus:ring-2 focus:ring-[#A5F7AC] focus:border-[#A5F7AC] transition-colors font-inter text-gray-900 placeholder-[#889096]"
        />
      </div>
    </form>
  );
}
