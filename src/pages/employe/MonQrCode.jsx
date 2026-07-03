import { useState, useEffect } from "react";
import api from "../../api/axios";

const MonQrCode = () => {
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/presences/mon-qrcode")
      .then(res => setQrToken(res.data.qr_token))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
    </div>
  );

  if (!qrToken) return (
    <div className="text-center py-12 text-gray-500">
      Aucun QR Code disponible pour votre profil
    </div>
  );

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${qrToken}&color=005DCB&bgcolor=ffffff`;

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Mon QR Code</h2>
      <p className="text-gray-500 text-sm mb-8">
        Présentez ce code à la DRH pour pointer votre arrivée et votre départ
      </p>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 inline-block">
          <img src={qrUrl} alt="Mon QR Code" className="rounded-xl" />
        </div>
        <p className="text-gray-400 text-xs mt-6">
          Ce code est unique et personnel. Ne le partagez pas.
        </p>
      </div>
    </div>
  );
};

export default MonQrCode;