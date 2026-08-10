import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  QrCode,
  Briefcase,
  User,
  Camera,
  FileText,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const AccueilEmploye = ({ basePath = "/employe" }) => {
  const { user, hasPermission } = useAuth();

  const actionsBase = [
    { icon: Calendar, label: "Mes absences", to: `${basePath}/absences` },
    { icon: QrCode, label: "Mon QR Code", to: `${basePath}/qrcode` },
    { icon: Briefcase, label: "Offres d'emploi", to: `${basePath}/offres` },
    { icon: User, label: "Mon profil", to: `${basePath}/profil` },
  ];

  const actionsPermissions = [
    hasPermission("recrutement") && { icon: Briefcase, label: "Recrutement", to: `${basePath}/recrutement` },
    hasPermission("scanner") && { icon: Camera, label: "Scanner présence", to: `${basePath}/scanner` },
    hasPermission("historique_presence") && { icon: FileText, label: "Historique présences", to: `${basePath}/historique-presence` },
    hasPermission("travaux_stagiaire") && { icon: ClipboardList, label: "Travaux stagiaires", to: `${basePath}/travaux-stagiaires` },
    hasPermission("absences") && { icon: CheckCircle2, label: "Gérer les absences", to: `${basePath}/absences-gestion` },
  ].filter(Boolean);

  const actions = [...actionsBase, ...actionsPermissions];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Bonjour {user?.name?.split(" ")[0]}
      </h2>
      <p className="text-gray-500 text-sm mb-8">Que souhaitez-vous faire aujourd'hui ?</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.to}
              className="bg-[#129547] text-white p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:bg-[#0E7739] transition shadow-md"
            >
              <Icon className="w-7 h-7" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AccueilEmploye;