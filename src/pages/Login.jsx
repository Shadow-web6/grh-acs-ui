import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";
import { Users, Calendar, Building2, ClipboardList, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Connexion réussie !");
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "drh") navigate("/drh");
      else if (user.role === "directeur") navigate("/directeur");
      else if (user.role === "employe") navigate("/employe");
      else if (user.role === "stagiaire") navigate("/stagiaire");
    } catch {
      toast.error("Email ou mot de passe incorrect !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex"> 
      <div className="hidden lg:flex lg:w-1/2 bg-[#005DCB] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="text-center relative z-10">
          <img src={logo} alt="Data Links" className="w-20 h-20 rounded-2xl mb-6 shadow-lg mx-auto" />
          <h1 className="text-4xl font-bold mb-2 text-white">EASY HR</h1>
          <p className="text-yellow-300 font-semibold text-lg mb-8 tracking-wide">
            Simplifiez la gestion de vos ressources humaines
          </p>
          <p className="text-blue-100 mb-10 max-w-sm mx-auto">
            Plateforme de Gestion des Ressources Humaines
          </p>

          <div className="grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
            {[
              { icon: Users, text: "Gestion des employés" },
              { icon: Calendar, text: "Congés & permissions" },
              { icon: Building2, text: "Départements" },
              { icon: ClipboardList, text: "Recrutement" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-3">
                  <Icon className="w-5 h-5 text-white" />
                  <span className="text-sm text-white">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Développé par <span className="font-medium text-gray-500">AnaëlTCHIBOZO & Lael HOUNTO-HOTEGBE</span>
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img src={logo} alt="Data Links" className="w-16 h-16 rounded-2xl mb-3 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">EASY HR</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bon retour !</h2>
            <p className="text-gray-500 mb-8">Connectez-vous à votre espace RH</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nom@datalinks.bj"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005DCB] focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005DCB] focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#005DCB] text-white py-3 rounded-xl font-semibold hover:bg-[#004BA8] transition-all duration-200 shadow-lg shadow-[#005DCB]/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Connexion...
                  </span>
                ) : "Se connecter →"}
              </button>
            </form>      
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;