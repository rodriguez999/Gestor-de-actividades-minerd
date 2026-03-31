import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserPlus, Mail, Shield, Building, Loader2, Trash2, Lock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'visor',
    departamento: 'General'
  });

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('nombre_completo', { ascending: true });
    if (data) setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { nombre_completo: formData.nombre_completo } }
    });

    if (authError) {
      toast.error("Error al crear acceso: " + authError.message);
      setLoading(false);
    } else {
      toast.success("Usuario creado exitosamente");
      setFormData({ email: '', password: '', nombre_completo: '', rol: 'visor', departamento: 'General' });
      fetchUsers();
      setLoading(false);
    }
  };

  // FUNCIÓN PARA ELIMINAR USUARIO
  const handleDeleteUser = async (userId, userName) => {
    const confirmacion = window.confirm(`¿Estás seguro de eliminar a ${userName}? Esta acción borrará su perfil de la base de datos.`);
    
    if (!confirmacion) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success("Usuario eliminado correctamente");
      fetchUsers();
    } catch (error) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  return (
    <div className="p-8 ml-15 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-50 p-2 rounded-xl text-[#003876]"><UserPlus size={24}/></div>
            <h2 className="text-xl font-black text-gray-800">Nuevo Usuario</h2>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input required className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre_completo} onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Correo Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="email" required className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="usuario@minerd.gob.do"
                  value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Contraseña Temporal</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input type="password" required className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  placeholder="••••••••"
                  value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Rol</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-600"
                  value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})}>
                  <option value="admin">Admin</option>
                  <option value="responsable">Responsable</option>
                  <option value="visor">Visor</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Departamento</label>
                <select className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-600"
                  value={formData.departamento} onChange={(e) => setFormData({...formData, departamento: e.target.value})}>
                  <option value="Informatica Educativa">Informática</option>
                  <option value="Recursos Humanos">RRHH</option>
                  <option value="Planificación">Planificación</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Registrar Usuario"}
            </button>
          </form>
        </div>

        {/* LISTADO DE USUARIOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b bg-gray-50/50">
            <h3 className="font-black text-gray-700 uppercase text-sm tracking-widest">Usuarios Registrados</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Nombre</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Departamento</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Rol</th>
                <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-bold text-gray-700 text-sm">{u.nombre_completo}</td>
                  <td className="p-4"><span className="flex items-center gap-1 text-gray-500 text-xs font-medium"><Building size={14}/> {u.departamento}</span></td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                      u.rol === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 
                      u.rol === 'responsable' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.nombre_completo)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm font-medium">No hay usuarios registrados todavía.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;