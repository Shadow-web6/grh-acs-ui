import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Printer, RefreshCw, X } from "lucide-react";
import QRCode from "qrcode";

const QrCodeGlobal = () => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    limite_arrivee_employe: "08:30",
    limite_arrivee_stagiaire: "08:00",
    blocage_depart_debut: "09:00",
    blocage_depart_fin: "18:30",
    latitude: "",
    longitude: "",
    rayon_metres: 30,
  });
  const canvasRef = useRef(null);

  const fetchQr = async () => {
    setLoading(true);
    try {
      const res = await api.get("/qr-global");
      setQr(res.data);
    } catch {
      toast.error("Erreur de chargement du QR Code global");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQr(); }, []);

  useEffect(() => {
    if (qr && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qr.code, { width: 280, margin: 2 });
    }
  }, [qr]);

  const ouvrirFormulaire = () => {
    if (qr) {
      setForm({
        limite_arrivee_employe: qr.limite_arrivee_employe?.slice(0, 5) || "08:30",
        limite_arrivee_stagiaire: qr.limite_arrivee_stagiaire?.slice(0, 5) || "08:00",
        blocage_depart_debut: qr.blocage_depart_debut?.slice(0, 5) || "09:00",
        blocage_depart_fin: qr.blocage_depart_fin?.slice(0, 5) || "18:30",
        latitude: qr.latitude ?? "",
        longitude: qr.longitude ?? "",
        rayon_metres: qr.rayon_metres ?? 30,
      });
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.confirm(
      "Régénérer le QR Code global rendra l'ancien (déjà imprimé/affiché) inutilisable. Vous devrez réimprimer et réafficher le nouveau. Confirmez-vous ?"
    )) return;

    setRegenerating(true);
    try {
      const res = await api.post("/qr-global/regenerer", form);
      setQr(res.data.qr);
      setShowForm(false);
      toast.success("QR Code global régénéré — pensez à réimprimer l'affiche");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la régénération");
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#129547]"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">QR Code global de présence</h2>
        <p className="text-gray-500 text-sm">
          Affiche unique à imprimer et installer à l'entrée. Chaque employé/stagiaire le scanne avec son propre compte pour pointer arrivée ou départ.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-700">
        Règles actuelles : arrivée acceptée jusqu'à <strong>{qr?.limite_arrivee_stagiaire?.slice(0, 5)}</strong> pour les stagiaires et <strong>{qr?.limite_arrivee_employe?.slice(0, 5)}</strong> pour les employés. Départ bloqué entre <strong>{qr?.blocage_depart_debut?.slice(0, 5)}</strong> et <strong>{qr?.blocage_depart_fin?.slice(0, 5)}</strong>, sauf permission validée en cours. Rayon autorisé : <strong>{qr?.rayon_metres} m</strong>.
      </div>

      <div id="zone-impression" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md">
        <div className="flex flex-col items-center text-center">
          <h3 className="font-bold text-gray-900 mb-1">GRH ACS — Pointage de présence</h3>
          <p className="text-xs text-gray-400 mb-6">Scannez avec votre compte GRH ACS</p>
          <canvas ref={canvasRef} />
          <p className="text-[10px] text-gray-300 mt-4 break-all">{qr?.code}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6 print:hidden">
        <button onClick={handlePrint}
          className="bg-[#129547] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0E7739] transition shadow-md flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimer l'affiche
        </button>
        <button onClick={ouvrirFormulaire}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Régénérer
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Règles du nouveau QR Code</h3>
                <p className="text-gray-500 text-xs mt-1">Ces règles s'appliqueront dès la régénération.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Limite arrivée — Employé</label>
                  <input type="time" name="limite_arrivee_employe" value={form.limite_arrivee_employe} onChange={handleChange} required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Limite arrivée — Stagiaire</label>
                  <input type="time" name="limite_arrivee_stagiaire" value={form.limite_arrivee_stagiaire} onChange={handleChange} required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Début blocage départ</label>
                  <input type="time" name="blocage_depart_debut" value={form.blocage_depart_debut} onChange={handleChange} required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fin blocage départ</label>
                  <input type="time" name="blocage_depart_fin" value={form.blocage_depart_fin} onChange={handleChange} required
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                  <input type="number" step="0.000001" name="latitude" value={form.latitude} onChange={handleChange} required
                    placeholder="6.381872"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                  <input type="number" step="0.000001" name="longitude" value={form.longitude} onChange={handleChange} required
                    placeholder="2.413610"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rayon autorisé (mètres)</label>
                <input type="number" min="5" max="1000" name="rayon_metres" value={form.rayon_metres} onChange={handleChange} required
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#129547]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={regenerating}
                  className="flex-1 bg-[#129547] text-white py-3 rounded-xl font-medium hover:bg-[#0E7739] transition disabled:opacity-50">
                  {regenerating ? "Génération..." : "Régénérer avec ces règles"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodeGlobal;