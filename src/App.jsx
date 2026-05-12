import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import UserManagement from './components/UserManagement';
import ListView from './components/ListView'; // Nueva importación
import { Toaster } from 'react-hot-toast';

function App() {
  const [session, setSession] = useState(localStorage.getItem('userRole'));
  const [currentView, setCurrentView] = useState('calendar');
  // Sincronizamos este estado con el hover del Sidebar para el margen dinámico
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      setSession(localStorage.getItem('userRole'));
    };
    window.addEventListener('storage', checkSession);
    return () => window.removeEventListener('storage', checkSession);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard />;
      case 'calendar': 
        return <CalendarView />;
      case 'activities': 
        return <ListView />; // Nueva sección de cronograma
      case 'users': 
        return <UserManagement />;
      default: 
        return <CalendarView />;
    }
  }

  // Si no hay sesión iniciada
  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLoginSuccess={() => setSession(localStorage.getItem('userRole'))} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Sidebar con control de estado para el layout */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        // Pasamos setters si el componente Sidebar necesita avisar a App cuando cambia el ancho
        onExpand={() => setIsSidebarExpanded(true)}
        onCollapse={() => setIsSidebarExpanded(false)}
      />

      {/* Contenedor Principal: El margen cambia dinámicamente con el Sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        
        {/* Header Compacto y Profesional */}
        <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-baseline gap-3">
            <h2 className="text-gray-800 font-black text-sm uppercase tracking-tighter">
              {currentView === 'users' ? 'Gestión de Usuarios' : 
               currentView === 'activities' ? 'Cronograma' : 
               currentView}
            </h2>
            <span className="text-gray-300 text-xs font-light">|</span>
            <p className="text-[11px] text-gray-500 font-medium">
              {localStorage.getItem('userName')} 
              <span className="text-gray-300 mx-2">•</span> 
              <span className="text-blue-600 font-bold uppercase text-[10px] tracking-wider">
                {localStorage.getItem('userDept')}
              </span>
            </p>
          </div>
          
          {/* Avatar / Badge de Rol */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-700 shadow-sm">
               {localStorage.getItem('userRole')?.substring(0,2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Zona de Contenido con padding optimizado */}
        <main className="p-3 md:p-4 overflow-x-hidden">
          <div className="w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;