import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const MesTravaux = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "" });
  const [dejaSaisiAujourdhui, setDejaSaisiAujourdhui] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, jourRes] = await Promise.all([
        api.get("/travaux-stagiaire"),
        api.get("/travaux-stagiaire/aujourd-hui"),
      ]);
      setHistorique(histRes.data);
      if (jourRes.data) {
        setForm({ titre: jourRes.data.titre, description: jourRes.data.description });
        setDejaSaisiAujourdhui(true);
      }
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/travaux-stagiaire", form);
      toast.success(dejaSaisiAujourdhui ? "Rapport mis à jour" : "Rapport enregistré");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Travaux effectués</h2>
      <p className="text-gray-500 text-sm mb-6">
        Renseignez quotidiennement ce que vous avez réalisé aujourd'hui
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-900 font-semibold">Rapport du jour</h3>
          {dejaSaisiAujourdhui && (
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full">
              Déjà saisi — modifiable
            </span>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.titre}
            onChange={e => setForm({ ...form, titre: e.target.value })}
            placeholder="Titre (ex: Intégration module React)"
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez ce que vous avez réalisé aujourd'hui..."
            rows={5}
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#005DCB] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : dejaSaisiAujourdhui ? "Mettre à jour" : "Enregistrer"}
          </button>
        </form>
      </div>

      <h3 className="text-gray-900 font-semibold mb-4">Historique</h3>
      <div className="space-y-3">
        {historique.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-gray-900 font-medium">{t.titre}</h4>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-3">{t.date}</span>
            </div>
            <p className="text-sm text-gray-500">{t.description}</p>
          </div>
        ))}
        {historique.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun rapport saisi pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default MesTravaux;