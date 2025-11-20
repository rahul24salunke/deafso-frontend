// Route utility functions for role-based navigation

export const getDefaultRouteForUserType = (userType) => {
  switch (userType) {
    case 'student':
      return '/student/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    default:
      return '/';
  }
};

export const isRouteAccessibleByUserType = (path, userType) => {
  // Public routes accessible to everyone
  const publicRoutes = ['/', '/student/login', '/student/signup', '/teacher/login', '/teacher/signup', '/AudioToSign'];
  
  if (publicRoutes.includes(path)) {
    return true;
  }
  
  // Student routes
  const studentRoutes = ['/student/dashboard', '/student/profile', '/profile'];
  
  // Teacher routes  
  const teacherRoutes = ['/teacher/dashboard', '/teacher/classes', '/teacher/profile'];
  
  // Protected routes (require authentication but no specific role)
  const protectedRoutes = ['/class/', '/subject/'];
  
  if (studentRoutes.some(route => path.startsWith(route))) {
    return userType === 'student';
  }
  
  if (teacherRoutes.some(route => path.startsWith(route))) {
    return userType === 'teacher';
  }
  
  if (protectedRoutes.some(route => path.startsWith(route))) {
    return userType === 'student' || userType === 'teacher';
  }
  
  return false;
};
