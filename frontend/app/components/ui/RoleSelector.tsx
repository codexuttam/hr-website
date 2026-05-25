import React from 'react';

export type UserRole = 'student' | 'recruiter' | 'mentor' | 'admin';

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  showDescriptions?: boolean;
}

const roleOptions = [
  {
    value: 'student' as UserRole,
    label: 'Student',
    description: 'Looking for career guidance and opportunities'
  },
  {
    value: 'recruiter' as UserRole,
    label: 'Recruiter',
    description: 'Hiring and evaluating candidates'
  },
  {
    value: 'mentor' as UserRole,
    label: 'Mentor',
    description: 'Providing career guidance and support'
  },
  {
    value: 'admin' as UserRole,
    label: 'Admin',
    description: 'Platform administration and management'
  }
];

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  label = 'Role',
  className = '',
  disabled = false,
  showDescriptions = true
}) => {
  return (
    <div className={className}>
      <label htmlFor="role-selector" className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id="role-selector"
        value={value}
        onChange={(e) => onChange(e.target.value as UserRole)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {showDescriptions 
              ? `${option.label} - ${option.description}`
              : option.label
            }
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;

// Utility functions for role management
export const getRoleDisplayName = (role: UserRole): string => {
  const option = roleOptions.find(opt => opt.value === role);
  return option?.label || role;
};

export const getRoleDescription = (role: UserRole): string => {
  const option = roleOptions.find(opt => opt.value === role);
  return option?.description || '';
};

export const isValidRole = (role: string): role is UserRole => {
  return roleOptions.some(option => option.value === role);
};