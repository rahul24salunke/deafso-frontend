// Auth utility functions
export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

export const getStoredUserType = () => {
  return localStorage.getItem('userType');
};

export const getStoredUserData = () => {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }
  return null;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('userData');
};

export const setAuthHeader = (token) => {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export const isAuthenticated = () => {
  const token = getStoredToken();
  return token && !isTokenExpired(token);
};
