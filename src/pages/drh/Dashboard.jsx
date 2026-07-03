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
import { useAuth } from "../../context/AuthContext";

const DrhDashboard = () => {
  const { hasPermission } = useAuth();

  const menuSections = [
    { label: "Principal", items: [
      { path: "/drh", iconKey: "dashboard", label: "Tableau de bord", exact: true },
    ]},
    { label: "Ressources humaines", items: [
      { path: "/drh/employes", iconKey: "employes", label: "Employés" },
      { path: "/drh/stagiaires", iconKey: "stagiaires", label: "Stagiaires" },
      ...(hasPermission("absences") || true ? [{ path: "/drh/absences", iconKey: "absences", label: "Absences" }] : []),
      ...(hasPermission("scanner") || true ? [{ path: "/drh/scanner", iconKey: "scanner", label: "Scanner présence" }] : []),
      ...(hasPermission("recrutement") || true ? [{ path: "/drh/recrutement", iconKey: "recrutement", label: "Recrutement" }] : []),
      ...(hasPermission("travaux_stagiaire") || true ? [{ path: "/drh/travaux-stagiaires", iconKey: "travaux", label: "Travaux stagiaires" }] : []),
    ]},
    { label: "Structure", items: [
      ...(hasPermission("historique_presence") || true ? [{ path: "/drh/historique-presence", iconKey: "historique", label: "Historique présences" }] : []),
      { path: "/drh/departements", iconKey: "departements", label: "Départements" },
    ]},
  ];

  return (
    <DashboardLayout menuSections={menuSections} role="drh" pageTitle="Tableau de bord RH">
      <Routes>
        <Route path="/" element={<AdminHome basePath="/drh" role="drh" />} />
        <Route path="/departements" element={<Departements basePath="/drh" />} />
        <Route path="/employes" element={<Employes />} />
        <Route path="/stagiaires" element={<Stagiaires />} />
        <Route path="/absences" element={<Absences />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/historique-presence" element={<HistoriquePresence />} />
        <Route path="/travaux-stagiaires" element={<TravauxStagiaires />} />
        <Route path="/recrutement" element={<Recrutement />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DrhDashboard;