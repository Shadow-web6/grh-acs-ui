import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import MesAbsences from "../employe/MesAbsences";
import MonQrCode from "../employe/MonQrCode";
import MesTravaux from "./MesTravaux";
import OffresEmploi from "../employe/OffresEmploi";
import MonProfil from "../employe/MonProfil";
import AccueilStagiaire from "./AccueilStagiaire";
import Absences from "../admin/absences/Absences";
import Recrutement from "../admin/recrutement/Recrutement";
import HistoriquePresence from "../admin/presences/RapportPresence";
import Scanner from "../admin/presences/Scanner";
import { useAuth } from "../../context/AuthContext";
import TravauxStagiaires from "../admin/travaux/TravauxStagiaires";

const StagiaireDashboard = () => {
  const { hasPermission } = useAuth();

  const menuSections = [
    { label: "Principal", items: [
      { path: "/stagiaire", iconKey: "dashboard", label: "Accueil", exact: true },
      { path: "/stagiaire/profil", iconKey: "profil", label: "Mon profil" },
    ]},
    { label: "Mon espace", items: [
      { path: "/stagiaire/absences", iconKey: "absences", label: "Mes absences" },
      { path: "/stagiaire/qrcode", iconKey: "qrcode", label: "Mon QR Code" },
      { path: "/stagiaire/travaux", iconKey: "travaux", label: "Travaux effectués" },
      { path: "/stagiaire/offres", iconKey: "offres", label: "Offres d'emploi" },
      // Modules supplémentaires si permission accordée
      ...(hasPermission("recrutement") ? [{ path: "/stagiaire/recrutement", iconKey: "recrutement", label: "Recrutement" }] : []),
      ...(hasPermission("absences") ? [{ path: "/stagiaire/absences-gestion", iconKey: "absences", label: "Gérer les absences" }] : []),
      ...(hasPermission("scanner") ? [{ path: "/stagiaire/scanner", iconKey: "scanner", label: "Scanner présence" }] : []),
      ...(hasPermission("historique_presence") ? [{ path: "/stagiaire/historique-presence", iconKey: "historique", label: "Historique présences" }] : []),
    ]},
  ];

  return (
    <DashboardLayout menuSections={menuSections} role="stagiaire" pageTitle="Mon espace">
      <Routes>
        <Route path="/" element={<AccueilStagiaire />} />
        <Route path="/profil" element={<MonProfil />} />
        <Route path="/absences" element={<MesAbsences />} />
        <Route path="/qrcode" element={<MonQrCode />} />
        <Route path="/travaux" element={<MesTravaux />} />
        <Route path="/offres" element={<OffresEmploi />} />
        {hasPermission("recrutement") && <Route path="/recrutement" element={<Recrutement />} />}
        {hasPermission("scanner") && <Route path="/scanner" element={<Scanner />} />}
        {hasPermission("historique_presence") && <Route path="/historique-presence" element={<HistoriquePresence />} />}
        {hasPermission("travaux_stagiaire") && <Route path="/travaux-stagiaires" element={<TravauxStagiaires />} />}
      </Routes>
    </DashboardLayout>
  );
};

export default StagiaireDashboard;