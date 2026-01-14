import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminBatches from "./pages/AdminBatches";
import AdminStudents from "./pages/AdminStudents";
import AdminFees from "./pages/AdminFees";
import AdminParents from "./pages/AdminParents";
import AdminTests from "./pages/AdminTests";
import AdminSettings from "./pages/AdminSettings";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminCredentials from "./pages/AdminCredentials";
import AdminCoachingDetails from "./pages/AdminCoachingDetails";
import { CoachingProvider } from "./context/CoachingContext";

function App() {
  return (
    <CoachingProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student/login" element={<StudentLogin />} />
        
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      <Route
        path="/parent"
        element={
          <ProtectedRoute role="parent">
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/batches"
        element={
          <ProtectedRoute role="admin">
            <AdminBatches />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/students"
        element={
          <ProtectedRoute role="admin">
            <AdminStudents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/parents"
        element={
          <ProtectedRoute role="admin">
            <AdminParents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tests"
        element={
          <ProtectedRoute role="admin">
            <AdminTests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/fees"
        element={
          <ProtectedRoute role="admin">
            <AdminFees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/announcements"
        element={
          <ProtectedRoute role="admin">
            <AdminAnnouncements />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/credentials"
        element={
          <ProtectedRoute role="admin">
            <AdminCredentials />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/coaching-details"
        element={
          <ProtectedRoute role="admin">
            <AdminCoachingDetails />
          </ProtectedRoute>
        }
      />
      </Routes>
    </CoachingProvider>
  );
}

export default App;
