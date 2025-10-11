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
  Users, 
  GraduationCap, 
  PlusCircle, 
  LogOut,
  ArrowLeft,
  BookOpen,
  Calendar,
  UserCheck,
  Settings
} from 'lucide-react';
import { DashboardApi } from '@/lib/endpoints';

export default function ClassManagementPage() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


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
        setLoading(true);
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
        setLoading(false);
      } catch (err) {
        console.error('Failed to load classes:', err);
        setError('Failed to load classes');
        setLoading(false);
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

  const handleBackToDashboard = () => {
    navigate('/teacher/dashboard');
  };

  const groupedClasses = classes.reduce((acc, classItem) => {
    const standard = classItem.standard;
    if (!acc[standard]) {
      acc[standard] = [];
    }
    acc[standard].push(classItem);
    return acc;
  }, {});

  const getStandardColor = (standard) => {
    const colors = {
      '8': 'bg-blue-600',
      '9': 'bg-green-600', 
      '10': 'bg-purple-600',
      '11': 'bg-orange-600',
      '12': 'bg-red-600'
    };
    return colors[standard] || 'bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Button 
              onClick={handleBackToDashboard}
              variant="outline" 
              className="border-purple-500 text-purple-300 hover:bg-purple-600 hover:text-white shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Class Management</h1>
              <p className="text-gray-400 font-medium">Manage your classes and students</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-600 text-white shadow-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Classes</p>
                  <p className="text-3xl font-bold text-white mt-1">{classes.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Standards</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {Object.keys(groupedClasses).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Divisions</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {classes.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes by Standard */}
        {loading ? (
          <Card className="bg-gray-800 border border-gray-700 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading classes...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="bg-gray-800 border border-gray-700 shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedClasses).map((standard) => (
              <div key={standard}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Standard {standard}</h2>
                    <p className="text-gray-400">
                      {groupedClasses[standard].length} division{groupedClasses[standard].length > 1 ? 's' : ''} • {' '}
                      {groupedClasses[standard].reduce((sum, cls) => sum + cls.studentCount, 0)} students
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedClasses[standard].map((classItem, index) => (
                    <Card 
                      key={`${classItem.standard}-${classItem.division}`}
                      className="bg-gray-800 border border-gray-700 hover:border-purple-500 transition-all duration-200 hover:shadow-md"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 shadow-sm">
                              <span className="text-white font-bold text-lg">
                                {classItem.division}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-white">
                                Division {classItem.division}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                {classItem.studentCount} students
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Subjects */}
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Subjects:</p>
                            <div className="flex flex-wrap gap-2">
                              {classItem.subjects.map((subject, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className="bg-purple-900 text-purple-300 border-purple-700 hover:bg-purple-800"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4">
                            <Link 
                              to={`/class/${classItem.standard}/${classItem.division}/students`}
                              className="flex-1"
                            >
                              <Button 
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
                                size="sm"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                View Students
                              </Button>
                            </Link>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {classes.length === 0 && !loading && (
              <Card className="bg-gray-800 border border-gray-700 shadow-sm">
                <CardContent className="p-8 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Classes Found</h3>
                  <p className="text-gray-400 mb-6">
                    You haven't been assigned to any classes yet. Contact your administrator.
                  </p>
                  <Button 
                    onClick={handleBackToDashboard}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
                  >
                    Back to Dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
