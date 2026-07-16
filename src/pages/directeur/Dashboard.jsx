import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import Departements from "../admin/departements/Departements";
import Employes from "../admin/employes/Employes";
import Absences from "../admin/absences/Absences";
import AdminHome from "../admin/AdminHome";
import Recrutement from "../admin/recrutement/Recrutement";
import Stagiaires from "../admin/stagiaires/Stagiaires";

const menuSections = [
  { label: "Principal", items: [
    { path: "/directeur", iconKey: "dashboard", label: "Tableau de bord", exact: true },
  ]},
  { label: "Ressources humaines", items: [
    { path: "/directeur/employes", iconKey: "employes", label: "Employés" },
    { path: "/directeur/stagiaires", iconKey: "stagiaires", label: "Stagiaires" },
    { path: "/directeur/absences", iconKey: "absences", label: "Absences" },
    { path: "/directeur/recrutement", iconKey: "recrutement", label: "Recrutement" },
    // Travaux stagiaires retiré : plus accessible au Directeur, ni par défaut ni via permission
  ]},
  { label: "Structure", items: [
    { path: "/directeur/departements", iconKey: "departements", label: "Départements" },
  ]},
];

const DirecteurDashboard = () => {
  return (
    <DashboardLayout menuSections={menuSections} role="directeur" pageTitle="Tableau de bord Direction">
      <Routes>
        <Route path="/departements" element={<Departements basePath="/directeur" role="directeur" />} />
        <Route path="/employes" element={<Employes />} />
        <Route path="/stagiaires" element={<Stagiaires />} />
        <Route path="/absences" element={<Absences />} />
        <Route path="/recrutement" element={<Recrutement />} />
        <Route path="/" element={<AdminHome basePath="/directeur" role="directeur" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DirecteurDashboard;