import { useState, useEffect } from "react";
import api from "../../api/axios";

const OffresEmploi = () => {
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/offres-emploi")
      .then(res => setOffres(res.data.filter(o => o.statut === "ouverte")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Offres d'emploi</h2>
      <p className="text-gray-500 text-sm mb-6">Opportunités de mobilité interne ouvertes</p>

      <div className="space-y-4">
        {offres.map(offre => (
          <div key={offre.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-900 font-bold">{offre.titre}</h3>
              <span className="bg-blue-50 text-[#129547] text-xs font-medium px-2.5 py-1 rounded-full">
                {offre.type_contrat}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{offre.departement?.nom}</p>
            <p className="text-gray-600 text-sm">{offre.description}</p>
          </div>
        ))}
        {offres.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucune offre ouverte actuellement
          </div>
        )}
      </div>
    </div>
  );
};

export default OffresEmploi;