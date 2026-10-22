import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import CoursesPage from './pages/admin/CoursesPage';
import SectionsPage from './pages/admin/SectionsPage';

// Instructor Pages
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import SectionDetailPage from './pages/instructor/SectionDetailPage';
import AssignmentsPage from './pages/instructor/AssignmentsPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableCoursesPage from './pages/student/AvailableCoursesPage';
import MyEnrollmentsPage from './pages/student/MyEnrollmentsPage';
import GradesPage from './pages/student/GradesPage';
import AcademicProgressPage from './pages/student/AcademicProgressPage';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <div className={isAuthPage ? '' : 'container mt-4'}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CoursesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/sections" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SectionsPage />
              </ProtectedRoute>
            } 
          />

          {/* Instructor routes */}
          <Route 
            path="/instructor" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/sections" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/sections/:sectionId" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <SectionDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/sections/:sectionId/assignments" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <AssignmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/assignments" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <AssignmentsPage />
              </ProtectedRoute>
            } 
          />

          {/* Student routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/courses" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AvailableCoursesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/enrollments" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyEnrollmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/grades" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <GradesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/progress" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AcademicProgressPage />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;