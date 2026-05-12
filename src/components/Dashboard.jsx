import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon, 
  Loader2, LayoutDashboard, Building2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total: 0, completadas: 0, atrasadas: 0, enCurso: 0, porDepartamento: []
  });
  const [loading, setLoading] = useState(true);
  const [años, setAños] = useState([]);
  const [dependencias, setDependencias] = useState([]);

  // Estados de Filtros
  const [selectedAño, setSelectedAño] = useState('todos');
  const [selectedMes, setSelectedMes] = useState('todos');
  const [selectedDepto, setSelectedDepto] = useState('todos');

  const meses = [
    { id: '01', name: 'Enero' }, { id: '02', name: 'Febrero' }, { id: '03', name: 'Marzo' },
    { id: '04', name: 'Abril' }, { id: '05', name: 'Mayo' }, { id: '06', name: 'Junio' },
    { id: '07', name: 'Julio' }, { id: '08', name: 'Agosto' }, { id: '09', name: 'Septiembre' },
    { id: '10', name: 'Octubre' }, { id: '11', name: 'Noviembre' }, { id: '12', name: 'Diciembre' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [selectedAño, selectedMes, selectedDepto]);

  const fetchInitialData = async () => {
    try {
      const { data: dataAnos } = await supabase.from('años_escolares').select('*').order('nombre', { ascending: false });
      if (dataAnos) setAños(dataAnos);

      const { data: dataDepto } = await supabase.from('actividades').select('departamento');
      if (dataDepto) {
        const unicos = [...new Set(dataDepto.map(item => item.departamento))].sort();
        setDependencias(unicos);
      }
    } catch (error) {
      console.error("Error inicial:", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let query = supabase.from('actividades').select('*');
      
      if (selectedAño !== 'todos') query = query.eq('año_id', selectedAño);
      if (selectedDepto !== 'todos') query = query.eq('departamento', selectedDepto);

      const { data, error } = await query;
      if (error) throw error;

      let filteredData = data || [];
      if (selectedMes !== 'todos') {
        filteredData = data.filter(act => {
          const mesActividad = (new Date(act.inicio).getMonth() + 1).toString().padStart(2, '0');
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
        name: dept, cantidad: agrupado[dept]
      })).sort((a, b) => b.cantidad - a.cantidad);

      setMetrics({ total, completadas, atrasadas, enCurso, porDepartamento: chartData });
    } catch (error) {
      toast.error("Error al cargar métricas");
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Completadas', value: metrics.completadas, color: '#10b981' },
    { name: 'Atrasadas', value: metrics.atrasadas, color: '#ef4444' },
    { name: 'En curso', value: metrics.enCurso, color: '#f59e0b' },
  ];

  return (
    <div className="p-8 ml-15 bg-gray-50 min-h-screen font-sans">
      
      {/* CABECERA Y FILTROS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
            <div className="bg-[#003876] p-2 rounded-xl text-white shadow-lg shadow-blue-900/20">
              <LayoutDashboard size={24} />
            </div>
            Panel Estratégico VSTP
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 ml-12 italic">Visualización técnica de gestión</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-transparent">
            <CalendarIcon size={16} className="text-gray-400" />
            <select className="bg-transparent text-[10px] font-black text-gray-600 outline-none cursor-pointer uppercase" value={selectedAño} onChange={e => setSelectedAño(e.target.value)}>
              <option value="todos">Todos los Años</option>
              {años.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-transparent">
            <Clock size={16} className="text-gray-400" />
            <select className="bg-transparent text-[10px] font-black text-gray-600 outline-none cursor-pointer uppercase" value={selectedMes} onChange={e => setSelectedMes(e.target.value)}>
              <option value="todos">Cualquier Mes</option>
              {meses.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-transparent">
            <Building2 size={16} className="text-gray-400" />
            <select className="bg-transparent text-[10px] font-black text-gray-600 outline-none cursor-pointer uppercase max-w-[150px]" value={selectedDepto} onChange={e => setSelectedDepto(e.target.value)}>
              <option value="todos">Dependencia</option>
              {dependencias.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-[#003876] mb-4" size={48} />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs text-center">Cargando Métricas...</p>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
          
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Actividades" value={metrics.total} icon={<LayoutDashboard size={20}/>} color="blue" />
            <StatCard title="Completadas" value={metrics.completadas} icon={<CheckCircle size={20}/>} color="emerald" />
            <StatCard title="Atrasadas" value={metrics.atrasadas} icon={<AlertTriangle size={20}/>} color="rose" />
            <StatCard title="En Curso" value={metrics.enCurso} icon={<Clock size={20}/>} color="amber" />
          </div>

          {/* GRÁFICOS */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 h-[400px]">
              <h3 className="font-black text-gray-700 uppercase text-[10px] tracking-widest mb-6 text-center">Nivel de Cumplimiento</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" wrapperStyle={{ fontWeight: 'bold', fontSize: '10px', paddingTop: '20px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-3 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 h-[400px]">
              <h3 className="font-black text-gray-700 uppercase text-[10px] tracking-widest mb-6">Distribución por Dependencia</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={metrics.porDepartamento}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={130} tick={{fill: '#64748b', fontWeight: 'bold', fontSize: 9}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="cantidad" fill="#003876" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
        © Departamento de Informática Educativa - MINERD
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100"
  };
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`p-3 w-fit rounded-2xl ${colors[color]} border mb-4 shadow-sm`}>{icon}</div>
      <div className="text-3xl font-black text-gray-800">{value}</div>
      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 leading-tight">{title}</div>
    </div>
  );
};

export default Dashboard;