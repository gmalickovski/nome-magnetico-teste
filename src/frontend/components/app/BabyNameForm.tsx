/**
 * BabyNameForm — formulário para análise de nomes de bebê.
 * Envia para /api/analyze com product_type: 'nome_bebe'.
 */

import { useState } from 'react';
import { DateInput } from '../ui/DateInput';

interface FormState {
  data_nascimento_bebe: string;
  nome_pai: string;
  sobrenome_pai: string;
  ignorar_pai: boolean;
  nome_mae: string;
  sobrenome_mae: string;
  ignorar_mae: boolean;
  outros_sobrenomes: string;
  genero_preferido: string;
  estilo_preferido: string;
  nomes_candidatos: string;
  caracteristicas_desejadas: string;
}

interface Props {
  onSuccess?: (analysisId: string) => void;
}

const ESTILOS = ['Clássico', 'Moderno', 'Espiritual', 'Internacional', 'Simples', 'Composto'];

export default function BabyNameForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    data_nascimento_bebe: '',
    nome_pai: '',
    sobrenome_pai: '',
    ignorar_pai: false,
    nome_mae: '',
    sobrenome_mae: '',
    ignorar_mae: false,
    outros_sobrenomes: '',
    genero_preferido: 'surpresa',
    estilo_preferido: '',
    nomes_candidatos: '',
    caracteristicas_desejadas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Define um tipo genérico K que é uma chave de FormState
  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
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

    const outros = form.outros_sobrenomes
      .split(/[,;\n]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    const temSobrenomeMae = !form.ignorar_mae && form.sobrenome_mae.trim().length > 0;
    const temSobrenomePai = !form.ignorar_pai && form.sobrenome_pai.trim().length > 0;
    const temOutros = outros.length > 0;

    if (!form.data_nascimento_bebe) {
      setError('Informe a data de nascimento ou data prevista do bebê.');
      return;
    }
    
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_nascimento_bebe)) {
      setError('A data de nascimento do bebê deve estar no formato DD/MM/AAAA completando o ano corretamente.');
      return;
    }
    
    if (!temSobrenomeMae && !temSobrenomePai && !temOutros) {
      setError('Informe ao menos um sobrenome familiar para compor o nome (da mãe, do pai ou outros).');
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
          nome_completo: `(bebê)`, // Será dinamicamente complementado no backend
          data_nascimento: form.data_nascimento_bebe,
          nome_pai: form.nome_pai || undefined,
          sobrenome_pai: form.sobrenome_pai || undefined,
          ignorar_pai: form.ignorar_pai,
          nome_mae: form.nome_mae || undefined,
          sobrenome_mae: form.sobrenome_mae || undefined,
          ignorar_mae: form.ignorar_mae,
          outros_sobrenomes: outros.length > 0 ? outros : undefined,
          genero_preferido: form.genero_preferido,
          estilo_preferido: form.estilo_preferido || undefined,
          caracteristicas_desejadas: form.caracteristicas_desejadas.trim() || undefined,
          nomes_candidatos: candidatos,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao iniciar análise');

      if (onSuccess) {
        onSuccess(data.analysisId);
      } else {
        window.location.href = `/app/resultado/${data.analysisId}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>👶</span> Dados do Bebê e da Família
        </h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Data de nascimento (real ou prevista) *</label>
          <div className="w-full sm:w-1/2">
            <DateInput
              value={form.data_nascimento_bebe}
              onChangeValue={v => set('data_nascimento_bebe', v)}
              className="input-dark w-full"
              required
            />
          </div>
        </div>

        {/* Dados da Mãe */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <h4 className="text-gold font-medium text-sm flex items-center gap-2 uppercase tracking-wider">
            Dados da Mãe
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Primeiro Nome</label>
              <input
                type="text"
                value={form.nome_mae}
                onChange={e => set('nome_mae', e.target.value)}
                placeholder="Ex: Maria"
                className="input-dark w-full"
                disabled={form.ignorar_mae}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sobrenome da mãe</label>
              <input
                type="text"
                value={form.sobrenome_mae}
                onChange={e => set('sobrenome_mae', e.target.value)}
                placeholder="Ex: Silva"
                className="input-dark w-full"
                disabled={form.ignorar_mae}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.ignorar_mae}
              onChange={e => set('ignorar_mae', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold"
            />
            <span className="text-sm text-gray-400 select-none">Não considerar os dados da mãe na análise</span>
          </label>
        </div>

        {/* Dados do Pai */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <h4 className="text-gold font-medium text-sm flex items-center gap-2 uppercase tracking-wider">
            Dados do Pai
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Primeiro Nome</label>
              <input
                type="text"
                value={form.nome_pai}
                onChange={e => set('nome_pai', e.target.value)}
                placeholder="Ex: João"
                className="input-dark w-full"
                disabled={form.ignorar_pai}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sobrenome do pai</label>
              <input
                type="text"
                value={form.sobrenome_pai}
                onChange={e => set('sobrenome_pai', e.target.value)}
                placeholder="Ex: Santos"
                className="input-dark w-full"
                disabled={form.ignorar_pai}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.ignorar_pai}
              onChange={e => set('ignorar_pai', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold"
            />
            <span className="text-sm text-gray-400 select-none">Não considerar os dados do pai na análise</span>
          </label>
        </div>

        {/* Outros Sobrenomes */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <h4 className="text-gold font-medium text-sm uppercase tracking-wider mb-1">Outros sobrenomes utilizados na família</h4>
          <label className="block text-xs text-gray-400 mb-2">
            Pode separar por vírgula ou adicionar cada um em uma linha nova pressionando 'Enter'.
          </label>
          <textarea
            value={form.outros_sobrenomes}
            onChange={e => set('outros_sobrenomes', e.target.value)}
            placeholder="Ex: Souza, Ferreira"
            rows={2}
            className="input-dark w-full resize-none"
          />
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

      {/* Características desejadas */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>✨</span> Características Desejadas <span className="text-gray-500 text-xs font-normal">(opcional)</span>
        </h3>
        <p className="text-sm text-gray-400">
          Descreva características de personalidade que você gostaria que seu filho tivesse. A IA levará isso em consideração na análise e nas sugestões.
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {['Responsável', 'Carinhoso', 'Determinado', 'Criativo', 'Divertido', 'Sério', 'Meigo', 'Corajoso', 'Sensível', 'Liderança'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => {
                const current = form.caracteristicas_desejadas;
                const already = current.toLowerCase().includes(c.toLowerCase());
                if (already) {
                  set('caracteristicas_desejadas', current.replace(new RegExp(`,?\\s*${c}`, 'i'), '').replace(/^,\s*/, '').trim());
                } else {
                  set('caracteristicas_desejadas', current ? `${current}, ${c}` : c);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                form.caracteristicas_desejadas.toLowerCase().includes(c.toLowerCase())
                  ? 'bg-gold text-black font-medium'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <textarea
          value={form.caracteristicas_desejadas}
          onChange={e => set('caracteristicas_desejadas', e.target.value)}
          placeholder="Ex: responsável, carinhoso, com liderança natural, criativo..."
          rows={2}
          className="input-dark w-full resize-none"
        />
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
          'Analisar Nomes do Bebê'
        )}
      </button>
    </form>
  );
}
