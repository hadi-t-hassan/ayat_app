import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Users, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/utils/api';

// Available pages for permissions - will be updated with translations in component
const AVAILABLE_PAGES = [
  { id: 'dashboard', title: 'Dashboard', description: 'Overview and statistics' },
  { id: 'users', title: 'Users Settings', description: 'Manage users and permissions' },
  { id: 'events', title: 'Manage Events', description: 'Create and manage events' },
  { id: 'parties', title: 'View Parties', description: 'View event participants' },
  { id: 'language-settings', title: 'Language Settings', description: 'Customize translation values' },
];

// Type
interface Profile {
  id: string;
  name: string;
  username: string;
  role: string;
  user_id: string;
  permissions?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export default function UsersSettings() {
  const { profile: currentProfile } = useAuth();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();

  // Get translated page titles
  const getTranslatedPages = () => [
    { id: 'dashboard', title: t.dashboard, description: t.overviewAndStatistics },
    { id: 'users', title: t.userManagement, description: t.manageUsersAndPermissions },
    { id: 'events', title: t.eventManagement, description: t.createAndManageEvents },
    { id: 'parties', title: t.parties, description: t.viewEventParticipants },
    { id: 'language-settings', title: 'Language Settings', description: t.customizeTranslationValues },
  ];
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Profile[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    role: 'user',
    password: '',
  });

  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const isAdmin = currentProfile?.role === 'admin';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiGet('/users/');
      
      if (response.error) {
        throw new Error(response.error);
      }

      setUsers(response.data?.results || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can add new users",
        variant: "destructive",
      });
      return;
    }

    if (!userForm.name || !userForm.username || !userForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Split name into first and last name
      const nameParts = userForm.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await apiPost('/users/create/', {
        username: userForm.username,
        first_name: firstName,
        last_name: lastName,
        password: userForm.password,
        role: userForm.role,
        permissions: userPermissions,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const newUser = response.data;
      
      // Add to local state
      setUsers(prev => [newUser, ...prev]);

      toast({
        title: "Success!",
        description: `User ${userForm.name} has been created successfully`,
      });

      // Reset form
      setUserForm({
        name: '',
        username: '',
        role: 'user',
        password: '',
      });
      setUserPermissions({});

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      username: user.username,
      role: user.role,
      password: '', // Don't pre-fill password for security
    });
    setUserPermissions(user.permissions || {});
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete users",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiDelete(`/users/${userId}/`);

      if (response.error) {
        throw new Error(response.error);
      }

      // Remove from local state
      setUsers(prev => prev.filter(user => user.id !== userId));

      toast({
        title: "Success!",
        description: "User has been deleted successfully",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can update users",
        variant: "destructive",
      });
      return;
    }

    if (!editingUser) {
      toast({
        title: "Error",
        description: "No user selected for editing",
        variant: "destructive",
      });
      return;
    }

    if (!userForm.name || !userForm.username) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Split name into first and last name
      const nameParts = userForm.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const updateData: any = {
        first_name: firstName,
        last_name: lastName,
        role: userForm.role,
        permissions: userPermissions,
      };

      // Only include password if it's provided
      if (userForm.password) {
        updateData.password = userForm.password;
      }

      const response = await apiPatch(`/users/${editingUser.id}/`, updateData);

      if (response.error) {
        throw new Error(response.error);
      }

      const updatedUser = response.data;
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, name: userForm.name, username: userForm.username, role: userForm.role, permissions: userPermissions }
          : user
      ));

      toast({
        title: "Success!",
        description: `User ${userForm.name} has been updated successfully`,
      });

      // Reset form and editing state
      setUserForm({
        name: '',
        username: '',
        role: 'user',
        password: '',
      });
      setUserPermissions({});
      setEditingUser(null);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      username: '',
      role: 'user',
      password: '',
    });
    setUserPermissions({});
  };

  const handlePermissionChange = (pageId: string, checked: boolean) => {
    setUserPermissions(prev => ({
      ...prev,
      [pageId]: checked
    }));
  };

  return (
    <div className={`space-y-3 sm:space-y-4 md:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className={`px-1 ${isRTL ? 'text-right' : 'text-left'}`}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t.userManagement}</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          {t.permissions}
        </p>
      </div>

      {/* Add User Form */}
      <Card>
        <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Plus className="h-5 w-5" />
                {editingUser ? t.editUser : t.addNewUser}
              </CardTitle>
              <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                {editingUser ? 'Update user information and permissions' : t.createNewUserAccount}
                {!isAdmin && " (Admin access required)"}
              </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={editingUser ? handleUpdateUser : handleSubmit} className="space-y-6">
            {/* Basic User Information */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className={isRTL ? 'text-right' : 'text-left'}>{t.fullName}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  disabled={!isAdmin}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className={isRTL ? 'text-right' : 'text-left'}>{t.username}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  disabled={!isAdmin}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isRTL ? 'text-right' : 'text-left'}>{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={editingUser ? "Enter new password (leave blank to keep current)" : "Enter password"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  disabled={!isAdmin}
                  className={isRTL ? 'text-right' : 'text-left'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className={isRTL ? 'text-right' : 'text-left'}>{t.role}</Label>
                <Select 
                  value={userForm.role} 
                  onValueChange={(value) => setUserForm({ ...userForm, role: value })}
                  disabled={!isAdmin}
                >
                  <SelectTrigger className={isRTL ? 'text-right' : 'text-left'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                    <SelectItem value="user">{t.participant}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Page Permissions */}
            {isAdmin && (
              <div className="space-y-4">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Settings className="h-5 w-5" />
                  <Label className={`text-base font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t.permissions}</Label>
                </div>
                <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  Select which pages this user can access when they log in.
                </p>
                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {getTranslatedPages().map((page) => (
                    <div key={page.id} className={`flex items-center space-x-2 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Checkbox
                        id={`permission-${page.id}`}
                        checked={userPermissions[page.id] || false}
                        onCheckedChange={(checked) => handlePermissionChange(page.id, checked as boolean)}
                        disabled={!isAdmin}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={`permission-${page.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          {page.title}
                        </Label>
                        <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {page.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={loading || !isAdmin}
                className="w-full sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
              {editingUser && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users className="h-5 w-5" />
            {t.systemUsers}
          </CardTitle>
          <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
            {t.allRegisteredUsers}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={`min-w-[100px] sm:min-w-[120px] ${isRTL ? 'text-right' : 'text-left'}`}>{t.fullName}</TableHead>
                    <TableHead className={`min-w-[80px] sm:min-w-[100px] ${isRTL ? 'text-right' : 'text-left'}`}>{t.username}</TableHead>
                    <TableHead className={`min-w-[60px] sm:min-w-[80px] ${isRTL ? 'text-right' : 'text-left'}`}>{t.role}</TableHead>
                    <TableHead className={`min-w-[150px] sm:min-w-[200px] hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{t.permissions}</TableHead>
                    <TableHead className={`min-w-[80px] sm:min-w-[100px] hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{t.created}</TableHead>
                    <TableHead className={`w-[100px] sm:w-[120px] ${isRTL ? 'text-right' : 'text-left'}`}>{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className={`text-center py-8 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{user.name}</TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>@{user.username}</TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === 'admin' ? t.admin : t.participant}
                          </Badge>
                        </TableCell>
                        <TableCell className={`hidden sm:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                            {user.permissions && Object.entries(user.permissions).map(([pageId, hasAccess]) => {
                              if (hasAccess) {
                                const page = getTranslatedPages().find(p => p.id === pageId);
                                return page ? (
                                  <Badge key={pageId} variant="outline" className="text-xs">
                                    {page.title}
                                  </Badge>
                                ) : null;
                              }
                              return null;
                            })}
                            {(!user.permissions || Object.values(user.permissions).every(p => !p)) && (
                              <span className="text-xs text-muted-foreground">No permissions</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={`hidden md:table-cell ${isRTL ? 'text-right' : 'text-left'}`}>{formatDate(user.created_at)}</TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className={`flex flex-wrap items-center gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!isAdmin}
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditUser(user)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!isAdmin || user.id === currentProfile?.id}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
