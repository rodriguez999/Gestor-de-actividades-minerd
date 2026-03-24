import { useState } from 'react';
import { supabase } from '../supabaseClient';
import logoMinerd from '../assets/logo-minerd.png'; // Asegúrate de que el archivo esté en esta ruta
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Forzamos el mensaje en español para que el usuario entienda qué pasó
        toast.error("Correo o contraseña incorrectos", {
          duration: 5000,
          id: 'login-error', // Evita que se amontonen muchos mensajes si hace clic varias veces
          style: {
            background: '#333',
            color: '#fff',
            borderLeft: '5px solid #dc2626'
          },
        });
        console.log("Error de Supabase:", error.message);
      } else if (data.user) {
        toast.success(`¡Bienvenido al sistema, ${data.user.email.split('@')[0]}!`, {
          icon: '👋',
        });
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado al conectar.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          
          {/* AQUÍ SUSTITUIMOS EL CUADRO AZUL POR EL LOGO QUE PASASTE */}
          <div className="mx-auto mb-6 w-56 h-auto">
            <img 
              src={logoMinerd} 
              alt="Logo MINERD" 
              className="w-full h-auto object-contain"
              onError={(e) => {
                // Por si acaso la ruta local falla, usamos el link directo temporalmente
                e.target.src = "https://i.imgur.com/428Nriw.png";
              }}
            />
          </div>

          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Gestión de Actividades</h1>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">Informática Educativa</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Correo Institucional</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                required 
                placeholder="usuario@minerd.gob.do"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase ml-1 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-900 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <LogIn size={20} /> 
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-[10px] mt-8 uppercase font-medium">
          Acceso restringido a personal autorizado
        </p>
      </div>
    </div>
  );
};

export default Login;