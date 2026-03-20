import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Users, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, porDepto: [] });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data } = await supabase.from('actividades').select('departamento');
    
    if (data) {
      const counts = data.reduce((acc, item) => {
        acc[item.departamento] = (acc[item.departamento] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(counts).map(key => ({
        name: key,
        cantidad: counts[key]
      }));

      setStats({ total: data.length, porDepto: chartData });
    }
  };

  const COLORS = ['#003876', '#0056b3', '#007bff', '#66a3ff'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#003876] flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-[#003876]"><Calendar size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase">Total Actividades</p>
            <h4 className="text-3xl font-black text-gray-800">{stats.total}</h4>
          </div>
        </div>
        {/* Puedes añadir más tarjetas aquí luego */}
      </div>

      {/* GRÁFICA DE DEPARTAMENTOS */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800">Actividades por Departamento</h3>
          <p className="text-sm text-gray-500">Distribución de carga de trabajo en la Regional</p>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.porDepto}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="cantidad" radius={[10, 10, 0, 0]}>
                {stats.porDepto.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;