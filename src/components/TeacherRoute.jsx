import ProtectedRoute from './ProtectedRoute';

const TeacherRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredUserType="teacher">
      {children}
    </ProtectedRoute>
  );
};

export default TeacherRoute;
