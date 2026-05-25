import { useAuth, UserRole } from '../contexts/AuthContext';

interface RolePermissions {
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canPostJobs: boolean;
  canReviewResumes: boolean;
  canMentorStudents: boolean;
  canAccessATS: boolean;
  canBuildResume: boolean;
}

export const useRoleAccess = (): RolePermissions & { userRole: UserRole | null } => {
  const { user } = useAuth();
  const userRole = user?.role || null;

  const getPermissions = (role: UserRole | null): RolePermissions => {
    if (!role) {
      return {
        canAccessAdmin: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canPostJobs: false,
        canReviewResumes: false,
        canMentorStudents: false,
        canAccessATS: false,
        canBuildResume: false,
      };
    }

    switch (role) {
      case 'admin':
        return {
          canAccessAdmin: true,
          canManageUsers: true,
          canViewAnalytics: true,
          canPostJobs: true,
          canReviewResumes: true,
          canMentorStudents: true,
          canAccessATS: true,
          canBuildResume: true,
        };
      case 'recruiter':
        return {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canPostJobs: true,
          canReviewResumes: true,
          canMentorStudents: false,
          canAccessATS: true,
          canBuildResume: false,
        };
      case 'mentor':
        return {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canPostJobs: false,
          canReviewResumes: true,
          canMentorStudents: true,
          canAccessATS: false,
          canBuildResume: false,
        };
      case 'student':
        return {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canPostJobs: false,
          canReviewResumes: false,
          canMentorStudents: false,
          canAccessATS: true,
          canBuildResume: true,
        };
      default:
        return {
          canAccessAdmin: false,
          canManageUsers: false,
          canViewAnalytics: false,
          canPostJobs: false,
          canReviewResumes: false,
          canMentorStudents: false,
          canAccessATS: false,
          canBuildResume: false,
        };
    }
  };

  const permissions = getPermissions(userRole);

  return {
    ...permissions,
    userRole,
  };
};

// Utility function to check if user has specific role
export const hasRole = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

// Utility function to check if user has any of the specified roles
export const hasAnyRole = (userRole: UserRole | null, requiredRoles: UserRole[]): boolean => {
  return userRole ? requiredRoles.includes(userRole) : false;
};

// Utility function to check if user has admin privileges
export const isAdmin = (userRole: UserRole | null): boolean => {
  return userRole === 'admin';
};