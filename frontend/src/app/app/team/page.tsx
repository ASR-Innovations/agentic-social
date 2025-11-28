'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Edit,
  Trash2,
  Crown,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';

const teamMembers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Owner',
    status: 'active',
    avatar: null,
    joinedAt: '2024-01-01'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Admin',
    status: 'active',
    avatar: null,
    joinedAt: '2024-01-15'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Editor',
    status: 'active',
    avatar: null,
    joinedAt: '2024-02-01'
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'Viewer',
    status: 'pending',
    avatar: null,
    joinedAt: '2024-02-10'
  },
];

const roleBadgeColors = {
  Owner: 'bg-gray-100 text-gray-900 border-gray-200',
  Admin: 'bg-gray-100 text-gray-900 border-gray-200',
  Editor: 'bg-gray-100 text-gray-900 border-gray-200',
  Viewer: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-white p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-light text-gray-900 mb-1 tracking-tight">
            Team Management
          </h1>
          <p className="text-sm text-gray-500">Manage your team members and their permissions</p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white shadow-none"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="default" className="border border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Members</p>
                <p className="text-3xl font-light text-gray-900">{teamMembers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="border border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-light text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="border border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className="text-3xl font-light text-gray-900">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-200">
                <Clock className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="border border-gray-200 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Admins</p>
                <p className="text-3xl font-light text-gray-900">
                  {teamMembers.filter(m => m.role === 'Admin' || m.role === 'Owner').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card variant="default" className="border border-gray-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-light text-gray-900">Team Members</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Manage roles and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="relative group"
                >
                  <div className="flex items-center justify-between p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="relative w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {getInitials(member.name)}
                        </span>
                        {/* Status indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          member.status === 'active' ? 'bg-emerald-500' : 'bg-orange-500'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-gray-900 font-medium">{member.name}</p>
                          {member.role === 'Owner' && (
                            <Crown className="w-4 h-4 text-gray-900" aria-label="Owner" />
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Badge with icon */}
                      <Badge
                        variant={member.status === 'active' ? 'success' : 'warning'}
                        icon={member.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      >
                        {member.status}
                      </Badge>
                      
                      {/* Role Badge with color coding */}
                      <Badge
                        className={roleBadgeColors[member.role as keyof typeof roleBadgeColors]}
                        icon={member.role === 'Owner' ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                      >
                        {member.role}
                      </Badge>
                      
                      {/* Action Menu Button */}
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="hover:bg-gray-100 rounded-lg"
                          onClick={() => setShowActionMenu(showActionMenu === member.id ? null : member.id)}
                          aria-label="Member actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </Button>
                        
                        {/* Action Menu Dropdown */}
                        <AnimatePresence>
                          {showActionMenu === member.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-10"
                            >
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                onClick={() => {
                                  setShowActionMenu(null);
                                  // Handle edit action
                                }}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Role
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                onClick={() => {
                                  setShowActionMenu(null);
                                  // Handle settings action
                                }}
                              >
                                <Settings className="w-4 h-4" />
                                Permissions
                              </button>
                              <div className="border-t border-gray-200 my-1" />
                              <button
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                onClick={() => {
                                  setShowActionMenu(null);
                                  // Handle remove action
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove Member
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
        description="Send an invitation to join your team"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle invite submission
                setShowInviteModal(false);
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-none"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-900 transition-all appearance-none cursor-pointer">
                <option value="admin">Admin - Full access to all features</option>
                <option value="editor">Editor - Can create and edit content</option>
                <option value="viewer">Viewer - Read-only access</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Crown className="w-4 h-4 text-gray-900" />
              Role Permissions
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Admin:</strong> Manage team, billing, and all settings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Editor:</strong> Create, edit, and publish content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Viewer:</strong> View content and analytics only</span>
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
