import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar'; // <--- ESTE ES EL QUE FALTABA

function App() {
  const [session, setSession] = useState(null);
  const [currentView, setCurrentView] = useState('calendar');

  // Lógica de autenticación que faltaba en tu código
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Función para cambiar de vista
  const renderContent = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />;
      case 'dashboard':
        return <Dashboard />;
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
      {/* Sidebar ahora sí funcionará porque lo importamos arriba */}
      <Sidebar 
        session={session} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm sticky top-0 z-10">
          <div>
            <h2 className="text-gray-800 font-bold text-lg capitalize">{currentView}</h2>
            <p className="text-[11px] text-gray-400 font-medium">Gestión Operativa MINERD</p>
          </div>
        </header>

        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;