import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null,
        isAuthenticated: false,
        userType: null // 'student' or 'teacher'
    },
    reducers: {
        setUser: (state, action) => {
            const userData = action.payload;
            if (userData) {
                state.user = userData;
                state.token = userData.token;
                state.isAuthenticated = true;
                state.userType = userData.userType || (userData.standard ? 'student' : 'teacher');
                
                // Store token in localStorage
                if (userData.token) {
                    localStorage.setItem('authToken', userData.token);
                    localStorage.setItem('userType', state.userType);
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
            } else {
                // Clear all auth data
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.userType = null;
                localStorage.removeItem('authToken');
                localStorage.removeItem('userType');
                localStorage.removeItem('userData');
            }
        },
        clearAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.userType = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userData');
        },
        loadAuthFromStorage: (state) => {
            const token = localStorage.getItem('authToken');
            const userType = localStorage.getItem('userType');
            const userData = localStorage.getItem('userData');
            
            if (token && userData) {
                try {
                    const parsedUserData = JSON.parse(userData);
                    state.user = parsedUserData;
                    state.token = token;
                    state.userType = userType;
                    state.isAuthenticated = true;
                } catch (error) {
                    // Clear corrupted data
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('userData');
                }
            }
        }
    }
});

export const { setUser, clearAuth, loadAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;