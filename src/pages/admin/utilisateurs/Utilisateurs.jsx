import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const roleLabel = { admin: "Admin", drh: "DRH", directeur: "Directeur", employe: "Employé", stagiaire: "Stagiaire" };
const roleBadge = {
  admin: "bg-red-50 text-red-600",
  drh: "bg-purple-50 text-purple-600",
  directeur: "bg-cyan-50 text-cyan-600",
  employe: "bg-green-50 text-green-600",
  stagiaire: "bg-amber-50 text-amber-600",
};

const Utilisateurs = () => {
  const [comptes, setComptes] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filtreRole, setFiltreRole] = useState("tous");
  const [permissionsPanel, setPermissionsPanel] = useState(null);
  const [permissionsUtilisateur, setPermissionsUtilisateur] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [editPanel, setEditPanel] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFiles, setEditFiles] = useState({ cv: null, contrat: null });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", role: "employe",
    telephone: "", date_naissance: "", adresse: "",
    departement_id: "", poste: "", type_contrat: "CDI",
    date_embauche: "", date_fin_contrat: "", salaire: "",
    jours_conge_annuels: 18, notes: "",
    cv: null, contrat: null,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, deptRes] = await Promise.all([
        api.get("/utilisateurs"),
        api.get("/departements"),
      ]);
      setComptes(compRes.data);
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

  const ouvrirEdit = (compte) => {
    setEditPanel(compte);
    setEditFiles({ cv: null, contrat: null });
    setEditForm({
      name: compte.user?.name || "",
      email: compte.user?.email || "",
      telephone: compte.user?.telephone || "",
      role: compte.user?.role || "",
      password: "",
      poste: compte.poste || "",
      departement_id: compte.departement_id || "",
      type_contrat: compte.type_contrat || "",
      salaire: compte.salaire || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.entries(editForm).forEach(([key, value]) => {
        if (key === "password" && !value) return; // n'envoie pas si vide
        if (value !== null && value !== undefined && value !== "") formData.append(key, value);
      });
      if (editFiles.cv) formData.append("cv", editFiles.cv);
      if (editFiles.contrat) formData.append("contrat", editFiles.contrat);

      await api.post(`/utilisateurs/${editPanel.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Compte modifié avec succès");
      setEditPanel(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") formData.append(key, value);
      });

      await api.post("/utilisateurs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Compte créé avec succès");
      setShowForm(false);
      setForm({
        prenom: "", nom: "", email: "", password: "", role: "employe",
        telephone: "", date_naissance: "", adresse: "",
        departement_id: "", poste: "", type_contrat: "CDI",
        date_embauche: "", date_fin_contrat: "", salaire: "",
        jours_conge_annuels: 18, notes: "",
        cv: null, contrat: null,
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, nom) => {
    const confirme = window.confirm(
      `⚠️ Suppression DÉFINITIVE du compte de ${nom}.\n\n` +
      `Toutes ses données disparaîtront pour toujours : historique de présences, demandes de congés/permissions, documents (CV, contrat, rapports), et tout le reste lié à ce compte.\n\n` +
      `Cette action est IRRÉVERSIBLE et ne peut pas être annulée.\n\n` +
      `Si vous souhaitez seulement empêcher cette personne de se connecter tout en gardant son historique, utilisez plutôt "Désactiver".\n\n` +
      `Confirmez-vous la suppression définitive ?`
    );
    if (!confirme) return;
    try {
      await api.delete(`/utilisateurs/${id}`);
      toast.success("Compte supprimé");
      fetchData();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleStatut = async (compte) => {
    const estActif = compte.user?.statut !== "inactif";
    const nom = compte.user?.name;
    const message = estActif
      ? `Désactiver le compte de ${nom} ?\n\n` +
        `Il ne pourra plus se connecter ni pointer sa présence tant que le compte reste désactivé.\n` +
        `Toutes ses données (présences, congés, documents) sont conservées, et le compte peut être réactivé à tout moment.`
      : `Réactiver le compte de ${nom} ?\n\n` +
        `Il pourra de nouveau se connecter et pointer sa présence normalement.`;

    if (!window.confirm(message)) return;

    setToggling(compte.id);
    try {
      await api.put(`/utilisateurs/${compte.id}`, { statut: estActif ? "inactif" : "actif" });
      toast.success(estActif ? "Compte désactivé" : "Compte réactivé");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du changement de statut");
    } finally {
      setToggling(null);
    }
  };

  const modules = [
  { key: "absences", label: "Absences (traitement)" },
  { key: "scanner", label: "Scanner présence" },
  { key: "historique_presence", label: "Historique présences" },
  { key: "travaux_stagiaire", label: "Travaux stagiaires" },
  { key: "recrutement", label: "Recrutement" },
  ];

  const ouvrirPermissions = async (compte) => {
    setPermissionsPanel(compte);
    setLoadingPerms(true);
    try {
      const res = await api.get(`/permissions/${compte.user?.id}`);
      setPermissionsUtilisateur(res.data);
    } catch {
      toast.error("Erreur de chargement des permissions");
    } finally {
      setLoadingPerms(false);
    }
  };

  const togglePermission = async (userId, module, estActive) => {
    try {
      if (estActive) {
        await api.delete("/permissions", { data: { user_id: userId, module } });
        setPermissionsUtilisateur(prev => prev.filter(p => p !== module));
        toast.success("Permission retirée");
      } else {
        await api.post("/permissions", { user_id: userId, module });
        setPermissionsUtilisateur(prev => [...prev, module]);
        toast.success("Permission accordée");
      }
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const filtered = comptes.filter(c => filtreRole === "tous" ? true : c.user?.role === filtreRole);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Gestion des utilisateurs</h2>
          <p className="text-gray-500 text-sm">{filtered.length} compte(s) — Création, modification, suppression</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Nouveau compte"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["tous", "admin", "drh", "directeur", "employe", "stagiaire"].map(r => (
          <button
            key={r}
            onClick={() => setFiltreRole(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
              ${filtreRole === r ? "bg-[#129547] text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-gray-800"}`}
          >
            {r === "tous" ? "Tous" : roleLabel[r]}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-5">👤 Informations du compte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mot de passe *" required
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Téléphone"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              <select name="role" value={form.role} onChange={handleChange}
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]">
                <option value="employe">Employé</option>
                <option value="stagiaire">Stagiaire</option>
                <option value="directeur">Directeur</option>
                <option value="drh">DRH</option>
                <option value="admin">Admin</option>
              </select>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date de naissance</label>
                <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
              </div>
              <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse"
                className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
            </div>

            <h3 className="text-gray-900 font-semibold mb-5">💼 Informations professionnelles</h3>
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
                <option value="Stage">Stage</option>
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
              <h3 className="text-gray-900 font-semibold mb-4">📎 Documents</h3>
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
              <h3 className="text-gray-900 font-semibold mb-4">📝 Notes</h3>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={4}
                placeholder="Observations..."
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#129547] text-white py-3 rounded-xl font-medium hover:bg-[#0E7739] transition shadow-md disabled:opacity-50"
            >
              {submitting ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Nom</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Email</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Département</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Rôle</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Statut</th>
                <th className="px-5 py-3 text-left text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const estActif = c.user?.statut !== "inactif";
                return (
                <tr key={c.id} className={`border-t border-gray-100 hover:bg-gray-50 ${!estActif ? "opacity-60" : ""}`}>
                  <td className="px-5 py-4 text-gray-900 font-medium">{c.user?.name}</td>
                  <td className="px-5 py-4 text-gray-500">{c.user?.email}</td>
                  <td className="px-5 py-4 text-gray-500">{c.departement?.nom}</td>
                  <td className="px-5 py-4">
                    <span className={`${roleBadge[c.user?.role]} text-xs font-medium px-2.5 py-1 rounded-full`}>
                      {roleLabel[c.user?.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estActif ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                      {estActif ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => ouvrirEdit(c)}
                        className="text-[#129547] hover:underline text-xs font-medium"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => ouvrirPermissions(c)}
                        className="text-gray-500 hover:underline text-xs font-medium"
                      >
                        Accès
                      </button>
                      <button
                        onClick={() => handleToggleStatut(c)}
                        disabled={toggling === c.id}
                        className={`text-xs font-medium disabled:opacity-50 ${estActif ? "text-amber-600 hover:text-amber-700" : "text-green-600 hover:text-green-700"}`}
                      >
                        {estActif ? "Désactiver" : "Réactiver"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.user?.name)}
                        className="text-red-500 hover:text-red-600 text-xs font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-gray-500">Aucun compte trouvé</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setEditPanel(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold text-gray-900">Modifier le compte</h3>
              <button onClick={() => setEditPanel(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nom complet</label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Téléphone</label>
                  <input value={editForm.telephone} onChange={e => setEditForm({ ...editForm, telephone: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Rôle</label>
                  <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]">
                    <option value="employe">Employé</option>
                    <option value="stagiaire">Stagiaire</option>
                    <option value="directeur">Directeur</option>
                    <option value="drh">DRH</option>
                    <option value="admin">Admin</option>
                  </select>
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
                    <option value="Stage">Stage</option>
                    <option value="Consultant">Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Salaire (FCFA)</label>
                  <input type="number" value={editForm.salaire} onChange={e => setEditForm({ ...editForm, salaire: e.target.value })}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Remplacer le CV (PDF)</label>
                  <input type="file" accept="application/pdf"
                    onChange={e => setEditFiles({ ...editFiles, cv: e.target.files[0] })}
                    className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Remplacer le contrat (PDF)</label>
                  <input type="file" accept="application/pdf"
                    onChange={e => setEditFiles({ ...editFiles, contrat: e.target.files[0] })}
                    className="w-full text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Nouveau mot de passe <span className="text-gray-400">(laisser vide pour ne pas changer)</span>
                </label>
                <input type="password" value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editSubmitting}
                  className="bg-[#129547] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50">
                  {editSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
                <button type="button" onClick={() => setEditPanel(null)}
                  className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {permissionsPanel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setPermissionsPanel(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Gérer les accès</h3>
              <p className="text-sm text-gray-500">{permissionsPanel.user?.name}</p>
            </div>
            <button onClick={() => setPermissionsPanel(null)} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>

          {loadingPerms ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#129547]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-4">
                Ces permissions s'ajoutent aux droits standard du rôle 
                <span className="font-medium text-gray-600"> {permissionsPanel.user?.role}</span>.
              </p>
              {modules.map(module => {
                const estActive = permissionsUtilisateur.includes(module.key);
                return (
                  <div key={module.key}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{module.label}</span>
                    <button
                      onClick={() => togglePermission(permissionsPanel.user?.id, module.key, estActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${estActive ? "bg-[#129547]" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${estActive ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
};

export default Utilisateurs;