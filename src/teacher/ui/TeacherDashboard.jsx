import React, { useState, useEffect } from 'react';
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
  PlusCircle, 
  FileText, 
  LogOut,
  User,
  GraduationCap,
  Calendar,
  Bell,
  Eye
} from 'lucide-react';
import { DashboardApi } from '@/lib/endpoints';

export default function TeacherDashboard() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);


  // Function to fetch student count for a specific class
  const fetchStudentCount = async (standard, division) => {
    try {
      const response = await DashboardApi.getStudentsInClass(standard, division);
      const students = response.data?.data || response.data?.students || response.data || [];
      return Array.isArray(students) ? students.length : 0;
    } catch (err) {
      console.warn(`Failed to fetch student count for ${standard}-${division}:`, err);
      return 0;
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await DashboardApi.getTeacherClasses(user?.id);
        
        if (response.data?.success && response.data?.data) {
          // Transform API data to match our expected format
          const apiClasses = response.data.data;
          
          // Group by standard and division, then combine subjects
          const groupedClasses = apiClasses.reduce((acc, item) => {
            const key = `${item.standard}-${item.division}`;
            if (!acc[key]) {
              acc[key] = {
                standard: item.standard,
                division: item.division,
                subjects: [],
                subjectIds: []
              };
            }
            acc[key].subjects.push(item.subjectName);
            acc[key].subjectIds.push(item.subjectId);
            return acc;
          }, {});

          // Convert to array and fetch student counts
          const transformedClasses = Object.values(groupedClasses).map(cls => ({
            ...cls,
            studentCount: 0, // Will be updated below
            subjects: [...new Set(cls.subjects)] // Remove duplicates
          }));

          // Fetch student counts for each class
          const classesWithStudentCounts = await Promise.all(
            transformedClasses.map(async (cls) => {
              const studentCount = await fetchStudentCount(cls.standard, cls.division);
              return { ...cls, studentCount };
            })
          );

          setClasses(classesWithStudentCounts);
        } else {
          setClasses([]);
        }
        setClassesLoading(false);
      } catch (err) {
        console.error('Failed to load classes:', err);
        setClasses([]);
        setClassesLoading(false);
      }
    };

    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  const handleLogout = () => {
    dispatch(clearAuth());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const stats = [
    { label: 'Total Classes', value: classes.length.toString(), icon: <GraduationCap className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { label: 'Total Students', value: classes.reduce((sum, cls) => sum + cls.studentCount, 0).toString(), icon: <Users className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { label: 'Standards', value: [...new Set(classes.map(cls => cls.standard))].length.toString(), icon: <BookOpen className="w-6 h-6 text-white" />, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  ];

  const quickActions = [
    {
      title: 'Add New Subject',
      description: 'Upload course materials and create new subjects',
      icon: <PlusCircle className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      link: '/subject/add-subject'
    },
    {
      title: 'View My Profile',
      description: 'Manage your teacher profile and settings',
      icon: <User className="w-8 h-8 text-white" />,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      link: `/teacher/profile/${user?.id}`
    }
  ];

  const recentActivities = [
    { action: 'New student enrolled in Mathematics', time: '2 hours ago', type: 'enrollment' },
    { action: 'Physics assignment submitted by 15 students', time: '4 hours ago', type: 'assignment' },
    { action: 'Chemistry subject material updated', time: '1 day ago', type: 'update' },
    { action: 'New question asked in Biology chat', time: '2 days ago', type: 'chat' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Avatar className="w-16 h-16 ring-4 ring-purple-500 shadow-lg">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullname}`} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xl font-semibold">
                {user?.fullname?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {user?.fullname}!</h1>
              <p className="text-purple-300 font-medium">Teacher Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white shadow-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>
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
            <Card className="bg-gray-800 border border-gray-700 shadow-sm">
              <CardHeader className="pb-4">
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                <p className="text-gray-400">Manage your teaching activities</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link}>
                      <Card className="bg-gray-800 border border-gray-700 hover:border-purple-500 hover:shadow-md transition-all duration-200 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${action.color} shadow-sm group-hover:shadow-md transition-shadow`}>
                              {action.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">{action.title}</h3>
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
          
        </div>

        {/* Class Management Section */}
        <div className="mt-8">
          <Card className="bg-gray-800 border border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">My Classes</h2>
                  <p className="text-gray-400">Manage your classes organized by standard and division</p>
                </div>
                <Link to="/teacher/classes">
                  <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Classes
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {classesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading classes...</p>
                </div>
              ) : classes.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(
                    classes.reduce((acc, classItem) => {
                      const standard = classItem.standard;
                      if (!acc[standard]) acc[standard] = [];
                      acc[standard].push(classItem);
                      return acc;
                    }, {})
                  ).map(([standard, standardClasses]) => (
                    <div key={standard}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                          <span className="text-white font-bold text-lg">{standard}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Standard {standard}</h3>
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300 border-gray-600">
                          {standardClasses.length} division{standardClasses.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {standardClasses.map((classItem) => (
                          <Card 
                            key={`${classItem.standard}-${classItem.division}`}
                            className="bg-gray-800 border border-gray-700 hover:border-purple-500 hover:shadow-md transition-all duration-200"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                                    <span className="text-white font-bold text-sm">
                                      {classItem.division}
                                    </span>
                                  </div>
                                  <span className="text-white font-semibold">
                                    Division {classItem.division}
                                  </span>
                                </div>
                                <Badge variant="outline" className="border-gray-600 text-gray-400">
                                  {classItem.studentCount} students
                                </Badge>
                              </div>
                              
                              <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {classItem.subjects.slice(0, 2).map((subject, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant="secondary" 
                                      className="bg-purple-900 text-purple-300 text-xs border-purple-700"
                                    >
                                      {subject}
                                    </Badge>
                                  ))}
                                  {classItem.subjects.length > 2 && (
                                    <Badge variant="secondary" className="bg-gray-700 text-gray-400 text-xs border-gray-600">
                                      +{classItem.subjects.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <Link to={`/class/${classItem.standard}/${classItem.division}/students`}>
                                <Button 
                                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
                                  size="sm"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  View Students
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Classes Assigned</h3>
                  <p className="text-gray-400 mb-6">
                    You haven't been assigned to any classes yet. Contact your administrator.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
