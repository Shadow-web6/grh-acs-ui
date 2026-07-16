import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Lock, ShieldCheck } from "lucide-react";

// Enveloppe n'importe quel contenu sensible (QR personnel, scanner...) derrière une saisie de PIN.
// Si l'utilisateur n'a pas encore de PIN, propose d'abord d'en créer un.
const PinGate = ({ children }) => {
  const [statutCharge, setStatutCharge] = useState(false);
  const [pinDefini, setPinDefini] = useState(false);
  const [deverrouille, setDeverrouille] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirmation, setPinConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/pin/statut")
      .then(res => setPinDefini(res.data.pin_defini))
      .finally(() => setStatutCharge(true));
  }, []);

  const handleDefinir = async (e) => {
    e.preventDefault();
    setErreur("");
    if (pin.length < 4 || pin.length > 6) return setErreur("Le PIN doit contenir 4 à 6 chiffres");
    if (pin !== pinConfirmation) return setErreur("Les deux PIN ne correspondent pas");

    setSubmitting(true);
    try {
      await api.post("/pin/definir", { pin });
      toast.success("PIN défini avec succès");
      setPinDefini(true);
      setDeverrouille(true);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de la définition du PIN");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifier = async (e) => {
    e.preventDefault();
    setErreur("");
    setSubmitting(true);
    try {
      await api.post("/pin/verifier", { pin });
      setDeverrouille(true);
    } catch (err) {
      setErreur(err.response?.data?.message || "PIN incorrect");
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!statutCharge) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#005DCB]"></div>
      </div>
    );
  }

  if (deverrouille) return children;

  return (
    <div className="max-w-sm mx-auto mt-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
      <div className="w-14 h-14 bg-[#005DCB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        {pinDefini ? <Lock className="w-6 h-6 text-[#005DCB]" /> : <ShieldCheck className="w-6 h-6 text-[#005DCB]" />}
      </div>

      {pinDefini ? (
        <>
          <h3 className="font-bold text-gray-900 mb-1">Accès protégé</h3>
          <p className="text-gray-500 text-sm mb-5">Entrez votre PIN pour continuer</p>
          <form onSubmit={handleVerifier} className="space-y-3">
            <input
              type="password" inputMode="numeric" maxLength={6} autoFocus
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-widest bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005DCB]"
            />
            {erreur && <p className="text-red-500 text-xs">{erreur}</p>}
            <button type="submit" disabled={submitting || pin.length < 4}
              className="w-full bg-[#005DCB] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition disabled:opacity-50">
              {submitting ? "Vérification..." : "Déverrouiller"}
            </button>
          </form>
        </>
      ) : (
        <>
          <h3 className="font-bold text-gray-900 mb-1">Créez votre PIN</h3>
          <p className="text-gray-500 text-sm mb-5">Ce code (4 à 6 chiffres) vous sera demandé à chaque accès à cette fonctionnalité.</p>
          <form onSubmit={handleDefinir} className="space-y-3">
            <input
              type="password" inputMode="numeric" maxLength={6} autoFocus
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Nouveau PIN"
              className="w-full text-center text-lg tracking-widest bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005DCB]"
            />
            <input
              type="password" inputMode="numeric" maxLength={6}
              value={pinConfirmation} onChange={e => setPinConfirmation(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirmer le PIN"
              className="w-full text-center text-lg tracking-widest bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#005DCB]"
            />
            {erreur && <p className="text-red-500 text-xs">{erreur}</p>}
            <button type="submit" disabled={submitting}
              className="w-full bg-[#005DCB] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#004BA8] transition disabled:opacity-50">
              {submitting ? "Création..." : "Créer mon PIN"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default PinGate;