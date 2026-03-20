import { Calendar, Home, ClipboardList, LogOut } from 'lucide-react';

const Sidebar = ({ setView, currentView }) => {
  return (
    <div className="w-64 h-screen bg-[#003876] text-white flex flex-col p-4 fixed left-0 top-0">
      <div className="mb-8 flex items-center gap-3 p-2">
        <div className="bg-white p-1 rounded">
          <img src="https://www.minerd.gob.do/Logo_Minerd.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <h1 className="font-bold text-lg leading-tight">MINERD</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
        >
          <Home size={20} /> Dashboard
        </button>
        
        <button 
          onClick={() => setView('calendar')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${currentView === 'calendar' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
        >
          <Calendar size={20} /> Calendario
        </button>

        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-blue-800 transition-colors opacity-50 cursor-not-allowed">
          <ClipboardList size={20} /> Reportes (Próximamente)
        </button>
      </nav>

      <div className="border-t border-blue-800 pt-4">
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-600 transition-colors">
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;