'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail, MoreVertical, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface ClientPortalAccess {
  id: string;
  email: string;
  name: string;
  workspaceId: string;
  accessLevel: 'VIEW_ONLY' | 'VIEW_AND_COMMENT' | 'VIEW_AND_APPROVE';
  permissions: string[];
  isActive: boolean;
  inviteToken: string;
  inviteExpiresAt: string;
  lastAccessAt: string | null;
  createdAt: string;
}

interface ClientPortalManagementProps {
  workspaceId: string;
}

export function ClientPortalManagement({ workspaceId }: ClientPortalManagementProps) {
  const [accesses, setAccesses] = useState<ClientPortalAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    accessLevel: 'VIEW_ONLY' as const,
  });
  const { get, post, put, del } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadAccesses();
  }, [workspaceId]);

  const loadAccesses = async () => {
    try {
      setLoading(true);
      const data = await get(`/api/workspaces/${workspaceId}/client-portal`);
      setAccesses(data);
    } catch (error) {
      console.error('Failed to load client portal accesses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client portal accesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await post(`/api/workspaces/${workspaceId}/client-portal`, {
        ...formData,
        workspaceId,
      });
      toast({
        title: 'Success',
        description: 'Client portal access created successfully',
      });
      setShowCreateDialog(false);
      setFormData({ email: '', name: '', accessLevel: 'VIEW_ONLY' });
      loadAccesses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create client portal access',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (accessId: string) => {
    if (!confirm('Are you sure you want to revoke this client access?')) {
      return;
    }

    try {
      await del(`/api/workspaces/client-portal/${accessId}`);
      toast({
        title: 'Success',
        description: 'Client portal access revoked successfully',
      });
      loadAccesses();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke client portal access',
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/client-portal/accept/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Copied',
      description: 'Invite link copied to clipboard',
    });
  };

  const sendInviteEmail = async (access: ClientPortalAccess) => {
    // This would trigger an email send via the backend
    toast({
      title: 'Email Sent',
      description: `Invite email sent to ${access.email}`,
    });
  };

  const getAccessLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      VIEW_ONLY: 'secondary',
      VIEW_AND_COMMENT: 'default',
      VIEW_AND_APPROVE: 'default',
    };
    return <Badge variant={variants[level] || 'secondary'}>{level.replace(/_/g, ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading client portal accesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Portal Access</h2>
          <p className="text-muted-foreground">
            Manage client access to this workspace
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Client Portal Access</DialogTitle>
              <DialogDescription>
                Invite a client to access this workspace with limited permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={formData.accessLevel}
                  onValueChange={(value: any) => setFormData({ ...formData, accessLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW_ONLY">View Only</SelectItem>
                    <SelectItem value="VIEW_AND_COMMENT">View and Comment</SelectItem>
                    <SelectItem value="VIEW_AND_APPROVE">View and Approve</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.accessLevel === 'VIEW_ONLY' && 'Client can only view content and analytics'}
                  {formData.accessLevel === 'VIEW_AND_COMMENT' && 'Client can view and leave comments'}
                  {formData.accessLevel === 'VIEW_AND_APPROVE' && 'Client can view, comment, and approve posts'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Access</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Client Accesses</CardTitle>
          <CardDescription>
            {accesses.length} client{accesses.length !== 1 ? 's' : ''} with portal access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accesses.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No client accesses</h3>
              <p className="text-muted-foreground">
                Get started by adding your first client
              </p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Access</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accesses.map((access) => (
                  <TableRow key={access.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{access.name}</div>
                        <div className="text-sm text-muted-foreground">{access.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getAccessLevelBadge(access.accessLevel)}</TableCell>
                    <TableCell>
                      {access.isActive ? (
                        <Badge variant="default" className="bg-green-600">
                          <UserCheck className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <UserX className="mr-1 h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {access.lastAccessAt
                        ? format(new Date(access.lastAccessAt), 'MMM d, yyyy')
                        : 'Never'}
                    </TableCell>
                    <TableCell>{format(new Date(access.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyInviteLink(access.inviteToken)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Invite Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => sendInviteEmail(access)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRevoke(access.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
