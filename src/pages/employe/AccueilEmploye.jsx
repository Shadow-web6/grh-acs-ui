import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AccueilEmploye = ({ basePath = "/employe" }) => {
  const { user, hasPermission } = useAuth();

  const actionsBase = [
    { icon: "📅", label: "Mes absences", to: `${basePath}/absences` },
    { icon: "📱", label: "Mon QR Code", to: `${basePath}/qrcode` },
    { icon: "💼", label: "Offres d'emploi", to: `${basePath}/offres` },
    { icon: "👤", label: "Mon profil", to: `${basePath}/profil` },
  ];

  const actionsPermissions = [
    hasPermission("recrutement") && { icon: "📋", label: "Recrutement", to: `${basePath}/recrutement` },
    hasPermission("scanner") && { icon: "📷", label: "Scanner présence", to: `${basePath}/scanner` },
    hasPermission("historique_presence") && { icon: "📊", label: "Historique présences", to: `${basePath}/historique-presence` },
    hasPermission("travaux_stagiaire") && { icon: "📝", label: "Travaux stagiaires", to: `${basePath}/travaux-stagiaires` },
    hasPermission("absences") && { icon: "✅", label: "Gérer les absences", to: `${basePath}/absences-gestion` },
  ].filter(Boolean);

  const actions = [...actionsBase, ...actionsPermissions];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">
        Bonjour {user?.name?.split(" ")[0]} 👋
      </h2>
      <p className="text-gray-500 text-sm mb-8">Que souhaitez-vous faire aujourd'hui ?</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className="bg-[#005DCB] text-white p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:bg-[#004BA8] transition shadow-md"
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccueilEmploye;