'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Search,
  Filter,
  Download,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Crown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Types
interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'VIEWER';
  isActive: boolean;
  permissions: string[];
  lastActive?: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

interface TeamAnalytics {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  totalActions: number;
  activityByRole: Record<string, number>;
  recentActivity: Array<{
    date: string;
    actions: number;
  }>;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-500',
  ADMIN: 'bg-red-500',
  MANAGER: 'bg-blue-500',
  EDITOR: 'bg-green-500',
  VIEWER: 'bg-gray-500',
};

const PERMISSIONS = [
  { id: 'posts.create', label: 'Create Posts', category: 'Content' },
  { id: 'posts.read', label: 'View Posts', category: 'Content' },
  { id: 'posts.update', label: 'Edit Posts', category: 'Content' },
  { id: 'posts.delete', label: 'Delete Posts', category: 'Content' },
  { id: 'posts.publish', label: 'Publish Posts', category: 'Content' },
  { id: 'analytics.read', label: 'View Analytics', category: 'Analytics' },
  { id: 'analytics.export', label: 'Export Analytics', category: 'Analytics' },
  { id: 'team.read', label: 'View Team', category: 'Team' },
  { id: 'team.invite', label: 'Invite Members', category: 'Team' },
  { id: 'team.update', label: 'Update Members', category: 'Team' },
  { id: 'team.remove', label: 'Remove Members', category: 'Team' },
  { id: 'settings.read', label: 'View Settings', category: 'Settings' },
  { id: 'settings.update', label: 'Update Settings', category: 'Settings' },
  { id: 'billing.read', label: 'View Billing', category: 'Billing' },
  { id: 'billing.update', label: 'Manage Billing', category: 'Billing' },
];

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('EDITOR');

  // Fetch team members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => apiClient.getTeamMembers(),
  });

  // Fetch team analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<TeamAnalytics>({
    queryKey: ['teamAnalytics'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        totalMembers: members.length || 0,
        activeMembers: members.filter((m: TeamMember) => m.isActive).length || 0,
        pendingInvites: 3,
        totalActions: 1247,
        activityByRole: {
          ADMIN: 450,
          MANAGER: 320,
          EDITOR: 477,
        },
        recentActivity: [
          { date: '2024-01-01', actions: 45 },
          { date: '2024-01-02', actions: 52 },
          { date: '2024-01-03', actions: 38 },
        ],
      };
    },
  });

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          action: 'INVITE_MEMBER',
          resource: 'team',
          details: 'Invited jane@example.com as Editor',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          action: 'UPDATE_ROLE',
          resource: 'team',
          details: 'Changed role from Editor to Manager',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ipAddress: '192.168.1.2',
        },
      ];
    },
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      apiClient.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      toast.success('Invitation sent successfully');
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('EDITOR');
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });

  // Remove member mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => apiClient.removeTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      toast.success('Member removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  // Filter members
  const filteredMembers = members.filter((member: TeamMember) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      removeMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold mt-2">
                  {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalMembers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold mt-2">
                  {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.activeMembers}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold mt-2">
                  {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.pendingInvites}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                <p className="text-2xl font-bold mt-2">
                  {analyticsLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalActions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team members and their access
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="OWNER">Owner</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.map((member: TeamMember) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onRemove={handleRemoveMember}
                      onViewPermissions={(m) => {
                        setSelectedMember(m);
                        setPermissionModalOpen(true);
                      }}
                    />
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No members found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>
                View and manage permissions for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity by Role</CardTitle>
                <CardDescription>
                  Actions performed by each role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analytics?.activityByRole || {}).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${ROLE_COLORS[role]}`} />
                          <span className="font-medium">{ROLE_LABELS[role]}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-48 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${ROLE_COLORS[role]}`}
                              style={{
                                width: `${(count / (analytics?.totalActions || 1)) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>
                  Key metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                      <p className="text-2xl font-bold">2.3h</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm text-muted-foreground">Posts Created</p>
                      <p className="text-2xl font-bold">847</p>
                    </div>
                    <Activity className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                    <div>
                      <p className="text-sm text-muted-foreground">Collaboration Score</p>
                      <p className="text-2xl font-bold">94%</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>
                    Complete history of team actions and changes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <AuditLogItem key={log.id} log={log} />
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No audit logs found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {inviteRole === 'ADMIN' && 'Full access to all features and settings'}
                {inviteRole === 'MANAGER' && 'Can manage content and team members'}
                {inviteRole === 'EDITOR' && 'Can create and edit content'}
                {inviteRole === 'VIEWER' && 'Read-only access to content and analytics'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Details Modal */}
      <Dialog open={permissionModalOpen} onOpenChange={setPermissionModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Permissions</DialogTitle>
            <DialogDescription>
              {selectedMember?.name} ({selectedMember?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedMember && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
                  <div>
                    <p className="font-medium">Current Role</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[selectedMember.role]}
                    </p>
                  </div>
                  <Badge className={ROLE_COLORS[selectedMember.role]}>
                    {ROLE_LABELS[selectedMember.role]}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium mb-3">Permissions</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {PERMISSIONS.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-muted-foreground">{permission.category}</p>
                        </div>
                        {selectedMember.permissions?.includes(permission.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionModalOpen(false)}>
              Close
            </Button>
            <Button>Edit Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Member Card Component
function MemberCard({
  member,
  onRemove,
  onViewPermissions,
}: {
  member: TeamMember;
  onRemove: (id: string) => void;
  onViewPermissions: (member: TeamMember) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {member.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{member.name}</p>
            {member.role === 'OWNER' && <Crown className="w-4 h-4 text-yellow-500" />}
            <Badge className={ROLE_COLORS[member.role]} variant="secondary">
              {ROLE_LABELS[member.role]}
            </Badge>
            {member.isActive ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600 border-gray-600">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{member.email}</p>
          {member.lastActive && (
            <p className="text-xs text-muted-foreground">
              Last active: {format(new Date(member.lastActive), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewPermissions(member)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Permissions
        </Button>
        {member.role !== 'OWNER' && (
          <>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(member.id)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// Permission Matrix Component
function PermissionMatrix() {
  const roles = ['ADMIN', 'MANAGER', 'EDITOR', 'VIEWER'];
  const categories = ['Content', 'Analytics', 'Team', 'Settings', 'Billing'];

  const rolePermissions: Record<string, string[]> = {
    ADMIN: [
      'posts.create', 'posts.read', 'posts.update', 'posts.delete', 'posts.publish',
      'analytics.read', 'analytics.export',
      'team.read', 'team.invite', 'team.update', 'team.remove',
      'settings.read', 'settings.update',
      'billing.read', 'billing.update',
    ],
    MANAGER: [
      'posts.create', 'posts.read', 'posts.update', 'posts.delete', 'posts.publish',
      'analytics.read', 'analytics.export',
      'team.read', 'team.invite',
      'settings.read',
    ],
    EDITOR: [
      'posts.create', 'posts.read', 'posts.update',
      'analytics.read',
      'team.read',
    ],
    VIEWER: [
      'posts.read',
      'analytics.read',
      'team.read',
    ],
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Permission</th>
            {roles.map((role) => (
              <th key={role} className="text-center p-3 font-medium">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${ROLE_COLORS[role]}`} />
                  {ROLE_LABELS[role]}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <React.Fragment key={category}>
              <tr className="bg-accent">
                <td colSpan={5} className="p-3 font-semibold">
                  {category}
                </td>
              </tr>
              {PERMISSIONS.filter((p) => p.category === category).map((permission) => (
                <tr key={permission.id} className="border-b hover:bg-accent/50">
                  <td className="p-3 text-sm">{permission.label}</td>
                  {roles.map((role) => (
                    <td key={role} className="text-center p-3">
                      {rolePermissions[role]?.includes(permission.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Audit Log Item Component
function AuditLogItem({ log }: { log: AuditLog }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INVITE_MEMBER':
        return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'UPDATE_ROLE':
        return <Edit className="w-4 h-4 text-yellow-600" />;
      case 'REMOVE_MEMBER':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow">
      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
        {getActionIcon(log.action)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium">{log.userName}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
        {log.ipAddress && (
          <p className="text-xs text-muted-foreground mt-1">IP: {log.ipAddress}</p>
        )}
      </div>
    </div>
  );
}
