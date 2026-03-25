import React, { useState } from 'react';

type UserData = {
  id: string;
  email: string | null;
  nome: string | null;
  role: string | null;
  created_at: string;
};

type AdminUsersTableProps = {
  initialUsers: UserData[];
  activeProducts: Record<string, string[]>;
};

const PRODUCT_BADGES: Record<string, { label: string; style: string }> = {
  nome_social: { label: 'NM', style: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' },
  nome_bebe:      { label: 'Bebê', style: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
  nome_empresa:   { label: 'Empresa', style: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
};

export default function AdminUsersTable({ initialUsers, activeProducts }: AdminUsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsChangingRole(true);
    try {
      const resp = await fetch('/api/admin/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole }),
      });
      if (!resp.ok) {
        throw new Error('Erro ao alterar role');
      }
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
      alert('Categoria do usuário atualizada com sucesso.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsChangingRole(false);
    }
  };

  const openUserDetails = (user: UserData) => {
    setSelectedUser(user);
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Email</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Nome</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Role</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Produtos</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Cadastro</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium whitespace-nowrap">Opções</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const nomeDisplay = user.nome || '—';
              const roleClass = user.role === 'admin'
                ? 'px-2 py-0.5 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#D4AF37]'
                : 'px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400';
              const products = activeProducts[user.id] ?? [];
              return (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3 text-gray-200 whitespace-nowrap cursor-pointer hover:underline decoration-[#D4AF37]" onClick={() => openUserDetails(user)}>{user.email}</td>
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap cursor-pointer hover:underline decoration-[#D4AF37]" onClick={() => openUserDetails(user)}>{nomeDisplay}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className={roleClass}>{user.role}</span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {products.length === 0
                        ? <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700/40 text-gray-500">—</span>
                        : products.map(p => {
                            const badge = PRODUCT_BADGES[p] ?? { label: p, style: 'bg-gray-500/20 text-gray-400' };
                            return <span key={p} className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.style}`}>{badge.label}</span>;
                          })
                      }
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button 
                      onClick={() => openUserDetails(user)}
                      className="text-[#D4AF37] hover:text-[#f2ca50] text-xs font-medium px-3 py-1 border border-[#D4AF37]/30 rounded-lg transition-colors"
                    >
                      Editar / Detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button 
              onClick={closeUserDetails}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-xl font-cinzel font-bold text-[#D4AF37] mb-6">Visualização de Usuário</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider">Email</label>
                <p className="text-white text-base">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider">Nome Completo</label>
                <p className="text-white text-base">{selectedUser.nome || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider">Data de Cadastro</label>
                  <p className="text-white text-sm">{new Date(selectedUser.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider">Nível de Permissão</label>
                  <div className="mt-1 flex items-center gap-2">
                    <select 
                      value={selectedUser.role || 'user'}
                      onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                      disabled={isChangingRole}
                      className="bg-black border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:border-[#D4AF37] disabled:opacity-50 outline-none"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {isChangingRole && <span className="text-xs text-gray-500">Salvando...</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block border-t border-white/10 pt-4 mt-2">Planos e Produtos Ativos</label>
                <div className="flex flex-wrap gap-2">
                  {activeProducts[selectedUser.id]?.length ? (
                    activeProducts[selectedUser.id].map(p => {
                      const badge = PRODUCT_BADGES[p] ?? { label: p, style: 'bg-gray-500/20 text-gray-400' };
                      return <span key={p} className={`px-3 py-1 rounded-full text-xs font-medium ${badge.style}`}>{p.replace('_', ' ').toUpperCase()} ({badge.label})</span>;
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum produto ativo encontrado.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={closeUserDetails}
                className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                >Feito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
