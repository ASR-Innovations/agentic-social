'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  WorkspaceTemplates,
  ClientPortalAccessManagement,
} from '@/components/workspace';
import { useSearchParams } from 'next/navigation';

export default function WorkspacesPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get('workspaceId') || '';
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Workspace Management</h1>
          <p className="text-muted-foreground">
            Manage workspace templates and client portal access
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="client-access">Client Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-6">
            <WorkspaceTemplates workspaceId={workspaceId} />
          </TabsContent>

          <TabsContent value="client-access" className="mt-6">
            {workspaceId ? (
              <ClientPortalAccessManagement workspaceId={workspaceId} />
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Please select a workspace to manage client portal access
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
