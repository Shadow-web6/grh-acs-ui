import { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Printer, RefreshCw } from "lucide-react";
import QRCode from "qrcode";

const QrCodeGlobal = () => {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
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

  const handleRegenerer = async () => {
    if (!window.confirm(
      "Régénérer le QR Code global rendra l'ancien (déjà imprimé/affiché) inutilisable. Vous devrez réimprimer et réafficher le nouveau. Confirmez-vous ?"
    )) return;

    setRegenerating(true);
    try {
      const res = await api.post("/qr-global/regenerer");
      setQr(res.data.qr);
      toast.success("QR Code global régénéré — pensez à réimprimer l'affiche");
    } catch {
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegenerating(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
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
        Rappel des règles : arrivée acceptée jusqu'à <strong>8h00</strong> pour les stagiaires et <strong>8h30</strong> pour les employés (au-delà, une notification invite à s'enregistrer avec le QR personnel auprès de la DRH). Départ bloqué entre <strong>9h00 et 18h30</strong>, sauf permission validée en cours à l'heure du scan.
      </div>

      <div id="zone-impression" className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm max-w-md">
        <div className="flex flex-col items-center text-center">
          <h3 className="font-bold text-gray-900 mb-1">Data Links — Pointage de présence</h3>
          <p className="text-xs text-gray-400 mb-6">Scannez avec votre compte Easy HR</p>
          <canvas ref={canvasRef} />
          <p className="text-[10px] text-gray-300 mt-4 break-all">{qr?.code}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6 print:hidden">
        <button onClick={handlePrint}
          className="bg-[#005DCB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition shadow-md flex items-center gap-2">
          <Printer className="w-4 h-4" /> Imprimer l'affiche
        </button>
        <button onClick={handleRegenerer} disabled={regenerating}
          className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50">
          <RefreshCw className="w-4 h-4" /> {regenerating ? "Régénération..." : "Régénérer"}
        </button>
      </div>
    </div>
  );
};

export default QrCodeGlobal;