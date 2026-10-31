
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import BranchManagement from "./pages/BranchManagement";
import ExcelImport from "./pages/ExcelImport";
import UserHistory from "./pages/UserHistory";
import TypeOfConcern from "./pages/TypeOfConcern";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import PSFOverallStatus from "./pages/PSFOverallStatus";
import PSFOverallConcernStatus from "./pages/PSFOverallConcernStatus";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Shared authenticated layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/branches"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <BranchManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/import"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ExcelImport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/type-of-concerns"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <TypeOfConcern />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-history"
            element={
              <ProtectedRoute
                allowedRoles={["admin", "manager", "employee"]}
              >
                <UserHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/psf-overall-status"
            element={<PSFOverallStatus />}
          />

           <Route
          path="/psf-overall-concern-status"
          element={<PSFOverallConcernStatus />}
        />
        </Route>
       

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
