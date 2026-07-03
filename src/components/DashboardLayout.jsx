import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notifications from "./Notifications";
import logo from "../assets/logo.png";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, Camera,
  FileText, Briefcase, ClipboardList, Lock, Building2, User, FileEdit
} from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  employes: Users,
  stagiaires: GraduationCap,
  absences: Calendar,
  scanner: Camera,
  historique: FileText,
  recrutement: Briefcase,
  travaux: ClipboardList,
  utilisateurs: Lock,
  departements: Building2,
  profil: User,
  qrcode: ClipboardList,
  offres: Briefcase,
  rapport: FileEdit,
};

const DashboardLayout = ({ menuSections, children, role, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const initials = user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabels = {
    admin: "admin",
    drh: "drh",
    directeur: "directeur",
    employe: "employé",
    stagiaire: "stagiaire",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {sidebarOpen && !isDesktop && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        bg-white border-r border-gray-200 text-gray-700 flex flex-col
        transition-all duration-300 ease-in-out w-72
        ${isDesktop ? 'translate-x-0' : sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Data Links" className="w-9 h-9 rounded-full flex-shrink-0" />
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">DATA LINKS</h1>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase">Système RH</p>
            </div>
          </div>
          {!isDesktop && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx}>
              <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase px-3 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map(item => {
                  const IconComponent = iconMap[item.iconKey] || LayoutDashboard;
                  const active = isActive(item.path, item.exact);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                        ${active
                          ? 'bg-[#005DCB] text-white font-medium shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                    >
                      <IconComponent className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Badge utilisateur */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className="w-9 h-9 bg-[#005DCB] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">{roleLabels[user?.role] || user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-300 mt-3">
            Easy HR — par Anaël TCHIBOZO & Lael HOUNTO-HOTEGBE 
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              {pageTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Notifications />
            <p className="text-sm text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;