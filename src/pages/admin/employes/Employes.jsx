import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { X, Paperclip, Pencil } from "lucide-react";

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreDept, setFiltreDept] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const emptyForm = {
    prenom: "", nom: "", telephone: "", date_naissance: "", adresse: "",
    departement_id: "", poste: "", type_contrat: "CDI",
    date_embauche: "", date_fin_contrat: "", salaire: "",
    jours_conge_annuels: 18, notes: "",
    cv: null, contrat: null,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get("/employes", { params: { role: "employe" } }),
        api.get("/departements"),
      ]);
      setEmployes(empRes.data);
      setDepartements(deptRes.data);
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
      formData.append("role", "employe");
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") formData.append(key, value);
      });

      const res = await api.post("/employes", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.identifiants_a_definir) {
        toast.success("Employé créé. Un administrateur doit encore définir son email et son mot de passe.");
      } else {
        toast.success("Employé créé avec succès");
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

  const ouvrirEdition = (emp) => {
    setEditForm({
      name: emp.user?.name || "",
      email: emp.user?.email || "",
      telephone: emp.user?.telephone || "",
      poste: emp.poste || "",
      departement_id: emp.departement_id || "",
      type_contrat: emp.type_contrat || "CDI",
      salaire: emp.salaire || "",
      jours_conge_annuels: emp.jours_conge_annuels || "",
    });
    setEditMode(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await api.put(`/utilisateurs/${selected.id}`, editForm);
      toast.success("Employé modifié avec succès");
      setEditMode(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setEditSubmitting(false);
    }
  };

  const filtered = employes.filter(e => filtreDept ? e.departement_id === parseInt(filtreDept) : true);

  const docTypeLabel = { cv: "CV", contrat: "Contrat", diplome: "Diplôme", piece_identite: "Pièce d'identité", autre: "Autre" };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Employés</h2>
          <p className="text-gray-500 text-sm">
            {filtered.length} employé(s)
            {!showForm && " — L'email et le mot de passe seront définis par un administrateur"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Nouvel employé"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-5">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de naissance</label>
                <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
              </div>
              <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400 md:col-span-2" />
            </div>

            <h3 className="text-gray-900 font-semibold mb-5">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="departement_id" value={form.departement_id} onChange={handleChange} required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]">
                <option value="">Sélectionner un département *</option>
                {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              <input name="poste" value={form.poste} onChange={handleChange} placeholder="Poste"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <select name="type_contrat" value={form.type_contrat} onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]">
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Consultant">Consultant</option>
              </select>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date d'embauche</label>
                <input name="date_embauche" type="date" value={form.date_embauche} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date fin contrat</label>
                <input name="date_fin_contrat" type="date" value={form.date_fin_contrat} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
              </div>
              <input name="salaire" type="number" value={form.salaire} onChange={handleChange} placeholder="Salaire (FCFA)"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jours de congé annuels</label>
                <input name="jours_conge_annuels" type="number" value={form.jours_conge_annuels} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
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
                  <label className="text-xs text-gray-500 mb-2 block">Contrat (PDF)</label>
                  <input name="contrat" type="file" accept="application/pdf" onChange={handleChange}
                    className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-gray-900 font-semibold mb-4">Notes</h3>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
                placeholder="Observations..."
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700">
              L'email et le mot de passe de connexion de cet employé seront définis par un administrateur, depuis la gestion des utilisateurs.
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#129547] text-white py-3 rounded-xl font-medium hover:bg-[#0E7739] transition shadow-md disabled:opacity-50"
            >
              {submitting ? "Création..." : "Créer l'employé"}
            </button>
          </div>
        </form>
      )}

      <select
        value={filtreDept}
        onChange={e => setFiltreDept(e.target.value)}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 mb-6 focus:outline-none focus:border-[#129547]"
      >
        <option value="">Tous les départements</option>
        {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <button
            key={emp.id}
            onClick={() => setSelected(emp)}
            className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-[#129547]/40 hover:shadow-md transition shadow-sm"
          >
            <div className="w-10 h-10 bg-[#129547]/10 rounded-full flex items-center justify-center text-[#129547] font-bold text-sm mb-3">
              {emp.user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <h3 className="text-gray-900 font-semibold">{emp.user?.name}</h3>
            <p className="text-gray-500 text-sm">{emp.poste || "-"}</p>
            <p className="text-gray-400 text-xs mt-1">{emp.departement?.nom}</p>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun employé trouvé
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
                  <button onClick={() => ouvrirEdition(selected)} className="text-[#129547] hover:underline text-xs font-medium flex items-center gap-1">
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
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
                  <input value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Département</label>
                  <select value={editForm.departement_id} onChange={e => setEditForm({ ...editForm, departement_id: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]">
                    {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Poste</label>
                  <input value={editForm.poste} onChange={e => setEditForm({ ...editForm, poste: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Type de contrat</label>
                  <select value={editForm.type_contrat} onChange={e => setEditForm({ ...editForm, type_contrat: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]">
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Salaire (FCFA)</label>
                  <input type="number" value={editForm.salaire} onChange={e => setEditForm({ ...editForm, salaire: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Jours de congé annuels</label>
                  <input type="number" value={editForm.jours_conge_annuels} onChange={e => setEditForm({ ...editForm, jours_conge_annuels: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <p className="text-xs text-gray-400">L'email et le mot de passe se modifient uniquement depuis la gestion des utilisateurs (Admin).</p>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={editSubmitting}
                    className="bg-[#129547] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50">
                    {editSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button type="button" onClick={() => setEditMode(false)}
                    className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Matricule</span><span className="text-gray-900">{selected.matricule}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-900">{selected.user?.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="text-gray-900">{selected.user?.telephone || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Département</span><span className="text-gray-900">{selected.departement?.nom}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Poste</span><span className="text-gray-900">{selected.poste || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Contrat</span><span className="text-gray-900">{selected.type_contrat || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Embauché le</span><span className="text-gray-900">{selected.date_embauche || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Congés annuels</span><span className="text-gray-900">{selected.jours_conge_annuels || "-"} jours</span></div>
                </div>

                {selected.documents?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <p className="text-gray-900 text-sm font-medium mb-2">Documents</p>
                    {selected.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={`http://127.0.0.1:8000/storage/${doc.chemin_fichier}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#129547] hover:underline mb-1"
                      >
                        <Paperclip className="w-3 h-3" />
                        {docTypeLabel[doc.type]} — {doc.nom_fichier}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;