/**
 * BrandingIdentidade — seção de Identidade Visual Magnética para Nome Empresa.
 *
 * Exibe sugestões de cores, tipografia e estilo de logo derivadas do
 * número de Expressão da empresa, unindo numerologia e design gráfico.
 */
import React from 'react';
import type { IdentidadeVisual } from '../../../backend/numerology/branding';

interface Props {
  identidade: IdentidadeVisual;
  nomeEmpresa: string;
  expressao: number;
}

export default function BrandingIdentidade({ identidade, nomeEmpresa, expressao }: Props) {
  const { cores, tipografia, logo } = identidade;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da seção */}
      <div className="rounded-2xl bg-[#4A7FC1]/5 border border-[#4A7FC1]/20 p-6">
        <p className="text-xs text-[#4A7FC1] font-bold uppercase tracking-[0.15em] mb-2">
          Expressão {expressao} · {identidade.titulo}
        </p>
        <p className="text-gray-300 leading-relaxed text-sm">{identidade.descricaoGeral}</p>
      </div>

      {/* Paleta de Cores */}
      <div>
        <h3 className="font-cinzel text-sm uppercase tracking-[0.12em] text-[#D4AF37]/80 mb-4">
          🎨 Paleta de Cores Numerológica
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Cor Primária', cor: cores.primaria },
            { label: 'Cor Secundária', cor: cores.secundaria },
            { label: 'Cor de Acento', cor: cores.acento },
          ].map(({ label, cor }) => (
            <div key={label} className="rounded-2xl bg-white/5 overflow-hidden">
              {/* Swatch de cor */}
              <div
                className="h-20 w-full"
                style={{ backgroundColor: cor.hex }}
              />
              <div className="p-4">
                <p className="text-[10px] text-[#76746a] uppercase tracking-[0.1em] mb-1">{label}</p>
                <p className="font-cinzel text-white font-semibold text-sm mb-1">{cor.nome}</p>
                <p className="font-mono text-[#D4AF37] text-xs mb-2">{cor.hex}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{cor.significado}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Preview de combinação */}
        <div className="mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: cores.secundaria.hex }}>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: cores.acento.hex, opacity: 0.8 }}>
                Preview da Identidade
              </p>
              <p className="font-bold text-lg" style={{ color: cores.acento.hex }}>
                {nomeEmpresa}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
              style={{ backgroundColor: cores.primaria.hex, color: cores.acento.hex }}
            >
              {expressao}
            </div>
          </div>
          <div className="h-2" style={{ backgroundColor: cores.primaria.hex }} />
        </div>
      </div>

      {/* Tipografia */}
      <div>
        <h3 className="font-cinzel text-sm uppercase tracking-[0.12em] text-[#D4AF37]/80 mb-4">
          ✍️ Tipografia Recomendada
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-[10px] text-[#76746a] uppercase tracking-[0.1em] mb-2">Para Títulos & Logotipo</p>
            <p className="text-white font-semibold text-sm mb-2">{tipografia.titulos.sugestao}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{tipografia.titulos.estilo}</p>
            <div
              className="mt-3 text-2xl font-bold tracking-wider"
              style={{ color: cores.primaria.hex }}
            >
              {nomeEmpresa}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-5">
            <p className="text-[10px] text-[#76746a] uppercase tracking-[0.1em] mb-2">Para Corpo de Texto</p>
            <p className="text-white font-semibold text-sm mb-2">{tipografia.corpo.sugestao}</p>
            <p className="text-gray-400 text-xs leading-relaxed">{tipografia.corpo.estilo}</p>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed">
              Comunicar com clareza e autenticidade é o diferencial desta vibração.
            </p>
          </div>
        </div>
      </div>

      {/* Estilo de Logo */}
      <div>
        <h3 className="font-cinzel text-sm uppercase tracking-[0.12em] text-[#D4AF37]/80 mb-4">
          🔷 Estilo & Símbolo do Logotipo
        </h3>
        <div className="rounded-2xl bg-white/5 p-6 space-y-5">
          <div>
            <p className="text-[10px] text-[#76746a] uppercase tracking-[0.1em] mb-2">Estilo Visual</p>
            <p className="text-white font-medium text-sm">{logo.estilo}</p>
          </div>

          <div>
            <p className="text-[10px] text-[#76746a] uppercase tracking-[0.1em] mb-2">Descrição & Orientação</p>
            <p className="text-gray-300 text-sm leading-relaxed">{logo.descricao}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-emerald-400 uppercase tracking-[0.1em] mb-2">✓ Formas Recomendadas</p>
              <ul className="space-y-1">
                {logo.formas.map((f, i) => (
                  <li key={i} className="text-gray-300 text-xs flex items-start gap-2">
                    <span style={{ color: cores.primaria.hex }}>◆</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] text-red-400 uppercase tracking-[0.1em] mb-2">✗ Elementos a Evitar</p>
              <ul className="space-y-1">
                {logo.evitar.map((e, i) => (
                  <li key={i} className="text-gray-400 text-xs flex items-start gap-2">
                    <span className="text-red-400/60">✗</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Nota */}
      <p className="text-[10px] text-[#76746a] text-center leading-relaxed px-4">
        Estas orientações de branding são derivadas da vibração numerológica da <strong className="text-[#D4AF37]/60">Expressão {expressao}</strong> da empresa.
        A identidade visual final deve ser desenvolvida com um designer que compreenda e aplique estas diretrizes energéticas.
      </p>
    </div>
  );
}
