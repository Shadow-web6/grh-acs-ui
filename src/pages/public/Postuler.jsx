import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://127.0.0.1:8000/api";

const Postuler = () => {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nom_candidat: "", email_candidat: "", telephone_candidat: "", lettre_motivation: "",
  });

  useEffect(() => {
    axios.get(`${API_URL}/offres-emploi/publiques`)
      .then(res => setOffres(res.data.filter(o => o.statut === "ouverte")))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/candidatures`, {
        ...form,
        offre_id: selectedOffre.id,
      });
      toast.success("Candidature envoyée avec succès !");
      setForm({ nom_candidat: "", email_candidat: "", telephone_candidat: "", lettre_motivation: "" });
      setSelectedOffre(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#005DCB] rounded-2xl mb-4">
            <span className="text-2xl font-bold text-white">DL</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoignez Data Links</h1>
          <p className="text-gray-500">Découvrez nos offres d'emploi et postulez en ligne</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
          </div>
        ) : selectedOffre ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <button
              onClick={() => setSelectedOffre(null)}
              className="text-gray-500 hover:text-gray-800 text-sm mb-6 flex items-center gap-2"
            >
              ← Retour aux offres
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedOffre.titre}</h2>
            <p className="text-gray-500 text-sm mb-6">{selectedOffre.departement?.nom} • {selectedOffre.type_contrat}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                value={form.nom_candidat}
                onChange={e => setForm({ ...form, nom_candidat: e.target.value })}
                placeholder="Nom complet *"
                required
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
              />
              <input
                type="email"
                value={form.email_candidat}
                onChange={e => setForm({ ...form, email_candidat: e.target.value })}
                placeholder="Email *"
                required
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
              />
              <input
                value={form.telephone_candidat}
                onChange={e => setForm({ ...form, telephone_candidat: e.target.value })}
                placeholder="Téléphone"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
              />
              <textarea
                value={form.lettre_motivation}
                onChange={e => setForm({ ...form, lettre_motivation: e.target.value })}
                placeholder="Lettre de motivation"
                rows={5}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#005DCB] text-white py-3 rounded-xl font-medium hover:bg-[#004BA8] transition disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Envoyer ma candidature"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {offres.map(offre => (
              <div key={offre.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-gray-900 font-bold text-lg">{offre.titre}</h3>
                    <p className="text-gray-500 text-sm">{offre.departement?.nom}</p>
                  </div>
                  <span className="bg-blue-50 text-[#005DCB] text-xs font-medium px-3 py-1 rounded-full">
                    {offre.type_contrat}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{offre.description}</p>
                <button
                  onClick={() => setSelectedOffre(offre)}
                  className="bg-[#005DCB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition"
                >
                  Postuler
                </button>
              </div>
            ))}
            {offres.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
                Aucune offre d'emploi disponible actuellement
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Postuler;