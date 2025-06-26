import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, User, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeView?: string;
  onViewChange?: (view: string) => void;
}

// User data
const user = {
  id: 'placeholder-id',
  full_name: 'Alex Chen',
  email: 'alex.chen@email.com',
  avatar_url: '', // Empty to test initials fallback
  subscription_tier: 'pro' as const,
  ai_credits_remaining: 0,
  created_at: new Date().toISOString(),
};

// Helper function to get user initials
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

// User Avatar Component
const UserAvatar = ({ user, size = 'w-10 h-10' }: { user: typeof user; size?: string }) => {
  const initials = getUserInitials(user.full_name);
  
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={`${size} object-cover`}
      />
    );
  }
  
  return (
    <div className={`${size} bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm`}>
      {initials}
    </div>
  );
};

// Custom SVG Icons (keeping your existing icons)
const CollapsedLogo = () => (
  <svg 
    width="32" 
    height="34" 
    viewBox="0 0 107.5 112.6" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-800"
  >
    <path fill="currentColor" d="M61.8,69.1c-4-3.4-9.2-8-14.7-12.9l0,0C33.8,44.4,18.9,31.5,18.6,31c-0.6-0.7-1.6-0.6-1.8-0.6c-0.1,0,0,0,0,0H4.5
    c-1.2,0-2.2,1-2.2,2.2v48c0,1.2,1,2.2,2.2,2.2h9.7c0.1,0,0.3,0,0.3-0.3V45.4l0,0l0,0l0,0l0,0c0-0.6,0.6-1,1.2-1s0.4,0,0.6,0.1l0,0
    l0,0c0,0,0,0,0.1,0l21.8,18.9l0,0l4,3.4l0,0l13.8,12l3.1,2.7l0,0c1.6,1.9,2.5,4.3,2.5,7c0,6.4-5.5,11.6-12.2,11.6
    s-12.2-5.2-12.2-11.6s1.5-6.2,3.9-8.3s0-0.3,0-0.4l-8.3-7.1c0,0-0.3,0-0.4,0c-4.3,4.2-6.8,9.8-6.8,15.9c0,12.6,10.7,22.7,24.1,22.7
    S73.7,101,73.7,88.5s-4.3-13.1-4.6-13.4s0,0,0,0c-0.1-0.1-3-2.7-7.1-6.2L61.8,69.1z"/>
    <path fill="currentColor" d="M45.8,44c4,3.4,9.2,8,14.7,12.9l0,0C73.9,68.6,88.7,81.6,89,82c0.6,0.7,1.8,0.6,1.8,0.6h2.1h1.3h8.9c1.2,0,2.2-1,2.2-2.2
    v-48c0-1.2-1-2.2-2.2-2.2h-10v37.4l0,0l0,0l0,0l0,0c0,0.6-0.6,1-1.2,1s-0.4,0-0.6-0.1l0,0l0,0c0,0,0,0-0.1,0L69.4,49.6l0,0l-4-3.4
    l0,0l-13.8-12l-3.1-2.7c-1.6-1.9-2.5-4.3-2.5-7c0-6.4,5.5-11.6,12.2-11.6c6.7,0,12.2,5.2,12.2,11.6s-1.6,6.5-4,8.6l8.8,7.6
    c4.3-4.2,7-9.8,7-16.2C82,11.9,71.4,1.8,58,1.8S33.9,12.1,33.9,24.5s4.6,13.4,4.6,13.4s2.8,2.5,7.1,6.2L45.8,44z"/>
  </svg>
);

const ExpandedLogo = () => (
  <svg 
    viewBox="0 0 608.8 118"
    xmlns="http://www.w3.org/2000/svg"
    className="w-[200px] h-auto text-gray-800"
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
);

const ToggleIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 18 18" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
  >
    <circle cx="9" cy="9" r="8.5" fill="#FAF9F9" stroke="#889096"/>
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M6.77564 13.0243C6.54132 12.7899 6.54132 12.41 6.77564 12.1757L9.95137 9L6.77564 5.82426C6.54132 5.58995 6.54132 5.21005 6.77564 4.97573C7.00995 4.74142 7.38985 4.74142 7.62417 4.97573L11.2242 8.57573C11.4585 8.81005 11.4585 9.18995 11.2242 9.42426L7.62417 13.0243C7.38985 13.2586 7.00995 13.2586 6.77564 13.0243Z" 
      fill="#889096"
    />
  </svg>
);

// Your existing icons (keeping the same)
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 3H4C3.44772 3 3 3.44772 3 4V9C3 9.55228 3.44772 10 4 10H20C20.5523 10 21 9.55228 21 9V4C21 3.44772 20.5523 3 20 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 14H4C3.44772 14 3 14.4477 3 15V20C3 20.5523 3.44772 21 4 21H9C9.55228 21 10 20.5523 10 20V15C10 14.4477 9.55228 14 9 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 14H15C14.4477 14 14 14.4477 14 15V20C14 20.5523 14.4477 21 15 21H20C20.5523 21 21 20.5523 21 20V15C21 14.4477 20.5523 14 20 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WriteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 9 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H2.2227C3.30993 1 4.19042 1.87647 4.19042 2.95875V16.1093C4.19042 17.1916 3.30993 18.0681 2.2227 18.0681H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.38097 1H6.15827C5.07103 1 4.19055 1.87647 4.19055 2.95875V16.1093C4.19055 17.1916 5.07103 18.0681 6.15827 18.0681H7.38097" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CanvasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M11.5528 1.10557C11.8343 0.964809 12.1657 0.964809 12.4472 1.10557L22.4472 6.10557C22.786 6.27496 23 6.62123 23 7C23 7.37877 22.786 7.72504 22.4472 7.89443L12.4472 12.8944C12.1657 13.0352 11.8343 13.0352 11.5528 12.8944L1.55279 7.89443C1.214 7.72504 1 7.37877 1 7C1 6.62123 1.214 6.27496 1.55279 6.10557L11.5528 1.10557ZM4.23607 7L12 10.882L19.7639 7L12 3.11803L4.23607 7Z" fill="currentColor"/>
    <path d="M1.10555 16.5528C1.35254 16.0588 1.95321 15.8586 2.44719 16.1055L12 20.8819L21.5528 16.1055C22.0467 15.8586 22.6474 16.0588 22.8944 16.5528C23.1414 17.0467 22.9412 17.6474 22.4472 17.8944L12.4472 22.8944C12.1657 23.0352 11.8343 23.0352 11.5528 22.8944L1.55276 17.8944C1.05878 17.6474 0.858558 17.0467 1.10555 16.5528Z" fill="currentColor"/>
    <path d="M2.44719 11.1055C1.95321 10.8586 1.35254 11.0588 1.10555 11.5528C0.858558 12.0467 1.05878 12.6474 1.55276 12.8944L11.5528 17.8944C11.8343 18.0352 12.1657 18.0352 12.4472 17.8944L22.4472 12.8944C22.9412 12.6474 23.1414 12.0467 22.8944 11.5528C22.6474 11.0588 22.0467 10.8586 21.5528 11.1055L12 15.8819L2.44719 11.1055Z" fill="currentColor"/>
  </svg>
);

const PlanningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2140_3151)">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.8219 13.4183C10.7148 14.2067 9.36048 14.6703 7.89769 14.6703C4.15722 14.6703 1.125 11.6381 1.125 7.89766C1.125 4.15719 4.15722 1.12497 7.89769 1.12497C11.6381 1.12497 14.6703 4.15719 14.6703 7.89766C14.6703 9.36039 14.2067 10.7148 13.4183 11.8219L17.6694 16.073C18.1103 16.5138 18.1103 17.2286 17.6694 17.6693C17.2286 18.1102 16.5139 18.1102 16.073 17.6693L11.8219 13.4183ZM12.4128 7.89766C12.4128 10.3913 10.3913 12.4128 7.89769 12.4128C5.4041 12.4128 3.38256 10.3913 3.38256 7.89766C3.38256 5.404 5.4041 3.38253 7.89769 3.38253C10.3913 3.38253 12.4128 5.404 12.4128 7.89766Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_2140_3151">
        <rect width="18" height="18" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const FilesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 10H22M2 18V6C2 4.89543 2.89543 4 4 4H7.17157C7.70201 4 8.21071 4.21071 8.58579 4.58579L9.41421 5.41421C9.78929 5.78929 10.298 6 10.8284 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M15.3102 21.03C15.2102 21.71 14.5902 22.25 13.8502 22.25H10.1502C9.41023 22.25 8.79023 21.71 8.70023 20.98L8.43023 19.09C8.16023 18.95 7.90023 18.8 7.64023 18.63L5.84023 19.35C5.14023 19.61 4.37023 19.32 4.03023 18.7L2.20023 15.53C1.85023 14.87 2.00023 14.09 2.56023 13.65L4.09023 12.46C4.08023 12.31 4.07023 12.16 4.07023 12C4.07023 11.85 4.08023 11.69 4.09023 11.54L2.57023 10.35C1.98023 9.90001 1.83023 9.09001 2.20023 8.47001L4.05023 5.28001C4.39023 4.66001 5.16023 4.38001 5.84023 4.65001L7.65023 5.38001C7.91023 5.21001 8.17023 5.06001 8.43023 4.92001L8.70023 3.01001C8.79023 2.31001 9.41023 1.76001 10.1402 1.76001H13.8402C14.5802 1.76001 15.2002 2.30001 15.2902 3.03001L15.5602 4.92001C15.8302 5.06001 16.0902 5.21001 16.3502 5.38001L18.1502 4.66001C18.8602 4.40001 19.6302 4.69001 19.9702 5.31001L21.8102 8.49001C22.1702 9.15001 22.0102 9.93001 21.4502 10.37L19.9302 11.56C19.9402 11.71 19.9502 11.86 19.9502 12.02C19.9502 12.18 19.9402 12.33 19.9302 12.48L21.4502 13.67C22.0102 14.12 22.1702 14.9 21.8202 15.53L19.9602 18.75C19.6202 19.37 18.8502 19.65 18.1602 19.38L16.3602 18.66C16.1002 18.83 15.8402 18.98 15.5802 19.12L15.3102 21.03ZM10.6202 20.25H13.3802L13.7502 17.7L14.2802 17.48C14.7202 17.3 15.1602 17.04 15.6202 16.7L16.0702 16.36L18.4502 17.32L19.8302 14.92L17.8002 13.34L17.8702 12.78L17.8733 12.7531C17.9023 12.5027 17.9302 12.2607 17.9302 12C17.9302 11.73 17.9002 11.47 17.8702 11.22L17.8002 10.66L19.8302 9.08001L18.4402 6.68001L16.0502 7.64001L15.6002 7.29001C15.1802 6.97001 14.7302 6.71001 14.2702 6.52001L13.7502 6.30001L13.3802 3.75001H10.6202L10.2502 6.30001L9.72023 6.51001C9.28023 6.70001 8.84023 6.95001 8.38023 7.30001L7.93023 7.63001L5.55023 6.68001L4.16023 9.07001L6.19023 10.65L6.12023 11.21C6.09023 11.47 6.06023 11.74 6.06023 12C6.06023 12.26 6.08023 12.53 6.12023 12.78L6.19023 13.34L4.16023 14.92L5.54023 17.32L7.93023 16.36L8.38023 16.71C8.81023 17.04 9.24023 17.29 9.71023 17.48L10.2402 17.7L10.6202 20.25ZM15.5002 12C15.5002 13.933 13.9332 15.5 12.0002 15.5C10.0672 15.5 8.50023 13.933 8.50023 12C8.50023 10.067 10.0672 8.50001 12.0002 8.50001C13.9332 8.50001 15.5002 10.067 15.5002 12Z" fill="currentColor"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.57503 7.49998C7.77095 6.94303 8.15766 6.4734 8.66666 6.17425C9.17566 5.87511 9.77411 5.76576 10.356 5.86557C10.9379 5.96538 11.4657 6.26791 11.8459 6.71958C12.2261 7.17125 12.4342 7.74291 12.4334 8.33331C12.4334 9.99998 9.93337 10.8333 9.93337 10.8333M9.99996 14.1666H10.0083M18.3333 9.99996C18.3333 14.6023 14.6023 18.3333 9.99996 18.3333C5.39759 18.3333 1.66663 14.6023 1.66663 9.99996C1.66663 5.39759 5.39759 1.66663 9.99996 1.66663C14.6023 1.66663 18.3333 5.39759 18.3333 9.99996Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.6665 16.6667C1.6665 17.1269 2.0396 17.5 2.49984 17.5C2.96007 17.5 3.33317 17.1269 3.33317 16.6667V3.33333C3.33317 2.8731 2.96007 2.5 2.49984 2.5C2.0396 2.5 1.6665 2.8731 1.6665 3.33333V16.6667Z" fill="currentColor"/>
    <path d="M11.4224 14.7559C11.7479 14.4305 11.7479 13.9028 11.4224 13.5774L8.67835 10.8333L17.4998 10.8333C17.9601 10.8333 18.3332 10.4602 18.3332 10C18.3332 9.53976 17.9601 9.16667 17.4998 9.16667L8.67835 9.16667L11.4224 6.42259C11.7479 6.09715 11.7479 5.56951 11.4224 5.24408C11.097 4.91864 10.5694 4.91864 10.2439 5.24408L6.07725 9.41074C5.75181 9.73618 5.75181 10.2638 6.07725 10.5893L10.2439 14.7559C10.5694 15.0814 11.097 15.0814 11.4224 14.7559Z" fill="currentColor"/>
  </svg>
);

// Fixed Tooltip component for collapsed sidebar
const TooltipMenu = ({ 
  item, 
  onItemClick, 
  activeView 
}: { 
  item: any; 
  onItemClick: (view: string) => void;
  activeView: string;
}) => (
  <div className="absolute left-16 top-0 bg-white border border-[#C6C5C5] rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-[60] w-48">
    <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
      {item.label}
    </div>
    {item.hasDropdown && item.subItems ? (
      <div className="py-1">
        {item.subItems.map((subItem: any) => {
          const isSubActive = activeView === subItem.view;
          return (
            <button
              key={subItem.key}
              onClick={() => onItemClick(subItem.view)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                isSubActive
                  ? 'bg-[#A5F7AC] text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {subItem.label}
            </button>
          );
        })}
      </div>
    ) : (
      <div className="py-1">
        <button
          onClick={() => onItemClick(item.view)}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go to {item.label}
        </button>
      </div>
    )}
  </div>
);

export function Sidebar({ isCollapsed, onToggle, activeView = 'write', onViewChange }: SidebarProps) {
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleDropdown = (key: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(key)) {
      newOpenDropdowns.delete(key);
    } else {
      newOpenDropdowns.add(key);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const handleItemClick = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const menuStructure = [
    {
      key: 'dashboard',
      icon: DashboardIcon,
      label: 'Dashboard',
      view: 'dashboard',
      hasDropdown: false
    },
    {
      key: 'write',
      icon: WriteIcon,
      label: 'Write',
      view: 'write',
      hasDropdown: true,
      subItems: [
        {
          key: 'projects',
          label: 'Projects',
          view: 'projects'
        }
      ]
    },
    {
      key: 'canvas',
      icon: CanvasIcon,
      label: 'Canvas',
      view: 'canvas',
      hasDropdown: false,
      isNew: true
    },
    {
      key: 'planning',
      icon: PlanningIcon,
      label: 'Planning',
      view: 'planning',
      hasDropdown: true,
      subItems: [
        { key: 'outline', label: 'Outline', view: 'outline' },
        { key: 'plot', label: 'Plot', view: 'plot' },
        { key: 'characters', label: 'Characters', view: 'characters' },
        { key: 'world-building', label: 'World Building', view: 'world-building' }
      ]
    },
    {
      key: 'files',
      icon: FilesIcon,
      label: 'Files',
      view: 'files',
      hasDropdown: false
    },
    {
      key: 'settings',
      icon: SettingsIcon,
      label: 'Settings',
      view: 'settings',
      hasDropdown: true,
      subItems: [
        { key: 'history', label: 'History', view: 'history' },
        { key: 'integrations', label: 'Integrations', view: 'integrations' }
      ]
    },
    {
      key: 'help',
      icon: HelpIcon,
      label: 'Help & Support',
      view: 'help',
      hasDropdown: true,
      subItems: [
        { key: 'help-topics', label: 'Help Topics', view: 'help-topics' },
        { key: 'get-started', label: 'Get Started', view: 'get-started' },
        { key: 'ask-question', label: 'Ask A Question', view: 'ask-question' },
        { key: 'give-feedback', label: 'Give Feedback', view: 'give-feedback' }
      ]
    }
  ];

  // Collapsed sidebar view
  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-[#C6C5C5] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Collapsed Header */}
        <div className="h-[60px] border-b border-[#C6C5C5] flex items-center justify-center px-2 relative">
          <CollapsedLogo />
          {/* Floating toggle button */}
          <button
            onClick={handleToggleClick}
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-all duration-200 z-10"
            title="Expand Sidebar"
          >
            <ToggleIcon isCollapsed={true} />
          </button>
        </div>

        {/* Collapsed Navigation Icons */}
        <nav className="flex-1 py-6">
          <ul className="space-y-4 px-2">
            {menuStructure.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.view || 
                (item.subItems?.some(sub => activeView === sub.view));

              return (
                <li key={item.key} className="relative group">
                  <button
                    onClick={() => handleItemClick(item.view)}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-[#A5F7AC] text-gray-900' 
                        : 'text-[#889096] hover:bg-gray-50 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon />
                    {item.isNew && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#A5F7AC] rounded-full border-2 border-white"></div>
                    )}
                  </button>
                  
                  {/* Tooltip Menu */}
                  <TooltipMenu 
                    item={item}
                    onItemClick={handleItemClick}
                    activeView={activeView}
                  />
                </li>
              );
            })}
          </ul>

          {/* Collapsed Exit Button */}
          <div className="mt-8 px-2">
            <div className="relative group">
              <button
                className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 text-[#889096] hover:bg-gray-50 hover:text-gray-700"
              >
                <ExitIcon />
              </button>
              {/* Simple tooltip for Exit */}
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[60] whitespace-nowrap">
                Exit Application
              </div>
            </div>
          </div>
        </nav>

        {/* Collapsed User Profile */}
        <div className="p-2 border-t border-[#C6C5C5]">
          <div className="relative group">
            <button
              onClick={() => handleItemClick('settings')}
              className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#A5F7AC] transition-colors"
            >
              <UserAvatar user={user} size="w-full h-full" />
            </button>
            {/* User tooltip with menu */}
            <div className="absolute left-16 top-0 bg-white border border-[#C6C5C5] rounded-lg shadow-lg py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-[60] w-48">
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">{user.full_name}</div>
                <div className="text-xs text-[#889096]">{user.email}</div>
                <div className="text-xs bg-[#A5F7AC] text-gray-900 px-2 py-0.5 rounded-full inline-block mt-1">
                  {user.subscription_tier}
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => handleItemClick('settings')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => handleItemClick('help')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded sidebar view
  return (
    <div className="w-[250px] bg-white border-r border-[#C6C5C5] flex flex-col min-h-screen transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="h-[80px] border-b border-[#C6C5C5] flex items-center justify-left px-4 relative">
        <div className="w-[200px] h-auto">
          <ExpandedLogo />
        </div>

        {/* Floating toggle button */}
        <button
          onClick={handleToggleClick}
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 hover:scale-110 transition-all duration-200 z-10"
          title="Collapse Sidebar"
        >
          <ToggleIcon isCollapsed={false} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-4">
          {menuStructure.map((item) => {
            const Icon = item.icon;
            const isOpen = openDropdowns.has(item.key);
            const isActive = activeView === item.view || 
              (item.subItems?.some(sub => activeView === sub.view));

            return (
              <li key={item.key}>
                <div>
                  <button
                    onClick={() => {
                      if (item.hasDropdown) {
                        toggleDropdown(item.key);
                      } else {
                        handleItemClick(item.view);
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold text-left
                      ${isActive 
                        ? 'bg-[#EAE9E9] text-gray-900' 
                        : 'text-[#889096] hover:bg-gray-50 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon />
                    <span className="font-inter font-semibold flex-1">
                      {item.label}
                    </span>
                    {item.isNew && (
                      <span className="text-xs bg-[#A5F7AC] text-gray-900 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Dropdown Items */}
                  {item.hasDropdown && isOpen && item.subItems && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.subItems.map((subItem) => {
                        const isSubActive = activeView === subItem.view;
                        return (
                          <li key={subItem.key}>
                            <button
                              onClick={() => handleItemClick(subItem.view)}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium text-left
                                ${isSubActive
                                  ? 'bg-[#A5F7AC] text-gray-900' 
                                  : 'text-[#889096] hover:bg-gray-50 hover:text-gray-700'
                                }
                              `}
                            >
                              <span className="font-inter flex-1">{subItem.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Exit Button */}
        <div className="mt-8 px-4">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold text-[#889096] hover:bg-gray-50 hover:text-gray-700"
          >
            <ExitIcon />
            <span className="font-inter font-semibold">Exit</span>
          </button>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-[#C6C5C5] relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-[#A5F7AC] transition-colors flex-shrink-0">
            <UserAvatar user={user} size="w-full h-full" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-900 text-sm">{user.full_name}</div>
            <div className="text-xs text-[#889096] truncate">{user.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#A5F7AC] text-gray-900 px-2 py-0.5 rounded-full font-medium">
              {user.subscription_tier}
            </span>
            <ChevronDown className={`w-4 h-4 text-[#889096] transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* User Menu Dropdown */}
        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-[#C6C5C5] rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                handleItemClick('settings');
                setShowUserMenu(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                handleItemClick('help');
                setShowUserMenu(false);
              }}
 className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
            <div className="border-t border-gray-200 my-1"></div>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
