import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import { supabase } from '../supabaseClient';
import { Plus, X, Trash2, Mail, Building2, AlignLeft, Search } from 'lucide-react';

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [años, setAños] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la búsqueda
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', departamento: 'Informatica Educativa',
    responsable_email: '', año_id: '', inicio: '', fin: ''
  });

  useEffect(() => {
    fetchAños();
    fetchEvents();
  }, []);

  const fetchAños = async () => {
    const { data } = await supabase.from('años_escolares').select('*');
    if (data && data.length > 0) {
      setAños(data);
      setFormData(prev => ({ ...prev, año_id: data[0].id }));
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('actividades').select('*');
    if (data) {
      const formatted = data.map(item => ({
        id: item.id,
        title: item.titulo,
        start: item.inicio,
        end: item.fin || item.inicio,
        extendedProps: { ...item },
        backgroundColor: '#003876',
        borderColor: '#003876',
      }));
      setEvents(formatted);
    }
  };

  // LÓGICA DE FILTRADO
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.extendedProps.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('actividades').insert([formData]);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ ...formData, titulo: '', descripcion: '', inicio: '', fin: '' });
      fetchEvents();
    }
  };

  const eliminarActividad = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta actividad?")) {
      const { error } = await supabase.from('actividades').delete().eq('id', id);
      if (!error) {
        setSelectedEvent(null);
        fetchEvents();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* BARRA DE HERRAMIENTAS SUPERIOR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por título o departamento..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full md:w-auto bg-[#003876] text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 shadow-md transition-all active:scale-95"
        >
          <Plus size={18} /> Nueva Actividad
        </button>
      </div>

      {/* CALENDARIO */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <FullCalendar
          plugins={[daygridPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents} // Pasamos los eventos filtrados
          locale="es"
          height="65vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          eventClick={(info) => setSelectedEvent(info.event)}
        />
      </div>

      {/* MODAL PARA CREAR (Simplificado) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border">
            <div className="bg-[#003876] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold">Nueva Actividad</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input placeholder="Título de la actividad" required className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
              <textarea placeholder="Descripción" className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required className="border rounded-lg p-2 text-sm" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} />
                <input type="date" className="border rounded-lg p-2 text-sm" value={formData.fin} onChange={e => setFormData({...formData, fin: e.target.value})} />
              </div>
              <select className="w-full border rounded-lg p-2 text-sm" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})}>
                <option>Informatica Educativa</option>
                <option>Recursos Humanos</option>
                <option>Pedagogía</option>
                <option>Administrativo</option>
              </select>
              <button type="submit" className="w-full bg-[#003876] text-white py-3 rounded-xl font-bold hover:bg-blue-900 shadow-lg">Guardar en Supabase</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLES (Mismo de antes) */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border animate-in zoom-in duration-150">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-[#003876]">{selectedEvent.title}</h2>
                <button onClick={() => setSelectedEvent(null)}><X size={24} className="text-gray-400"/></button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-bold"><Building2 size={16}/> {selectedEvent.extendedProps.departamento}</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"><AlignLeft size={16} className="inline mr-2"/> {selectedEvent.extendedProps.descripcion || 'Sin descripción'}</div>
              </div>
              <div className="pt-4 flex gap-2">
                <button onClick={() => eliminarActividad(selectedEvent.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200"><Trash2 size={16}/> Borrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;