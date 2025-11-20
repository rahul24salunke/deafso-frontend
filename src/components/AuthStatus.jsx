import { useSelector } from 'react-redux';

const AuthStatus = () => {
  const { isAuthenticated, userType, user } = useSelector((state) => state.auth);

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold text-lg mb-2">Auth Status</h3>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      <p><strong>User Type:</strong> {userType || 'None'}</p>
      <p><strong>User ID:</strong> {user?.id || 'None'}</p>
    </div>
  );
};

export default AuthStatus;
