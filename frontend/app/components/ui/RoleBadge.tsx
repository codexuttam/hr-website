import React from 'react';
import { UserRole, getRoleDisplayName } from './RoleSelector';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'md', 
  className = '' 
}) => {
  const getRoleColor = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'recruiter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mentor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'student':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      case 'md':
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${getRoleColor(role)}
        ${getSizeClasses(size)}
        ${className}
      `}
    >
      {getRoleDisplayName(role)}
    </span>
  );
};

export default RoleBadge;