import { useState } from 'react';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import Dashboard from './components/Dashboard';

function App() {
  // Este "estado" guardará en qué pantalla estamos
  const [view, setView] = useState('dashboard');

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Le pasamos setView al Sidebar para que los botones funcionen */}
      <Sidebar setView={setView} currentView={view} />

      <main className="ml-64 flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#003876]">
              {view === 'dashboard' ? 'Dashboard Principal' : 'Calendario de Actividades'}
            </h2>
            <p className="text-gray-500 text-sm">Regional 17 Monte Plata</p>
          </div>
        </header>

        {/* Lógica para cambiar de pantalla */}
        <div className="animate-in fade-in duration-500">
          {view === 'dashboard' && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold mb-4">Bienvenido, Bryan</h3>
              <p>Selecciona "Calendario" en el menú para gestionar las fechas.</p>

              <div className="animate-in fade-in duration-500">
  {view === 'dashboard' && <Dashboard />}
  {view === 'calendar' && <CalendarView />}
</div>
            </div>

            
          )}
          
          {view === 'calendar' && <CalendarView />}
        </div>
      </main>
    </div>
  );
}

export default App;