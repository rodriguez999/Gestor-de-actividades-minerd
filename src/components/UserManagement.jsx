import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import { UserPlus, Loader2, Trash2, Edit3, X, Mail, User, Lock, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'visor',
    departamento: 'General'
  });

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('perfiles')
      .select('*')
      .order('nombre_completo', { ascending: true });
    if (data) setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- LÓGICA DE CREACIÓN ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('perfiles').insert([{
        nombre_completo: formData.nombre_completo,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        departamento: formData.departamento
      }]);
      if (error) throw error;
      toast.success("Usuario creado exitosamente");
      setFormData({ email: '', password: '', nombre_completo: '', rol: 'visor', departamento: 'General' });
      fetchUsers();
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally { setLoading(false); }
  };

  // --- LÓGICA DE ELIMINACIÓN ---
  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    const { error } = await supabase.from('perfiles').delete().eq('id', id);
    if (!error) {
      toast.success("Usuario eliminado");
      fetchUsers();
    }
  };

  // --- LÓGICA DE ACTUALIZACIÓN ---
  const openEditModal = (user) => {
    setSelectedUser({ ...user }); // Clonamos para no editar la lista original directamente
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: selectedUser.nombre_completo,
          email: selectedUser.email,
          password: selectedUser.password,
          rol: selectedUser.rol,
          departamento: selectedUser.departamento
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      toast.success("Usuario actualizado correctamente");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Error al actualizar: " + error.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Formulario Lateral de Creación */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#003876]">
            <UserPlus size={24}/> Nuevo Acceso
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input required placeholder="Nombre Completo" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.nombre_completo} onChange={e => setFormData({...formData, nombre_completo: e.target.value})} />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="email" required placeholder="Correo Institucional" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="password" required placeholder="Contraseña" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            
            <select className="w-full p-3 bg-gray-50 rounded-xl font-bold outline-none border-none focus:ring-2 focus:ring-blue-500" value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})}>
              <option value="admin">Administrador</option>
              <option value="responsable">Responsable</option>
              <option value="visor">Visor</option>
            </select>

            <select className="w-full p-3 bg-gray-50 rounded-xl text-xs outline-none border-none focus:ring-2 focus:ring-blue-500" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})}>
              {DEPARTAMENTOS_OFICIALES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <button type="submit" disabled={loading} className="w-full bg-[#003876] text-white py-4 rounded-xl font-bold hover:bg-blue-900 shadow-lg transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Registrar Usuario"}
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">PERSONAL VSTP</h3>
            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase">
              {users.length} Registrados
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Datos</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Dependencia</th>
                  <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Rol</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-bold text-sm text-gray-800">{u.nombre_completo}</div>
                      <div className="text-[11px] text-gray-400 font-medium">{u.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                        <Building size={12}/> {u.departamento}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                        u.rol === 'admin' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit3 size={18}/>
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN (Lógica de Actualización) */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600">
              <X size={24}/>
            </button>
            
            <div className="mb-6">
              <h3 className="text-2xl font-black text-[#003876]">Editar Acceso</h3>
              <p className="text-sm text-gray-400 font-medium">Actualiza la información del colaborador</p>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nombre Completo</label>
                <input required className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={selectedUser.nombre_completo} onChange={e => setSelectedUser({...selectedUser, nombre_completo: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Correo Institucional</label>
                <input required type="email" className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={selectedUser.email} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Cambiar Contraseña</label>
                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  value={selectedUser.password} onChange={e => setSelectedUser({...selectedUser, password: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rol</label>
                  <select className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                    value={selectedUser.rol} onChange={e => setSelectedUser({...selectedUser, rol: e.target.value})}>
                    <option value="admin">Admin</option>
                    <option value="responsable">Responsable</option>
                    <option value="visor">Visor</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Dependencia</label>
                  <select className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-[10px]" 
                    value={selectedUser.departamento} onChange={e => setSelectedUser({...selectedUser, departamento: e.target.value})}>
                    {DEPARTAMENTOS_OFICIALES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#003876] text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:bg-blue-900 transition-all mt-4">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;