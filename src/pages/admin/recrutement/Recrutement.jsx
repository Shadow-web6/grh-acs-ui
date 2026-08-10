import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const Recrutement = () => {
  const [offres, setOffres] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [offreOuverte, setOffreOuverte] = useState(null);
  const [showEntretienForm, setShowEntretienForm] = useState(null);

  const [form, setForm] = useState({
    titre: "", departement_id: "", description: "", type_contrat: "CDI",
    date_publication: new Date().toISOString().split("T")[0], date_limite: "",
  });
  const [entretienForm, setEntretienForm] = useState({ date_entretien: "", lieu: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [offRes, deptRes] = await Promise.all([
        api.get("/offres-emploi"),
        api.get("/departements"),
      ]);
      setOffres(offRes.data);
      setDepartements(deptRes.data);
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
      await api.post("/offres-emploi", form);
      toast.success("Offre créée");
      setShowForm(false);
      setForm({ titre: "", departement_id: "", description: "", type_contrat: "CDI", date_publication: new Date().toISOString().split("T")[0], date_limite: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleFermerOffre = async (id) => {
    if (!window.confirm("Fermer cette offre ?")) return;
    try {
      await api.put(`/offres-emploi/${id}`, { statut: "fermee" });
      toast.success("Offre fermée");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleChangerStatutCandidature = async (id, statut) => {
    try {
      await api.put(`/candidatures/${id}`, { statut });
      toast.success("Statut mis à jour");
      fetchData();
    } catch {
      toast.error("Erreur");
    }
  };

  const handleProgrammerEntretien = async (e, candidatureId) => {
    e.preventDefault();
    try {
      await api.post("/entretiens", { candidature_id: candidatureId, ...entretienForm });
      toast.success("Entretien programmé");
      setShowEntretienForm(null);
      setEntretienForm({ date_entretien: "", lieu: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const statutBadge = {
    recue: "bg-blue-50 text-[#129547]",
    en_entretien: "bg-amber-50 text-amber-600",
    acceptee: "bg-green-50 text-green-600",
    rejetee: "bg-red-50 text-red-600",
  };
  const statutLabel = { recue: "Reçue", en_entretien: "En entretien", acceptee: "Acceptée", rejetee: "Rejetée" };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Recrutement</h2>
          <p className="text-gray-500 text-sm">{offres.length} offre(s) d'emploi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition shadow-md"
        >
          {showForm ? "Annuler" : "+ Nouvelle offre"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-5">Nouvelle offre d'emploi</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })}
              placeholder="Titre du poste *" required
              className="md:col-span-2 bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
            />
            <select
              value={form.departement_id} onChange={e => setForm({ ...form, departement_id: e.target.value })} required
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
            >
              <option value="">Sélectionner un département *</option>
              {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
            <select
              value={form.type_contrat} onChange={e => setForm({ ...form, type_contrat: e.target.value })}
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]"
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Consultant">Consultant</option>
            </select>
            <textarea
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description du poste *" rows={4} required
              className="md:col-span-2 bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
            />
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date de publication</label>
              <input type="date" value={form.date_publication} onChange={e => setForm({ ...form, date_publication: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Date limite</label>
              <input type="date" value={form.date_limite} onChange={e => setForm({ ...form, date_limite: e.target.value })}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547]" />
            </div>
            <button type="submit" className="md:col-span-2 bg-[#129547] text-white py-3 rounded-xl font-medium hover:bg-[#0E7739] transition w-fit px-8">
              Publier l'offre
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {offres.map(offre => (
          <div key={offre.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOffreOuverte(offreOuverte === offre.id ? null : offre.id)}
              className="w-full p-5 text-left flex justify-between items-start hover:bg-gray-50 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-gray-900 font-bold">{offre.titre}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${offre.statut === "ouverte" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {offre.statut === "ouverte" ? "Ouverte" : "Fermée"}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{offre.departement?.nom} • {offre.type_contrat} • {offre.candidatures?.length || 0} candidature(s)</p>
              </div>
              <span className={`text-gray-400 transition-transform ${offreOuverte === offre.id ? "rotate-180" : ""}`}>▾</span>
            </button>

            {offreOuverte === offre.id && (
              <div className="border-t border-gray-100 p-5">
                <p className="text-gray-600 text-sm mb-4">{offre.description}</p>

                {offre.statut === "ouverte" && (
                  <button
                    onClick={() => handleFermerOffre(offre.id)}
                    className="text-xs text-red-500 hover:text-red-600 mb-5"
                  >
                    Fermer cette offre
                  </button>
                )}

                <h4 className="text-gray-900 font-semibold text-sm mb-3">Candidatures</h4>
                <div className="space-y-3">
                  {(offre.candidatures || []).map(cand => (
                    <div key={cand.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-gray-900 text-sm font-medium">{cand.nom_candidat}</p>
                          <p className="text-gray-500 text-xs">{cand.email_candidat} {cand.telephone_candidat && `• ${cand.telephone_candidat}`}</p>
                        </div>
                        <span className={`${statutBadge[cand.statut]} text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap`}>
                          {statutLabel[cand.statut]}
                        </span>
                      </div>
                      {cand.lettre_motivation && (
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2">{cand.lettre_motivation}</p>
                      )}

                      {(cand.entretiens || []).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {cand.entretiens.map(ent => (
                            <p key={ent.id} className="text-xs text-amber-600">
                              📅 Entretien le {ent.date_entretien} {ent.lieu && `— ${ent.lieu}`}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 flex-wrap">
                        {cand.statut === "recue" && (
                          <button
                            onClick={() => setShowEntretienForm(showEntretienForm === cand.id ? null : cand.id)}
                            className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                          >
                            Programmer entretien
                          </button>
                        )}
                        <button
                          onClick={() => handleChangerStatutCandidature(cand.id, "acceptee")}
                          className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleChangerStatutCandidature(cand.id, "rejetee")}
                          className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                        >
                          Rejeter
                        </button>
                      </div>

                      {showEntretienForm === cand.id && (
                        <form onSubmit={(e) => handleProgrammerEntretien(e, cand.id)} className="mt-3 pt-3 border-t border-gray-200 flex gap-2 flex-wrap">
                          <input
                            type="datetime-local"
                            value={entretienForm.date_entretien}
                            onChange={e => setEntretienForm({ ...entretienForm, date_entretien: e.target.value })}
                            required
                            className="bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#129547]"
                          />
                          <input
                            value={entretienForm.lieu}
                            onChange={e => setEntretienForm({ ...entretienForm, lieu: e.target.value })}
                            placeholder="Lieu"
                            className="bg-white border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#129547]"
                          />
                          <button type="submit" className="bg-[#129547] text-white px-3 py-2 rounded-lg text-xs font-medium">
                            Confirmer
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                  {(offre.candidatures || []).length === 0 && (
                    <p className="text-gray-500 text-sm">Aucune candidature reçue</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {offres.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucune offre d'emploi créée
          </div>
        )}
      </div>
    </div>
  );
};

export default Recrutement;