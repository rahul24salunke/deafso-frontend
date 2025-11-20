import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DashboardApi, AuthApi } from '@/lib/endpoints';
import { clearAuth } from '@/redux/authSlice';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  GraduationCap,
  BookOpen,
  Users,
  LogOut,
  Settings
} from 'lucide-react';

export default function TeacherProfilePage() {
  const { teacherID } = useParams();
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({});
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
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await DashboardApi.getTeacherProfile(teacherID);
        
        if (res.data.success) {
          setProfile(res.data.data);
          setTempProfile(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (teacherID) fetchProfile();
  }, [teacherID]);

  // Fetch classes data for stats
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await DashboardApi.getTeacherClasses(teacherID);
        
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

    if (teacherID) fetchClasses();
  }, [teacherID]);

  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const handleLogout = async () => {
    try {
      await AuthApi.teacherLogout();
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      navigate('/');
    } catch (e) {
      dispatch(clearAuth());
      toast.success('Logged out');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/teacher/dashboard" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Card className="bg-gray-800 border border-red-700">
            <CardContent className="p-6 text-center">
              <p className="text-red-400 text-lg">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/teacher/dashboard" className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {profile && (
          <Card className="bg-gray-800 border border-orange-700 rounded-xl shadow-2xl shadow-orange-900/40">
            <CardHeader className="pb-4">
              <h1 className="text-3xl font-bold text-orange-400 text-center">Teacher Profile</h1>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-32 h-32 ring-4 ring-orange-500 ring-offset-4 ring-offset-gray-800">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullname}`} alt={profile.fullname} />
                    <AvatarFallback className="bg-orange-600 text-white text-2xl">
                      {profile.fullname?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-grow space-y-6">
                  <div className="text-center md:text-left">
                    {!isEditing ? (
                      <>
                        <h2 className="text-2xl font-bold text-white mb-2">{profile.fullname}</h2>
                        <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                          <Badge className="bg-orange-700 hover:bg-orange-800">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Teacher
                          </Badge>
                          <Badge className="bg-orange-700 hover:bg-orange-800">
                            <User className="w-4 h-4 mr-1" />
                            ID: {profile.id}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Input
                          value={tempProfile.fullname || ''}
                          onChange={(e) => handleInputChange('fullname', e.target.value)}
                          className="bg-gray-700 border-orange-600 text-white placeholder-orange-400"
                          placeholder="Full Name"
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Mail className="w-5 h-5 text-orange-400" />
                      <div className="flex-grow">
                        <p className="text-sm text-orange-300">Email</p>
                        {!isEditing ? (
                          <p className="text-white">{profile.email}</p>
                        ) : (
                          <Input
                            value={tempProfile.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="bg-gray-600 border-orange-600 text-white text-sm mt-1"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Phone className="w-5 h-5 text-orange-400" />
                      <div className="flex-grow">
                        <p className="text-sm text-orange-300">Mobile</p>
                        {!isEditing ? (
                          <p className="text-white">{profile.mobile}</p>
                        ) : (
                          <Input
                            value={tempProfile.mobile || ''}
                            onChange={(e) => handleInputChange('mobile', e.target.value)}
                            className="bg-gray-600 border-orange-600 text-white text-sm mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-sm text-orange-300">Joined</p>
                        <p className="text-white">{new Date(profile.created_at || profile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Settings className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-sm text-orange-300">Status</p>
                        <p className="text-green-400">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center md:justify-start">
                    {!isEditing ? (
                      <Button onClick={handleEdit} className="bg-orange-700 hover:bg-orange-800 text-white">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleSave} className="bg-orange-700 hover:bg-orange-800 text-white">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={handleCancel} variant="outline" className="bg-transparent border-orange-700 text-orange-300 hover:bg-orange-700 hover:text-white">
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teaching Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gray-800 border border-orange-700">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Subjects</h3>
              <p className="text-3xl font-bold text-orange-400">
                {classesLoading ? '...' : [...new Set(classes.flatMap(cls => cls.subjects))].length}
              </p>
              <p className="text-gray-400 text-sm">Active Subjects</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-orange-700">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Students</h3>
              <p className="text-3xl font-bold text-orange-400">
                {classesLoading ? '...' : classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
              </p>
              <p className="text-gray-400 text-sm">Total Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-orange-700">
            <CardContent className="p-6 text-center">
              <GraduationCap className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Classes</h3>
              <p className="text-3xl font-bold text-orange-400">
                {classesLoading ? '...' : classes.length}
              </p>
              <p className="text-gray-400 text-sm">Total Classes</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border border-orange-700 mt-8">
          <CardHeader>
            <h2 className="text-xl font-bold text-orange-400">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/subject/add-subject">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add New Subject
                </Button>
              </Link>
              
              <Link to="/teacher/classes">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Users className="w-4 h-4 mr-2" />
                  View Classes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


