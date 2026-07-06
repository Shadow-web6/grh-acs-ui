import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import DrhDashboard from "./pages/drh/Dashboard";
import DirecteurDashboard from "./pages/directeur/Dashboard";
import EmployeDashboard from "./pages/employe/Dashboard";
import StagiaireDashboard from "./pages/stagiaire/Dashboard";
import Postuler from "./pages/public/Postuler";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/postuler" element={<Postuler />} />
          <Route path="/admin/*" element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/drh/*" element={
            <PrivateRoute roles={["drh"]}>
              <DrhDashboard />
            </PrivateRoute>
          } />
          <Route path="/directeur/*" element={
            <PrivateRoute roles={["directeur"]}>
              <DirecteurDashboard />
            </PrivateRoute>
          } />
          <Route path="/employe/*" element={
            <PrivateRoute roles={["employe"]}>
              <EmployeDashboard />
            </PrivateRoute>
          } />
          <Route path="/stagiaire/*" element={
            <PrivateRoute roles={["stagiaire"]}>
              <StagiaireDashboard />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;