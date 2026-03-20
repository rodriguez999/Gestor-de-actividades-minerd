import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    total: 0,
    completadas: 0,
    atrasadas: 0,
    enCurso: 0,
    porDepartamento: []
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const { data, error } = await supabase.from('actividades').select('*');
    
    if (data) {
      const total = data.length;
      const completadas = data.filter(a => a.progreso === 'Completado').length;
      const atrasadas = data.filter(a => a.progreso === 'Atrasado').length;
      const enCurso = data.filter(a => a.progreso === 'En curso' || a.progreso === 'Reprogramada').length;

      // Agrupar por departamento para el gráfico de barras
      const agrupado = data.reduce((acc, curr) => {
        acc[curr.departamento] = (acc[curr.departamento] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(agrupado).map(dept => ({
        name: dept,
        cantidad: agrupado[dept]
      }));

      setMetrics({ total, completadas, atrasadas, enCurso, porDepartamento: chartData });
    }
  };

  const pieData = [
    { name: 'Completadas', value: metrics.completadas, color: '#059669' },
    { name: 'Atrasadas', value: metrics.atrasadas, color: '#dc2626' },
    { name: 'En curso', value: metrics.enCurso, color: '#d97706' },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-[#003876] flex items-center gap-2">
        <CalendarIcon /> Panel de Control Estratégico
      </h1>

      {/* TARJETAS DE RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Actividades" value={metrics.total} icon={<CalendarIcon className="text-blue-600"/>} />
        <StatCard title="Completadas" value={metrics.completadas} icon={<CheckCircle className="text-green-600"/>} />
        <StatCard title="Atrasadas" value={metrics.atrasadas} icon={<AlertTriangle className="text-red-600"/>} />
        <StatCard title="Pendientes" value={metrics.enCurso} icon={<Clock className="text-orange-600"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO DE PROGRESO (PIE) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Estado de Cumplimiento</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO POR DEPARTAMENTO (BAR) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Actividades por Departamento</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={metrics.porDepartamento}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="cantidad" fill="#003876" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Componente pequeño para las tarjetas
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
  </div>
);

export default Dashboard;