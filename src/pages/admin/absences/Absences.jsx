import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const Absences = () => {
  const [demandes, setDemandes] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [commentaire, setCommentaire] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    employe_id: "", type: "conge", date_debut: "", date_fin: "",
    heure_debut: "", heure_fin: "", motif: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demRes, empRes] = await Promise.all([
        api.get("/demandes"),
        api.get("/employes"),
      ]);
      setDemandes(demRes.data);
      setEmployes(empRes.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/demandes", form);
      toast.success("Demande créée");
      setForm({ employe_id: "", type: "conge", date_debut: "", date_fin: "", heure_debut: "", heure_fin: "", motif: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleTraiter = async (id, statut) => {
    try {
      await api.post(`/demandes/${id}/traiter`, {
        statut,
        commentaire: selectedId === id ? commentaire : ""
      });
      toast.success(`Demande ${statut === "approuvee" ? "approuvée" : "rejetée"}`);
      setSelectedId(null);
      setCommentaire("");
      fetchData();
    } catch {
      toast.error("Erreur lors du traitement");
    }
  };

  const statutBadge = {
    en_attente: "bg-amber-50 text-amber-600",
    approuvee: "bg-green-50 text-green-600",
    rejetee: "bg-red-50 text-red-600",
  };
  const statutLabel = { en_attente: "En attente", approuvee: "Approuvée", rejetee: "Rejetée" };
  const typeLabel = { conge: "Congé", permission: "Permission" };

  const filtered = demandes.filter(d => filtreStatut === "tous" ? true : d.statut === filtreStatut);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Absences</h2>
          <p className="text-gray-500 text-sm">{filtered.length} demande(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#005DCB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Nouvelle demande"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["tous", "en_attente", "approuvee", "rejetee"].map(s => (
          <button
            key={s}
            onClick={() => setFiltreStatut(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${filtreStatut === s ? "bg-[#005DCB] text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            {s === "tous" ? "Tous" : statutLabel[s]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-5">Nouvelle demande d'absence</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={form.employe_id}
              onChange={e => setForm({ ...form, employe_id: e.target.value })}
              required
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]"
            >
              <option value="">Sélectionner un employé *</option>
              {employes.map(e => (
                <option key={e.id} value={e.id}>{e.user?.name} — {e.departement?.nom}</option>
              ))}
            </select>

            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]"
            >
              <option value="conge">Congé</option>
              <option value="permission">Permission</option>
            </select>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de début *</label>
              <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} required
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de fin</label>
              <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
            </div>

            {form.type === "permission" && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Heure de début</label>
                  <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Heure de fin</label>
                  <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
              </>
            )}

            <textarea
              value={form.motif}
              onChange={e => setForm({ ...form, motif: e.target.value })}
              placeholder="Motif de l'absence..."
              rows={3}
              className="md:col-span-2 bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
            />

            <button
              type="submit"
              className="md:col-span-2 bg-[#005DCB] text-white py-3 rounded-xl font-medium hover:bg-[#004BA8] transition w-fit px-8"
            >
              Soumettre la demande
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(demande => (
          <div key={demande.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900 font-semibold">{demande.employe?.user?.name}</h3>
                  <span className="text-xs text-gray-400">— {demande.employe?.departement?.nom}</span>
                </div>
                <p className="text-sm text-gray-500">
                  {typeLabel[demande.type]} • {demande.date_debut}
                  {demande.date_fin && ` → ${demande.date_fin}`}
                  {demande.heure_debut && ` • ${demande.heure_debut} - ${demande.heure_fin}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">{demande.motif}</p>
              </div>
              <span className={`${statutBadge[demande.statut]} text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap`}>
                {statutLabel[demande.statut]}
              </span>
            </div>

            {demande.statut === "en_attente" && (
              <div className="border-t border-gray-100 pt-4 mt-3">
                <textarea
                  placeholder="Commentaire (optionnel)..."
                  value={selectedId === demande.id ? commentaire : ""}
                  onFocus={() => setSelectedId(demande.id)}
                  onChange={e => setCommentaire(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTraiter(demande.id, "approuvee")}
                    className="bg-green-50 text-green-600 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => handleTraiter(demande.id, "rejetee")}
                    className="bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    ✕ Rejeter
                  </button>
                </div>
              </div>
            )}

            {demande.commentaire && (
              <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                💬 {demande.commentaire}
              </p>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucune demande trouvée
          </div>
        )}
      </div>
    </div>
  );
};

export default Absences;