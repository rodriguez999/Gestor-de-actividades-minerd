import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Clock, CheckCircle2, AlertCircle, MapPin, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

const ListView = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgreso, setFilterProgreso] = useState('Todos');
  const [filterFecha, setFilterFecha] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('actividades') 
        .select('*')
        .order('inicio', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado en tiempo real
  const filteredActivities = activities.filter(activity => {
    const cumpleBusqueda = activity.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           activity.departamento?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleProgreso = filterProgreso === 'Todos' || activity.progreso === filterProgreso;
    
    const cumpleFecha = !filterFecha || activity.inicio?.startsWith(filterFecha);

    return cumpleBusqueda && cumpleProgreso && cumpleFecha;
  });

  const getStatusBadge = (progreso, startISO) => {
    const start = startISO ? parseISO(startISO) : null;
    
    switch (progreso) {
      case 'Completado':
        return <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase"><CheckCircle2 size={12}/> Completado</span>;
      case 'Atrasado':
        return <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase"><AlertCircle size={12}/> Atrasado</span>;
      case 'Reprogramada':
        return <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase"><CalendarIcon size={12}/> Reprogramada</span>;
      default:
        if (start && isToday(start)) {
          return <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse"><Clock size={12}/> Hoy</span>;
        }
        return <span className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">En curso</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-[#003876] border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-bold italic text-sm">Filtrando cronograma...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 animate-in fade-in duration-500">
      
      {/* Cabecera y Título */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Cronograma Operativo</h3>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em]">Ministerio de Educación</p>
        </div>
        <div className="bg-gray-100 px-4 py-1.5 rounded-2xl">
          <p className="text-[11px] text-gray-500 font-bold uppercase">
            {filteredActivities.length} de {activities.length} Actividades
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título o dependencia..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl">
          <Filter size={16} className="text-gray-400" />
          <select 
            className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0 cursor-pointer"
            value={filterProgreso}
            onChange={(e) => setFilterProgreso(e.target.value)}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="En curso">En curso</option>
            <option value="Completado">Completado</option>
            <option value="Atrasado">Atrasado</option>
            <option value="Reprogramada">Reprogramada</option>
          </select>
        </div>

        {/* Filtro de Fecha */}
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-xl">
          <CalendarIcon size={16} className="text-gray-400" />
          <input 
            type="date" 
            className="bg-transparent border-none text-sm font-bold text-gray-600 focus:ring-0 cursor-pointer"
            value={filterFecha}
            onChange={(e) => setFilterFecha(e.target.value)}
          />
          {filterFecha && (
            <button onClick={() => setFilterFecha('')} className="text-gray-400 hover:text-red-500 text-xs font-bold px-1">✕</button>
          )}
        </div>
      </div>

      {/* Lista de Actividades */}
      <div className="grid gap-4">
        {filteredActivities.map((activity) => (
          <div 
            key={activity.id} 
            className="group bg-white border border-gray-100 p-5 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center gap-6"
          >
            {/* Fecha */}
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 min-w-[95px] group-hover:bg-[#003876] transition-all duration-300">
              <span className="text-[11px] uppercase font-black text-gray-400 group-hover:text-blue-200 transition-colors">
                {activity.inicio ? format(parseISO(activity.inicio), 'MMM', { locale: es }) : '---'}
              </span>
              <span className="text-3xl font-black text-[#003876] group-hover:text-white transition-colors">
                {activity.inicio ? format(parseISO(activity.inicio), 'dd') : '--'}
              </span>
            </div>

            {/* Contenido */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(activity.progreso, activity.inicio)}
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-l pl-2 border-gray-200">
                  ID-{activity.id}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-[#003876] transition-colors">
                {activity.titulo}
              </h4>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-gray-400">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Clock size={14} className="text-blue-500" />
                  <span>{activity.inicio ? new Date(activity.inicio).toLocaleTimeString('es-DO', {hour: '2-digit', minute:'2-digit'}) : 'Sin hora'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin size={14} className="text-rose-500" />
                  <span className="truncate max-w-[200px]">MINERD - Sede Central</span>
                </div>
              </div>
            </div>

            {/* Dependencia */}
            <div className="md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-gray-50">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-1">Dependencia Responsable</p>
              <span className="inline-block bg-blue-50 text-[#003876] text-[10px] font-black px-4 py-2 rounded-xl border border-blue-100 uppercase">
                {activity.departamento || 'General'}
              </span>
            </div>
          </div>
        ))}

        {/* Estado Vacío */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-black text-xl">No coinciden resultados</p>
            <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
              Prueba a cambiar los filtros o el término de búsqueda para encontrar lo que necesitas.
            </p>
            <button 
              onClick={() => {setSearchTerm(''); setFilterProgreso('Todos'); setFilterFecha('');}}
              className="mt-6 text-blue-600 font-bold text-sm hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;