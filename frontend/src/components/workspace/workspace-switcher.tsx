'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface Workspace {
  id: string;
  name: string;
  plan: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const { get, post } = useApi();

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (currentWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === currentWorkspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [currentWorkspaceId, workspaces]);

  const loadWorkspaces = async () => {
    try {
      const data = await get('/api/workspaces/my-workspaces');
      setWorkspaces(data);
      if (data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(data[0]);
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    }
  };

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    try {
      await post('/api/workspaces/switch', { workspaceId: workspace.id });
      setSelectedWorkspace(workspace);
      setOpen(false);
      onWorkspaceChange?.(workspace.id);
      // Reload the page to refresh all data with new workspace context
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch workspace:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a workspace"
          className="w-[200px] justify-between"
        >
          {selectedWorkspace ? selectedWorkspace.name : 'Select workspace...'}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  onSelect={() => handleWorkspaceSwitch(workspace)}
                  className="text-sm"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedWorkspace?.id === workspace.id
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{workspace.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {workspace.plan}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  // Navigate to create workspace page
                  window.location.href = '/app/workspaces/new';
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
