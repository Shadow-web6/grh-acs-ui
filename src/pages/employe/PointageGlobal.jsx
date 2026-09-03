import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { QrCode, CheckCircle2, LogOut, AlertTriangle, Clock } from "lucide-react";
import PinGate from "../../components/PinGate";

const QR_ELEMENT_ID = "qr-reader-global";

const PointageGlobalContent = () => {
  const [scanning, setScanning] = useState(false);
  const [resultat, setResultat] = useState(null);
  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  const obtenirPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("La géolocalisation n'est pas supportée par cet appareil"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        () => reject(new Error("Impossible d'obtenir votre position. Autorisez la géolocalisation pour scanner.")),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleScanSuccess = async (decodedText) => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    await stopScanner();

    try {
      const position = await obtenirPosition();
      const res = await api.post("/presences/scanner-global", {
        qr_token: decodedText,
        latitude: position.latitude,
        longitude: position.longitude,
      });
      const data = res.data;
      setResultat({ success: true, type: data.type, heure: data.heure, enRetard: !!data.en_retard });
      if (data.en_retard) {
        toast.warning(data.message);
      } else {
        toast.success(data.message);
      }
    } catch (err) {
      const data = err.response?.data;
      const message = data?.message || err.message || "Erreur lors du scan";
      setResultat({ success: false, message });
      toast.error(message);
    } finally {
      isStoppingRef.current = false;
    }
  };

  const startScanner = async () => {
    setResultat(null);
    await new Promise(r => setTimeout(r, 100));
    try {
      const html5QrCode = new Html5Qrcode(QR_ELEMENT_ID);
      html5QrCodeRef.current = html5QrCode;
      setScanning(true);
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => {}
      );
    } catch {
      toast.error("Impossible d'accéder à la caméra");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => () => { stopScanner(); }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Pointage via QR Code général</h2>
        <p className="text-gray-500 text-sm">Scannez l'affiche à l'entrée avec votre propre compte pour enregistrer votre arrivée ou votre départ. Votre position sera vérifiée : vous devez être sur place.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="rounded-xl overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center relative">
          <div id={QR_ELEMENT_ID} style={{ width: "100%" }} />
          {!scanning && (
            <p className="text-gray-400 text-sm absolute pointer-events-none">La caméra apparaîtra ici</p>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          {!scanning ? (
            <button onClick={startScanner}
              className="bg-[#129547] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0E7739] transition shadow-md flex items-center gap-2">
              <QrCode className="w-5 h-5" /> Scanner l'affiche
            </button>
          ) : (
            <button onClick={stopScanner} className="bg-red-50 text-red-500 px-8 py-3 rounded-xl font-medium hover:bg-red-100 transition">
              Arrêter
            </button>
          )}
        </div>
      </div>

      {resultat && (
        <div className={`mt-6 rounded-2xl p-6 border ${
          !resultat.success ? "bg-red-50 border-red-200"
          : resultat.enRetard ? "bg-amber-50 border-amber-200"
          : "bg-green-50 border-green-200"
        }`}>
          {resultat.success ? (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {resultat.type === "arrivee"
                  ? (resultat.enRetard
                      ? <Clock className="w-10 h-10 text-amber-600" />
                      : <CheckCircle2 className="w-10 h-10 text-green-600" />)
                  : <LogOut className="w-10 h-10 text-amber-600" />}
              </div>
              <p className={`font-medium ${resultat.enRetard ? "text-amber-600" : "text-green-600"}`}>
                {resultat.type === "arrivee"
                  ? (resultat.enRetard ? "Arrivée enregistrée — en retard" : "Arrivée enregistrée")
                  : "Départ enregistré"}
              </p>
              <p className="text-gray-500 text-sm mt-1">à {resultat.heure}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-2"><AlertTriangle className="w-10 h-10 text-red-500" /></div>
              <p className="text-red-600 font-medium">{resultat.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PointageGlobal() {
  return (
    <PinGate>
      <PointageGlobalContent />
    </PinGate>
  );
}