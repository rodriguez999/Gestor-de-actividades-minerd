import { supabase } from '../supabaseClient';
import { LayoutDashboard, Calendar, LogOut, GraduationCap, User } from 'lucide-react';

// Le pasamos 'session' y 'setCurrentView' como props desde App.jsx
const Sidebar = ({ session, currentView, setCurrentView }) => {

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'calendar', name: 'Calendario', icon: <Calendar size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-[#003876] text-white flex flex-col fixed left-0 top-0 shadow-xl z-20">
      {/* LOGO */}
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <div className="bg-white p-2 rounded-lg shadow-md">
          <GraduationCap className="text-[#003876]" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight leading-none">MINERD</span>
          <span className="text-[10px] text-blue-300 font-bold uppercase mt-1">Actividades</span>
        </div>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-3 p-3 w-full rounded-xl transition-all ${
              currentView === item.id 
                ? 'bg-white text-[#003876] shadow-lg font-bold' 
                : 'hover:bg-blue-800 text-blue-100'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* INFO USUARIO Y LOGOUT */}
      <div className="p-4 border-t border-blue-800 bg-blue-900/20">
        <div className="flex items-center gap-3 px-3 mb-4">
          <div className="bg-blue-500/20 p-2 rounded-full border border-blue-400/30">
            <User size={16} className="text-blue-200" />
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-[11px] font-bold truncate text-white">
              {session?.user?.email || "Usuario"}
            </p>
            <p className="text-[9px] text-blue-400 uppercase font-black">Conectado</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full text-red-300 hover:bg-red-500/10 hover:text-red-100 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;