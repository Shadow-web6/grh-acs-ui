import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import AdminHome from "./AdminHome";
import Departements from "./departements/Departements";
import Utilisateurs from "./utilisateurs/Utilisateurs";
import QrCodeGlobal from "./presences/QrCodeGlobal";

const menuSections = [
  { label: "Principal", items: [
    { path: "/admin", iconKey: "dashboard", label: "Tableau de bord", exact: true },
  ]},
  { label: "Administration", items: [
    { path: "/admin/utilisateurs", iconKey: "utilisateurs", label: "Utilisateurs" },
    { path: "/admin/departements", iconKey: "departements", label: "Départements" },
    { path: "/admin/qr-global", iconKey: "qrcode", label: "QR Code général" },
  ]},
];

const AdminDashboard = () => {
  return (
    <DashboardLayout menuSections={menuSections} role="admin" pageTitle="Tableau de bord">
      <Routes>
        <Route path="/" element={<AdminHome basePath="/admin" role="admin" />} />
        <Route path="/utilisateurs" element={<Utilisateurs />} />
        <Route path="/departements" element={<Departements basePath="/admin" />} />
        <Route path="/qr-global" element={<QrCodeGlobal />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;