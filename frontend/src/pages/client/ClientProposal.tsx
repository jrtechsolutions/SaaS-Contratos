import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileSignature,
  ArrowRight,
  MessageSquare,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { publicApi, PropostaPublica } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

function calculateValidUntil(dateString: string): string {
  try {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() + 1); // Adiciona 1 mês
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "";
  }
}

export default function ClientProposal() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [proposta, setProposta] = useState<PropostaPublica | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // Carregar proposta
  useEffect(() => {
    async function loadProposta() {
      if (!id) {
        setError("ID da proposta não fornecido");
        setLoading(false);
        return;
      }

      try {
        const data = await publicApi.get<PropostaPublica>(`/public/proposta/${id}`);
        setProposta(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar proposta");
        toast.error(err.message || "Erro ao carregar proposta");
      } finally {
        setLoading(false);
      }
    }

    loadProposta();
  }, [id]);

  const handleAcceptClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!id || !proposta) return;

    setIsProcessing(true);
    
    try {
      const response = await publicApi.post<{
        message: string;
        contrato_id: string;
      }>(`/public/proposta/${id}/aceitar`);

      setIsProcessing(false);
      setConfirmDialogOpen(false);
      setAccepted(true);
      toast.success("Proposta aceita com sucesso! Gerando contrato...");
      
      // Redireciona para assinatura do contrato após breve delay
      setTimeout(() => {
        navigate(`/cliente/contrato/${response.contrato_id}`);
      }, 1500);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err.message || "Erro ao aceitar proposta");
    }
  };

  const handleRequestChanges = () => {
    if (!proposta) return;
    
    // Abre WhatsApp ou email para solicitar alterações
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar algumas alterações na proposta comercial. Meu nome é ${proposta.cliente_nome}.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando proposta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposta) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Proposta não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            {error || "A proposta solicitada não existe ou não está mais disponível."}
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
        <p className="text-muted-foreground">
          Olá, {proposta.cliente_nome}! Confira os detalhes da proposta abaixo.
        </p>
      </div>

      {/* Proposal Card */}
      <Card className="p-8 mb-6">
        {/* Client Info */}
        <div className="pb-6 mb-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Proposta para</p>
              <p className="font-semibold text-lg">{proposta.cliente_nome}</p>
              {proposta.cliente_empresa && (
                <p className="text-muted-foreground">{proposta.cliente_empresa}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Emitida em</p>
              <p className="font-medium">{formatDate(proposta.created_at)}</p>
              <p className="text-sm text-muted-foreground mt-2">Válida até</p>
              <p className="font-medium text-primary">
                {calculateValidUntil(proposta.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Serviços Incluídos</h3>
          </div>
          <ul className="space-y-2">
            {proposta.servicos && proposta.servicos.length > 0 ? (
              proposta.servicos.map((service, index) => (
                <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span>{service}</span>
                </li>
              ))
            ) : (
              <li className="p-3 rounded-lg bg-muted/30 text-muted-foreground">
                Nenhum serviço especificado
              </li>
            )}
            {proposta.servico_personalizado && (
              <li className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>{proposta.servico_personalizado}</span>
              </li>
            )}
          </ul>
        </div>

        {/* Value */}
        <div className="mb-6 p-6 rounded-xl gradient-bg-soft space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Investimento</h3>
          </div>

          {(proposta.tipo_proposta === "projeto_fixo" ||
            proposta.tipo_proposta === "hibrido" ||
            !proposta.tipo_proposta) && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {proposta.tipo_proposta === "hibrido" ? "Implantação do sistema" : "Valor do projeto"}
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(proposta.valor_implantacao ?? proposta.valor_total)}
              </p>
              {(proposta.condicoes_pagamento_implantacao || proposta.condicoes_pagamento) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {proposta.condicoes_pagamento_implantacao || proposta.condicoes_pagamento}
                </p>
              )}
            </div>
          )}

          {(proposta.tipo_proposta === "saas_recorrente" ||
            proposta.tipo_proposta === "hibrido") &&
            proposta.valor_mensalidade_total != null &&
            proposta.valor_mensalidade_total > 0 && (
              <div className={proposta.tipo_proposta === "hibrido" ? "pt-4 border-t border-primary/20" : ""}>
                <p className="text-sm text-muted-foreground mb-1">Mensalidade</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(proposta.valor_mensalidade_total)}
                  <span className="text-lg font-medium text-muted-foreground">/mês</span>
                </p>
                {proposta.modulos && proposta.modulos.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {proposta.modulos.map((modulo, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center p-2 rounded-lg bg-background/60 text-sm"
                      >
                        <span>{modulo.nome}</span>
                        <span className="font-medium">
                          {formatCurrency(modulo.valor_mensal)}/mês
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {proposta.data_inicio_mensalidade && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Início: {formatDate(proposta.data_inicio_mensalidade)}
                    {proposta.dia_vencimento_mensalidade
                      ? ` · Vencimento dia ${proposta.dia_vencimento_mensalidade}`
                      : ""}
                  </p>
                )}
              </div>
            )}

          {proposta.tipo_proposta === "saas_recorrente" &&
            (proposta.valor_implantacao ?? 0) > 0 && (
              <div className="pt-4 border-t border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Setup / implantação</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(proposta.valor_implantacao!)}
                </p>
              </div>
            )}
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Prazo de Execução</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Duração</p>
              <p className="font-semibold text-lg">
                {proposta.prazo_execucao || "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Início</p>
              <p className="font-semibold text-lg">
                {proposta.data_inicio ? formatDate(proposta.data_inicio) : "—"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Entrega</p>
              <p className="font-semibold text-lg">
                {proposta.data_entrega ? formatDate(proposta.data_entrega) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ANEXO I - Telas do Sistema */}
        {proposta.telas_sistema &&
          Array.isArray(proposta.telas_sistema) &&
          proposta.telas_sistema.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">ANEXO I — Telas do Sistema</h3>
              </div>
              <Card className="p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Confira as telas do sistema que serão desenvolvidas conforme esta proposta:
                </p>
                <Accordion type="multiple" className="w-full">
                  {proposta.telas_sistema
                    .filter((t) => t?.imagem && t?.titulo)
                    .map((tela, idx) => (
                      <AccordionItem key={idx} value={`tela-${idx}`}>
                        <AccordionTrigger>
                          <div className="text-left">
                            <div className="font-medium">
                              Tela {idx + 1}: {tela.titulo}
                            </div>
                            {tela.descricao && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {tela.descricao}
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {tela.descricao && (
                            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                              {tela.descricao}
                            </p>
                          )}
                          <div className="w-full rounded-lg border border-border bg-muted/30 p-2">
                            <img
                              src={tela.imagem}
                              alt={tela.titulo}
                              className="w-full max-h-[400px] object-contain rounded-md bg-white"
                              loading="lazy"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </Card>
            </div>
          )}

        {/* Info sobre contrato */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-start gap-2">
            <FileSignature className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-primary mb-1">Próximo Passo: Assinatura do Contrato</p>
              <p className="text-muted-foreground">
                Ao aceitar esta proposta, você será direcionado para visualizar e assinar digitalmente o contrato de prestação de serviços.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      {!accepted ? (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="px-8 gap-2"
            onClick={handleRequestChanges}
          >
            <MessageSquare className="w-4 h-4" />
            Solicitar Alterações
          </Button>
          <Button onClick={handleAcceptClick} className="gradient-bg gap-2 px-8">
            <FileSignature className="w-4 h-4" />
            Aceitar Proposta
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Card className="p-6 text-center bg-success/10 border-success">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-success mb-2">Proposta Aceita!</h3>
          <p className="text-muted-foreground">Gerando contrato e redirecionando...</p>
        </Card>
      )}

      {/* Dialog de Confirmação */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aceitação da Proposta</DialogTitle>
            <DialogDescription>
              Ao aceitar esta proposta, um contrato será gerado automaticamente e você será direcionado para assiná-lo digitalmente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              {(proposta?.tipo_proposta === "projeto_fixo" ||
                proposta?.tipo_proposta === "hibrido" ||
                !proposta?.tipo_proposta) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Implantação:</span>
                  <span className="font-semibold">
                    {proposta
                      ? formatCurrency(proposta.valor_implantacao ?? proposta.valor_total)
                      : "—"}
                  </span>
                </div>
              )}
              {(proposta?.tipo_proposta === "saas_recorrente" ||
                proposta?.tipo_proposta === "hibrido") &&
                proposta.valor_mensalidade_total != null &&
                proposta.valor_mensalidade_total > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensalidade:</span>
                    <span className="font-semibold">
                      {formatCurrency(proposta.valor_mensalidade_total)}/mês
                    </span>
                  </div>
                )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-semibold">
                  {proposta?.prazo_execucao || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviços:</span>
                <span className="font-semibold">
                  {proposta ? (proposta.servicos?.length || 0) + (proposta.servico_personalizado ? 1 : 0) : 0} itens
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              className="gradient-bg gap-2"
              onClick={handleConfirmAccept}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar e Prosseguir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
