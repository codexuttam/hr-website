import { UserRole } from '@/contexts/AuthContext';

/**
 * Get the redirect path based on user role
 */
export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'recruiter':
      return '/dashboard';
    case 'mentor':
      return '/dashboard';
    case 'student':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Get the home path for a user based on their role
 */
export function getUserHomePath(role: UserRole): string {
  return getRedirectPath(role);
}

/**
 * Check if a user should have access to the regular dashboard
 */
export function canAccessDashboard(role: UserRole): boolean {
  return role !== 'admin';
}

/**
 * Check if a user should have access to the admin dashboard
 */
export function canAccessAdminDashboard(role: UserRole): boolean {
  return role === 'admin';
}
