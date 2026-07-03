import { useState, useEffect } from "react";
import api from "../../../api/axios";

const couleurs = [
  "border-l-emerald-500", "border-l-cyan-500", "border-l-emerald-500",
  "border-l-amber-500", "border-l-purple-500", "border-l-pink-500", "border-l-orange-500",
];

const roleBadge = {
  admin: "bg-red-500/15 text-red-400",
  drh: "bg-purple-500/15 text-purple-400",
  directeur: "bg-emerald-500/15 text-emerald-400",
  employe: "bg-emerald-500/15 text-emerald-400",
  stagiaire: "bg-amber-500/15 text-amber-400",
};

const Organigramme = () => {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ouverts, setOuverts] = useState({});

  useEffect(() => {
    api.get("/organigramme")
      .then(res => setDepartements(res.data))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setOuverts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
    </div>
  );

  const directeur = departements
    .flatMap(d => d.employes || [])
    .find(e => e.user?.role === "directeur");

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-1">Organigramme de Data Links SARL</h2>
      <p className="text-gray-500 text-sm mb-10">Structure hiérarchique de l'entreprise</p>

      {/* Direction Générale */}
      <div className="flex justify-center mb-3">
        <div className="bg-emerald-600 rounded-2xl px-10 py-5 text-center max-w-md shadow-lg shadow-emerald-600/30">
          <p className="text-white font-bold text-lg mb-1">Direction Générale</p>
          <p className="text-blue-100 text-xs leading-relaxed">
            Supervise l'ensemble des pôles et assure la gestion stratégique, juridique et financière de l'entreprise
          </p>
          {directeur && (
            <p className="text-white text-sm font-medium mt-3 pt-3 border-t border-white/20">
              {directeur.user?.name}
            </p>
          )}
        </div>
      </div>

      {/* Ligne de connexion verticale */}
      <div className="flex justify-center">
        <div className="w-px h-10 bg-white/15"></div>
      </div>

      {/* Ligne horizontale décorative (simule la ramification) */}
      <div className="relative mb-8">
        <div className="border-t border-white/15 mx-auto" style={{ maxWidth: "90%" }}></div>
      </div>

      {/* Départements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {departements.map((dept, i) => {
          const couleur = couleurs[i % couleurs.length];
          const employes = (dept.employes || []).filter(e => e.user?.role !== "directeur");
          const isOpen = ouverts[dept.id];

          return (
            <div key={dept.id}>
              {/* Petite flèche au-dessus de chaque carte */}
              <div className="flex justify-center mb-1">
                <div className="w-px h-5 bg-white/15"></div>
              </div>

              <div className={`bg-[#111827] border border-white/5 ${couleur} border-l-4 rounded-2xl overflow-hidden`}>
                <button
                  onClick={() => toggle(dept.id)}
                  className="w-full p-5 text-left flex justify-between items-start hover:bg-white/[0.02] transition"
                >
                  <div>
                    <h3 className="text-white font-bold text-sm">{dept.nom}</h3>
                    <p className="text-gray-500 text-xs mt-1">{employes.length} employé(s)</p>
                  </div>
                  <span className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}>
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-3 space-y-2">
                    {employes.length > 0 ? employes.map(emp => (
                      <div key={emp.id} className="flex items-center justify-between py-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{emp.user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.poste || "-"}</p>
                        </div>
                        <span className={`${roleBadge[emp.user?.role]} text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-2`}>
                          {emp.user?.role}
                        </span>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-sm py-2">Aucun employé</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Organigramme;