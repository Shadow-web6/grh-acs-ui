import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Departements from "../admin/departements/Departements";
import Employes from "../admin/employes/Employes";
import Absences from "../admin/absences/Absences";
import Scanner from "../admin/presences/Scanner";
import HistoriquePresence from "../admin/presences/RapportPresence";
import AdminHome from "../admin/AdminHome";
import Recrutement from "../admin/recrutement/Recrutement";
import Stagiaires from "../admin/stagiaires/Stagiaires";
import { useAuth } from "../../context/AuthContext";

const DirecteurDashboard = () => {
  const { hasPermission } = useAuth();

  const menuSections = [
    { label: "Principal", items: [
      { path: "/directeur", iconKey: "dashboard", label: "Tableau de bord", exact: true },
    ]},
    { label: "Ressources humaines", items: [
      { path: "/directeur/employes", iconKey: "employes", label: "Employés" },
      { path: "/directeur/stagiaires", iconKey: "stagiaires", label: "Stagiaires" },
      { path: "/directeur/absences", iconKey: "absences", label: "Absences" },
      { path: "/directeur/recrutement", iconKey: "recrutement", label: "Recrutement" },
      // Modules accordés individuellement par l'Administrateur (jamais par défaut pour le Directeur)
      ...(hasPermission("scanner") ? [{ path: "/directeur/scanner", iconKey: "scanner", label: "Scanner présence" }] : []),
      ...(hasPermission("historique_presence") ? [{ path: "/directeur/historique-presence", iconKey: "historique", label: "Historique présences" }] : []),
    ]},
    { label: "Structure", items: [
      { path: "/directeur/departements", iconKey: "departements", label: "Départements" },
    ]},
  ];

  return (
    <DashboardLayout menuSections={menuSections} role="directeur" pageTitle="Tableau de bord Direction">
      <Routes>
        <Route path="/departements" element={<Departements basePath="/directeur" role="directeur" />} />
        <Route path="/employes" element={<Employes />} />
        <Route path="/stagiaires" element={<Stagiaires />} />
        <Route path="/absences" element={<Absences />} />
        <Route path="/recrutement" element={<Recrutement />} />
        {hasPermission("scanner") && <Route path="/scanner" element={<Scanner />} />}
        {hasPermission("historique_presence") && <Route path="/historique-presence" element={<HistoriquePresence />} />}
        <Route path="/" element={<AdminHome basePath="/directeur" role="directeur" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DirecteurDashboard;