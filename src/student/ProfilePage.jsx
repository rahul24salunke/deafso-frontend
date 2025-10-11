import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DashboardApi } from '@/lib/endpoints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, User, Mail, Phone, Calendar, BookOpen, Hash } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useSelector(store => store.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await DashboardApi.getStudentProfile(user?.id);
        if (res.data.success) {
          setProfile(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchProfile();
  }, [user?.id]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-purple-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-6">
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
        <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        {profile && (
          <Card className="bg-gray-800 border border-purple-700 rounded-xl shadow-2xl shadow-purple-900/40">
            <CardHeader className="pb-4">
              <h1 className="text-3xl font-bold text-purple-400 text-center">Student Profile</h1>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="w-32 h-32 ring-4 ring-purple-500 ring-offset-4 ring-offset-gray-800">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.fullname}`} alt={profile.fullname} />
                    <AvatarFallback className="bg-purple-600 text-white text-2xl">
                      {profile.fullname?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-grow space-y-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl font-bold text-white mb-2">{profile.fullname}</h2>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <Badge className="bg-purple-700 hover:bg-purple-800">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Standard {profile.standard}
                      </Badge>
                      <Badge className="bg-purple-700 hover:bg-purple-800">
                        Division {profile.division}
                      </Badge>
                      <Badge className="bg-purple-700 hover:bg-purple-800">
                        <Hash className="w-4 h-4 mr-1" />
                        Roll {profile.rollnumber}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-300">Email</p>
                        <p className="text-white">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-300">Mobile</p>
                        <p className="text-white">{profile.mobile}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-300">Joined</p>
                        <p className="text-white">{new Date(profile.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <User className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-purple-300">Student ID</p>
                        <p className="text-white">{profile.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="bg-gray-800 border border-purple-700">
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Class</h3>
                <p className="text-3xl font-bold text-purple-400">
                  {user?.standard}-{user?.division}
                </p>
                <p className="text-gray-400 text-sm">Current Class</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border border-purple-700">
              <CardContent className="p-6 text-center">
                <User className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Status</h3>
                <p className="text-3xl font-bold text-green-400">Active</p>
                <p className="text-gray-400 text-sm">Student Status</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="bg-red-900 border border-red-700 mt-8">
            <CardContent className="p-4">
              <p className="text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}


