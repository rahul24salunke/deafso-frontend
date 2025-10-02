import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth } from '@/redux/authSlice';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  Settings, 
  PlusCircle, 
  BarChart3, 
  FileText, 
  LogOut,
  User,
  GraduationCap,
  Calendar,
  Bell
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const stats = [
    { label: 'Total Subjects', value: '8', icon: <BookOpen className="w-6 h-6" />, color: 'bg-blue-600' },
    { label: 'Active Students', value: '156', icon: <Users className="w-6 h-6" />, color: 'bg-green-600' },
    { label: 'Classes Today', value: '4', icon: <Calendar className="w-6 h-6" />, color: 'bg-purple-600' },
    { label: 'Pending Reviews', value: '12', icon: <FileText className="w-6 h-6" />, color: 'bg-orange-600' }
  ];

  const quickActions = [
    {
      title: 'Add New Subject',
      description: 'Upload course materials and create new subjects',
      icon: <PlusCircle className="w-8 h-8" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      link: '/subject/add-subject'
    },
    {
      title: 'View My Profile',
      description: 'Manage your teacher profile and settings',
      icon: <User className="w-8 h-8" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      link: `/teacher/profile/${user?.id}`
    },
    {
      title: 'Student Analytics',
      description: 'View student progress and performance metrics',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'bg-green-600 hover:bg-green-700',
      link: '/teacher/analytics'
    },
    {
      title: 'Class Management',
      description: 'Manage students in different classes',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      link: '/teacher/classes'
    }
  ];

  const recentActivities = [
    { action: 'New student enrolled in Mathematics', time: '2 hours ago', type: 'enrollment' },
    { action: 'Physics assignment submitted by 15 students', time: '4 hours ago', type: 'assignment' },
    { action: 'Chemistry subject material updated', time: '1 day ago', type: 'update' },
    { action: 'New question asked in Biology chat', time: '2 days ago', type: 'chat' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16 ring-4 ring-orange-500">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullname}`} />
              <AvatarFallback className="bg-orange-600 text-white text-xl">
                {user?.fullname?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {user?.fullname}!</h1>
              <p className="text-orange-300">Teacher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-orange-600 text-orange-300 hover:bg-orange-600">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800 border border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <h2 className="text-2xl font-bold text-orange-400">Quick Actions</h2>
                <p className="text-gray-400">Manage your teaching activities</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link}>
                      <Card className="bg-gray-700 border border-gray-600 hover:border-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${action.color} text-white`}>
                              {action.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                              <p className="text-gray-400 text-sm">{action.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <h2 className="text-xl font-bold text-orange-400">Recent Activities</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-gray-400 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8">
          <Card className="bg-gray-800 border border-gray-700">
            <CardHeader>
              <h2 className="text-2xl font-bold text-orange-400">Teaching Tools</h2>
              <p className="text-gray-400">Access advanced teaching features</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/class/10/A/students">
                  <Card className="bg-gray-700 border border-gray-600 hover:border-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">View Class Students</h3>
                      <p className="text-gray-400 text-sm">Manage students in Standard 10-A</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/subject/chat">
                  <Card className="bg-gray-700 border border-gray-600 hover:border-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <MessageCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Subject Chat</h3>
                      <p className="text-gray-400 text-sm">Test AI chat with subjects</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/profile">
                  <Card className="bg-gray-700 border border-gray-600 hover:border-orange-500 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Settings className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">Profile Settings</h3>
                      <p className="text-gray-400 text-sm">Manage your account settings</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
