import api from './api';

export const AuthApi = {
  studentLogin: (data) => api.post('/api/v1/student/login', data),
  studentSignup: (data) => api.post('/api/v1/student/signup', data),
  studentLogout: () => api.post('/api/v1/student/logout'),
  teacherLogin: (data) => api.post('/api/v1/teacher/login', data),
  teacherSignup: (data) => api.post('/api/v1/teacher/signup', data),
  teacherLogout: () => api.post('/api/v1/teacher/logout'),
};

export const DashboardApi = {
  getStudentProfile: (studentID) => api.get(`/api/v1/student/profile/${studentID}`),
  getTeacherProfile: (teacherID) => api.get(`/api/v1/teacher/profile/${teacherID}`),
  getStudentsInClass: (standard, division) => api.get(`/api/v1/class/${standard}/${division}/students`),
  getTeacherClasses: (teacherID) => api.get(`/api/v1/teacher/${teacherID}/classes`),
};

export const SubjectApi = {
  addSubject: (formData) => api.post('/api/v1/subject/add-subject', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  chat: (payload) => api.post('/api/v1/subject/chat', payload),
  getStudentSubjects: (payload) => api.post('/api/v1/subject/get-student-subjects', payload),
  getSubjectMaterial: (subjectId) => api.get(`/api/v1/subject/${subjectId}/material`),
};


