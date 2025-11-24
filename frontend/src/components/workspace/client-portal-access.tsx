'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApi } from '@/hooks/useApi';
import { Plus, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

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

interface ClientPortalAccessProps {
  workspaceId: string;
}

export function ClientPortalAccessManagement({
  workspaceId,
}: ClientPortalAccessProps) {
  const [accesses, setAccesses] = useState<ClientPortalAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAccess, setNewAccess] = useState({
    email: '',
    name: '',
    accessLevel: 'VIEW_ONLY' as const,
    permissions: [] as string[],
  });
  const { get, post, del } = useApi();
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
      console.error('Failed to load client accesses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load client portal accesses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = async () => {
    try {
      await post(`/api/workspaces/${workspaceId}/client-portal`, {
        ...newAccess,
        workspaceId,
      });
      toast({
        title: 'Success',
        description: 'Client portal access created successfully',
      });
      setCreateDialogOpen(false);
      setNewAccess({
        email: '',
        name: '',
        accessLevel: 'VIEW_ONLY',
        permissions: [],
      });
      loadAccesses();
    } catch (error) {
      console.error('Failed to create access:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client portal access',
        variant: 'destructive',
      });
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      await del(`/api/workspaces/client-portal/${accessId}`);
      toast({
        title: 'Success',
        description: 'Client portal access revoked successfully',
      });
      loadAccesses();
    } catch (error) {
      console.error('Failed to revoke access:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke access',
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/client-portal/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Success',
      description: 'Invite link copied to clipboard',
    });
  };

  const getAccessLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      VIEW_ONLY: 'secondary',
      VIEW_AND_COMMENT: 'default',
      VIEW_AND_APPROVE: 'outline',
    };
    return <Badge variant={variants[level] || 'default'}>{level}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Portal Access</h2>
          <p className="text-muted-foreground">
            Manage client access to this workspace
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant Client Portal Access</DialogTitle>
              <DialogDescription>
                Invite a client to access this workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Client Name</Label>
                <Input
                  id="name"
                  value={newAccess.name}
                  onChange={(e) =>
                    setNewAccess({ ...newAccess, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAccess.email}
                  onChange={(e) =>
                    setNewAccess({ ...newAccess, email: e.target.value })
                  }
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <Label htmlFor="accessLevel">Access Level</Label>
                <Select
                  value={newAccess.accessLevel}
                  onValueChange={(value: any) =>
                    setNewAccess({ ...newAccess, accessLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW_ONLY">View Only</SelectItem>
                    <SelectItem value="VIEW_AND_COMMENT">
                      View and Comment
                    </SelectItem>
                    <SelectItem value="VIEW_AND_APPROVE">
                      View and Approve
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateAccess}>Create Access</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {accesses.map((access) => (
          <Card key={access.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{access.name}</CardTitle>
                  <CardDescription>{access.email}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {access.isActive ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {getAccessLevelBadge(access.accessLevel)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Access:</span>
                  <span>
                    {access.lastAccessAt
                      ? new Date(access.lastAccessAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Invite Expires:</span>
                  <span>
                    {new Date(access.inviteExpiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyInviteLink(access.inviteToken)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Invite Link
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRevokeAccess(access.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accesses.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No client portal accesses. Add a client to get started.
        </div>
      )}
    </div>
  );
}
