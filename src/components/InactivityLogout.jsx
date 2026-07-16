import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const TIMEOUT_MINUTES = 7; // Ajuste ici (5 à 8 min selon la préférence retenue)
const TIMEOUT_MS = TIMEOUT_MINUTES * 60 * 1000;
const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

const InactivityLogout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogout = useCallback(async () => {
    await logout();
    toast.info("Vous avez été déconnecté après une période d'inactivité.");
    navigate("/login");
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    // N'active la surveillance que si un utilisateur est connecté
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    resetTimer();
    EVENTS.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, resetTimer]);

  return null; // Composant purement fonctionnel, aucun rendu visuel
};

export default InactivityLogout;