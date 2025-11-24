'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Globe,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  config: any;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function WorkspaceTemplates() {
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkspaceTemplate | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const { get, post, del } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadWorkspaces();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await get('/api/workspaces/templates');
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workspace templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      const data = await get('/api/workspaces/my-workspaces');
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await post('/api/workspaces/templates', formData);
      toast({
        title: 'Success',
        description: 'Workspace template created successfully',
      });
      setShowCreateDialog(false);
      setFormData({ name: '', description: '', isPublic: false });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create template',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await del(`/api/workspaces/templates/${templateId}`);
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      loadTemplates();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleApply = async (workspaceId: string) => {
    if (!selectedTemplate) return;

    try {
      await post('/api/workspaces/templates/apply', {
        templateId: selectedTemplate.id,
        workspaceId,
      });
      toast({
        title: 'Success',
        description: 'Template applied successfully',
      });
      setShowApplyDialog(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply template',
        variant: 'destructive',
      });
    }
  };

  const openApplyDialog = (template: WorkspaceTemplate) => {
    setSelectedTemplate(template);
    setShowApplyDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workspace Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable workspace configurations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace Template</DialogTitle>
              <DialogDescription>
                Save your current workspace configuration as a reusable template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="E-commerce Starter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Pre-configured workspace for e-commerce businesses..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this template public
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Public templates can be used by other users in your organization
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Apply Template Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template</DialogTitle>
            <DialogDescription>
              Select a workspace to apply the template "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleApply(workspace.id)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {workspace.name}
                  <Badge variant="secondary" className="ml-auto">
                    {workspace.plan}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Create your first workspace template to quickly set up new workspaces with
              pre-configured settings
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      {template.isPublic ? (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {template.description || 'No description provided'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openApplyDialog(template)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Apply
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pre-built Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-built Templates</CardTitle>
          <CardDescription>
            Quick-start templates for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'E-commerce',
                description: 'Perfect for online stores with product catalogs and shopping features',
                icon: '🛍️',
              },
              {
                name: 'Agency',
                description: 'Multi-client management with white-label capabilities',
                icon: '🏢',
              },
              {
                name: 'Personal Brand',
                description: 'Influencer and content creator focused setup',
                icon: '⭐',
              },
              {
                name: 'B2B SaaS',
                description: 'Professional services and lead generation',
                icon: '💼',
              },
              {
                name: 'Restaurant',
                description: 'Food service with menu sharing and reviews',
                icon: '🍽️',
              },
              {
                name: 'Real Estate',
                description: 'Property listings and virtual tours',
                icon: '🏠',
              },
            ].map((prebuilt) => (
              <div
                key={prebuilt.name}
                className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="text-3xl mb-2">{prebuilt.icon}</div>
                <h4 className="font-semibold">{prebuilt.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{prebuilt.description}</p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
