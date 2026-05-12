import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { supabase } from '../supabaseClient';
import { 
  Plus, X, Search, Loader2, 
  Calendar, Edit2, Send, Filter, Eye, FileText, Download, Info, AlertTriangle
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const DEPARTAMENTOS_OFICIALES = [
  "Dirección de Currículo", "Departamento de Cultura y Cultos", "Departamento de Informática Educativa",
  "Dirección de Educación Inicial", "Dirección de Educación Primaria", "Dirección de Educación Secundaria",
  "Departamento de Educación Secundaria Modalidad Académica", "Departamento de Educación Secundaria Modalidad Técnico Profesional",
  "Departamento de Educación Secundaria Modalidad en Artes", "Dirección de Educación de Personas Jóvenes y Adultas",
  "Departamento de Alfabetización", "Departamento de Educación Primaria de Personas Jóvenes y Adultas",
  "Departamento de Educación Secundaria de Personas Jóvenes y Adultas-Prepara", "Departamento de Educación Laboral",
  "Departamento de Educación Virtual", "Dirección de Educación Especial", "Dirección de Orientación y Psicología",
  "Dirección de Medios Educativos", "Dirección de Participación Comunitaria", "Dirección Editorial Educativa",
  "Dirección de Radio y Televisión Educativa y Cultural “Edu+”", "PLE-RD, Programa de Liderazgo Educativo",
  "Unidad de Inglés", "Programa Salud Escolar", "Programa Huertos Escolares", "General"
];

const CalendarView = () => {
  const userRole = localStorage.getItem('userRole') || 'visor';
  const userDept = localStorage.getItem('userDept') || 'General';
  
  const [events, setEvents] = useState([]);
  const [años, setAños] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepto, setFilterDepto] = useState('Todos');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const [tagInputActores, setTagInputActores] = useState('');
  const [actoresTags, setActoresTags] = useState([]);
  const [tagInputEmails, setTagInputEmails] = useState('');
  const [emailsTags, setEmailsTags] = useState([]);

  const [conflictData, setConflictData] = useState(null);

  const [formData, setFormData] = useState({
    id: null, titulo: '', descripcion: '', departamento: userDept,
    año_id: '', inicio: '', fin: '', progreso: 'En curso'
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
    const { data, error } = await supabase.from('actividades').select('*');
    if (error) {
        toast.error("Error al conectar con la base de datos");
        return;
    }
    const formatted = data.map(item => ({
      id: String(item.id),
      title: `[${item.departamento}] ${item.titulo}`,
      start: item.inicio,
      end: item.fin || item.inicio,
      backgroundColor: item.progreso === 'Atrasado' ? '#dc2626' : 
                       item.progreso === 'Completado' ? '#059669' : 
                       item.progreso === 'Reprogramada' ? '#4f46e5' : '#d97706',
      borderColor: 'transparent',
      extendedProps: { ...item },
    }));
    setEvents(formatted);
  };

  // --- LÓGICA DE TAGS CORREGIDA ---
  const addTag = (type) => {
    const isActores = type === 'actores';
    const val = isActores ? tagInputActores.trim() : tagInputEmails.trim();

    if (!val) {
      isActores ? setTagInputActores('') : setTagInputEmails('');
      return;
    }

    if (isActores) {
      if (!actoresTags.includes(val)) {
        setActoresTags([...actoresTags, val]);
      }
      setTagInputActores('');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(val)) {
        if (!emailsTags.includes(val)) {
          setEmailsTags([...emailsTags, val]);
        }
        setTagInputEmails('');
      } else {
        toast.error("Formato de correo inválido");
      }
    }
  };

  const handleKeyDownTags = (e, type) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // CRITICO: Evita que el espacio se escriba en el input
      addTag(type);
    }
  };

  const removeTag = (index, type) => {
    if (type === 'actores') setActoresTags(actoresTags.filter((_, i) => i !== index));
    else setEmailsTags(emailsTags.filter((_, i) => i !== index));
  };
  // --------------------------------

  const handleOpenCreateModal = () => {
    setFormData({
      id: null, titulo: '', descripcion: '', departamento: userDept,
      año_id: años.length > 0 ? años[0].id : '', 
      inicio: '', fin: '', progreso: 'En curso'
    });
    setActoresTags([]);
    setEmailsTags([]);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    const data = event.extendedProps;
    setFormData({
      id: data.id, titulo: data.titulo, descripcion: data.descripcion || '',
      departamento: data.departamento, año_id: data.año_id,
      inicio: data.inicio ? data.inicio.substring(0, 16) : '',
      fin: data.fin ? data.fin.substring(0, 16) : '',
      progreso: data.progreso
    });
    setActoresTags(data.actores_participantes ? data.actores_participantes.split(',').filter(t => t.trim() !== "") : []);
    setEmailsTags(data.responsable_email ? data.responsable_email.split(',').filter(t => t.trim() !== "") : []);
    setIsEditing(true);
    setIsModalOpen(true);
    setSelectedEvent(null);
  };

  const checkConflictsAndSubmit = (e) => {
    e.preventDefault();
    const nuevaFechaInicio = new Date(formData.inicio).getTime();
    const nuevaFechaFin = new Date(formData.fin).getTime();

    const eventoConflictivo = events.find(ev => {
      if (isEditing && ev.id === String(formData.id)) return false;
      const evInicio = new Date(ev.start).getTime();
      const evFin = new Date(ev.end).getTime();
      return nuevaFechaInicio < evFin && nuevaFechaFin > evInicio;
    });

    if (eventoConflictivo) {
      setConflictData(eventoConflictivo.extendedProps.departamento);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setConflictData(null);
    setLoading(true);

    const dataToSave = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      departamento: formData.departamento,
      año_id: parseInt(formData.año_id),
      inicio: new Date(formData.inicio).toISOString(),
      fin: new Date(formData.fin).toISOString(),
      progreso: formData.progreso,
      actores_participantes: actoresTags.join(','),
      responsable_email: emailsTags.join(',')
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from('actividades').update(dataToSave).eq('id', formData.id);
        if (error) throw error;
        toast.success("Cambios guardados");
      } else {
        const { error: dbError } = await supabase.from('actividades').insert([dataToSave]);
        if (dbError) throw dbError;

        if (emailsTags.length > 0) {
          const promesasEnvio = emailsTags.map(correo => 
            emailjs.send('service_yg37u1l', 'template_7m6yhff', {
              to_email: correo,
              titulo: formData.titulo,
              departamento: formData.departamento,
              inicio: new Date(formData.inicio).toLocaleString('es-DO'),
              notas: formData.descripcion,
              meta: formData.descripcion 
            }, 'ZJUa3PrF_NdnmGOs3')
          );
          await Promise.all(promesasEnvio);
        }
        toast.success("Actividad publicada");
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const eliminarActividad = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta actividad?")) return;
    setLoading(true);
    try {
        const { error } = await supabase.from('actividades').delete().eq('id', id);
        if (error) throw error;
        toast.success("Actividad eliminada");
        setSelectedEvent(null);
        fetchEvents();
    } catch (error) { toast.error("No se pudo eliminar"); }
    finally { setLoading(false); }
  };

  const filteredEvents = events.filter(event => {
    const cumpleBusqueda = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const cumpleDepto = filterDepto === 'Todos' || event.extendedProps.departamento === filterDepto;
    const fechaInicioEv = new Date(event.start);
    const cumpleFechaInicio = !filterFechaInicio || fechaInicioEv >= new Date(filterFechaInicio);
    const cumpleFechaFin = !filterFechaFin || fechaInicioEv <= new Date(filterFechaFin);
    return cumpleBusqueda && cumpleDepto && cumpleFechaInicio && cumpleFechaFin;
  });

  const handlePreviewPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredEvents.map(ev => [
      ev.extendedProps.titulo,
      ev.extendedProps.departamento,
      new Date(ev.start).toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' }),
      ev.extendedProps.progreso
    ]);

    doc.setFontSize(18);
    doc.text("Reporte de Actividades Educativas", 14, 20);
    
    autoTable(doc, {
      startY: 30,
      head: [['Actividad', 'Departamento', 'Fecha/Hora', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 56, 118] }
    });

    const blob = doc.output('blob');
    setPdfUrl(URL.createObjectURL(blob));
    setShowPdfPreview(true);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4">
      <style>{`
        .fc-event {
          cursor: pointer !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .fc-event:hover {
          transform: scale(1.03) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
          z-index: 50 !important;
        }
      `}</style>

      {/* Barra de Filtros */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-3 items-center flex-1">
            <div className="relative min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input type="text" placeholder="Buscar actividad..." className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            <select className="bg-gray-50 border-none rounded-xl py-2 text-sm px-4 focus:ring-2 focus:ring-blue-500 max-w-[200px]" value={filterDepto} onChange={e => setFilterDepto(e.target.value)}>
                <option value="Todos">Todas las Dependencias</option>
                {DEPARTAMENTOS_OFICIALES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <Filter size={14} className="text-gray-400" />
                <input type="date" className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer" value={filterFechaInicio} onChange={e => setFilterFechaInicio(e.target.value)} />
                <span className="text-gray-300">|</span>
                <input type="date" className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer" value={filterFechaFin} onChange={e => setFilterFechaFin(e.target.value)} />
            </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handlePreviewPDF} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95">
            <Eye size={18}/> Previsualizar Reporte
          </button>
          {userRole !== 'visor' && (
            <button onClick={handleOpenCreateModal} className="bg-[#003876] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-900 transition-all shadow-lg active:scale-95">
              <Plus size={18}/> Nueva Actividad
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
        <FullCalendar
          plugins={[daygridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          locale="es"
          height="70vh"
          dayMaxEvents={false}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
          eventClick={(info) => setSelectedEvent(info.event)}
        />
      </div>

      {/* Modal Previsualización PDF */}
      {showPdfPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[150] p-4 md:p-10 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full h-full flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-black text-xl text-[#003876] flex items-center gap-2"><FileText /> Previsualización del Reporte</h2>
              <div className="flex gap-3">
                <a href={pdfUrl} download="Reporte_Actividades.pdf" className="bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold hover:bg-emerald-700 transition-all">
                   <Download size={18}/> Descargar Ahora
                </a>
                <button onClick={() => setShowPdfPreview(false)} className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-all"><X /></button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200">
              <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADO DE CONFLICTO */}
      {conflictData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-red-100 animate-in zoom-in duration-300">
            <div className="bg-rose-600 p-8 text-white flex flex-col items-center text-center">
              <div className="bg-white/20 p-4 rounded-full mb-4">
                <AlertTriangle size={48} className="text-white" />
              </div>
              <h3 className="text-2xl font-black">¡Conflicto de Horario!</h3>
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-600 font-medium leading-relaxed">
                Ya existe una actividad registrada en este rango por el departamento:
                <span className="block mt-2 font-black text-rose-600 text-lg">"{conflictData}"</span>
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setConflictData(null)}
                  className="py-3.5 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all"
                >
                  Revisar
                </button>
                <button 
                  onClick={executeSubmit}
                  className="py-3.5 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  Ignorar y Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-8">
            <div className={`p-6 text-white flex justify-between items-center ${isEditing ? 'bg-amber-600' : 'bg-[#003876]'}`}>
              <h2 className="font-bold text-xl flex items-center gap-2">
                {isEditing ? <><Edit2 size={22}/> Editar Actividad</> : <><Plus size={22}/> Nueva Actividad</>}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-1 rounded-full hover:bg-white/40"><X size={24}/></button>
            </div>

            <form onSubmit={checkConflictsAndSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-auto">
              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Título de la Actividad</label>
                <input required className="w-full bg-gray-50 border-none rounded-xl p-3.5 mt-1 focus:ring-2 focus:ring-blue-500 font-bold text-gray-700" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Meta / Descripción de la Actividad</label>
                <textarea 
                  required 
                  placeholder="Detalla el objetivo o meta de esta actividad..."
                  className="w-full bg-gray-50 border-none rounded-xl p-3.5 mt-1 focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 min-h-[100px]" 
                  value={formData.descripcion} 
                  onChange={e => setFormData({...formData, descripcion: e.target.value})} 
                />
              </div>

              {/* Tags Actores */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Actores Participantes</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl mt-1 border-2 border-transparent focus-within:border-blue-200 transition-all">
                  {actoresTags.map((tag, i) => (
                    <span key={i} className="bg-white text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100 flex items-center gap-2 shadow-sm">
                      {tag} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(i, 'actores')}/>
                    </span>
                  ))}
                  <input 
                    placeholder="Presionar Espacio o Enter..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm p-1 min-w-[150px]" 
                    value={tagInputActores} 
                    onChange={e => setTagInputActores(e.target.value)} 
                    onBlur={() => addTag('actores')}
                    onKeyDown={e => handleKeyDownTags(e, 'actores')} 
                  />
                </div>
              </div>

              {/* Tags Emails */}
              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Contacto Dependencias Articulantes (Emails)</label>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl mt-1 border-2 border-transparent focus-within:border-blue-200 transition-all">
                  {emailsTags.map((tag, i) => (
                    <span key={i} className="bg-[#003876] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm">
                      {tag} <X size={14} className="cursor-pointer hover:text-red-300" onClick={() => removeTag(i, 'emails')}/>
                    </span>
                  ))}
                  <input 
                    placeholder="correo@ejemplo.com..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm p-1 min-w-[150px]" 
                    value={tagInputEmails} 
                    onChange={e => setTagInputEmails(e.target.value)} 
                    onBlur={() => addTag('emails')}
                    onKeyDown={e => handleKeyDownTags(e, 'emails')} 
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Fecha de Inicio</label>
                <input type="datetime-local" required className="w-full bg-gray-50 border-none rounded-xl p-3.5 mt-1 font-bold text-gray-600" value={formData.inicio} onChange={e => setFormData({...formData, inicio: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Fecha de Fin</label>
                <input type="datetime-local" required className="w-full bg-gray-50 border-none rounded-xl p-3.5 mt-1 font-bold text-gray-600" value={formData.fin} onChange={e => setFormData({...formData, fin: e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Estado del Progreso</label>
                <select className="w-full bg-gray-100 border-none rounded-xl p-3.5 mt-1 font-black text-blue-900 focus:ring-2 focus:ring-blue-500" value={formData.progreso} onChange={e => setFormData({...formData, progreso: e.target.value})}>
                    <option value="En curso">🟠 En curso</option>
                    <option value="Completado">🟢 Completado</option>
                    <option value="Atrasado">🔴 Atrasado</option>
                    <option value="Reprogramada">🔵 Reprogramada</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className={`md:col-span-2 py-4 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#003876] hover:bg-blue-900'}`}>
                {loading ? <Loader2 className="animate-spin"/> : <><Send size={20}/> {isEditing ? 'Guardar Cambios' : 'Publicar Actividad'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative border border-gray-100 animate-in slide-in-from-bottom-4">
            <button onClick={() => setSelectedEvent(null)} className="absolute right-6 top-6 text-gray-300 hover:text-gray-500"><X size={28}/></button>
            
            <div className="space-y-4">
              <span className="text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                {selectedEvent.extendedProps.departamento}
              </span>
              <h2 className="font-black text-2xl text-gray-800 leading-tight">{selectedEvent.extendedProps.titulo}</h2>
              
              <div className="space-y-3 py-4 border-y border-gray-50">
                <div className="flex items-center gap-3 text-gray-600">
                    <Calendar size={18} className="text-blue-500"/>
                    <span className="text-sm font-bold">{new Date(selectedEvent.start).toLocaleString('es-DO', { dateStyle: 'full', timeStyle: 'short' })}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selectedEvent.extendedProps.progreso === 'Completado' ? 'bg-green-500' : 'bg-orange-500'}`}/>
                    <span className="text-sm font-black uppercase text-gray-700">{selectedEvent.extendedProps.progreso}</span>
                </div>
              </div>

              {selectedEvent.extendedProps.descripcion && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <p className="text-[9px] font-black text-blue-400 uppercase mb-1 flex items-center gap-1"><Info size={12}/> Meta de Actividad</p>
                   <p className="text-xs text-gray-600 italic leading-relaxed">"{selectedEvent.extendedProps.descripcion}"</p>
                </div>
              )}

              {selectedEvent.extendedProps.actores_participantes && (
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Participantes:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedEvent.extendedProps.actores_participantes.split(',').filter(a => a.trim() !== "").map((a, i) => (
                            <span key={i} className="text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-600 font-medium border border-gray-100">{a}</span>
                        ))}
                    </div>
                </div>
              )}

              {userRole !== 'visor' && (userRole === 'admin' || selectedEvent.extendedProps.departamento === userDept) && (
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button onClick={() => handleOpenEditModal(selectedEvent)} className="bg-amber-50 text-amber-700 py-3 rounded-xl text-xs font-black uppercase hover:bg-amber-100 transition-all">Editar</button>
                  <button onClick={() => eliminarActividad(selectedEvent.id)} className="bg-rose-50 text-rose-600 py-3 rounded-xl text-xs font-black uppercase hover:bg-rose-100 transition-all">Eliminar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;