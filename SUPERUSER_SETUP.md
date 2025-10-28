# Superuser Permissions Setup Guide

This guide shows you how to give superuser permissions to users so they can access all pages and features.

## 🚀 **Quick Setup (Recommended)**

### **Method 1: Using the Script (Easiest)**

```bash
# 1. Go to backend directory
cd /home/ayat_app/backend

# 2. Activate virtual environment
source ../venv/bin/activate

# 3. Run the superuser script
python set_superuser.py hadi

# 4. List all users to verify
python set_superuser.py --list
```

### **Method 2: Using Django Admin**

```bash
# 1. Go to Django admin
https://ayat.pingtech.dev/admin/

# 2. Login with your superuser account
# 3. Go to Users section
# 4. Edit the user you want to make superuser
# 5. Check "Superuser status" and "Staff status"
# 6. Set Role to "admin"
# 7. Save the user
```

### **Method 3: Using Django Shell**

```bash
# 1. Go to backend directory
cd /home/ayat_app/backend
source ../venv/bin/activate

# 2. Open Django shell
python manage.py shell --settings=quran_events_backend.settings_production

# 3. Run these commands in the shell:
from accounts.models import User

# Get the user
user = User.objects.get(username='hadi')

# Set superuser permissions
user.is_superuser = True
user.is_staff = True
user.role = 'admin'

# Set all permissions
all_permissions = {
    'view_dashboard': True,
    'manage_events': True,
    'view_events': True,
    'manage_parties': True,
    'view_parties': True,
    'manage_users': True,
    'view_users': True,
    'view_reports': True,
    'manage_settings': True,
    'view_analytics': True,
    'manage_roles': True,
    'view_logs': True,
    'manage_system': True,
    'export_data': True,
    'import_data': True,
    'backup_data': True,
    'restore_data': True
}

user.permissions = all_permissions
user.save()

print(f"User {user.username} is now a superuser!")
```

## 🔧 **Using the Permission System in Frontend**

### **1. Using PermissionGuard Component**

```tsx
import { PermissionGuard } from '@/components/PermissionGuard';

// Show content only to superusers
<PermissionGuard requireSuperUser={true}>
  <div>This content is only visible to superusers</div>
</PermissionGuard>

// Show content only to admins
<PermissionGuard requireAdmin={true}>
  <div>This content is visible to admins and superusers</div>
</PermissionGuard>

// Show content based on specific permission
<PermissionGuard permission="manage_system">
  <div>This content requires manage_system permission</div>
</PermissionGuard>

// Show content based on page access
<PermissionGuard page="admin">
  <div>This content requires admin page access</div>
</PermissionGuard>
```

### **2. Using the usePermissions Hook**

```tsx
import { usePermissions } from '@/components/PermissionGuard';

function MyComponent() {
  const { isAdmin, isSuperUser, hasPermission, canAccessPage } = usePermissions();

  return (
    <div>
      {isSuperUser() && <div>Superuser content</div>}
      {isAdmin() && <div>Admin content</div>}
      {hasPermission('manage_events') && <div>Event management content</div>}
      {canAccessPage('dashboard') && <div>Dashboard content</div>}
    </div>
  );
}
```

### **3. Using the useAuth Hook**

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isSuperUser, isAdmin, hasPermission, canAccessPage } = useAuth();

  return (
    <div>
      {isSuperUser() && <div>Superuser only content</div>}
      {isAdmin() && <div>Admin content</div>}
      {hasPermission('manage_users') && <div>User management</div>}
    </div>
  );
}
```

## 📋 **Available Permissions**

| Permission | Description |
|------------|-------------|
| `view_dashboard` | Access to dashboard |
| `manage_events` | Create, edit, delete events |
| `view_events` | View events |
| `manage_parties` | Create, edit, delete parties |
| `view_parties` | View parties |
| `manage_users` | Create, edit, delete users |
| `view_users` | View users |
| `view_reports` | Access to reports |
| `manage_settings` | Access to settings |
| `view_analytics` | Access to analytics |
| `manage_roles` | Manage user roles |
| `view_logs` | Access to system logs |
| `manage_system` | System administration |
| `export_data` | Export data |
| `import_data` | Import data |
| `backup_data` | Backup data |
| `restore_data` | Restore data |

## 🎯 **Page Access Control**

| Page | Required Permissions |
|------|---------------------|
| `dashboard` | `view_dashboard` |
| `events` | `manage_events` or `view_events` |
| `parties` | `manage_parties` or `view_parties` |
| `users` | `manage_users` or `view_users` |
| `reports` | `view_reports` |
| `settings` | `manage_settings` |
| `analytics` | `view_analytics` |
| `admin` | `manage_system` |
| `logs` | `view_logs` |
| `backup` | `backup_data` or `restore_data` |

## 🔍 **Verification**

After setting up superuser permissions, verify by:

1. **Login to the application**
2. **Check if you can access all pages**
3. **Check browser console for any permission errors**
4. **Test API endpoints that require permissions**

## 🚨 **Troubleshooting**

### **If permissions don't work:**

1. **Check if user is properly saved:**
   ```bash
   python set_superuser.py --list
   ```

2. **Check browser console for errors**

3. **Verify the user is logged in with correct role**

4. **Check if the frontend is using the updated AuthContext**

### **If you get 500 errors:**

1. **Check uWSGI logs:**
   ```bash
   journalctl -u ayat-app -f
   ```

2. **Check if the backend is running:**
   ```bash
   systemctl status ayat-app
   ```

3. **Restart services:**
   ```bash
   systemctl restart ayat-app
   systemctl restart nginx
   ```

## ✅ **Success Indicators**

You'll know the superuser permissions are working when:

- ✅ **User can access all pages** without permission errors
- ✅ **Admin features are visible** in the UI
- ✅ **No 403 Forbidden errors** in the browser console
- ✅ **All API endpoints respond** correctly
- ✅ **User role shows as "admin"** in the profile

Your superuser now has full access to all features! 🎉
