import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FileUp, Download, Trash2, FileText } from "lucide-react";

const MAX_TAILLE_OCTETS = 15 * 1024 * 1024; // 15 Mo
const FORMATS_ACCEPTES = ".xls,.xlsx,.csv,.doc,.docx,.pdf,.ppt,.pptx";
const MAX_FICHIERS = 2;

const storageUrl = (chemin) => {
  const base = api.defaults.baseURL.replace(/\/api\/?$/, "");
  return `${base}/storage/${chemin}`;
};

const MesDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fichier, setFichier] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [erreurTaille, setErreurTaille] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents-personnels");
      setDocuments(res.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setErreurTaille("");
    if (f && f.size > MAX_TAILLE_OCTETS) {
      setErreurTaille(
        `Ce fichier fait ${(f.size / (1024 * 1024)).toFixed(1)} Mo, ce qui dépasse la limite autorisée de 15 Mo. Merci de réduire la taille du fichier (compresser le PDF, retirer des images, etc.) avant de l'envoyer.`
      );
      setFichier(null);
      e.target.value = "";
      return;
    }
    setFichier(f || null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fichier) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("fichier", fichier);
      await api.post("/documents-personnels", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Fichier envoyé avec succès");
      setFichier(null);
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" de votre espace personnel ?`)) return;
    try {
      await api.delete(`/documents-personnels/${id}`);
      toast.success("Fichier supprimé");
      fetchDocuments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const espacePlein = documents.length >= MAX_FICHIERS;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Mes documents</h2>
      <p className="text-gray-500 text-sm mb-6">
        Espace personnel — {documents.length}/{MAX_FICHIERS} fichier(s). Formats acceptés : Excel, Word, PDF, PowerPoint (15 Mo max par fichier).
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        {espacePlein ? (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-4">
            Votre espace personnel est plein ({MAX_FICHIERS}/{MAX_FICHIERS}). Supprimez un fichier existant ci-dessous pour pouvoir en ajouter un nouveau.
          </p>
        ) : (
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept={FORMATS_ACCEPTES}
              onChange={handleFileChange}
              className="flex-1 text-sm text-gray-500 bg-white border border-gray-300 rounded-xl p-2.5 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 file:text-xs"
            />
            <button
              type="submit"
              disabled={!fichier || uploading}
              className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FileUp className="w-4 h-4" />
              {uploading ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        )}
        {erreurTaille && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl p-4 mt-3">{erreurTaille}</p>
        )}
      </div>

      <div className="space-y-3">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            
            <a  href={storageUrl(doc.chemin_fichier)}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-3 text-sm text-gray-900 hover:text-[#129547] min-w-0"
            >
              <FileText className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="truncate">{doc.nom_fichier}</span>
              <Download className="w-4 h-4 text-gray-400 shrink-0" />
            </a>
            <button
              onClick={() => handleDelete(doc.id, doc.nom_fichier)}
              className="text-red-500 hover:text-red-600 shrink-0 ml-3"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-2xl shadow-sm">
            Aucun document envoyé pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default MesDocuments;