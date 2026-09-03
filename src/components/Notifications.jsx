import { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
      setUnread(res.data.filter(n => !n.read_at).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLireTout = async () => {
    try {
      await api.post("/notifications/lire-tout");
      fetchNotifications();
      toast.success("Toutes les notifications lues");
    } catch {}
  };

  const handleSupprimer = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSupprimerLues = async () => {
    try {
      await api.delete("/notifications-lues");
      setNotifications(prev => prev.filter(n => !n.read_at));
      toast.success("Notifications lues supprimées");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getIcon = (type) => {
    if (type === "demande_traitee") return "📋";
    if (type === "presence_scannee") return "📷";
    return "🔔";
  };

  const nbLues = notifications.filter(n => n.read_at).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2.5 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-800"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
              <div className="flex gap-3">
                {nbLues > 0 && (
                  <button onClick={handleSupprimerLues} className="text-xs text-gray-400 hover:text-red-500">
                    Supprimer les lues
                  </button>
                )}
                {unread > 0 && (
                  <button onClick={handleLireTout} className="text-xs text-[#129547] hover:underline">
                    Tout lire
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm p-6">Aucune notification</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 group ${!notif.read_at ? "bg-blue-50/50" : ""}`}
                >
                  <div className="flex gap-3">
                    <span className="text-lg">{getIcon(notif.data?.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{notif.data?.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSupprimer(notif.id)}
                      className="text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications;