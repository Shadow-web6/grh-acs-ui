import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Users, Pencil } from "lucide-react";

const couleurs = [
  { bord: "border-l-[#129547]", badge: "bg-blue-50 text-[#129547]" },
  { bord: "border-l-cyan-500", badge: "bg-cyan-50 text-cyan-600" },
  { bord: "border-l-green-500", badge: "bg-green-50 text-green-600" },
  { bord: "border-l-amber-500", badge: "bg-amber-50 text-amber-600" },
  { bord: "border-l-purple-500", badge: "bg-purple-50 text-purple-600" },
  { bord: "border-l-pink-500", badge: "bg-pink-50 text-pink-600" },
  { bord: "border-l-orange-500", badge: "bg-orange-50 text-orange-600" },
];

const Departements = ({ basePath = "/admin", role = "admin" }) => {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nom: "", description: "" });
  const navigate = useNavigate();

  const fetchDepartements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departements");
      setDepartements(res.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/departements/${editId}`, form);
        toast.success("Département modifié");
      } else {
        await api.post("/departements", form);
        toast.success("Département créé");
      }
      setForm({ nom: "", description: "" });
      setEditId(null);
      setShowForm(false);
      fetchDepartements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const handleEdit = (dept) => {
    setEditId(dept.id);
    setForm({ nom: dept.nom, description: dept.description || "" });
    setShowForm(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Départements</h2>
          <p className="text-gray-500 text-sm">{departements.length} départements configurés</p>
        </div>
        {role !== "drh" && (
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ nom: "", description: "" }); }}
            className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition shadow-md"
          >
            {showForm ? "Annuler" : "+ Nouveau département"}
          </button>
        )}
      </div>

      {showForm && role !== "drh" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="text-gray-900 font-semibold mb-4">
            {editId ? "Modifier le département" : "Nouveau département"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Nom du département"
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
              required
            />
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              rows={2}
              className="bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#129547] placeholder-gray-400"
            />
            <button
              type="submit"
              className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition w-fit"
            >
              {editId ? "Modifier" : "Créer"}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departements.map((dept, i) => {
          const couleur = couleurs[i % couleurs.length];
          const nbEmployes = dept.employes?.length || 0;
          return (
            <div
              key={dept.id}
              className={`bg-white border border-gray-200 ${couleur.bord} border-l-4 rounded-2xl p-5 shadow-sm`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-gray-900 font-bold text-lg">{dept.nom}</h3>
                <span className={`${couleur.badge} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                  {nbEmployes}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-[2.5rem]">
                {dept.description || "Aucune description"}
              </p>

              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-500">Employés</span>
                <span className="text-gray-700 font-medium">{nbEmployes}</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`${basePath}/employes?departement=${dept.id}`)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Voir les employés
                </button>
                <button
                  onClick={() => handleEdit(dept)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 rounded-lg transition flex items-center justify-center"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {departements.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun département trouvé
          </div>
        )}
      </div>
    </div>
  );
};

export default Departements;