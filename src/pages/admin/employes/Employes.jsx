import { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";

const Employes = () => {
  const [employes, setEmployes] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreDept, setFiltreDept] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
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
    fetchData();
  }, []);

  const filtered = employes.filter(e => filtreDept ? e.departement_id === parseInt(filtreDept) : true);

  const docTypeLabel = { cv: "CV", contrat: "Contrat", diplome: "Diplôme", piece_identite: "Pièce d'identité", autre: "Autre" };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Employés</h2>
        <p className="text-gray-500 text-sm">{filtered.length} employé(s) — Pour créer ou supprimer un compte, allez dans Utilisateurs</p>
      </div>

      <select
        value={filtreDept}
        onChange={e => setFiltreDept(e.target.value)}
        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-xl px-4 py-2.5 mb-6 focus:outline-none focus:border-[#005DCB]"
      >
        <option value="">Tous les départements</option>
        {departements.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(emp => (
          <button
            key={emp.id}
            onClick={() => setSelected(emp)}
            className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-[#005DCB]/40 hover:shadow-md transition shadow-sm"
          >
            <div className="w-10 h-10 bg-[#005DCB]/10 rounded-full flex items-center justify-center text-[#005DCB] font-bold text-sm mb-3">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-gray-900">{selected.user?.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700">✕</button>
            </div>
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
                  <a>
                    key={doc.id}
                    href={`http://127.0.0.1:8000/storage/${doc.chemin_fichier}`}
                    target="_blank" rel="noreferrer"
                    className="block text-xs text-[#005DCB] hover:underline mb-1"
                  
                    📎 {docTypeLabel[doc.type]} — {doc.nom_fichier}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Employes;