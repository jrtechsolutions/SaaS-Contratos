import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import {
  TIPOS_PROPOSTA,
  hasMensalidade,
  hasImplantacao,
  computeModulosTotal,
  formatCurrency,
  parseCurrency,
  type PricingFormData,
  type ModuloProposta,
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

function ModuloValorInput({
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

export function ProposalPricingStep({ pricing, onChange }: ProposalPricingStepProps) {
  const [termosAbertos, setTermosAbertos] = useState(false);
  const showImplantacao = hasImplantacao(pricing.tipoProposta);
  const showMensalidade = hasMensalidade(pricing.tipoProposta);
  const totalMensal = computeModulosTotal(pricing.modulos);

  const update = (partial: Partial<PricingFormData>) => {
    onChange({ ...pricing, ...partial });
  };

  const updateModulo = (index: number, partial: Partial<ModuloProposta>) => {
    const modulos = [...pricing.modulos];
    modulos[index] = { ...modulos[index], ...partial };
    update({ modulos });
  };

  const addModulo = () => {
    update({
      modulos: [...pricing.modulos, { nome: "", valor_mensal: 0 }],
    });
  };

  const removeModulo = (index: number) => {
    update({ modulos: pricing.modulos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-semibold mb-1">Valores e Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de proposta e preencha os valores correspondentes.
        </p>
      </div>

      {/* Tipo de proposta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TIPOS_PROPOSTA.map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            onClick={() => update({ tipoProposta: tipo.value })}
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

      {/* Implantação */}
      {showImplantacao && (
        <div className="space-y-4 p-4 rounded-lg border border-border">
          <h4 className="font-semibold">
            {pricing.tipoProposta === "projeto_fixo"
              ? "Valor do Projeto"
              : pricing.tipoProposta === "hibrido"
                ? "Sistema Próprio — Implantação"
                : "Valor de Implantação (opcional)"}
          </h4>

          <CurrencyInput
            label={
              pricing.tipoProposta === "saas_recorrente"
                ? "Valor de setup/implantação"
                : "Valor de implantação"
            }
            value={pricing.valorImplantacao}
            onChange={(v) => update({ valorImplantacao: v })}
            required={pricing.tipoProposta !== "saas_recorrente"}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Condições de pagamento da implantação
            </label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Ex: 50% na assinatura, 50% na entrega"
              value={pricing.condicoesPagamentoImplantacao}
              onChange={(e) => update({ condicoesPagamentoImplantacao: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Módulos mensais */}
      {showMensalidade && (
        <div className="space-y-4 p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Módulos Mensais</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione livremente os módulos e valores mensais
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addModulo} className="gap-1">
              <Plus className="w-4 h-4" />
              Módulo
            </Button>
          </div>

          {pricing.modulos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              Nenhum módulo adicionado. Clique em &quot;Módulo&quot; para começar.
            </p>
          ) : (
            <div className="space-y-3">
              {pricing.modulos.map((modulo, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-3 items-start p-3 rounded-lg bg-muted/30"
                >
                  <div className="space-y-2">
                    <Input
                      placeholder="Nome do módulo (ex: Fiscal)"
                      value={modulo.nome}
                      onChange={(e) => updateModulo(index, { nome: e.target.value })}
                    />
                    <Input
                      placeholder="Descrição opcional"
                      value={modulo.descricao || ""}
                      onChange={(e) => updateModulo(index, { descricao: e.target.value })}
                    />
                  </div>
                  <ModuloValorInput
                    value={modulo.valor_mensal}
                    onChange={(v) => updateModulo(index, { valor_mensal: v })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeModulo(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {totalMensal > 0 && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Total mensal</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(totalMensal)}/mês</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Início da mensalidade</label>
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Descrição da mensalidade (opcional — gerada automaticamente dos módulos)
            </label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Deixe em branco para gerar automaticamente a partir dos módulos"
              value={pricing.descricaoMensalidade}
              onChange={(e) => update({ descricaoMensalidade: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Exclusividade */}
      {showMensalidade && (
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

          {pricing.temExclusividade && (
            <div className="space-y-3 pl-8">
              <div>
                <label className="block text-sm font-medium mb-2">Escopo da exclusividade *</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Ex: segmento de delivery de alimentação na região metropolitana de SP"
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
                    onChange={(e) => update({ condicoesRenovacaoExclusividade: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Termos contratuais — colapsável com defaults pré-preenchidos */}
      <div className="rounded-lg border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setTermosAbertos(!termosAbertos)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
        >
          <div>
            <p className="font-semibold text-sm">Termos contratuais</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Valores padrão já preenchidos — altere apenas se necessário nesta proposta
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
              {showMensalidade && (
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
