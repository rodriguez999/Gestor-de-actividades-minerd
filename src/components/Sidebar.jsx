import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Calendar, LogOut, GraduationCap, Users } from 'lucide-react';

const Sidebar = ({ session, currentView, setCurrentView }) => {
  // 1. Lógica de detección de rol (URL > LocalStorage > Default)
  const getInitialRole = () => {
    const params = new URLSearchParams(window.location.search);
    const roleFromUrl = params.get('role');
    if (roleFromUrl) return roleFromUrl.toLowerCase();
    return localStorage.getItem('userRole') || 'visor';
  };

  const [role, setRole] = useState(getInitialRole());
  const userName = localStorage.getItem('userName') || "Usuario";

  // 2. Efecto para sincronizar el rol cuando cambia la sesión
  useEffect(() => {
    const activeRole = getInitialRole();
    setRole(activeRole);
  }, [session]);

  const handleLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  // 3. Definición base del menú
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'calendar', name: 'Calendario', icon: <Calendar size={20} /> },
  ];

  // 4. Inserción condicional del botón de Usuarios
  // Limpiamos el string para evitar errores por espacios ocultos
  if (String(role).trim().toLowerCase() === 'admin') {
    menuItems.push({ id: 'users', name: 'Usuarios', icon: <Users size={20} /> });
  }

  return (
    <div className="h-screen w-64 bg-[#003876] text-white flex flex-col fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <div className="bg-white p-2 rounded-lg shadow-md">
          <GraduationCap className="text-[#003876]" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-none">MINERD</span>
          <span className="text-[10px] text-blue-300 font-bold uppercase mt-1">Actividades</span>
        </div>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
              currentView === item.id ? 'bg-white text-[#003876] font-bold' : 'hover:bg-blue-800 text-blue-100'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Información del Usuario en la parte inferior */}
      <div className="p-4 border-t border-blue-800 bg-blue-900/20">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="overflow-hidden text-left">
            <p className="text-[11px] font-bold truncate text-white">{userName}</p>
            <p className="text-[10px] text-yellow-400 font-black uppercase">
              Actual: {role} 
            </p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 p-3 w-full text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;