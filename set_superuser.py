#!/usr/bin/env python3
"""
Script to set superuser permissions for a user
Run this from the backend directory: python set_superuser.py
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/home/ayat_app/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'quran_events_backend.settings_production')

# Setup Django
django.setup()

from accounts.models import User

def set_superuser_permissions(username):
    """Set superuser permissions for a user"""
    try:
        user = User.objects.get(username=username)
        
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
        
        print(f"✅ User '{username}' has been granted superuser permissions!")
        print(f"   - Role: {user.role}")
        print(f"   - Is Superuser: {user.is_superuser}")
        print(f"   - Is Staff: {user.is_staff}")
        print(f"   - Permissions: {len(user.permissions)} permissions granted")
        
    except User.DoesNotExist:
        print(f"❌ User '{username}' not found!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

def list_users():
    """List all users"""
    users = User.objects.all()
    print("\n📋 All Users:")
    print("-" * 50)
    for user in users:
        print(f"Username: {user.username}")
        print(f"  - Role: {user.role}")
        print(f"  - Is Superuser: {user.is_superuser}")
        print(f"  - Is Staff: {user.is_staff}")
        print(f"  - Permissions: {len(user.permissions) if user.permissions else 0} permissions")
        print("-" * 50)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python set_superuser.py <username>")
        print("       python set_superuser.py --list")
        print("\nExamples:")
        print("  python set_superuser.py hadi")
        print("  python set_superuser.py admin")
        print("  python set_superuser.py --list")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_users()
    else:
        username = sys.argv[1]
        set_superuser_permissions(username)
