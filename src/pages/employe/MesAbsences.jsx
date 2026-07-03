import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

const MesAbsences = () => {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employeId, setEmployeId] = useState(null);

  const [form, setForm] = useState({
    type: "conge", date_debut: "", date_fin: "",
    heure_debut: "", heure_fin: "", motif: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [demRes, meRes] = await Promise.all([
        api.get("/demandes"),
        api.get("/me"),
      ]);
      setDemandes(demRes.data);
      setEmployeId(meRes.data.employe?.id);
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
      await api.post("/demandes", { ...form, employe_id: employeId });
      toast.success("Demande envoyée");
      setForm({ type: "conge", date_debut: "", date_fin: "", heure_debut: "", heure_fin: "", motif: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  const statutBadge = {
    en_attente: "bg-amber-50 text-amber-600",
    approuvee: "bg-green-50 text-green-600",
    rejetee: "bg-red-50 text-red-600",
  };
  const statutLabel = { en_attente: "En attente", approuvee: "Approuvée", rejetee: "Rejetée" };
  const typeLabel = { conge: "Congé", permission: "Permission" };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Mes absences</h2>
          <p className="text-gray-500 text-sm">{demandes.length} demande(s)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#005DCB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Effectuer une demande"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]"
            >
              <option value="conge">Congé</option>
              <option value="permission">Permission</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="date" value={form.date_debut} onChange={e => setForm({ ...form, date_debut: e.target.value })} required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
              <input type="date" value={form.date_fin} onChange={e => setForm({ ...form, date_fin: e.target.value })}
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
            </div>

            {form.type === "permission" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="time" value={form.heure_debut} onChange={e => setForm({ ...form, heure_debut: e.target.value })}
                  className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
                <input type="time" value={form.heure_fin} onChange={e => setForm({ ...form, heure_fin: e.target.value })}
                  className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
              </div>
            )}

            <textarea
              value={form.motif}
              onChange={e => setForm({ ...form, motif: e.target.value })}
              placeholder="Motif de l'absence..."
              rows={3}
              required
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400"
            />

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#005DCB] text-white py-3 rounded-xl font-medium hover:bg-[#004BA8] transition w-fit px-8 disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Soumettre la demande"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {demandes.map(demande => (
          <div key={demande.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="text-gray-900 font-medium">{typeLabel[demande.type]}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {demande.date_debut}{demande.date_fin && ` → ${demande.date_fin}`}
                  {demande.heure_debut && ` • ${demande.heure_debut} - ${demande.heure_fin}`}
                </p>
                <p className="text-sm text-gray-500 mt-1">{demande.motif}</p>
                {demande.commentaire && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-2.5 rounded-lg mt-2">
                    💬 {demande.commentaire}
                  </p>
                )}
              </div>
              <span className={`${statutBadge[demande.statut]} text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap`}>
                {statutLabel[demande.statut]}
              </span>
            </div>
          </div>
        ))}

        {demandes.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucune demande pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default MesAbsences;