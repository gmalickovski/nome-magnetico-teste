/**
 * CompanyNameForm — formulário para análise de nomes de empresa.
 * Envia para /api/analyze com product_type: 'nome_empresa'.
 */

import { useState } from 'react';
import { DateInput } from '../ui/DateInput';

interface FormState {
  nome_socio_principal: string;
  data_nascimento_socio: string;
  data_fundacao: string;
  ramo_atividade: string;
  descricao_negocio: string;
  nomes_candidatos: string;
  nome_socio2: string;
  data_nascimento_socio2: string;
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
    nome_socio2: '',
    data_nascimento_socio2: '',
  });
  const [showSocio2, setShowSocio2] = useState(false);
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
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_nascimento_socio)) {
      setError('A data de nascimento do sócio deve estar no formato DD/MM/AAAA.');
      return;
    }
    if (form.data_fundacao && !/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_fundacao)) {
      setError('A data de fundação deve estar no formato DD/MM/AAAA.');
      return;
    }
    if (showSocio2 && form.nome_socio2.trim() && !form.data_nascimento_socio2) {
      setError('Informe a data de nascimento do 2º sócio.');
      return;
    }
    if (showSocio2 && form.data_nascimento_socio2 && !/^\d{2}\/\d{2}\/\d{4}$/.test(form.data_nascimento_socio2)) {
      setError('A data de nascimento do 2º sócio deve estar no formato DD/MM/AAAA.');
      return;
    }
    if (candidatos.length === 0) {
      setError('Informe ao menos um nome candidato para a empresa.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: 'nome_empresa',
          nome_completo: form.nome_socio_principal,
          data_nascimento: form.data_nascimento_socio,
          data_fundacao: form.data_fundacao || undefined,
          ramo_atividade: form.ramo_atividade || undefined,
          descricao_negocio: form.descricao_negocio || undefined,
          nomes_candidatos: candidatos,
          ...(showSocio2 && form.nome_socio2.trim() ? {
            nome_socio2: form.nome_socio2.trim(),
            data_nascimento_socio2: form.data_nascimento_socio2,
          } : {}),
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
            <DateInput
              value={form.data_nascimento_socio}
              onChangeValue={v => set('data_nascimento_socio', v)}
              className="input-dark w-full"
              required
            />
          </div>
        </div>
      </div>

      {/* 2º Sócio (opcional) */}
      {!showSocio2 ? (
        <button
          type="button"
          onClick={() => setShowSocio2(true)}
          className="w-full py-3 rounded-xl border border-dashed border-white/20 text-gray-400 text-sm hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> Adicionar 2º Sócio
        </button>
      ) : (
        <div className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-gold font-semibold flex items-center gap-2">
              <span>👤</span> 2º Sócio
            </h3>
            <button
              type="button"
              onClick={() => { setShowSocio2(false); set('nome_socio2', ''); set('data_nascimento_socio2', ''); }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Remover
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome completo</label>
              <input
                type="text"
                value={form.nome_socio2}
                onChange={e => set('nome_socio2', e.target.value)}
                placeholder="ex: Ana Paula Ferreira"
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de nascimento</label>
              <DateInput
                value={form.data_nascimento_socio2}
                onChangeValue={v => set('data_nascimento_socio2', v)}
                className="input-dark w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dados da empresa */}
      <div className="glass rounded-xl p-5 space-y-4">
        <h3 className="text-gold font-semibold flex items-center gap-2">
          <span>🏢</span> Dados da Empresa
        </h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Data de fundação prevista</label>
          <DateInput
            value={form.data_fundacao}
            onChangeValue={v => set('data_fundacao', v)}
            className="input-dark w-full"
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
