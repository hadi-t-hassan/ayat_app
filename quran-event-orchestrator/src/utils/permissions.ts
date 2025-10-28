/**
 * Permission utility functions for role-based access control
 */

export interface UserPermissions {
  [key: string]: boolean;
}

export interface User {
  id: string;
  username: string;
  role?: string;
  permissions?: UserPermissions;
}

export interface Profile {
  id: string;
  name: string;
  username: string;
  role: string;
  user_id: string;
  permissions?: UserPermissions;
  created_at: string;
  updated_at: string;
}

/**
 * Check if user has admin role
 */
export const isAdmin = (user: User | null, profile: Profile | null): boolean => {
  if (!user || !profile) return false;
  return profile.role === 'admin' || user.role === 'admin';
};

/**
 * Check if user is superuser (admin with full permissions)
 */
export const isSuperUser = (user: User | null, profile: Profile | null): boolean => {
  if (!user || !profile) return false;
  return profile.role === 'admin' && (user.role === 'admin' || user.role === 'superuser');
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  user: User | null, 
  profile: Profile | null, 
  permission: string
): boolean => {
  if (!user || !profile) return false;
  
  // Superuser has all permissions
  if (isSuperUser(user, profile)) return true;
  
  // Admin has most permissions by default
  if (isAdmin(user, profile)) {
    // Define admin permissions
    const adminPermissions = [
      'view_dashboard',
      'manage_events',
      'manage_users',
      'view_reports',
      'manage_settings',
      'view_parties',
      'manage_parties',
      'view_analytics',
      'manage_roles',
      'view_logs',
      'manage_system',
      'export_data',
      'import_data',
      'backup_data',
      'restore_data'
    ];
    
    if (adminPermissions.includes(permission)) return true;
  }
  
  // Check specific user permissions
  const userPermissions = profile.permissions || user.permissions || {};
  return userPermissions[permission] === true;
};

/**
 * Check if user can access a specific page/route
 */
export const canAccessPage = (
  user: User | null, 
  profile: Profile | null, 
  page: string
): boolean => {
  if (!user || !profile) return false;
  
  // Superuser can access everything
  if (isSuperUser(user, profile)) return true;
  
  // Define page permissions
  const pagePermissions: { [key: string]: string[] } = {
    'dashboard': ['view_dashboard'],
    'events': ['manage_events', 'view_events'],
    'parties': ['manage_parties', 'view_parties'],
    'users': ['manage_users', 'view_users'],
    'reports': ['view_reports'],
    'settings': ['manage_settings'],
    'analytics': ['view_analytics'],
    'admin': ['manage_system'],
    'logs': ['view_logs'],
    'backup': ['backup_data', 'restore_data'],
    'export': ['export_data'],
    'import': ['import_data']
  };
  
  const requiredPermissions = pagePermissions[page] || [];
  if (requiredPermissions.length === 0) return true; // No specific permissions required
  
  return requiredPermissions.some(permission => hasPermission(user, profile, permission));
};

/**
 * Get all permissions for a user
 */
export const getUserPermissions = (user: User | null, profile: Profile | null): string[] => {
  if (!user || !profile) return [];
  
  const allPermissions = [
    'view_dashboard',
    'manage_events',
    'view_events',
    'manage_parties',
    'view_parties',
    'manage_users',
    'view_users',
    'view_reports',
    'manage_settings',
    'view_analytics',
    'manage_roles',
    'view_logs',
    'manage_system',
    'export_data',
    'import_data',
    'backup_data',
    'restore_data'
  ];
  
  if (isSuperUser(user, profile)) {
    return allPermissions;
  }
  
  if (isAdmin(user, profile)) {
    return allPermissions.filter(permission => 
      !['manage_system', 'backup_data', 'restore_data'].includes(permission)
    );
  }
  
  // Regular user permissions
  const userPermissions = profile.permissions || user.permissions || {};
  return allPermissions.filter(permission => userPermissions[permission] === true);
};

/**
 * Check if user can perform a specific action
 */
export const canPerformAction = (
  user: User | null,
  profile: Profile | null,
  action: string,
  resource?: string
): boolean => {
  if (!user || !profile) return false;
  
  // Superuser can do everything
  if (isSuperUser(user, profile)) return true;
  
  // Define action permissions
  const actionPermissions: { [key: string]: string[] } = {
    'create': ['manage_events', 'manage_parties', 'manage_users'],
    'edit': ['manage_events', 'manage_parties', 'manage_users'],
    'delete': ['manage_events', 'manage_parties', 'manage_users'],
    'view': ['view_events', 'view_parties', 'view_users', 'view_dashboard'],
    'export': ['export_data'],
    'import': ['import_data'],
    'backup': ['backup_data'],
    'restore': ['restore_data']
  };
  
  const requiredPermissions = actionPermissions[action] || [];
  return requiredPermissions.some(permission => hasPermission(user, profile, permission));
};
