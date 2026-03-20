// 1. IMPORTS
import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { supabase } from '../supabaseClient';
import { Plus, X, Trash2, Search, Target, Users, AlertCircle, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación directa del plugin

// 2. Definición del componente
const CalendarView = () => {
  
  // 3. Estados (Hooks)
  const [events, setEvents] = useState([]);
  const [años, setAños] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    departamento: 'Informatica Educativa',
    responsable_email: '',
    año_id: '',
    inicio: '',
    fin: '',
    meta: '',          
    participantes: '', 
    progreso: 'En curso', 
    notas: ''          
  });

  // Función para generar PDF
const generarPDF = () => {
  try {
    const doc = new jsPDF();
    const azulMinerd = [0, 56, 118]; 
    
    doc.setFontSize(18);
    doc.setTextColor(azulMinerd[0], azulMinerd[1], azulMinerd[2]);
    doc.text("Cronograma de Actividades Institucionales", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-DO')}`, 14, 30);

    const tableRows = filteredEvents.map(event => [
      event.start ? new Date(event.start).toLocaleDateString('es-DO') : 'S/F',
      event.extendedProps?.titulo || 'Sin título',
      event.extendedProps?.departamento || 'General',
      event.extendedProps?.progreso || 'N/A',
      event.extendedProps?.meta || 'N/A'
    ]);

    // CAMBIO CLAVE AQUÍ: Usamos autoTable(doc, { ... })
    autoTable(doc, {
      startY: 40,
      head: [['Fecha', 'Actividad', 'Departamento', 'Estado', 'Meta']],
      body: tableRows,
      headStyles: { fillColor: azulMinerd },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [240, 245, 255] },
    });

    doc.save(`Reporte_MINERD_${Date.now()}.pdf`);
  } catch (err) {
    console.error("Error detallado:", err);
    alert("Error al generar el PDF. Revisa la consola.");
  }
};

  // 4. useEffect y funciones de carga
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
      const formatted = data.map(item => {
        let colorEvento = '#003876'; 
        if (item.progreso === 'Atrasado') colorEvento = '#dc2626'; 
        if (item.progreso === 'Completado') colorEvento = '#059669'; 
        if (item.progreso === 'En curso') colorEvento = '#d97706'; 
        if (item.progreso === 'Reprogramada') colorEvento = '#4f46e5'; 

        return {
          id: item.id,
          title: `[${item.departamento}] ${item.titulo}`,
          start: item.inicio,
          end: item.fin || item.inicio,
          backgroundColor: colorEvento,
          borderColor: colorEvento,
          extendedProps: { ...item },
        };
      });
      setEvents(formatted);
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.extendedProps.departamento?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5. MANEJADOR DE ENVÍO
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevoInicio = new Date(formData.inicio).getTime();
    const nuevoFin = new Date(formData.fin).getTime();

    if (nuevoFin <= nuevoInicio) {
        alert("Error: La fecha de cierre no puede ser anterior a la de inicio.");
        return;
    }

    const hayChoque = events.some(event => {
      const inicioExistente = new Date(event.start).getTime();
      const finExistente = new Date(event.end).getTime();
      return (
        formData.departamento === event.extendedProps.departamento &&
        nuevoInicio < finExistente && 
        nuevoFin > inicioExistente
      );
    });

    if (hayChoque) {
      alert("🚨 ¡Choque de Horarios!\nYa hay una actividad programada en ese intervalo.");
      return;
    }

    const { error } = await supabase.from('actividades').insert([formData]);
    
    if (!error) {
      const emailParams = {
        to_email: formData.responsable_email,
        titulo: formData.titulo,
        departamento: formData.departamento,
        meta: formData.meta,
        inicio: new Date(formData.inicio).toLocaleString('es-DO', { 
          dateStyle: 'long', 
          timeStyle: 'short' 
        }), 
        participantes: formData.participantes,
        notas: formData.descripcion 
      };

      emailjs.send('service_yg37u1l', 'template_7m6yhff', emailParams, 'ZJUa3PrF_NdnmGOs3')
      .then(() => alert("✅ Actividad guardada y correo enviado."))
      .catch((err) => console.error("Error EmailJS:", err));

      setIsModalOpen(false);
      setFormData({ 
        ...formData, 
        titulo: '', descripcion: '', inicio: '', fin: '', 
        meta: '', participantes: '', responsable_email: '', progreso: 'En curso' 
      });
      fetchEvents();
    } else {
      alert("Error al guardar: " + error.message);
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
      {/* HEADER ÚNICO CORREGIDO */}
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
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={generarPDF} 
            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 shadow-md transition-all active:scale-95 font-bold"
          >
            <Mail size={18} /> Exportar PDF
          </button>

          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex-1 md:flex-none bg-[#003876] text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 shadow-md transition-all active:scale-95 font-bold"
          >
            <Plus size={18} /> Nueva Actividad
          </button>
        </div>
      </div>

      {/* CALENDARIO */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <FullCalendar
          plugins={[daygridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          locale="es"
          height="65vh"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          eventClick={(info) => setSelectedEvent(info.event)}
        />
      </div>

      {/* MODAL DE REGISTRO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto border">
            <div className="bg-[#003876] p-4 text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2"><Plus size={20}/> Registrar Actividad</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre *</label>
                <input required className="w-full border rounded-lg p-2 mt-1" 
                  value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Meta</label>
                <input className="w-full border rounded-lg p-2 mt-1 text-sm" 
                  value={formData.meta} onChange={e => setFormData({...formData, meta: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Estado *</label>
                <select className="w-full border rounded-lg p-2 mt-1 text-sm font-bold" 
                  value={formData.progreso} onChange={e => setFormData({...formData, progreso: e.target.value})}>
                  <option value="En curso">En curso</option>
                  <option value="Completado">Completado</option>
                  <option value="Atrasado">Atrasado</option>
                  <option value="Reprogramada">Reprogramada</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Inicio *</label>
                <input type="datetime-local" required className="w-full border rounded-lg p-2 mt-1 text-sm" 
                  value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Cierre *</label>
                <input type="datetime-local" required className="w-full border rounded-lg p-2 mt-1 text-sm" 
                  value={formData.fin} onChange={e => setFormData({...formData, fin: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Email Responsable *</label>
                <input type="email" required className="w-full border rounded-lg p-2 mt-1 text-sm" 
                  value={formData.responsable_email} onChange={e => setFormData({...formData, responsable_email: e.target.value})} />
              </div>
              <button type="submit" className="md:col-span-2 bg-[#003876] text-white py-3 rounded-xl font-bold hover:bg-blue-900 shadow-lg transition-all">
                Registrar y Enviar Correo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-150">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <h2 className="text-xl font-bold text-[#003876]">{selectedEvent.title}</h2>
                <button onClick={() => setSelectedEvent(null)}><X size={24} className="text-gray-400"/></button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><Target size={16} className="text-blue-600"/> <b>Meta:</b> {selectedEvent.extendedProps.meta || 'N/A'}</div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border-l-4 border-blue-500">
                   {selectedEvent.extendedProps.descripcion || 'Sin descripción'}
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button onClick={() => eliminarActividad(selectedEvent.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-red-200 transition-colors"><Trash2 size={16}/> Eliminar</button>
                <button onClick={() => setSelectedEvent(null)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold hover:bg-gray-200">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;