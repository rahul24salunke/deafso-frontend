import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadAuthFromStorage } from './redux/authSlice';
import store from './redux/store';
import LoginForm from './student/Auth/login/Login'
import SignUp from './student/Auth/signup/SignUp';
import DashboardPage from './student/ui/DashboardPage';
import HomePage from './student/ui/HomePage';
import Login from './teacher/Auth/login/Login';
import Signup from './teacher/Auth/signUp/SignUp';
import TeacherDashboard from './teacher/ui/TeacherDashboard';
import ClassManagementPage from './teacher/ui/ClassManagementPage';
import NotFoundPage from './NotFoundPage';
// import Profile from './profile/Profile';
import StudentProfilePage from './student/ProfilePage';
import TeacherProfilePage from './teacher/ProfilePage';
import ClassStudentsPage from './ClassStudentsPage';
import AddSubjectPage from './subject/AddSubjectPage';
import ChatSubjectPage from './subject/ChatSubjectPage';
import AudioToSign from './deaf/AudioToSign';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherRoute from './components/TeacherRoute';
import StudentRoute from './components/StudentRoute';

/**
 * Route Protection System
 * 
 * This application implements role-based route protection:
 * 
 * 1. Public Routes (accessible without authentication):
 *    - / (HomePage)
 *    - /student/login, /student/signup
 *    - /teacher/login, /teacher/signup
 *    - /AudioToSign
 * 
 * 2. Student Protected Routes (require student authentication):
 *    - /student/dashboard
 *    - /student/profile/:studentID
 *    - /profile
 * 
 * 3. Teacher Protected Routes (require teacher authentication):
 *    - /teacher/dashboard
 *    - /teacher/classes
 *    - /teacher/profile/:teacherID
 * 
 * 4. General Protected Routes (require authentication, any role):
 *    - /class/:standard/:division/students
 *    - /subject/add-subject
 *    - /subject/chat
 * 
 * Route Protection Components:
 * - ProtectedRoute: Base component for authentication checks
 * - StudentRoute: Wrapper for student-only routes
 * - TeacherRoute: Wrapper for teacher-only routes
 */

// Component to initialize authentication
function AuthInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, [dispatch]);

  return null;
}

// Main App Router Component
function AppRouter() {
  const Approuter = createBrowserRouter([
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/student/login',
      element: <LoginForm />
    },
    {
      path: '/student/signup',
      element: <SignUp />
    },
    {
      path: '/teacher/login',
      element: <Login />
    },
    {
      path: '/teacher/signup',
      element: <Signup />
    },
    // Student protected routes
    {
      path: '/student/profile/:studentID',
      element: (
        <StudentRoute>
          <StudentProfilePage />
        </StudentRoute>
      )
    },
    {
      path: '/student/dashboard',
      element: (
        <StudentRoute>
          <DashboardPage />
        </StudentRoute>
      )
    },
    // Teacher protected routes
    {
      path: '/teacher/profile/:teacherID',
      element: (
        <TeacherRoute>
          <TeacherProfilePage />
        </TeacherRoute>
      )
    },
    {
      path: '/teacher/dashboard',
      element: (
        <TeacherRoute>
          <TeacherDashboard />
        </TeacherRoute>
      )
    },
    {
      path: '/teacher/classes',
      element: (
        <TeacherRoute>
          <ClassManagementPage />
        </TeacherRoute>
      )
    },
    // Protected routes that require authentication but no specific role
    {
      path: '/class/:standard/:division/students',
      element: (
        <ProtectedRoute>
          <ClassStudentsPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/subject/add-subject',
      element: (
        <ProtectedRoute>
          <AddSubjectPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/subject/chat',
      element: (
        <ProtectedRoute>
          <ChatSubjectPage />
        </ProtectedRoute>
      )
    },
    {
      path: '/AudioToSign',
      element: <AudioToSign />
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ]);

  return <RouterProvider router={Approuter} />;
}

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <AppRouter />
    </Provider>
  );
}

export default App;