import { useState, useEffect } from "react";
import api from "../../api/axios";

const MonProfil = () => {
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/me").then(res => {
      if (res.data.employe?.id) {
        api.get(`/employes/${res.data.employe.id}`).then(r => setEmploye(r.data));
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  if (!employe) return (
    <div className="text-center py-12 text-gray-500">Profil introuvable</div>
  );

  const docTypeLabel = { cv: "CV", contrat: "Contrat", diplome: "Diplôme", piece_identite: "Pièce d'identité", autre: "Autre" };

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h2>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-gray-900 font-semibold mb-4">Informations personnelles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500 mb-1">Nom complet</p><p className="text-gray-900">{employe.user?.name}</p></div>
          <div><p className="text-gray-500 mb-1">Email</p><p className="text-gray-900">{employe.user?.email}</p></div>
          <div><p className="text-gray-500 mb-1">Téléphone</p><p className="text-gray-900">{employe.user?.telephone || "-"}</p></div>
          <div><p className="text-gray-500 mb-1">Adresse</p><p className="text-gray-900">{employe.adresse || "-"}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <h3 className="text-gray-900 font-semibold mb-4">Informations professionnelles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500 mb-1">Matricule</p><p className="text-gray-900">{employe.matricule}</p></div>
          <div><p className="text-gray-500 mb-1">Département</p><p className="text-gray-900">{employe.departement?.nom}</p></div>
          <div><p className="text-gray-500 mb-1">Poste</p><p className="text-gray-900">{employe.poste || "-"}</p></div>
          <div><p className="text-gray-500 mb-1">Type de contrat</p><p className="text-gray-900">{employe.type_contrat || "-"}</p></div>
          <div><p className="text-gray-500 mb-1">Date d'embauche</p><p className="text-gray-900">{employe.date_embauche || "-"}</p></div>
          <div><p className="text-gray-500 mb-1">Jours de congé annuels</p><p className="text-gray-900">{employe.jours_conge_annuels || "-"}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-gray-900 font-semibold mb-4">Mes documents</h3>
        {employe.documents?.length > 0 ? (
          <div className="space-y-2">
            {employe.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-700">📎 {docTypeLabel[doc.type]} — {doc.nom_fichier}</span>
                <a>
                  href={`http://127.0.0.1:8000/storage/${doc.chemin_fichier}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#005DCB] hover:underline"
                
                  Voir
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Aucun document disponible. Contactez la DRH pour en ajouter.</p>
        )}
      </div>
    </div>
  );
};

export default MonProfil;