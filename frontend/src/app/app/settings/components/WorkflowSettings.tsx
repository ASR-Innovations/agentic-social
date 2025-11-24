'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, CheckCircle, Users, ArrowRight } from 'lucide-react';

const workflows = [
  {
    id: '1',
    name: 'Content Approval',
    description: 'All posts require manager approval before publishing',
    steps: 3,
    active: true,
    approvers: ['Manager', 'Director']
  },
  {
    id: '2',
    name: 'Legal Review',
    description: 'Legal team reviews posts with specific keywords',
    steps: 2,
    active: true,
    approvers: ['Legal Team']
  },
  {
    id: '3',
    name: 'Client Approval',
    description: 'Client must approve all content before scheduling',
    steps: 4,
    active: false,
    approvers: ['Account Manager', 'Client']
  },
];

export default function WorkflowSettings() {
  const [workflowList, setWorkflowList] = useState(workflows);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Approval Workflows</CardTitle>
              <CardDescription className="text-gray-400">
                Configure multi-level approval processes for content
              </CardDescription>
            </div>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowList.map((workflow) => (
              <div key={workflow.id} className="p-4 rounded-lg glass border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white font-medium">{workflow.name}</h3>
                      <Badge variant={workflow.active ? 'success' : 'secondary'}>
                        {workflow.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{workflow.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{workflow.steps} steps</span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{workflow.approvers.join(' → ')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Automation Rules</CardTitle>
              <CardDescription className="text-gray-400">
                Set up automated actions based on conditions
              </CardDescription>
            </div>
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg glass border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Auto-tag AI Generated Content</p>
                  <p className="text-gray-400 text-sm">Automatically add #AIGenerated tag</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg glass border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Schedule Optimal Time</p>
                  <p className="text-gray-400 text-sm">Auto-schedule at best engagement times</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
