/**
 * SocialNameForm — formulário para análise de Nome Social (novo fluxo).
 * Envia para /api/analyze com product_type: 'nome_social'.
 */

import { useState } from 'react';
import { DateInput } from '../ui/DateInput';

interface FormState {
  nome_completo: string;
  data_nascimento: string;
  objetivo_apresentacao: string;
  vibracoes_desejadas: string;
  contexto_uso: string;
  estilo_preferido: string;
  genero: string;
  nomes_candidatos: string;
}

interface Props {
  nomeInicial?: string;
  dataInicial?: string;
  onSuccess?: (analysisId: string) => void;
}

const ESTILOS = ['Clássico', 'Moderno', 'Espiritual', 'Internacional', 'Simples'];

const CONTEXTOS = [
  { value: 'profissional', label: '💼 Profissional' },
  { value: 'espiritual', label: '🕊 Espiritual' },
  { value: 'criativo', label: '🎨 Criativo' },
  { value: 'redes_sociais', label: '📱 Redes Sociais' },
  { value: 'pessoal', label: '👤 Pessoal' },
];

const VIBRACOES_SUGESTOES = [
  'Autoridade', 'Leveza', 'Criatividade', 'Espiritualidade',
  'Prosperidade', 'Cura', 'Liderança', 'Conexão', 'Intuição', 'Expansão',
];

export default function SocialNameForm({ nomeInicial = '', dataInicial = '', onSuccess }: Props) {
  type Mode = 'criar_social' | 'analisar_atual';
  const [modo, setModo] = useState<Mode>('criar_social');

  const [form, setForm] = useState<FormState>({
    nome_completo: nomeInicial,
    data_nascimento: dataInicial,
    objetivo_apresentacao: '',
    vibracoes_desejadas: '',
    contexto_uso: '',
    estilo_preferido: '',
    genero: '',
    nomes_candidatos: '',
  });

  const [formAtual, setFormAtual] = useState({
    nome_completo: nomeInicial,
    data_nascimento: dataInicial,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleModoChange(novoModo: Mode) {
    if (modo === novoModo) return;
    setModo(novoModo);
    setError('');
  }

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  }

  function toggleVibracao(v: string) {
    const current = form.vibracoes_desejadas;
    const already = current.toLowerCase().includes(v.toLowerCase());
    if (already) {
      set('vibracoes_desejadas', current.replace(new RegExp(`,?\\s*${v}`, 'i'), '').replace(/^,\s*/, '').trim());
    } else {
      set('vibracoes_desejadas', current ? `${current}, ${v}` : v);
    }
  }

  const candidatosCount = form.nomes_candidatos
    .split(/[,;\n]+/)
    .filter(n => n.trim().length >= 2).length;

  async function handleSubmitCriar(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.nome_completo.trim() || form.nome_completo.trim().length < 2) {
      setError('Informe seu nome completo de nascimento.');
      return;
    }

    if (!form.data_nascimento) {
      setError('Informe sua data de nascimento.');
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_nascimento)) {
      setError('A data de nascimento deve estar no formato DD/MM/AAAA.');
      return;
    }

    const candidatos = form.nomes_candidatos
      .split(/[,;\n]+/)
      .map(n => n.trim())
      .filter(n => n.length >= 2);

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'nome_social',
          nome_completo: form.nome_completo.trim(),
          data_nascimento: form.data_nascimento,
          objetivo_apresentacao: form.objetivo_apresentacao.trim() || undefined,
          vibracoes_desejadas: form.vibracoes_desejadas.trim() || undefined,
          contexto_uso: form.contexto_uso || undefined,
          estilo_preferido: form.estilo_preferido || undefined,
          genero_preferido: form.genero || undefined,
          nomes_candidatos: candidatos.length > 0 ? candidatos : undefined,
          nome_ja_escolhido: false,
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

  async function handleSubmitAtual(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!formAtual.nome_completo.trim() || formAtual.nome_completo.trim().length < 2) {
      setError('Informe o nome completo a ser analisado.');
      return;
    }

    if (!formAtual.data_nascimento) {
      setError('Informe a data de nascimento.');
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formAtual.data_nascimento)) {
      setError('A data de nascimento deve estar no formato DD/MM/AAAA.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'nome_social',
          nome_completo: formAtual.nome_completo.trim(),
          data_nascimento: formAtual.data_nascimento,
          nome_ja_escolhido: true,
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
    <div className="space-y-6">
      {/* Seletor de modo */}
      <div className="glass rounded-xl p-1 flex gap-1">
        <button
          type="button"
          onClick={() => handleModoChange('criar_social')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            modo === 'criar_social'
              ? 'bg-gold text-black shadow-lg shadow-gold/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Criar Novo Nome Social</span>
          <span className="sm:hidden">Criar Nome</span>
        </button>
        <button
          type="button"
          onClick={() => handleModoChange('analisar_atual')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            modo === 'analisar_atual'
              ? 'bg-gold text-black shadow-lg shadow-gold/20'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          <span>✨</span>
          <span className="hidden sm:inline">Analisar Nome Atual (Registro)</span>
          <span className="sm:hidden">Nome Atual</span>
        </button>
      </div>

      {modo === 'criar_social' ? (
        <form onSubmit={handleSubmitCriar} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ── SEÇÃO 1: Dados de Nascimento (âncora) ── */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-gold font-semibold flex items-center gap-2">
              <span>🌟</span> Dados de Nascimento
            </h3>
            <p className="text-sm text-gray-400">
              Seu nome completo de nascimento e data são a âncora numerológica imutável da análise.
            </p>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome completo de nascimento *</label>
              <input
                type="text"
                value={form.nome_completo}
                onChange={e => set('nome_completo', e.target.value)}
                placeholder="Ex: Maria da Silva Santos"
                className="input-dark w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de nascimento *</label>
              <div className="w-full sm:w-1/2">
                <DateInput
                  value={form.data_nascimento}
                  onChangeValue={v => set('data_nascimento', v)}
                  className="input-dark w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 2: Intenção e Contexto ── */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-gold font-semibold flex items-center gap-2">
              <span>🎯</span> Intenção e Contexto <span className="text-gray-500 text-xs font-normal">(opcional)</span>
            </h3>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Como você quer se apresentar ao mundo neste momento?</label>
              <textarea
                value={form.objetivo_apresentacao}
                onChange={e => set('objetivo_apresentacao', e.target.value)}
                placeholder="Ex: Quero ser reconhecida como uma profissional de saúde com presença espiritual e autoridade..."
                rows={3}
                maxLength={500}
                className="input-dark w-full resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">{form.objetivo_apresentacao.length}/500 caracteres</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contexto principal de uso</label>
              <div className="flex flex-wrap gap-2">
                {CONTEXTOS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('contexto_uso', form.contexto_uso === opt.value ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      form.contexto_uso === opt.value
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

          {/* ── SEÇÃO 3: Vibrações Desejadas ── */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="text-gold font-semibold flex items-center gap-2">
              <span>✨</span> Vibrações Desejadas <span className="text-gray-500 text-xs font-normal">(opcional)</span>
            </h3>
            <p className="text-sm text-gray-400">
              Que características e energias você quer atrair para este momento da sua vida?
            </p>

            <div className="flex flex-wrap gap-2">
              {VIBRACOES_SUGESTOES.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVibracao(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 ${
                    form.vibracoes_desejadas.toLowerCase().includes(v.toLowerCase())
                      ? 'bg-gold text-black font-medium'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <textarea
              value={form.vibracoes_desejadas}
              onChange={e => set('vibracoes_desejadas', e.target.value)}
              placeholder="Ex: autoridade, expansão, cura, liderança espiritual..."
              rows={2}
              maxLength={300}
              className="input-dark w-full resize-none"
            />

            <div>
              <label className="block text-sm text-gray-400 mb-2">Gênero do nome</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'masculino', label: '♂ Masculino' },
                  { value: 'feminino', label: '♀ Feminino' },
                  { value: 'neutro', label: '⚧ Neutro' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set('genero', form.genero === opt.value ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                      form.genero === opt.value
                        ? 'bg-gold text-black font-medium'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 4: Nomes Candidatos ── */}
          <div className="glass rounded-xl p-5 space-y-3">
            <h3 className="text-gold font-semibold flex items-center gap-2">
              <span>📝</span> Nomes que você gostaria de considerar <span className="text-gray-500 text-xs font-normal">(opcional)</span>
            </h3>
            <p className="text-sm text-gray-400">
              Informe nomes ou variações que você já pensa em usar. Separe por vírgula, ponto e vírgula ou enter.
            </p>
            <textarea
              value={form.nomes_candidatos}
              onChange={e => set('nomes_candidatos', e.target.value)}
              placeholder="Ex: Mari, Maria, Mariana, Mari Santos..."
              rows={4}
              className="input-dark w-full resize-none"
            />
            {candidatosCount > 0 ? (
              <p className="text-xs text-gray-500">{candidatosCount} nome(s) informado(s)</p>
            ) : (
              <p className="text-xs text-amber-500/70">
                Nenhum nome informado — a IA gerará sugestões numerologicamente compatíveis com seu Destino.
              </p>
            )}
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
                Gerando Nome Social...
              </span>
            ) : (
              'Gerar Novo Nome Social'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmitAtual} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* ── SEÇÃO ÚNICA: Dados de Nascimento ── */}
          <div className="glass rounded-xl p-5 space-y-4">
            <div className="mb-4">
              <h3 className="text-gold font-semibold flex items-center gap-2 text-lg">
                <span>🔍</span> Relatório Completo do Nome de Batismo
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Esta análise detalhada mostrará como o seu nome atual atua na sua vida, revelando todos os bloqueios e harmonia entre seus números base.
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome completo atual (de registro) *</label>
              <input
                type="text"
                value={formAtual.nome_completo}
                onChange={e => {
                  setFormAtual(prev => ({ ...prev, nome_completo: e.target.value }));
                  setError('');
                }}
                placeholder="Ex: Maria da Silva Santos"
                className="input-dark w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de nascimento *</label>
              <div className="w-full sm:w-1/2">
                <DateInput
                  value={formAtual.data_nascimento}
                  onChangeValue={v => {
                    setFormAtual(prev => ({ ...prev, data_nascimento: v }));
                    setError('');
                  }}
                  className="input-dark w-full"
                  required
                />
              </div>
            </div>
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
                Analisando Nome Atual...
              </span>
            ) : (
              'Analisar e Verificar Bloqueios'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
