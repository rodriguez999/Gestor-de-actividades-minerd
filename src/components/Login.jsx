import { useState } from 'react';
import { supabase } from '../supabaseClient';
import logoMinerd from '../assets/logo-minerd.png';
import videoFondo from '../assets/FondoAbstractoAzulParaWeb.mp4'; 
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      /**
       * PLAN B: AUTENTICACIÓN DIRECTA EN TABLA PERFILES
       * Buscamos un registro que coincida exactamente con email y password.
       */
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol, nombre_completo, departamento, email')
        .eq('email', email)
        .eq('password', password) // Validación directa
        .maybeSingle();

      if (perfilError) {
        console.error("Error de base de datos:", perfilError);
        toast.error("Error al conectar con el servidor");
        setLoading(false);
        return;
      }

      if (!perfil) {
        toast.error("Correo o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // 1. GUARDADO DE SESIÓN EN LOCALSTORAGE
      // Limpiamos los strings por si acaso hay espacios en blanco
      const userRole = perfil.rol.trim().toLowerCase();
      const userName = perfil.nombre_completo || 'Usuario';
      const userDept = perfil.departamento || 'General';

      localStorage.setItem('userRole', userRole);
      localStorage.setItem('userName', userName);
      localStorage.setItem('userDept', userDept);
      localStorage.setItem('userEmail', perfil.email);
      
      toast.success(`Bienvenido, ${userName}`);

      // 2. REDIRECCIÓN
      // Usamos un pequeño delay para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        // Redirigimos a la raíz. Si tu sidebar depende del query param 'role', lo incluimos:
        window.location.href = `/?role=${userRole}`; 
      }, 800);

    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Ocurrió un fallo inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* VIDEO DE FONDO */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src={videoFondo} type="video/mp4" />
      </video>

      {/* OVERLAY AZUL */}
      <div className="absolute z-10 inset-0 bg-[#003876]/25 backdrop-blur-[2px]"></div>
      
      {/* CARD DE LOGIN */}
      <div className="relative z-20 bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <img src={logoMinerd} alt="Logo MINERD" className="mx-auto mb-6 w-56 h-auto" />
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#003876] tracking-tight">Acceso VSTP</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Viceministerio de Servicios Técnicos y Pedagógicos</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                required 
                placeholder="usuario@minerd.gob.do"
                className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-medium transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 font-medium transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar al Sistema"}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] text-gray-400 font-medium italic">
          ©️ Bryan Rodriguez Abad - 100523553
        </p>
      </div>
    </div>
  );
};

export default Login;