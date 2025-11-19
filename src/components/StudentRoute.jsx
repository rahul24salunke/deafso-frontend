import ProtectedRoute from './ProtectedRoute';

const StudentRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredUserType="student">
      {children}
    </ProtectedRoute>
  );
};

export default StudentRoute;
