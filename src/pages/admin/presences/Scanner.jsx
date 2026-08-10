import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { Camera, CheckCircle2, LogOut, AlertTriangle } from "lucide-react";
import PinGate from "../../../components/PinGate";

const QR_ELEMENT_ID = "qr-reader-region";

const ScannerContent = () => {
  const [scanning, setScanning] = useState(false);
  const [dernierScan, setDernierScan] = useState(null);
  const html5QrCodeRef = useRef(null);
  const isStoppingRef = useRef(false);

  const handleScanSuccess = async (decodedText) => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    await stopScanner();

    try {
      const res = await api.post("/presences/scanner", { qr_token: decodedText });
      const data = res.data;
      setDernierScan({
        success: true,
        type: data.type,
        employe: data.employe,
        heure: data.heure,
      });
      toast.success(data.message);
    } catch (err) {
      const data = err.response?.data;
      setDernierScan({
        success: false,
        message: data?.message || "QR Code invalide",
      });
      toast.error(data?.message || "Erreur lors du scan");
    } finally {
      isStoppingRef.current = false;
    }
  };

  const startScanner = async () => {
    setDernierScan(null);
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
    } catch (err) {
      toast.error("Impossible d'accéder à la caméra");
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Scanner de présence</h2>
        <p className="text-gray-500 text-sm">Scannez le QR Code de l'employé pour pointer arrivée/départ</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="rounded-xl overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center relative">
          <div id={QR_ELEMENT_ID} style={{ width: "100%" }} />
          {!scanning && (
            <p className="text-gray-400 text-sm absolute pointer-events-none">
              La caméra apparaîtra ici
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          {!scanning ? (
            <button
              onClick={startScanner}
              className="bg-[#129547] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0E7739] transition shadow-md flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Démarrer le scan
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="bg-red-50 text-red-500 px-8 py-3 rounded-xl font-medium hover:bg-red-100 transition"
            >
              Arrêter
            </button>
          )}
        </div>
      </div>

      {dernierScan && (
        <div className={`mt-6 rounded-2xl p-6 border ${
          dernierScan.success
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}>
          {dernierScan.success ? (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                {dernierScan.type === "arrivee" ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : (
                  <LogOut className="w-10 h-10 text-amber-600" />
                )}
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-1">{dernierScan.employe}</h3>
              <p className="text-green-600 font-medium">
                {dernierScan.type === "arrivee" ? "Arrivée enregistrée" : "Départ enregistré"}
              </p>
              <p className="text-gray-500 text-sm mt-1">à {dernierScan.heure}</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{dernierScan.message}</p>
            </div>
          )}
          <button
            onClick={startScanner}
            className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Scanner le suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default function Scanner() {
  return (
    <PinGate>
      <ScannerContent />
    </PinGate>
  );
}