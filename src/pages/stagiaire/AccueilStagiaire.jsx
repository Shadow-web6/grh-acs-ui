import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AccueilStagiaire = () => {
  const { user } = useAuth();

  const actions = [
    { icon: "📝", label: "Rapport du jour", to: "/stagiaire/travaux", color: "from-emerald-500 to-emerald-600" },
    { icon: "📅", label: "Effectuer une demande", to: "/stagiaire/absences", color: "from-amber-500 to-amber-600" },
    { icon: "📱", label: "Mon QR Code", to: "/stagiaire/qrcode", color: "from-cyan-500 to-cyan-600" },
    { icon: "📋", label: "Offres d'emploi", to: "/stagiaire/offres", color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Bonjour {user?.name?.split(" ")[0]} 👋</h2>
      <p className="text-gray-500 text-sm mb-8">Que souhaitez-vous faire aujourd'hui ?</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`bg-gradient-to-br ${action.color} text-white p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:opacity-90 transition shadow-lg`}
          >
            <span className="text-3xl">{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AccueilStagiaire;