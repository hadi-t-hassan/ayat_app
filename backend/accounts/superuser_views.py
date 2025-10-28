"""
Superuser management views
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def set_superuser_permissions(request):
    """
    Set superuser permissions for a user
    Only superusers can call this endpoint
    """
    # Check if the requesting user is a superuser
    if not request.user.is_superuser:
        return Response(
            {'error': 'Only superusers can set superuser permissions'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Set superuser permissions
    with transaction.atomic():
        user.is_superuser = True
        user.is_staff = True
        user.role = 'admin'
        user.save()
        
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
    
    return Response({
        'message': f'User {username} has been granted superuser permissions',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_superuser': user.is_superuser,
            'permissions': user.permissions
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    """
    Get current user's permissions
    """
    user = request.user
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'permissions': user.permissions or {}
        }
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_permissions(request):
    """
    Update user permissions
    Only superusers can update permissions
    """
    if not request.user.is_superuser:
        return Response(
            {'error': 'Only superusers can update permissions'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    username = request.data.get('username')
    permissions = request.data.get('permissions', {})
    
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update permissions
    user.permissions = permissions
    user.save()
    
    return Response({
        'message': f'Permissions updated for user {username}',
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'permissions': user.permissions
        }
    }, status=status.HTTP_200_OK)
