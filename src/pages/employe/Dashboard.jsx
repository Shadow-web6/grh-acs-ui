import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import MonProfil from "./MonProfil";
import MesAbsences from "./MesAbsences";
import MonQrCode from "./MonQrCode";
import OffresEmploi from "./OffresEmploi";
import Scanner from "../admin/presences/Scanner";
import HistoriquePresence from "../admin/presences/RapportPresence";
import Recrutement from "../admin/recrutement/Recrutement";
import TravauxStagiaires from "../admin/travaux/TravauxStagiaires";
import Absences from "../admin/absences/Absences";
import AccueilEmploye from "./AccueilEmploye";
import { useAuth } from "../../context/AuthContext";

const EmployeDashboard = () => {
  const { hasPermission } = useAuth();

  const menuSections = [
    { label: "Principal", items: [
      { path: "/employe", iconKey: "dashboard", label: "Accueil", exact: true },
      { path: "/employe/profil", iconKey: "profil", label: "Mon profil" },
    ]},
    { label: "Mon espace", items: [
      { path: "/employe/absences", iconKey: "absences", label: "Mes absences" },
      { path: "/employe/qrcode", iconKey: "qrcode", label: "Mon QR Code" },
      { path: "/employe/offres", iconKey: "offres", label: "Offres d'emploi" },
      // Modules supplémentaires si permission accordée
      ...(hasPermission("recrutement") ? [{ path: "/employe/recrutement", iconKey: "recrutement", label: "Recrutement" }] : []),
      ...(hasPermission("absences") ? [{ path: "/employe/absences-gestion", iconKey: "absences", label: "Gérer les absences" }] : []),
      ...(hasPermission("scanner") ? [{ path: "/employe/scanner", iconKey: "scanner", label: "Scanner présence" }] : []),
      ...(hasPermission("historique_presence") ? [{ path: "/employe/historique-presence", iconKey: "historique", label: "Historique présences" }] : []),
      ...(hasPermission("travaux_stagiaire") ? [{ path: "/employe/travaux-stagiaires", iconKey: "travaux", label: "Travaux stagiaires" }] : []),
    ]},
  ];

  return (
    <DashboardLayout menuSections={menuSections} role="employe" pageTitle="Mon espace">
      <Routes>
        <Route path="/" element={<AccueilEmploye basePath="/employe" />} />
        <Route path="/profil" element={<MonProfil />} />
        <Route path="/absences" element={<MesAbsences />} />
        <Route path="/qrcode" element={<MonQrCode />} />
        <Route path="/offres" element={<OffresEmploi />} />
        {hasPermission("recrutement") && <Route path="/recrutement" element={<Recrutement />} />}
        {hasPermission("scanner") && <Route path="/scanner" element={<Scanner />} />}
        {hasPermission("historique_presence") && <Route path="/historique-presence" element={<HistoriquePresence />} />}
        {hasPermission("travaux_stagiaire") && <Route path="/travaux-stagiaires" element={<TravauxStagiaires />} />}
        {hasPermission("absences") && <Route path="/absences-gestion" element={<Absences />} />}
      </Routes>
    </DashboardLayout>
  );
};

export default EmployeDashboard;