import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FileUp, FileCheck, Download } from "lucide-react";

const MesTravaux = () => {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ titre: "", description: "" });
  const [dejaSaisiAujourdhui, setDejaSaisiAujourdhui] = useState(false);

  const [rapportFinal, setRapportFinal] = useState(null);
  const [fichierRapport, setFichierRapport] = useState(null);
  const [uploadingRapport, setUploadingRapport] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [histRes, jourRes, rapportRes] = await Promise.all([
        api.get("/travaux-stagiaire"),
        api.get("/travaux-stagiaire/aujourd-hui"),
        api.get("/travaux-stagiaire/mon-rapport-final"),
      ]);
      setHistorique(histRes.data);
      if (jourRes.data) {
        setForm({ titre: jourRes.data.titre, description: jourRes.data.description });
        setDejaSaisiAujourdhui(true);
      }
      setRapportFinal(rapportRes.data);
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

  const handleUploadRapportFinal = async (e) => {
    e.preventDefault();
    if (!fichierRapport) return;

    if (rapportFinal && !window.confirm(
      "Un rapport final a déjà été déposé. Le déposer à nouveau remplacera définitivement l'ancien fichier. Confirmez-vous ?"
    )) return;

    setUploadingRapport(true);
    try {
      const formData = new FormData();
      formData.append("rapport_final", fichierRapport);
      await api.post("/travaux-stagiaire/rapport-final", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Rapport final déposé avec succès");
      setFichierRapport(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du dépôt du rapport");
    } finally {
      setUploadingRapport(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Travaux effectués</h2>
      <p className="text-gray-500 text-sm mb-6">
        Renseignez quotidiennement ce que vous avez réalisé aujourd'hui
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 font-semibold">Rapport final de stage</h3>
            <p className="text-gray-500 text-xs mt-1">Document PDF unique — un nouveau dépôt remplace le précédent</p>
          </div>
          {rapportFinal && (
            <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> Déposé
            </span>
          )}
        </div>

        {rapportFinal && (
          <a
            href={`http://127.0.0.1:8000/storage/${rapportFinal.chemin_fichier}`}
            target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-[#129547] hover:underline mb-4"
          >
            <Download className="w-4 h-4" /> {rapportFinal.nom_fichier}
          </a>
        )}

        <form onSubmit={handleUploadRapportFinal} className="flex flex-col sm:flex-row gap-3">
          <input
            type="file" accept="application/pdf"
            onChange={e => setFichierRapport(e.target.files[0])}
            className="flex-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs"
          />
          <button
            type="submit"
            disabled={!fichierRapport || uploadingRapport}
            className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <FileUp className="w-4 h-4" />
            {uploadingRapport ? "Envoi..." : rapportFinal ? "Remplacer" : "Déposer"}
          </button>
        </form>
      </div>

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
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
          />
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Décrivez ce que vous avez réalisé aujourd'hui..."
            rows={5}
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#129547] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50"
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