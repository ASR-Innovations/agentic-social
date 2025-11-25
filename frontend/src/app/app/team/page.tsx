'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  Crown,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

const roleColors = {
  Owner: 'from-purple-500 to-pink-500',
  Admin: 'from-blue-500 to-cyan-500',
  Editor: 'from-green-500 to-emerald-500',
  Viewer: 'from-gray-500 to-gray-600',
};

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Team Management
          </h1>
          <p className="text-gray-600">Manage your team members and their permissions</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
          onClick={() => setShowInviteModal(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Admins</p>
                <p className="text-3xl font-bold text-gray-900">
                  {teamMembers.filter(m => m.role === 'Admin' || m.role === 'Owner').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900">Team Members</CardTitle>
          <CardDescription className="text-gray-600">
            Manage roles and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${roleColors[member.role as keyof typeof roleColors]} rounded-full flex items-center justify-center shadow-lg`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-semibold">{member.name}</p>
                      {member.role === 'Owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge
                    className={`${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-orange-100 text-orange-700 border-orange-200'
                    }`}
                  >
                    {member.status}
                  </Badge>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                    {member.role}
                  </Badge>
                  <Button variant="ghost" size="sm" className="hover:bg-white">
                    <MoreVertical className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Role</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900">
                  <option>Admin</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  onClick={() => setShowInviteModal(false)}
                >
                  Send Invite
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
