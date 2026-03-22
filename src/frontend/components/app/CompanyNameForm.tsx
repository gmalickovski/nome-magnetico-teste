/**
 * CompanyNameForm — formulário para análise de nomes de empresa.
 * Envia para /api/analyze com product_type: 'nome_empresa'.
 */

import { useState } from 'react';

interface FormState {
  nome_socio_principal: string;
  data_nascimento_socio: string;
  data_fundacao: string;
  ramo_atividade: string;
  descricao_negocio: string;
  nomes_candidatos: string;
}

interface Props {
  onSuccess?: (analysisId: string) => void;
}

const RAMOS = [
  'Tecnologia', 'Saúde e Bem-estar', 'Educação', 'Consultoria',
  'Comércio', 'Serviços', 'Gastronomia', 'Arte e Criatividade',
  'Finanças', 'Imobiliário', 'Comunicação', 'Indústria',
];

export default function CompanyNameForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    nome_socio_principal: '',
    data_nascimento_socio: '',
    data_fundacao: '',
    ramo_atividade: '',
    descricao_negocio: '',
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

    if (!form.nome_socio_principal.trim()) {
      setError('O nome do sócio principal é obrigatório.');
      return;
    }
    if (!form.data_nascimento_socio) {
      setError('Informe a data de nascimento do sócio principal.');
      return;
    }
    if (candidatos.length === 0) {
      setError('Informe ao menos um nome candidato para a empresa.');
      return;
    }

    setLoading(true);
    try {
      const formatDate = (d: string) =>
        d ? d.replace(/-/g, '/').split('/').reverse().join('/') : '';

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'nome_empresa',
          nome_completo: form.nome_socio_principal,
          data_nascimento: formatDate(form.data_nascimento_socio),
          data_fundacao: form.data_fundacao ? formatDate(form.data_fundacao) : undefined,
          ramo_atividade: form.ramo_atividade || undefined,
          descricao_negocio: form.descricao_negocio || undefined,
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
      {/* Sócio principal */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>👤</span> Sócio Principal
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome completo *</label>
            <input
              type="text"
              value={form.nome_socio_principal}
              onChange={e => set('nome_socio_principal', e.target.value)}
              placeholder="ex: Carlos Eduardo Mendes"
              className="input-dark w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Data de nascimento *</label>
            <input
              type="date"
              value={form.data_nascimento_socio}
              onChange={e => set('data_nascimento_socio', e.target.value)}
              className="input-dark w-full"
              required
            />
          </div>
        </div>
      </div>

      {/* Dados da empresa */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>🏢</span> Dados da Empresa
        </h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Data de fundação prevista</label>
          <input
            type="date"
            value={form.data_fundacao}
            onChange={e => set('data_fundacao', e.target.value)}
            className="input-dark w-full sm:w-auto"
          />
          <p className="text-xs text-gray-500 mt-1">
            Opcional — se informada, usaremos o Destino da empresa na análise
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Ramo de atividade</label>
          <div className="flex flex-wrap gap-2">
            {RAMOS.map(ramo => (
              <button
                key={ramo}
                type="button"
                onClick={() => set('ramo_atividade', form.ramo_atividade === ramo ? '' : ramo)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                  form.ramo_atividade === ramo
                    ? 'bg-gold text-black font-medium'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {ramo}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Descrição do negócio</label>
          <textarea
            value={form.descricao_negocio}
            onChange={e => set('descricao_negocio', e.target.value)}
            placeholder="Descreva brevemente o que a empresa faz e o público-alvo..."
            rows={3}
            className="input-dark w-full resize-none"
          />
        </div>
      </div>

      {/* Nomes candidatos */}
      <div className="glass rounded-xl p-5 space-y-3">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>📝</span> Nomes Candidatos
        </h3>
        <p className="text-sm text-gray-400">
          Liste os nomes que você está considerando para a empresa. Separe por vírgula, ponto e vírgula ou enter.
        </p>
        <textarea
          value={form.nomes_candidatos}
          onChange={e => set('nomes_candidatos', e.target.value)}
          placeholder="ex: TechNova, Lumina Digital, Synapse Solutions"
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
          'Analisar Nomes da Empresa'
        )}
      </button>
    </form>
  );
}
