import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { CheckCircle2, Upload, FileText, Download, Trash2 } from "lucide-react";

const storageUrl = (chemin) => {
  const base = api.defaults.baseURL.replace(/\/api\/?$/, "");
  return `${base}/storage/${chemin}`;
};

const MesTravaux = () => {
  const [rapport, setRapport] = useState({ titre: "", description: "" });
  const [dejaEnvoye, setDejaEnvoye] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rapportFinal, setRapportFinal] = useState(null);
  const [fichierFinal, setFichierFinal] = useState(null);
  const [envoiFinalEnCours, setEnvoiFinalEnCours] = useState(false);

  useEffect(() => {
    const fetchDonnees = async () => {
      try {
        const [resAujourdhui, resRapportFinal] = await Promise.all([
          api.get("/travaux-stagiaire/aujourd-hui"),
          api.get("/travaux-stagiaire/mon-rapport-final"),
        ]);
        if (resAujourdhui.data) {
          setRapport({ titre: resAujourdhui.data.titre, description: resAujourdhui.data.description });
          setDejaEnvoye(true);
        }
        setRapportFinal(resRapportFinal.data);
      } catch {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchDonnees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/travaux-stagiaire", rapport);
      toast.success(dejaEnvoye ? "Rapport du jour mis à jour" : "Rapport du jour envoyé");
      setDejaEnvoye(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadFinal = async (e) => {
    e.preventDefault();
    if (!fichierFinal) return;
    setEnvoiFinalEnCours(true);
    try {
      const formData = new FormData();
      formData.append("fichier", fichierFinal);
      const res = await api.post("/travaux-stagiaire/rapport-final", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Rapport final envoyé avec succès");
      setRapportFinal(res.data.document);
      setFichierFinal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi du rapport final");
    } finally {
      setEnvoiFinalEnCours(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Travaux effectués aujourd'hui</h2>
        <p className="text-gray-500 text-sm mb-6">Décrivez brièvement ce que vous avez fait aujourd'hui</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          {dejaEnvoye && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-xl p-3">
              <CheckCircle2 className="w-4 h-4" /> Rapport du jour déjà envoyé — vous pouvez le modifier
            </div>
          )}
          <input
            value={rapport.titre}
            onChange={e => setRapport({ ...rapport, titre: e.target.value })}
            placeholder="Titre *"
            required
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
          />
          <textarea
            value={rapport.description}
            onChange={e => setRapport({ ...rapport, description: e.target.value })}
            placeholder="Description des travaux effectués *"
            required
            rows={6}
            className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#129547] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0E7739] transition disabled:opacity-50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {submitting ? "Envoi..." : dejaEnvoye ? "Mettre à jour" : "Envoyer"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Rapport final de stage</h2>
        <p className="text-gray-500 text-sm mb-6">Déposez votre rapport final (PDF) en fin de stage</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          {rapportFinal ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
              
              <a  href={storageUrl(rapportFinal.chemin_fichier)}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-3 text-sm text-gray-900 hover:text-[#129547]"
              >
                <FileText className="w-5 h-5 text-gray-400" />
                {rapportFinal.nom_fichier}
                <Download className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucun rapport final envoyé pour le moment</p>
          )}

          <form onSubmit={handleUploadFinal} className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFichierFinal(e.target.files[0])}
              className="flex-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs"
            />
            <button
              type="submit"
              disabled={!fichierFinal || envoiFinalEnCours}
              className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50 whitespace-nowrap"
            >
              {envoiFinalEnCours ? "Envoi..." : rapportFinal ? "Remplacer" : "Envoyer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MesTravaux;