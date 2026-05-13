import { useState } from 'react';
import { supabase } from '../supabaseClient';
import logoMinerd from '../assets/logo-minerd.png';
import videoFondo from '../assets/FondoAbstractoAzulParaWeb.mp4'; 
import { Mail, Lock, Loader2, AlertCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para la recuperación
  const [intentos, setIntentos] = useState(0);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfiles')
        .select('rol, nombre_completo, departamento, email')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();

      if (perfilError) throw perfilError;

      if (!perfil) {
        const nuevosIntentos = intentos + 1;
        setIntentos(nuevosIntentos);
        toast.error("Correo o contraseña incorrectos");
        setLoading(false);
        return;
      }

      // Guardado de sesión
      localStorage.setItem('userRole', perfil.rol.trim().toLowerCase());
      localStorage.setItem('userName', perfil.nombre_completo || 'Usuario');
      localStorage.setItem('userDept', perfil.departamento || 'General');
      localStorage.setItem('userEmail', perfil.email);
      
      toast.success(`Bienvenido, ${perfil.nombre_completo}`);
      setTimeout(() => {
        window.location.href = `/?role=${perfil.rol.trim().toLowerCase()}`; 
      }, 800);

    } catch (err) {
      toast.error("Error al conectar con el servidor");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (recoveryData.newPassword !== recoveryData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    setLoading(true);
    try {
      // 1. Verificar si el usuario existe
      const { data: userExists, error: searchError } = await supabase
        .from('perfiles')
        .select('id')
        .eq('email', recoveryData.email)
        .maybeSingle();

      if (searchError) throw searchError;

      if (!userExists) {
        toast.error("Este usuario no fue encontrado o no está registrado. Por favor, comuníquese con los administradores de la plataforma.", {
          duration: 5000,
          icon: '🚫'
        });
        setLoading(false);
        return;
      }

      // 2. Actualizar contraseña
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ password: recoveryData.newPassword })
        .eq('email', recoveryData.email);

      if (updateError) throw updateError;

      toast.success("Contraseña actualizada correctamente. Ya puede iniciar sesión.");
      setShowRecovery(false);
      setIntentos(0);
      setRecoveryData({ email: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error("Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      <video autoPlay loop muted playsInline className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover">
        <source src={videoFondo} type="video/mp4" />
      </video>

      <div className="absolute z-10 inset-0 bg-[#003876]/25 backdrop-blur-[2px]"></div>
      
      <div className="relative z-20 bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 transition-all duration-500">
        <div className="text-center mb-6">
          <img src={logoMinerd} alt="Logo MINERD" className="mx-auto mb-4 w-48 h-auto" />
          <h1 className="text-2xl font-black text-[#003876] tracking-tight">
            {showRecovery ? "Restablecer Acceso" : "Acceso VSTP"}
          </h1>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Viceministerio de Servicios Técnicos y Pedagógicos</p>
        </div>

        {!showRecovery ? (
          /* FORMULARIO DE LOGIN */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="email" required placeholder="usuario@minerd.gob.do" className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input type="password" required placeholder="••••••••" className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Entrar al Sistema"}
            </button>

            {intentos >= 2 && (
              <button 
                type="button"
                onClick={() => setShowRecovery(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 text-xs font-bold hover:underline animate-bounce"
              >
                <AlertCircle size={14}/> He olvidado mi contraseña
              </button>
            )}
          </form>
        ) : (
          /* FORMULARIO DE RECUPERACIÓN */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold leading-tight">
                Introduzca su correo registrado para asignar una nueva contraseña.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Correo de Usuario</label>
              <input type="email" required className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" value={recoveryData.email} onChange={(e) => setRecoveryData({...recoveryData, email: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nueva Contraseña</label>
              <input type="password" required minLength={6} className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" value={recoveryData.newPassword} onChange={(e) => setRecoveryData({...recoveryData, newPassword: e.target.value})} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Confirmar Contraseña</label>
              <input type="password" required className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50" value={recoveryData.confirmPassword} onChange={(e) => setRecoveryData({...recoveryData, confirmPassword: e.target.value})} />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><RefreshCcw size={18}/> Actualizar Contraseña</>}
            </button>

            <button type="button" onClick={() => setShowRecovery(false)} className="w-full flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase hover:text-gray-600 transition-colors pt-2">
              <ArrowLeft size={14}/> Volver al Login
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Soporte Técnico © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Login;