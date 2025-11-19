import React, { useState, useEffect } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Eye,
  MessageSquare,
  User,
  LogOut,
  Timer,
  BookOpen,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { SubjectApi } from "@/lib/endpoints";
import { clearAuth } from "@/redux/authSlice";
import { toast } from "sonner";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch subjects based on student's class
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user?.standard || !user?.division) {
        setError("Student class information not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await SubjectApi.getStudentSubjects({
          standard: user.standard,
          division: user.division
        });

        if (response.data.success) {
          setSubjects(response.data.data || []);
        } else {
          setError(response.data.message || "Failed to load subjects");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load subjects");
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [user?.standard, user?.division]);

  const handleLogout = async () => {
    try {
      dispatch(clearAuth());
      toast.success('Logged out successfully');
      navigate('/');
    } catch (e) {
      dispatch(clearAuth());
      toast.success('Logged out');
      navigate('/');
    }
  };

  const handleChatWithSubject = (subjectId) => {
    navigate(`/subject/chat?subjectId=${subjectId}`);
  };

  const filteredSubjects = subjects
    .filter((subject) =>
      subject.subjectName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.subjectName?.localeCompare(b.subjectName) || 0;
      if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-8 py-6">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">My Subjects</h1>
            <p className="text-purple-300">Class {user?.standard}-{user?.division}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-purple-600 text-purple-300 hover:bg-purple-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Top Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row w-full md:max-w-3xl gap-3">
          <Input
            type="search"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 rounded-full px-6 py-3 text-base shadow-sm"
          />

          <Select onValueChange={(val) => setSortBy(val)}>
            <SelectTrigger className="w-full sm:w-44 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white border-gray-700">
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="recent">Recently Added</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Avatar - Hidden on small screens */}
        <div className="self-end md:self-auto hidden md:block">
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer w-9 h-9 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900 transition-transform hover:scale-105">
                <AvatarImage src="https://github.com/shadcn.png" alt="User Profile" />
                <AvatarFallback className="bg-purple-700 text-white font-semibold">
                  JD
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-purple-700 text-white">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white text-sm truncate">{user?.fullname}</div>
                    <div className="text-xs text-gray-400">Student</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                <div className="pt-3 border-t border-gray-700 space-y-2">
                  <Link to={"/student/profile/:studentID"} className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                    >
                      <User className="w-4 h-4" />
                      View Profile
                    </Button>
                  </Link>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-purple-300">Loading subjects...</span>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.subjectId}
              className="bg-gray-800 border border-gray-700 rounded-2xl shadow-md hover:shadow-purple-900/30 transform transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-bold text-white text-center mb-3">{subject.subjectName}</h3>
                  <div className="flex items-center justify-center gap-6 text-gray-400 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{subject.subjectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(subject.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mb-4">
                    Standard {subject.standard} - Division {subject.division}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <Button
                    onClick={() => navigate(`/AudioToSign?subjectId=${subject.subjectId}&subjectName=${encodeURIComponent(subject.subjectName || '')}`)}
                    className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-semibold py-2 rounded-lg transition-all duration-200"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredSubjects.length === 0 && !error && (
        <div className="text-center text-gray-400 mt-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-lg font-medium mb-2">No subjects available</p>
          <p className="text-sm">Your teachers haven't added any subjects for your class yet.</p>
          <p className="text-xs mt-2">Class: {user?.standard}-{user?.division}</p>
        </div>
      )}
    </div>
  );
}
