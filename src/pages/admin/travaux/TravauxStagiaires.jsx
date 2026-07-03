import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const TravauxStagiaires = () => {
  const [travaux, setTravaux] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreStagiaire, setFiltreStagiaire] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [travRes, empRes] = await Promise.all([
        api.get("/travaux-stagiaire", { params: filtreStagiaire ? { employe_id: filtreStagiaire } : {} }),
        api.get("/employes"),
      ]);
      setTravaux(travRes.data);
      setStagiaires(empRes.data.filter(e => e.user?.role === "stagiaire"));
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filtreStagiaire]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Travaux des stagiaires</h2>
      <p className="text-gray-500 text-sm mb-6">Suivi des rapports journaliers</p>

      <select
        value={filtreStagiaire}
        onChange={e => setFiltreStagiaire(e.target.value)}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 mb-6 focus:outline-none focus:border-[#005DCB]"
      >
        <option value="">Tous les stagiaires</option>
        {stagiaires.map(s => (
          <option key={s.id} value={s.id}>{s.user?.name}</option>
        ))}
      </select>

      <div className="space-y-3">
        {travaux.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-gray-900 font-medium">{t.titre}</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.employe?.user?.name} — {t.employe?.departement?.nom}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{t.date}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">{t.description}</p>
          </div>
        ))}
        {travaux.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun rapport trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default TravauxStagiaires;