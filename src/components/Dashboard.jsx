import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon, Loader2, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    completadas: 0,
    atrasadas: 0,
    enCurso: 0,
    porDepartamento: []
  });
  const [loading, setLoading] = useState(true);
  const [años, setAños] = useState([]);
  
  // Estados para los filtros
  const [selectedAño, setSelectedAño] = useState('todos');
  const [selectedMes, setSelectedMes] = useState('todos');

  const meses = [
    { id: '01', name: 'Enero' }, { id: '02', name: 'Febrero' }, { id: '03', name: 'Marzo' },
    { id: '04', name: 'Abril' }, { id: '05', name: 'Mayo' }, { id: '06', name: 'Junio' },
    { id: '07', name: 'Julio' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Septiembre' },
    { id: '10', name: 'Octubre' }, { id: '11', name: 'Noviembre' }, { id: '12', name: 'Diciembre' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Recargar métricas cada vez que cambie un filtro
  useEffect(() => {
    fetchMetrics();
  }, [selectedAño, selectedMes]);

  const fetchInitialData = async () => {
    try {
      const { data } = await supabase.from('años_escolares').select('*').order('nombre', { ascending: false });
      if (data) setAños(data);
    } catch (error) {
      console.error("Error al cargar años escolares:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let query = supabase.from('actividades').select('*');
      
      // Filtro de Año Escolar
      if (selectedAño !== 'todos') {
        query = query.eq('año_id', selectedAño);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      if (data) {
        // Filtro de Mes (se hace sobre los resultados del año)
        let filteredData = data;
        if (selectedMes !== 'todos') {
          filteredData = data.filter(act => {
            const fecha = new Date(act.inicio);
            const mesActividad = (fecha.getMonth() + 1).toString().padStart(2, '0');
            return mesActividad === selectedMes;
          });
        }

        const total = filteredData.length;
        const completadas = filteredData.filter(a => a.progreso === 'Completado').length;
        const atrasadas = filteredData.filter(a => a.progreso === 'Atrasado').length;
        const enCurso = filteredData.filter(a => a.progreso === 'En curso' || a.progreso === 'Reprogramada').length;

        const agrupado = filteredData.reduce((acc, curr) => {
          acc[curr.departamento] = (acc[curr.departamento] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.keys(agrupado).map(dept => ({
          name: dept,
          cantidad: agrupado[dept]
        }));

        setMetrics({ total, completadas, atrasadas, enCurso, porDepartamento: chartData });
      }
    } catch (error) {
      toast.error("Error al filtrar métricas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Completadas', value: metrics.completadas, color: '#059669' },
    { name: 'Atrasadas', value: metrics.atrasadas, color: '#dc2626' },
    { name: 'En curso', value: metrics.enCurso, color: '#d97706' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* SECCIÓN DE TÍTULO Y FILTROS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#003876] flex items-center gap-2">
            <CalendarIcon /> Panel Estratégico
          </h1>
          <p className="text-gray-400 text-sm font-medium italic">Filtra la información por periodo</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Año */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
              value={selectedAño}
              onChange={(e) => setSelectedAño(e.target.value)}
            >
              <option value="todos">Todos los Años</option>
              {años.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Selector de Mes */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <select 
              className="bg-transparent text-sm font-bold text-gray-600 outline-none cursor-pointer"
              value={selectedMes}
              onChange={(e) => setSelectedMes(e.target.value)}
            >
              <option value="todos">Todos los Meses</option>
              {meses.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin text-[#003876] mb-4" size={40} />
          <p className="text-gray-400 font-bold">Actualizando métricas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Total Actividades" value={metrics.total} icon={<CalendarIcon className="text-blue-600"/>} type="default" />
            <StatCard title="Completadas" value={metrics.completadas} icon={<CheckCircle className="text-emerald-600"/>} type="success" />
            <StatCard title="Atrasadas" value={metrics.atrasadas} icon={<AlertTriangle className="text-rose-600"/>} type="danger" />
            <StatCard title="En Curso" value={metrics.enCurso} icon={<Clock className="text-amber-600"/>} type="warning" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
              <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Estado de Cumplimiento</h3>
              {metrics.total > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">No se encontraron actividades en este periodo</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
              <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Actividades por Departamento</h3>
              {metrics.total > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={metrics.porDepartamento}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} tick={{fill: '#6b7280'}} />
                    <YAxis tick={{fill: '#6b7280'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="cantidad" fill="#003876" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 italic font-medium">No se encontraron actividades en este periodo</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, type }) => {
  const styles = {
    default: "border-gray-100 bg-white",
    success: "border-emerald-100 bg-emerald-50/30",
    danger: "border-rose-100 bg-rose-50/30",
    warning: "border-amber-100 bg-amber-50/30"
  };

  return (
    <div className={`p-5 rounded-2xl shadow-sm border-2 transition-all hover:shadow-md ${styles[type]} flex items-center justify-between`}>
      <div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-800 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-white rounded-xl shadow-inner border border-gray-50">
        {icon}
      </div>
    </div>
  );
};

export default Dashboard;