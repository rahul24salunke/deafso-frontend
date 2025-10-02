import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginForm from './student/Auth/login/Login'
import SignUp from './student/Auth/signup/SignUp';
import DashboardPage from './student/ui/DashboardPage';
import HomePage from './student/ui/HomePage';
import Login from './teacher/Auth/login/Login';
import Signup from './teacher/Auth/signUp/SignUp';
import TeacherDashboard from './teacher/ui/TeacherDashboard';
import NotFoundPage from './NotFoundPage';
import Profile from './profile/Profile';
import StudentProfilePage from './student/ProfilePage';
import TeacherProfilePage from './teacher/ProfilePage';
import ClassStudentsPage from './ClassStudentsPage';
import AddSubjectPage from './subject/AddSubjectPage';
import ChatSubjectPage from './subject/ChatSubjectPage';
import AudioToSign from './deaf/AudioToSign';

function App() {
  const Approuter=createBrowserRouter([
    {
      path:'/',
      element:<HomePage/>
    },
    {
      path:'/student/profile/:studentID',
      element:<StudentProfilePage/>
    },
    {
      path:'/student/login',
      element:<LoginForm/>
    },
    {
      path:'/student/signup',
      element:<SignUp/>
    },
    {
      path:'/student/dashboard',
      element:<DashboardPage/>
    },
    {
      path:'/teacher/profile/:teacherID',
      element:<TeacherProfilePage/>
    },
    {
      path:'/teacher/login',
      element:<Login/>
    },
    {
      path:'/teacher/signup',
      element:<Signup/>
    },
    {
      path:'/teacher/dashboard',
      element:<TeacherDashboard/>
    },
    {
      path:'/class/:standard/:division/students',
      element:<ClassStudentsPage/>
    },
    {
      path:'/subject/add-subject',
      element:<AddSubjectPage/>
    },
    {
      path:'/subject/chat',
      element:<ChatSubjectPage/>
    },
    {
      path:'/profile',
      element:<Profile/>
    },
    {
      path:'*',
      element:<NotFoundPage/>
    }
  ]);
  
  return (
      <>
        <RouterProvider router={Approuter}/>

      </>
  )
}

export default App;