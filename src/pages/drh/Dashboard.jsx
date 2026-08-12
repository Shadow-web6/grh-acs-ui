import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Departements from "../admin/departements/Departements";
import Employes from "../admin/employes/Employes";
import Absences from "../admin/absences/Absences";
import Scanner from "../admin/presences/Scanner";
import HistoriquePresence from "../admin/presences/RapportPresence";
import AdminHome from "../admin/AdminHome";
import TravauxStagiaires from "../admin/travaux/TravauxStagiaires";
import Recrutement from "../admin/recrutement/Recrutement";
import Stagiaires from "../admin/stagiaires/Stagiaires";
import MonQrCode from "../employe/MonQrCode";
import { useAuth } from "../../context/AuthContext";

const DrhDashboard = () => {
  const { hasPermission } = useAuth();

  const menuSections = [
    { label: "Principal", items: [
      { path: "/drh", iconKey: "dashboard", label: "Tableau de bord", exact: true },
      { path: "/drh/qrcode", iconKey: "qrcode", label: "Mon QR Code" },
    ]},
    { label: "Ressources humaines", items: [
      { path: "/drh/employes", iconKey: "employes", label: "Employés" },
      { path: "/drh/stagiaires", iconKey: "stagiaires", label: "Stagiaires" },
      // Modules accordés par défaut à la création de compte, mais réellement révocables par l'Administrateur
      ...(hasPermission("absences") ? [{ path: "/drh/absences", iconKey: "absences", label: "Absences" }] : []),
      ...(hasPermission("scanner") ? [{ path: "/drh/scanner", iconKey: "scanner", label: "Scanner présence" }] : []),
      ...(hasPermission("recrutement") ? [{ path: "/drh/recrutement", iconKey: "recrutement", label: "Recrutement" }] : []),
      // Travaux stagiaires : retiré du rôle par défaut, uniquement via permission accordée par l'admin
      ...(hasPermission("travaux_stagiaire") ? [{ path: "/drh/travaux-stagiaires", iconKey: "travaux", label: "Travaux stagiaires" }] : []),
    ]},
    { label: "Structure", items: [
      ...(hasPermission("historique_presence") ? [{ path: "/drh/historique-presence", iconKey: "historique", label: "Historique présences" }] : []),
      { path: "/drh/departements", iconKey: "departements", label: "Départements" },
    ]},
  ];

  return (
    <DashboardLayout menuSections={menuSections} role="drh" pageTitle="Tableau de bord RH">
      <Routes>
        <Route path="/" element={<AdminHome basePath="/drh" role="drh" />} />
        <Route path="/qrcode" element={<MonQrCode />} />
        <Route path="/departements" element={<Departements basePath="/drh" role="drh" />} />
        <Route path="/employes" element={<Employes />} />
        <Route path="/stagiaires" element={<Stagiaires />} />
        {hasPermission("absences") && <Route path="/absences" element={<Absences />} />}
        {hasPermission("scanner") && <Route path="/scanner" element={<Scanner />} />}
        {hasPermission("historique_presence") && <Route path="/historique-presence" element={<HistoriquePresence />} />}
        {hasPermission("travaux_stagiaire") && <Route path="/travaux-stagiaires" element={<TravauxStagiaires />} />}
        {hasPermission("recrutement") && <Route path="/recrutement" element={<Recrutement />} />}
      </Routes>
    </DashboardLayout>
  );
};

export default DrhDashboard;