import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { LayoutDashboard, Calendar, LogOut, GraduationCap, Users, Building2, ListChecks } from 'lucide-react';

const Sidebar = ({ session, currentView, setCurrentView, onExpand, onCollapse }) => {
  const getInitialRole = () => {
    const params = new URLSearchParams(window.location.search);
    const roleFromUrl = params.get('role');
    if (roleFromUrl) return roleFromUrl.toLowerCase();
    return localStorage.getItem('userRole') || 'visor';
  };

  const [role, setRole] = useState(getInitialRole());
  const [isHovered, setIsHovered] = useState(false);

  const userName = localStorage.getItem('userName') || "Usuario";
  const userDept = localStorage.getItem('userDept') || "Sin Departamento";

  useEffect(() => {
    const activeRole = getInitialRole();
    setRole(activeRole);
  }, [session]);

  const handleLogout = async () => {
    localStorage.clear();
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'calendar', name: 'Calendario', icon: <Calendar size={20} /> },
    { id: 'activities', name: 'Cronograma', icon: <ListChecks size={20} /> },
  ];

  if (String(role).trim().toLowerCase() === 'admin') {
    menuItems.push({ id: 'users', name: 'Usuarios', icon: <Users size={20} /> });
  }

  // Funciones para manejar el hover y avisar al componente padre (App.jsx)
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onExpand) onExpand();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onCollapse) onCollapse();
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`h-screen bg-[#003876] text-white flex flex-col fixed left-0 top-0 shadow-2xl z-[100] transition-all duration-300 ease-in-out ${
        isHovered ? 'w-64' : 'w-20'
      }`}
    >
      {/* HEADER / LOGO */}
      <div className="p-5 flex items-center gap-3 border-b border-blue-800 overflow-hidden min-h-[80px]">
        <div className="bg-white p-2 rounded-lg shadow-md shrink-0">
          <GraduationCap className="text-[#003876]" size={24} />
        </div>
        <div className={`flex flex-col transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-bold text-sm leading-none whitespace-nowrap text-white text-left">MINERD</span>
          <span className="text-[10px] text-blue-300 font-bold uppercase mt-1 whitespace-nowrap">Gestión Operativa</span>
        </div>
      </div>

      {/* NAVEGACIÓN - Se quitó overflow-y-auto para evitar el scroll lateral */}
      <nav className="flex-1 mt-6 px-3 space-y-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-4 p-3 w-full rounded-xl transition-all relative group ${
              currentView === item.id ? 'bg-white text-[#003876] font-bold shadow-lg' : 'hover:bg-blue-800/50 text-blue-100'
            }`}
            title={!isHovered ? item.name : ""}
          >
            <div className="shrink-0">{item.icon}</div>
            <span className={`text-sm transition-opacity duration-300 whitespace-nowrap ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              {item.name}
            </span>
          </button>
        ))}
      </nav>

      {/* FOOTER / USUARIO */}
      <div className="p-4 border-t border-blue-800 bg-blue-900/20 overflow-hidden">
        <div className={`space-y-3 px-1 mb-4 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 invisible h-0'}`}>
          <div className="text-left">
            <p className="text-[11px] font-bold truncate text-white">{userName}</p>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="text-[9px] bg-yellow-500 text-[#003876] px-1.5 py-0.5 rounded font-black uppercase">
                 {role}
               </span>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-blue-300 text-left">
            <Building2 size={12} className="mt-0.5 shrink-0" />
            <p className="text-[10px] leading-tight font-medium italic opacity-80 truncate">
              {userDept}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-4 p-3 w-full text-red-300 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
          title={!isHovered ? "Cerrar Sesión" : ""}
        >
          <div className="shrink-0"><LogOut size={18} /></div>
          <span className={`transition-opacity duration-300 whitespace-nowrap ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            Cerrar Sesión
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;