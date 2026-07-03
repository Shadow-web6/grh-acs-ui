import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const Stagiaires = () => {
  const [stagiaires, setStagiaires] = useState([]);
  const [travaux, setTravaux] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stagRes, travRes] = await Promise.all([
          api.get("/employes", { params: { role: "stagiaire" } }),
          api.get("/travaux-stagiaire"),
        ]);
        setStagiaires(stagRes.data);

        const dernierTravailParStagiaire = {};
        travRes.data.forEach(t => {
          if (!dernierTravailParStagiaire[t.employe_id] || t.date > dernierTravailParStagiaire[t.employe_id].date) {
            dernierTravailParStagiaire[t.employe_id] = t;
          }
        });
        setTravaux(dernierTravailParStagiaire);
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Stagiaires</h2>
        <p className="text-gray-500 text-sm">{stagiaires.length} stagiaire(s) — Suivi des travaux journaliers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stagiaires.map(stag => {
          const dernierTravail = travaux[stag.id];
          return (
            <div key={stag.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 font-bold text-sm flex-shrink-0">
                  {stag.user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">{stag.user?.name}</h3>
                  <p className="text-gray-500 text-xs">{stag.departement?.nom}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <p className="text-xs text-gray-400 mb-1">Dernier travail rapporté</p>
                {dernierTravail ? (
                  <>
                    <p className="text-sm text-gray-900 font-medium">{dernierTravail.titre}</p>
                    <p className="text-xs text-gray-400 mt-1">{dernierTravail.date}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucun rapport encore soumis</p>
                )}
              </div>

              <button
                onClick={() => setSelected(stag)}
                className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs py-2 rounded-lg transition"
              >
                Voir le profil complet
              </button>
            </div>
          );
        })}
        {stagiaires.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun stagiaire trouvé
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-gray-900">{selected.user?.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Matricule</span><span className="text-gray-900">{selected.matricule}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{selected.user?.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Département</span><span className="text-gray-900">{selected.departement?.nom}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Début stage</span><span className="text-gray-900">{selected.date_embauche || "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fin stage</span><span className="text-gray-900">{selected.date_fin_contrat || "-"}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stagiaires;