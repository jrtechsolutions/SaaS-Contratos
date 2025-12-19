import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileSignature,
  ArrowRight,
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
};

export default function ClientProposal() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setTimeout(() => {
      navigate("/cliente/contrato/1");
    }, 1500);
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
      </Card>

      {/* Actions */}
      {!accepted ? (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="px-8">
            Solicitar Alterações
          </Button>
          <Button onClick={handleAccept} className="gradient-bg gap-2 px-8">
            <FileSignature className="w-4 h-4" />
            Aceitar e Prosseguir para Contrato
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Card className="p-6 text-center bg-success/10 border-success">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-success mb-2">Proposta Aceita!</h3>
          <p className="text-muted-foreground">Redirecionando para o contrato...</p>
        </Card>
      )}
    </div>
  );
}
