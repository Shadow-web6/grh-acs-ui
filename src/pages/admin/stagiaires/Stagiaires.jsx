import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { X, Pencil } from "lucide-react";

const Stagiaires = () => {
  const [stagiaires, setStagiaires] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [travaux, setTravaux] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const emptyForm = {
    prenom: "", nom: "", telephone: "", date_naissance: "", adresse: "",
    departement_id: "", poste: "", ecole_origine: "",
    date_embauche: "", date_fin_contrat: "", notes: "",
    cv: null, contrat: null,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stagRes, travRes, deptRes] = await Promise.all([
        api.get("/employes", { params: { role: "stagiaire" } }),
        api.get("/travaux-stagiaire"),
        api.get("/departements"),
      ]);
      setStagiaires(stagRes.data);
      setDepartements(deptRes.data);

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

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("role", "stagiaire");
      formData.append("type_contrat", "Stage");
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") formData.append(key, value);
      });

      const res = await api.post("/employes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.identifiants_a_definir) {
        toast.success("Stagiaire créé. Un administrateur doit encore définir son email et son mot de passe.");
      } else {
        toast.success("Stagiaire créé avec succès");
      }
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const ouvrirEdition = (stag) => {
    setEditForm({
      name: stag.user?.name || "",
      telephone: stag.user?.telephone || "",
      poste: stag.poste || "",
      departement_id: stag.departement_id || "",
      date_embauche: stag.date_embauche || "",
      date_fin_contrat: stag.date_fin_contrat || "",
    });
    setEditMode(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await api.put(`/utilisateurs/${selected.id}`, editForm);
      toast.success("Stagiaire modifié avec succès");
      setEditMode(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Stagiaires</h2>
          <p className="text-gray-500 text-sm">
            {stagiaires.length} stagiaire(s) — Suivi des travaux journaliers
            {!showForm && " · L'email et le mot de passe seront définis par un administrateur"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#005DCB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Nouveau stagiaire"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-5">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
              <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de naissance</label>
                <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
              </div>
              <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400 md:col-span-2" />
            </div>

            <h3 className="text-gray-900 font-semibold mb-5">Informations de stage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="departement_id" value={form.departement_id} onChange={handleChange} required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]">
                <option value="">Sélectionner un département *</option>
                {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              <input name="poste" value={form.poste} onChange={handleChange} placeholder="Poste / mission"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
              <input name="ecole_origine" value={form.ecole_origine} onChange={handleChange} placeholder="École d'origine"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de début de stage</label>
                <input name="date_embauche" type="date" value={form.date_embauche} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de fin de stage</label>
                <input name="date_fin_contrat" type="date" value={form.date_fin_contrat} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4">Documents</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">CV (PDF)</label>
                  <input name="cv" type="file" accept="application/pdf" onChange={handleChange}
                    className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Convention de stage (PDF)</label>
                  <input name="contrat" type="file" accept="application/pdf" onChange={handleChange}
                    className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4">Notes</h3>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
                placeholder="Observations..."
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#005DCB] placeholder-gray-400" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700">
              L'email et le mot de passe de connexion de ce stagiaire seront définis par un administrateur, depuis la gestion des utilisateurs.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#005DCB] text-white py-3 rounded-xl font-medium hover:bg-[#004BA8] transition shadow-md disabled:opacity-50"
            >
              {submitting ? "Création..." : "Créer le stagiaire"}
            </button>
          </div>
        </form>
      )}

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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setEditMode(false); }}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-gray-900">{selected.user?.name}</h3>
              <div className="flex items-center gap-3">
                {!editMode && (
                  <button onClick={() => ouvrirEdition(selected)} className="text-[#005DCB] hover:underline text-xs font-medium flex items-center gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Modifier
                  </button>
                )}
                <button onClick={() => { setSelected(null); setEditMode(false); }} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nom complet</label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
                  <input value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Département</label>
                  <select value={editForm.departement_id} onChange={e => setEditForm({ ...editForm, departement_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]">
                    {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Poste / mission</label>
                  <input value={editForm.poste} onChange={e => setEditForm({ ...editForm, poste: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Début du stage</label>
                  <input type="date" value={editForm.date_embauche} onChange={e => setEditForm({ ...editForm, date_embauche: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fin du stage</label>
                  <input type="date" value={editForm.date_fin_contrat} onChange={e => setEditForm({ ...editForm, date_fin_contrat: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#005DCB]" />
                </div>
                <p className="text-xs text-gray-400">L'email et le mot de passe se modifient uniquement depuis la gestion des utilisateurs (Admin).</p>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editSubmitting}
                    className="bg-[#005DCB] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition disabled:opacity-50">
                    {editSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Matricule</span><span className="text-gray-900">{selected.matricule}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{selected.user?.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Département</span><span className="text-gray-900">{selected.departement?.nom}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Début stage</span><span className="text-gray-900">{selected.date_embauche || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fin stage</span><span className="text-gray-900">{selected.date_fin_contrat || "-"}</span></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stagiaires;