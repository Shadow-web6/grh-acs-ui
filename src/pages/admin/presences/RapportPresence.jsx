import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const mois = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const FILTRES_STATUT = [
  { value: "tous", label: "Tous" },
  { value: "a_l_heure", label: "À l'heure" },
  { value: "en_retard", label: "En retard" },
  { value: "absent", label: "Absents" },
];

const badgeEtat = (etat) => {
  switch (etat) {
    case "a_l_heure":
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">À l'heure</span>;
    case "en_retard":
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">En retard</span>;
    case "absent":
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Absent</span>;
    default:
      return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600">En attente</span>;
  }
};

const HistoriquePresence = () => {
  const [historique, setHistorique] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [roster, setRoster] = useState([]);
  const [compteurs, setCompteurs] = useState(null);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modeFiltre, setModeFiltre] = useState("jour");
  const [statutFiltre, setStatutFiltre] = useState("tous");
  const [page, setPage] = useState(1);
  const [filtres, setFiltres] = useState({
    date: new Date().toISOString().split("T")[0],
    mois: new Date().getMonth() + 1,
    annee: new Date().getFullYear(),
    employe_id: "",
  });

  useEffect(() => {
    api.get("/employes").then(res => setEmployes(res.data));
  }, []);

  const fetchJour = async () => {
    setLoading(true);
    try {
      const res = await api.get("/presences/liste", {
        params: { date: filtres.date, statut: statutFiltre },
      });
      let data = res.data.data;
      if (filtres.employe_id) {
        data = data.filter(r => String(r.employe_id) === String(filtres.employe_id));
      }
      setRoster(data);
      setCompteurs(res.data.compteurs);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async (pageDemandee = 1) => {
    setLoading(true);
    try {
      let params = { page: pageDemandee, employe_id: filtres.employe_id || undefined };
      if (modeFiltre === "mois") {
        params = { ...params, mois: filtres.mois, annee: filtres.annee };
      } else {
        params = { ...params, annee: filtres.annee };
      }

      const res = await api.get("/presences/historique", { params });
      setHistorique(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
      setPage(pageDemandee);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonnees = () => {
    if (modeFiltre === "jour") {
      fetchJour();
    } else {
      fetchHistorique(1);
    }
  };

  useEffect(() => { fetchDonnees(); }, [modeFiltre]);
  useEffect(() => { if (modeFiltre === "jour") fetchJour(); }, [statutFiltre]);

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

        {modeFiltre === "jour" && (
          <div className="flex flex-wrap gap-2 mt-4">
            {FILTRES_STATUT.map(f => (
              <button
                key={f.value}
                onClick={() => setStatutFiltre(f.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                  statutFiltre === f.value
                    ? "bg-[#129547] text-white border-[#129547]"
                    : "bg-white text-gray-500 border-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={fetchDonnees}
          className="mt-4 bg-[#129547] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Filtrer
        </button>
      </div>

      {modeFiltre === "jour" && compteurs && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-amber-500">{compteurs.en_attente}</p>
            <p className="text-xs text-gray-500 mt-1">En attente</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-green-600">{compteurs.a_l_heure}</p>
            <p className="text-xs text-gray-500 mt-1">À l'heure</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-red-600">{compteurs.en_retard}</p>
            <p className="text-xs text-gray-500 mt-1">En retard</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-gray-500">{compteurs.absent}</p>
            <p className="text-xs text-gray-500 mt-1">Absents</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
        </div>
      ) : modeFiltre === "jour" ? (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Employé</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Département</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">État</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Arrivée</th>
                  <th className="px-5 py-3 text-left text-gray-500 font-medium">Départ</th>
                </tr>
              </thead>
              <tbody>
                {roster.map(r => (
                  <tr key={r.employe_id} className="border-t border-gray-100">
                    <td className="px-5 py-3 text-gray-900">{r.nom}</td>
                    <td className="px-5 py-3 text-gray-500">{r.departement || "-"}</td>
                    <td className="px-5 py-3">{badgeEtat(r.etat)}</td>
                    <td className="px-5 py-3 text-gray-500">{r.heure_arrivee || "-"}</td>
                    <td className="px-5 py-3 text-gray-500">{r.heure_depart || "-"}</td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-gray-500">Aucun employé/stagiaire actif trouvé</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>Page {pagination.current_page} / {pagination.last_page} — {pagination.total} résultat(s)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchHistorique(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchHistorique(page + 1)}
                  disabled={page >= pagination.last_page}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoriquePresence;