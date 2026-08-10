import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Search } from "lucide-react";

const mois = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const HistoriquePresence = () => {
  const [historique, setHistorique] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeFiltre, setModeFiltre] = useState("jour");
  const [filtres, setFiltres] = useState({
    date: new Date().toISOString().split("T")[0],
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    employe_id: "",
  });

  useEffect(() => {
    api.get("/employes").then(res => setEmployes(res.data));
  }, []);

  const fetchHistorique = async () => {
    setLoading(true);
    try {
      let params;
      if (modeFiltre === "jour") {
        params = { date: filtres.date, employe_id: filtres.employe_id || undefined };
      } else if (modeFiltre === "mois") {
        params = { mois: filtres.mois, annee: filtres.annee, employe_id: filtres.employe_id || undefined };
      } else {
        // mode "annee"
        params = { annee: filtres.annee, employe_id: filtres.employe_id || undefined };
      }

      const res = await api.get("/presences/historique", { params });
      setHistorique(res.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistorique(); }, [modeFiltre]);

  const calculerDuree = (arrivee, depart) => {
    if (!arrivee || !depart) return "-";
    const h = (new Date(`2000-01-01T${depart}`) - new Date(`2000-01-01T${arrivee}`)) / 3600000;
    return `${h.toFixed(1)}h`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Historique des présences</h2>
      <p className="text-gray-500 text-sm mb-6">Consultez les pointages par jour ou par mois</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setModeFiltre("jour")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${modeFiltre === "jour" ? "bg-[#129547] text-white" : "bg-gray-50 text-gray-500"}`}
          >
            Par jour
          </button>
          <button
            onClick={() => setModeFiltre("mois")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${modeFiltre === "mois" ? "bg-[#129547] text-white" : "bg-gray-50 text-gray-500"}`}
          >
            Par mois
          </button>
          <button
            onClick={() => setModeFiltre("annee")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${modeFiltre === "annee" ? "bg-[#129547] text-white" : "bg-gray-50 text-gray-500"}`}
          >
            Par année
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modeFiltre === "jour" && (
            <input
              type="date"
              value={filtres.date}
              onChange={e => setFiltres({ ...filtres, date: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
            />
          )}

          {modeFiltre === "mois" && (
            <>
              <select
                value={filtres.mois}
                onChange={e => setFiltres({ ...filtres, mois: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
              >
                {mois.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <input
                type="number"
                value={filtres.annee}
                onChange={e => setFiltres({ ...filtres, annee: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
              />
            </>
          )}

          {modeFiltre === "annee" && (
            <input
              type="number"
              value={filtres.annee}
              onChange={e => setFiltres({ ...filtres, annee: e.target.value })}
              placeholder="Année (ex: 2024)"
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
            />
          )}

          <select
            value={filtres.employe_id}
            onChange={e => setFiltres({ ...filtres, employe_id: e.target.value })}
            className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
          >
            <option value="">Tous les employés</option>
            {employes.map(e => <option key={e.id} value={e.id}>{e.user?.name}</option>)}
          </select>
        </div>

        <button
          onClick={fetchHistorique}
          className="mt-4 bg-[#129547] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Employé</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Date</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Arrivée</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Départ</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Durée</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Scanné par</th>
                </tr>
              </thead>
              <tbody>
                {historique.map(p => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-5 py-3 text-gray-900">{p.employe?.user?.name}</td>
                    <td className="px-5 py-3 text-gray-500">{p.date}</td>
                    <td className="px-5 py-3 text-green-600">{p.heure_arrivee || "-"}</td>
                    <td className="px-5 py-3 text-amber-600">{p.heure_depart || "-"}</td>
                    <td className="px-5 py-3 text-gray-500">{calculerDuree(p.heure_arrivee, p.heure_depart)}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{p.scanne_par?.name || "-"}</td>
                  </tr>
                ))}
                {historique.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-500">Aucune présence trouvée</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoriquePresence;