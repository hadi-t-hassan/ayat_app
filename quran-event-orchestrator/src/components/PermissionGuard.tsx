import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPage, hasPermission, isSuperUser, isAdmin } from '@/utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  page?: string;
  permission?: string;
  requireAdmin?: boolean;
  requireSuperUser?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Permission Guard Component
 * Controls access to components based on user permissions
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  page,
  permission,
  requireAdmin = false,
  requireSuperUser = false,
  fallback = null
}) => {
  const { user, profile } = useAuth();

  // Check if user is logged in
  if (!user || !profile) {
    return <>{fallback}</>;
  }

  // Check superuser requirement
  if (requireSuperUser && !isSuperUser(user, profile)) {
    return <>{fallback}</>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin(user, profile)) {
    return <>{fallback}</>;
  }

  // Check page access
  if (page && !canAccessPage(user, profile, page)) {
    return <>{fallback}</>;
  }

  // Check specific permission
  if (permission && !hasPermission(user, profile, permission)) {
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
};

/**
 * Hook for checking permissions in components
 */
export const usePermissions = () => {
  const { user, profile } = useAuth();

  return {
    isAdmin: () => isAdmin(user, profile),
    isSuperUser: () => isSuperUser(user, profile),
    hasPermission: (permission: string) => hasPermission(user, profile, permission),
    canAccessPage: (page: string) => canAccessPage(user, profile, page),
    user,
    profile
  };
};

/**
 * Higher-order component for permission-based rendering
 */
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: string | string[],
  fallback?: React.ReactNode
) => {
  return (props: P) => {
    const { user, profile } = useAuth();
    
    if (!user || !profile) {
      return <>{fallback}</>;
    }

    const permissions = Array.isArray(permission) ? permission : [permission];
    const hasRequiredPermission = permissions.some(perm => 
      hasPermission(user, profile, perm)
    );

    if (!hasRequiredPermission) {
      return <>{fallback}</>;
    }

    return <Component {...props} />;
  };
};
