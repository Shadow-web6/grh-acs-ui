import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  KeyRound,
  Building2,
  Camera,
  Calendar,
  ClipboardList,
  BarChart3,
  Users,
  Hourglass,
  CheckCircle2,
} from "lucide-react";

const AdminHome = ({ basePath = "/admin", role = "admin" }) => {
  const [stats, setStats] = useState({
    totalComptes: 0,
    totalDepartements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, deptRes] = await Promise.all([
          api.get("/utilisateurs"),
          api.get("/departements"),
        ]);
        setStats({
          totalComptes: usersRes.data.length,
          totalDepartements: deptRes.data.length,
        });
      } catch {}
      finally { setLoading(false); }
    };

    if (role === "admin") {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [role]);

  // Pour DRH et Directeur — leurs propres widgets
  const [demandesEnAttente, setDemandesEnAttente] = useState(0);
  const [presentsAujourdhui, setPresentsAujourdhui] = useState(null);
  const [loadingDrh, setLoadingDrh] = useState(true);

  const peutScanner = role === "drh";

  useEffect(() => {
    if (role === "admin") return;
    const fetchDrhData = async () => {
      try {
        const demRes = await api.get("/demandes");
        setDemandesEnAttente(demRes.data.filter(d => d.statut === "en_attente").length);
        if (peutScanner) {
          const presRes = await api.get("/presences/presents-aujourdhui");
          setPresentsAujourdhui(presRes.data.length);
        }
      } catch {}
      finally { setLoadingDrh(false); }
    };
    fetchDrhData();
  }, [role]);

  const actionsParRole = {
    admin: [
      { icon: KeyRound, label: "Nouveau compte", to: `${basePath}/utilisateurs` },
      { icon: Building2, label: "Départements", to: `${basePath}/departements` },
    ],
    drh: [
      { icon: Camera, label: "Scanner présence", to: `${basePath}/scanner` },
      { icon: Calendar, label: "Traiter absences", to: `${basePath}/absences` },
      { icon: ClipboardList, label: "Recrutement", to: `${basePath}/recrutement` },
      { icon: BarChart3, label: "Historique présences", to: `${basePath}/historique-presence` },
    ],
    directeur: [
      { icon: Calendar, label: "Traiter absences", to: `${basePath}/absences` },
      { icon: Users, label: "Employés", to: `${basePath}/employes` },
      { icon: ClipboardList, label: "Recrutement", to: `${basePath}/recrutement` },
      { icon: Building2, label: "Départements", to: `${basePath}/departements` },
    ],
  };

  const actions = actionsParRole[role] || actionsParRole.drh;

  if (role === "admin") {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Tableau de bord</h2>
        <p className="text-gray-500 text-sm mb-8">Gestion du système Easy HR</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            to={`${basePath}/utilisateurs`}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-[#005DCB]/40 hover:shadow-md transition shadow-sm"
          >
            <div>
              <p className="text-gray-500 text-sm mb-1">Comptes utilisateurs</p>
              <p className="text-3xl font-bold text-[#005DCB]">
                {loading ? "..." : stats.totalComptes}
              </p>
            </div>
            <Users className="w-8 h-8 text-[#005DCB]" />
          </Link>

          <Link
            to={`${basePath}/departements`}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-[#005DCB]/40 hover:shadow-md transition shadow-sm"
          >
            <div>
              <p className="text-gray-500 text-sm mb-1">Départements</p>
              <p className="text-3xl font-bold text-[#005DCB]">
                {loading ? "..." : stats.totalDepartements}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-[#005DCB]" />
          </Link>
        </div>

        <h3 className="text-gray-900 font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.to}
                className="bg-[#005DCB] text-white p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:bg-[#004BA8] transition shadow-md"
              >
                <Icon className="w-7 h-7" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // DRH et Directeur
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Tableau de bord</h2>
      <p className="text-gray-500 text-sm mb-8">Aperçu de votre activité aujourd'hui</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to={`${basePath}/absences`}
          className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-[#005DCB]/40 hover:shadow-md transition shadow-sm"
        >
          <div>
            <p className="text-gray-500 text-sm mb-1">Demandes à traiter</p>
            <p className="text-3xl font-bold text-amber-500">
              {loadingDrh ? "..." : demandesEnAttente}
            </p>
          </div>
          <Hourglass className="w-8 h-8 text-amber-500" />
        </Link>

        {peutScanner && (
          <Link
            to={`${basePath}/scanner`}
            className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-between hover:border-[#005DCB]/40 hover:shadow-md transition shadow-sm"
          >
            <div>
              <p className="text-gray-500 text-sm mb-1">Présents aujourd'hui</p>
              <p className="text-3xl font-bold text-green-600">
                {loadingDrh ? "..." : presentsAujourdhui ?? "-"}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </Link>
        )}
      </div>

      <h3 className="text-gray-900 font-semibold mb-4">Actions rapides</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.to}
              className="bg-[#005DCB] text-white p-5 rounded-2xl flex flex-col items-center gap-2 text-center hover:bg-[#004BA8] transition shadow-md"
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

export default AdminHome;