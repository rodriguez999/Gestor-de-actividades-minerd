import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import UserManagement from './components/UserManagement'; // <--- Importa el nuevo componente
import { Toaster } from 'react-hot-toast';

function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('calendar');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para cambiar de vista según la selección del Sidebar
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'users':
        return <UserManagement />; // <--- Nueva vista de gestión de usuarios
      default:
        return <CalendarView />;
    }
  };

  // Si no hay sesión, mostramos el Login
  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Sidebar controla el estado de currentView */}
      <Sidebar 
        session={session} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm sticky top-0 z-10">
          <div>
            <h2 className="text-gray-800 font-bold text-lg capitalize">
              {currentView === 'users' ? 'Gestión de Usuarios' : currentView}
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">Gestión Operativa MINERD</p>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Renderizado dinámico de componentes */}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;