import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Edit, Save, X, ArrowLeft, BookOpen, Clock, Award, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthApi } from "@/lib/endpoints";
import { setUser, clearAuth } from "@/redux/authSlice";

export default function Profile() {
   const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isoString = user?.createdAt;
  const dateOnlyReadable = new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.fullname,
    email: user?.email,
    standard: user?.standard,
    division: user?.division,
    rollno: user?.rollnumber,
  });

  const [tempProfile, setTempProfile] = useState({ ...profile });

  const stats = [
    { label: "Courses Enrolled", value: "6", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Study Hours", value: "48h", icon: <Clock className="w-5 h-5" /> },
    { label: "Completed", value: "4", icon: <Award className="w-5 h-5" /> },
    { label: "Progress", value: "78%", icon: <TrendingUp className="w-5 h-5" /> }
  ];

  const subjects = [
    { name: "Mathematics", progress: 85, status: "active" },
    { name: "Physics", progress: 72, status: "active" },
    { name: "Chemistry", progress: 90, status: "completed" },
    { name: "Biology", progress: 65, status: "active" },
    { name: "Computer Science", progress: 95, status: "active" },
    { name: "English Literature", progress: 100, status: "completed" }
  ];


  const handleEdit = () => {
    setTempProfile({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile({ ...tempProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile({ ...profile });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setTempProfile({ ...tempProfile, [field]: value });
  };

  const handleStudentLogout = async () => {
    try {
      await AuthApi.studentLogout();
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      navigate('/student/login');
    } catch (e) {
      // Even if API call fails, clear local auth
      dispatch(clearAuth());
      toast.success('Logged out');
      navigate('/student/login');
    }
  };

  const handleTeacherLogout = async () => {
    try {
      await AuthApi.teacherLogout();
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      navigate('/teacher/login');
    } catch (e) {
      // Even if API call fails, clear local auth
      dispatch(clearAuth());
      toast.success('Logged out');
      navigate('/teacher/login');
    }
  };
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-8">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gray-800 border border-purple-700 rounded-xl shadow-2xl shadow-purple-900/40 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 ring-4 ring-purple-500 ring-offset-4 ring-offset-gray-800">
                  <AvatarImage src="https://i.pravatar.cc/150" alt="Profile Picture" />
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-grow text-center md:text-left">
                {!isEditing ? (
                  <>
                    <h1 className="text-3xl font-bold text-white mb-2">{user?.fullname}</h1>
                    <p className="text-purple-300 mb-4">{user?.email}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                      <Badge className="bg-purple-700 hover:bg-purple-800">Standard: {user?.standard}</Badge>
                      <Badge className="bg-purple-700 hover:bg-purple-800">Division: {user?.division}</Badge>
                      <Badge className="bg-purple-700 hover:bg-purple-800">Roll No: {user?.rollnumber}</Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{profile?.bio}</p>
                    <p className="text-purple-400 text-sm">Joined: {dateOnlyReadable}</p>
                  </>
                ) : (
                  <div className="space-y-4 w-full">
                    <Input
                      value={tempProfile?.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-900 border border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                      placeholder="Full Name"
                    />
                    <Input
                      value={tempProfile?.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-900 border border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                      placeholder="Email"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={tempProfile?.standard}
                        onChange={(e) => handleInputChange('standard', e.target.value)}
                        className="bg-gray-900 border border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                        placeholder="Standard"
                      />
                      <Input
                        value={tempProfile?.division}
                        onChange={(e) => handleInputChange('division', e.target.value)}
                        className="bg-gray-900 border border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                        placeholder="Division"
                      />
                      <Input
                        value={tempProfile?.rollno}
                        onChange={(e) => handleInputChange('rollno', e.target.value)}
                        className="bg-gray-900 border border-purple-700 text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500"
                        placeholder="Roll No"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isEditing ? (
                  <Button onClick={handleEdit} className="bg-purple-700 hover:bg-purple-800 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="bg-purple-700 hover:bg-purple-800 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="bg-transparent border-purple-700 text-purple-300 hover:bg-purple-700 hover:text-white">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                <Button onClick={handleStudentLogout} className="bg-red-600 hover:bg-red-700 text-white">Student Logout</Button>
                <Button onClick={handleTeacherLogout} className="bg-red-600 hover:bg-red-700 text-white">Teacher Logout</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gray-800 border border-purple-700 rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-2 text-purple-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-purple-300">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subject Progress */}
        <Card className="bg-gray-800 border border-purple-700 rounded-xl shadow-lg">
          <CardHeader>
            <h2 className="text-2xl font-bold text-purple-400">Subject Progress</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{subject.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={subject.status === 'completed'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-purple-700 hover:bg-purple-800'
                        }
                      >
                        {subject.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                      <span className="text-sm text-purple-300">{subject.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${subject.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-purple-600'
                        }`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
