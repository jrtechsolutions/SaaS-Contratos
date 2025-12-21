import { useState } from "react";
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
} from "lucide-react";

const proposalData = {
  client: "João da Silva",
  company: "Tech Corp Ltda",
  date: "18/12/2024",
  validUntil: "18/01/2025",
  services: [
    "Desenvolvimento de Sistema Web",
    "Aplicativo Mobile (iOS e Android)",
    "Consultoria em TI",
  ],
  totalValue: "R$ 45.000,00",
  paymentTerms: "50% na assinatura do contrato e 50% na entrega final.",
  deliveryTime: "90 dias",
  startDate: "01/01/2025",
  deliveryDate: "01/04/2025",
  contractTemplateId: "1",
};

export default function ClientProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAcceptClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmAccept = () => {
    setIsProcessing(true);
    
    // Simula processamento: marcar proposta como aceita e gerar contrato
    setTimeout(() => {
      setIsProcessing(false);
      setConfirmDialogOpen(false);
      setAccepted(true);
      
      // Redireciona para assinatura do contrato após breve delay
      setTimeout(() => {
        navigate(`/cliente/contrato/${id}`);
      }, 1500);
    }, 2000);
  };

  const handleRequestChanges = () => {
    // Abre WhatsApp ou email para solicitar alterações
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar algumas alterações na proposta comercial. Meu nome é ${proposalData.client}.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
        <p className="text-muted-foreground">
          Olá, {proposalData.client}! Confira os detalhes da proposta abaixo.
        </p>
      </div>

      {/* Proposal Card */}
      <Card className="p-8 mb-6">
        {/* Client Info */}
        <div className="pb-6 mb-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-muted-foreground">Proposta para</p>
              <p className="font-semibold text-lg">{proposalData.client}</p>
              <p className="text-muted-foreground">{proposalData.company}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Emitida em</p>
              <p className="font-medium">{proposalData.date}</p>
              <p className="text-sm text-muted-foreground mt-2">Válida até</p>
              <p className="font-medium text-primary">{proposalData.validUntil}</p>
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
            {proposalData.services.map((service, index) => (
              <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Value */}
        <div className="mb-6 p-6 rounded-xl gradient-bg-soft">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Investimento</h3>
          </div>
          <p className="text-4xl font-bold text-primary mb-2">{proposalData.totalValue}</p>
          <p className="text-sm text-muted-foreground">{proposalData.paymentTerms}</p>
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
              <p className="font-semibold text-lg">{proposalData.deliveryTime}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Início</p>
              <p className="font-semibold text-lg">{proposalData.startDate}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">Entrega</p>
              <p className="font-semibold text-lg">{proposalData.deliveryDate}</p>
            </div>
          </div>
        </div>

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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Total:</span>
                <span className="font-semibold">{proposalData.totalValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-semibold">{proposalData.deliveryTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviços:</span>
                <span className="font-semibold">{proposalData.services.length} itens</span>
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
