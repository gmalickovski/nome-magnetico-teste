/**
 * BabyNameForm — formulário para análise de nomes de bebê.
 * Envia para /api/analyze com product_type: 'nome_bebe'.
 */

import { useState } from 'react';

interface FormState {
  sobrenome_familia: string;
  data_nascimento_bebe: string;
  nome_pai: string;
  nome_mae: string;
  genero_preferido: string;
  estilo_preferido: string;
  nomes_candidatos: string;
}

interface Props {
  onSuccess?: (analysisId: string) => void;
}

const ESTILOS = ['Clássico', 'Moderno', 'Espiritual', 'Internacional', 'Simples', 'Composto'];

export default function BabyNameForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    sobrenome_familia: '',
    data_nascimento_bebe: '',
    nome_pai: '',
    nome_mae: '',
    genero_preferido: 'surpresa',
    estilo_preferido: '',
    nomes_candidatos: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const candidatos = form.nomes_candidatos
      .split(/[,;\n]+/)
      .map(n => n.trim())
      .filter(n => n.length >= 2);

    if (!form.sobrenome_familia.trim()) {
      setError('O sobrenome da família é obrigatório.');
      return;
    }
    if (!form.data_nascimento_bebe) {
      setError('Informe a data de nascimento ou data prevista do bebê.');
      return;
    }
    if (candidatos.length === 0) {
      setError('Informe ao menos um nome candidato.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'nome_bebe',
          nome_completo: `(bebê) ${form.sobrenome_familia}`,
          data_nascimento: form.data_nascimento_bebe.replace(/-/g, '/').split('/').reverse().join('/'),
          sobrenome_familia: form.sobrenome_familia,
          nome_pai: form.nome_pai || undefined,
          nome_mae: form.nome_mae || undefined,
          genero_preferido: form.genero_preferido,
          estilo_preferido: form.estilo_preferido || undefined,
          nomes_candidatos: candidatos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao iniciar análise');

      onSuccess?.(data.analysisId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados da família */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>👶</span> Dados do Bebê e da Família
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sobrenome da família *</label>
            <input
              type="text"
              value={form.sobrenome_familia}
              onChange={e => set('sobrenome_familia', e.target.value)}
              placeholder="ex: Silva Santos"
              className="input-dark w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Data de nascimento (real ou prevista) *</label>
            <input
              type="date"
              value={form.data_nascimento_bebe}
              onChange={e => set('data_nascimento_bebe', e.target.value)}
              className="input-dark w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome do pai</label>
            <input
              type="text"
              value={form.nome_pai}
              onChange={e => set('nome_pai', e.target.value)}
              placeholder="opcional"
              className="input-dark w-full"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome da mãe</label>
            <input
              type="text"
              value={form.nome_mae}
              onChange={e => set('nome_mae', e.target.value)}
              placeholder="opcional"
              className="input-dark w-full"
            />
          </div>
        </div>
      </div>

      {/* Preferências */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>⚙️</span> Preferências
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Gênero preferido</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'masculino', label: '♂ Masculino' },
                { value: 'feminino', label: '♀ Feminino' },
                { value: 'neutro', label: '⚧ Neutro' },
                { value: 'surpresa', label: '🎁 Surpresa' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('genero_preferido', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    form.genero_preferido === opt.value
                      ? 'bg-gold text-black font-medium'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Estilo do nome</label>
            <div className="flex flex-wrap gap-2">
              {ESTILOS.map(estilo => (
                <button
                  key={estilo}
                  type="button"
                  onClick={() => set('estilo_preferido', form.estilo_preferido === estilo ? '' : estilo)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    form.estilo_preferido === estilo
                      ? 'bg-gold text-black font-medium'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {estilo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nomes candidatos */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>📝</span> Nomes Candidatos
        </h3>
        <p className="text-sm text-gray-400">
          Liste os nomes que você está considerando (primeiro nome apenas). Separe por vírgula, ponto e vírgula ou enter.
        </p>
        <textarea
          value={form.nomes_candidatos}
          onChange={e => set('nomes_candidatos', e.target.value)}
          placeholder="ex: Sofia, Laura, Isabella, Valentina"
          rows={4}
          className="input-dark w-full resize-none"
          required
        />
        <p className="text-xs text-gray-500">
          {form.nomes_candidatos
            .split(/[,;\n]+/)
            .filter(n => n.trim().length >= 2).length} nome(s) informado(s)
        </p>
      </div>

      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-4 text-base font-semibold disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Analisando os nomes...
          </span>
        ) : (
          '✦ Analisar Nomes do Bebê'
        )}
      </button>
    </form>
  );
}
