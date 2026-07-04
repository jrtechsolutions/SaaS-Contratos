import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  TIPOS_PROPOSTA,
  isProjetoFixo,
  isModulos,
  computeValorMensalidadeTotal,
  hasRecorrencia,
  formatCurrency,
  parseCurrency,
  type PricingFormData,
  type ItemRecorrente,
} from "@/lib/proposta-pricing";

interface ProposalPricingStepProps {
  pricing: PricingFormData;
  onChange: (pricing: PricingFormData) => void;
}

function CurrencyInput({
  label,
  value,
  onChange,
  required,
  placeholder = "R$ 0,00",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && " *"}
      </label>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          let v = e.target.value.replace(/[^\d,.-]/g, "");
          const parts = v.split(/[,.]/);
          if (parts.length > 2) v = parts[0] + "," + parts.slice(1).join("");
          onChange(v);
        }}
        onBlur={() => {
          const num = parseCurrency(value);
          if (num > 0) onChange(formatCurrency(num));
        }}
      />
    </div>
  );
}

function ItemValorInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [local, setLocal] = useState(value > 0 ? formatCurrency(value) : "");

  return (
    <input
      type="text"
      className="input-field"
      placeholder="R$ 0,00"
      value={local}
      onChange={(e) => {
        let v = e.target.value.replace(/[^\d,.-]/g, "");
        const parts = v.split(/[,.]/);
        if (parts.length > 2) v = parts[0] + "," + parts.slice(1).join("");
        setLocal(v);
        onChange(parseCurrency(v));
      }}
      onBlur={() => {
        if (value > 0) setLocal(formatCurrency(value));
      }}
    />
  );
}

function ItensRecorrentesList({
  titulo,
  descricao,
  placeholderNome,
  placeholderDescricao,
  botaoLabel,
  itens,
  onChange,
}: {
  titulo: string;
  descricao: string;
  placeholderNome: string;
  placeholderDescricao: string;
  botaoLabel: string;
  itens: ItemRecorrente[];
  onChange: (itens: ItemRecorrente[]) => void;
}) {
  const updateItem = (index: number, partial: Partial<ItemRecorrente>) => {
    const next = [...itens];
    next[index] = { ...next[index], ...partial };
    onChange(next);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold">{titulo}</h4>
          <p className="text-xs text-muted-foreground mt-1">{descricao}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...itens, { nome: "", valor_mensal: 0 }])}
          className="gap-1 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {botaoLabel}
        </Button>
      </div>

      {itens.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          Nenhum item adicionado. Clique em &quot;{botaoLabel}&quot; para começar.
        </p>
      ) : (
        <div className="space-y-3">
          {itens.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 items-start p-3 rounded-lg bg-muted/30"
            >
              <div className="space-y-2">
                <Input
                  placeholder={placeholderNome}
                  value={item.nome}
                  onChange={(e) => updateItem(index, { nome: e.target.value })}
                />
                <Input
                  placeholder={placeholderDescricao}
                  value={item.descricao || ""}
                  onChange={(e) => updateItem(index, { descricao: e.target.value })}
                />
              </div>
              <ItemValorInput
                value={item.valor_mensal}
                onChange={(v) => updateItem(index, { valor_mensal: v })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(itens.filter((_, i) => i !== index))}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProposalPricingStep({ pricing, onChange }: ProposalPricingStepProps) {
  const [termosAbertos, setTermosAbertos] = useState(false);

  const update = (partial: Partial<PricingFormData>) => {
    onChange({ ...pricing, ...partial });
  };

  const handleTipoChange = (tipo: PricingFormData["tipoProposta"]) => {
    onChange({
      ...pricing,
      tipoProposta: tipo,
      modulos: tipo === "modulos" ? pricing.modulos : [],
      custosMensais: tipo === "projeto_fixo" ? pricing.custosMensais : pricing.custosMensais,
      valorSistema: tipo === "modulos" ? "" : pricing.valorSistema,
      condicoesPagamento: tipo === "modulos" ? "" : pricing.condicoesPagamento,
      temExclusividade: tipo === "modulos" ? pricing.temExclusividade : false,
    });
  };

  const totalMensal = computeValorMensalidadeTotal(
    pricing.tipoProposta,
    pricing.modulos,
    pricing.custosMensais
  );
  const temRecorrencia = hasRecorrencia(
    pricing.tipoProposta,
    pricing.modulos,
    pricing.custosMensais
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-semibold mb-1">Valores e Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Escolha como esta proposta será cobrada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPOS_PROPOSTA.map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            onClick={() => handleTipoChange(tipo.value)}
            className={`p-4 rounded-lg border text-left transition-all ${
              pricing.tipoProposta === tipo.value
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            <p className="font-semibold text-sm">{tipo.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{tipo.description}</p>
          </button>
        ))}
      </div>

      {/* PROJETO FIXO */}
      {isProjetoFixo(pricing.tipoProposta) && (
        <>
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h4 className="font-semibold">Valor do sistema</h4>
            <p className="text-xs text-muted-foreground -mt-2">
              Valor único pelo desenvolvimento e entrega do projeto.
            </p>

            <CurrencyInput
              label="Valor total do sistema"
              value={pricing.valorSistema}
              onChange={(v) => update({ valorSistema: v })}
              required
            />

            <div>
              <label className="block text-sm font-medium mb-2">Condições de pagamento *</label>
              <textarea
                className="input-field min-h-[100px] resize-none"
                placeholder="Ex: 50% na assinatura, 50% na entrega"
                value={pricing.condicoesPagamento}
                onChange={(e) => update({ condicoesPagamento: e.target.value })}
              />
            </div>
          </div>

          <ItensRecorrentesList
            titulo="Custos mensais (opcional)"
            descricao="Suporte, infraestrutura, hospedagem, banco de dados e outros custos recorrentes."
            placeholderNome="Ex: Suporte técnico"
            placeholderDescricao="Ex: Atendimento e correções em horário comercial"
            botaoLabel="Custo mensal"
            itens={pricing.custosMensais}
            onChange={(custosMensais) => update({ custosMensais })}
          />
        </>
      )}

      {/* CONTRATO POR MÓDULOS */}
      {isModulos(pricing.tipoProposta) && (
        <>
          <ItensRecorrentesList
            titulo="Módulos contratados"
            descricao="Detalhe cada módulo do sistema e o valor mensal correspondente."
            placeholderNome="Ex: Estoque"
            placeholderDescricao="Ex: Controle de insumos, cadastro de produtos..."
            botaoLabel="Módulo"
            itens={pricing.modulos}
            onChange={(modulos) => update({ modulos })}
          />

          <ItensRecorrentesList
            titulo="Outros custos mensais (opcional)"
            descricao="Suporte, infraestrutura, hospedagem e demais custos que não são módulos do sistema."
            placeholderNome="Ex: Infraestrutura"
            placeholderDescricao="Ex: Servidor, banco de dados e hospedagem"
            botaoLabel="Outro custo"
            itens={pricing.custosMensais}
            onChange={(custosMensais) => update({ custosMensais })}
          />

          <div className="p-4 rounded-lg border border-border space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="temExclusividade"
                checked={pricing.temExclusividade}
                onChange={(e) => update({ temExclusividade: e.target.checked })}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="temExclusividade" className="font-medium cursor-pointer">
                Incluir cláusula de exclusividade comercial
              </label>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Opcional. Use apenas se combinado com o cliente.
            </p>

            {pricing.temExclusividade && (
              <div className="space-y-3 pl-8">
                <div>
                  <label className="block text-sm font-medium mb-2">Escopo da exclusividade *</label>
                  <textarea
                    className="input-field min-h-[80px] resize-none"
                    placeholder="Ex: segmento de buffet na região de SP"
                    value={pricing.escopoExclusividade}
                    onChange={(e) => update({ escopoExclusividade: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prazo *</label>
                    <Input
                      placeholder="Ex: 24 meses"
                      value={pricing.prazoExclusividade}
                      onChange={(e) => update({ prazoExclusividade: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Renovação</label>
                    <Input
                      placeholder="Ex: acordo mútuo por escrito"
                      value={pricing.condicoesRenovacaoExclusividade}
                      onChange={(e) =>
                        update({ condicoesRenovacaoExclusividade: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {temRecorrencia && (
        <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total mensal</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(totalMensal)}/mês</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Início da cobrança mensal</label>
              <input
                type="date"
                className="input-field"
                value={pricing.dataInicioMensalidade}
                onChange={(e) => update({ dataInicioMensalidade: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Dia de vencimento</label>
              <input
                type="number"
                min={1}
                max={28}
                className="input-field"
                value={pricing.diaVencimentoMensalidade}
                onChange={(e) =>
                  update({ diaVencimentoMensalidade: parseInt(e.target.value, 10) || 10 })
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setTermosAbertos(!termosAbertos)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div>
            <p className="font-semibold text-sm">Termos contratuais</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Valores padrão — altere só se necessário nesta proposta
            </p>
          </div>
          {termosAbertos ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {termosAbertos && (
          <div className="p-4 pt-0 space-y-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {temRecorrencia && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Índice de reajuste</label>
                    <Input
                      value={pricing.indiceReajuste}
                      onChange={(e) => update({ indiceReajuste: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Aviso de reajuste (dias)</label>
                    <Input
                      type="number"
                      value={pricing.prazoAvisoReajuste}
                      onChange={(e) =>
                        update({ prazoAvisoReajuste: parseInt(e.target.value, 10) || 30 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor hora de suporte (R$)</label>
                    <Input
                      type="number"
                      value={pricing.valorHoraSuporte}
                      onChange={(e) =>
                        update({ valorHoraSuporte: parseFloat(e.target.value) || 150 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tolerância inadimplência (dias)
                    </label>
                    <Input
                      type="number"
                      value={pricing.prazoToleranciaInadimplencia}
                      onChange={(e) =>
                        update({
                          prazoToleranciaInadimplencia: parseInt(e.target.value, 10) || 5,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Vigência inicial</label>
                    <Input
                      value={pricing.prazoVigenciaInicial}
                      onChange={(e) => update({ prazoVigenciaInicial: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Aviso não renovação (dias)
                    </label>
                    <Input
                      type="number"
                      value={pricing.prazoAvisoNaoRenovacao}
                      onChange={(e) =>
                        update({ prazoAvisoNaoRenovacao: parseInt(e.target.value, 10) || 30 })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Aviso rescisão mensalidade (dias)
                    </label>
                    <Input
                      type="number"
                      value={pricing.prazoAvisoRescisaoMensalidade}
                      onChange={(e) =>
                        update({
                          prazoAvisoRescisaoMensalidade: parseInt(e.target.value, 10) || 30,
                        })
                      }
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Prazo exportação de dados (dias)</label>
                <Input
                  type="number"
                  value={pricing.prazoExportacaoDados}
                  onChange={(e) =>
                    update({ prazoExportacaoDados: parseInt(e.target.value, 10) || 30 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Formato exportação</label>
                <Input
                  value={pricing.formatoExportacao}
                  onChange={(e) => update({ formatoExportacao: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
