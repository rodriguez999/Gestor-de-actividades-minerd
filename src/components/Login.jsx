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
      // 1. AUTENTICACIÓN CON SUPABASE
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      
      // CORRECCIÓN: Si las credenciales fallan, mostramos error y detenemos el proceso
      if (authError) {
        toast.error("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 2. OBTENER DATOS DE LA TABLA PERFILES
      // Nota: Requiere que la política RLS de 'SELECT' esté activa en Supabase
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol, nombre_completo, departamento')
        .eq('id', userId)
        .maybeSingle();

      if (perfilError || !perfil) {
        toast.error("Error al obtener el perfil de usuario");
        setLoading(false);
        return;
      }

      // 3. GUARDADO DE SESIÓN
      localStorage.setItem('userRole', perfil.rol.trim().toLowerCase());
      localStorage.setItem('userName', perfil.nombre_completo || 'Usuario');
      localStorage.setItem('userDept', perfil.departamento || 'General');
      
      toast.success(`Bienvenido, ${perfil.nombre_completo}`);

      // 4. REDIRECCIÓN FORZADA
      // Enviamos el rol por URL para asegurar que el Sidebar lo lea al instante
      setTimeout(() => {
        window.location.href = '/?role=' + perfil.rol; 
      }, 600);

    } catch (err) {
      toast.error("Error inesperado en el inicio de sesión");
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
      <div className="absolute z-10 inset-0 bg-[#003876]/20 backdrop-blur-[3px]"></div>
      
      {/* CARD DE LOGIN */}
      <div className="relative z-20 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <img src={logoMinerd} alt="Logo MINERD" className="mx-auto mb-6 w-56 h-auto" />
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Gestión de Actividades</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="email" 
              required 
              placeholder="usuario@minerd.gob.do"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-900 shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;