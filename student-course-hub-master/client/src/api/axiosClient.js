import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => axiosClient.post('/api/auth/login', credentials),
    register: (userData) => axiosClient.post('/api/auth/register', userData),
};

// Users API (Admin)
export const usersAPI = {
    getAll: () => axiosClient.get('/api/admin/users'),
    getById: (id) => axiosClient.get(`/api/admin/users/${id}`),
    create: (userData) => axiosClient.post('/api/admin/users', userData),
    update: (id, userData) => axiosClient.put(`/api/admin/users/${id}`, userData),
    delete: (id) => axiosClient.delete(`/api/admin/users/${id}`),
    deactivate: (id) => axiosClient.post(`/api/admin/users/${id}/deactivate`),
    activate: (id) => axiosClient.post(`/api/admin/users/${id}/activate`),
    getInstructors: () => axiosClient.get('/api/admin/users/instructors'),
    getStudents: () => axiosClient.get('/api/admin/users/students'),
    getByRole: (role) => axiosClient.get(`/api/admin/users/role/${role}`),
};

// Courses API (Admin)
export const coursesAPI = {
    getAll: () => axiosClient.get('/api/admin/courses'),
    getById: (id) => axiosClient.get(`/api/admin/courses/${id}`),
    create: (courseData) => axiosClient.post('/api/admin/courses', courseData),
    update: (id, courseData) => axiosClient.put(`/api/admin/courses/${id}`, courseData),
    delete: (id) => axiosClient.delete(`/api/admin/courses/${id}`),
};

// Sections API (Admin)
export const sectionsAPI = {
    getAll: () => axiosClient.get('/api/admin/sections'),
    getById: (id) => axiosClient.get(`/api/admin/sections/${id}`),
    create: (sectionData) => axiosClient.post('/api/admin/sections', sectionData),
    update: (id, sectionData) => axiosClient.put(`/api/admin/sections/${id}`, sectionData),
    delete: (id) => axiosClient.delete(`/api/admin/sections/${id}`),
};

// Instructor API
export const instructorAPI = {
    getSections: () => axiosClient.get('/api/instructor/sections'),
    getSectionById: (id) => axiosClient.get(`/api/instructor/sections/${id}`),
    getSectionStudents: (sectionId) => axiosClient.get(`/api/instructor/sections/${sectionId}/students`),
    // Session & Attendance
    getSessions: (sectionId) => axiosClient.get(`/api/sections/${sectionId}/sessions`),
    generateSessions: (sectionId, startDate) => axiosClient.post(`/api/sections/${sectionId}/sessions/week`, null, { params: { startDate } }),
    getSessionAttendance: (sessionId) => axiosClient.get(`/api/sessions/${sessionId}/attendance`),
    markAttendance: (sessionId, records) => axiosClient.post(`/api/sessions/${sessionId}/attendance`, records),
    
    getAssignments: () => axiosClient.get('/api/instructor/assignments'),
    getSectionAssignments: (sectionId) => axiosClient.get(`/api/instructor/sections/${sectionId}/assignments`),
    createAssignment: (assignmentData) => axiosClient.post('/api/instructor/assignments', assignmentData),
    updateAssignment: (id, assignmentData) => axiosClient.put(`/api/instructor/assignments/${id}`, assignmentData),
    deleteAssignment: (id) => axiosClient.delete(`/api/instructor/assignments/${id}`),
    getSubmissions: (assignmentId) => axiosClient.get(`/api/instructor/assignments/${assignmentId}/submissions`),
    recordGrades: (gradesData) => axiosClient.post('/api/instructor/grades', gradesData),
};

// Student API
export const studentAPI = {
    getAvailableSections: () => axiosClient.get('/api/student/sections/available'),
    getEnrollments: () => axiosClient.get('/api/student/enrollments'),
    getAllEnrollments: () => axiosClient.get('/api/student/enrollments/all'),
    enroll: (sectionId) => axiosClient.post('/api/student/enrollments', { sectionId }),
    dropCourse: (enrollmentId) => axiosClient.post(`/api/student/enrollments/${enrollmentId}/drop`),
    getAttendance: () => axiosClient.get('/api/student/attendance'),
    getAttendanceSummary: () => axiosClient.get('/api/student/attendance/summary'),
    getAssignments: () => axiosClient.get('/api/student/assignments'),
    getGrades: () => axiosClient.get('/api/student/grades'),
    getAcademicProgress: () => axiosClient.get('/api/student/academic-progress'),
    getAcademicProgressBySemester: (semester) => axiosClient.get(`/api/student/academic-progress/semester/${semester}`),
};

export default axiosClient;
