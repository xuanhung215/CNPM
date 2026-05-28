import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Role } from '../constants/role';

import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/dashboard/Index';
import { CriteriaManagement } from '../pages/criteria-management/Index';
import { FormGrading } from '../pages/student-grading/FormGrading';
import { StudentHistory } from '../pages/student-grading/History';
import { ListStudents } from '../pages/class-approval/ListStudents';
import { ReviewForm } from '../pages/class-approval/ReviewForm';
import { ListComplaints } from '../pages/complaints/ListComplaints';
import { AuditLogs } from '../pages/audit-logs/Index';
import { UserManagement } from '../pages/admin-mgmt/UserManagement';
import { SemesterManagement } from '../pages/admin-mgmt/SemesterManagement';
import { CategoryManagement } from '../pages/admin-mgmt/CategoryManagement';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Cụm trang Đăng nhập */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Cụm trang Nghiệp vụ chính */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route
          path="/criteria-management"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <CriteriaManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-grading"
          element={
            <ProtectedRoute allowedRoles={[Role.SINHVIEN, Role.BCS]}>
              <FormGrading />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-history"
          element={
            <ProtectedRoute allowedRoles={[Role.SINHVIEN, Role.BCS]}>
              <StudentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-approval"
          element={
            <ProtectedRoute allowedRoles={[Role.CVHT, Role.BCS]}>
              <ListStudents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-approval/review/:sheetId"
          element={
            <ProtectedRoute allowedRoles={[Role.CVHT, Role.BCS]}>
              <ReviewForm />
            </ProtectedRoute>
          }
        />

        <Route path="/complaints" element={<ListComplaints />} />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/semesters"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <SemesterManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <CategoryManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Điều hướng mặc định */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default AppRoutes;
