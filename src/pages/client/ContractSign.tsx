import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  CheckCircle2,
  Pen,
  Download,
  AlertCircle,
  User,
  Building,
  DollarSign,
  Calendar,
} from "lucide-react";

// Dados vindos da proposta aceita
const proposalData = {
  client: "João da Silva",
  company: "Tech Corp Ltda",
  cnpj: "12.345.678/0001-90",
  services: [
    "Desenvolvimento de Sistema Web",
    "Aplicativo Mobile (iOS e Android)",
    "Consultoria em TI",
  ],
  totalValue: "R$ 45.000,00",
  totalValueWritten: "quarenta e cinco mil reais",
  paymentTerms: "50% na assinatura do contrato e 50% na entrega final",
  startDate: "01/01/2025",
  deliveryDate: "01/04/2025",
  deliveryDays: "90",
};

// Contrato gerado a partir do template com variáveis preenchidas
const contractContent = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: ${proposalData.client}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${proposalData.cnpj}, com sede em São Paulo - SP, doravante denominada CONTRATANTE.

CONTRATADA: JR TECHNOLOGY SOLUTIONS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em [endereço], doravante denominada CONTRATADA.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:

1. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação dos seguintes serviços pela CONTRATADA:

${proposalData.services.map((s, i) => `${i + 1}.${i + 1}. ${s}`).join("\n")}

2. VALOR E FORMA DE PAGAMENTO

2.1. O valor total dos serviços contratados é de ${proposalData.totalValue} (${proposalData.totalValueWritten}).

2.2. Condições de pagamento: ${proposalData.paymentTerms}.

2.3. Os pagamentos deverão ser efetuados mediante depósito bancário ou transferência para conta indicada pela CONTRATADA.

3. PRAZO DE EXECUÇÃO

3.1. O prazo para execução dos serviços é de ${proposalData.deliveryDays} (${proposalData.deliveryDays}) dias.

3.2. Data de início: ${proposalData.startDate}.

3.3. Data prevista para conclusão: ${proposalData.deliveryDate}.

3.4. O prazo poderá ser prorrogado mediante acordo entre as partes, formalizado por escrito.

4. OBRIGAÇÕES DA CONTRATADA

4.1. Executar os serviços conforme especificações acordadas neste instrumento;

4.2. Manter sigilo absoluto sobre informações confidenciais da CONTRATANTE;

4.3. Entregar o projeto no prazo estipulado, salvo casos de força maior;

4.4. Fornecer suporte técnico durante o período de desenvolvimento;

4.5. Comunicar imediatamente qualquer impedimento para execução dos serviços.

5. OBRIGAÇÕES DO CONTRATANTE

5.1. Efetuar os pagamentos nas datas acordadas;

5.2. Fornecer todas as informações necessárias para execução do projeto;

5.3. Disponibilizar recursos e acessos quando solicitados pela CONTRATADA;

5.4. Validar as entregas em tempo hábil, no prazo máximo de 5 (cinco) dias úteis.

6. PROPRIEDADE INTELECTUAL

6.1. Após a quitação integral do valor contratado, todos os direitos de propriedade intelectual sobre o software desenvolvido serão transferidos à CONTRATANTE.

7. RESCISÃO

7.1. O presente contrato poderá ser rescindido por qualquer das partes, mediante notificação por escrito com antecedência mínima de 30 (trinta) dias.

7.2. Em caso de rescisão, serão devidos os valores proporcionais aos serviços já executados.

8. DISPOSIÇÕES GERAIS

8.1. Este contrato é regido pelas leis brasileiras.

8.2. Quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.

8.3. Os casos omissos serão resolvidos de comum acordo entre as partes.

E, por estarem assim justas e acordadas, as partes assinam o presente instrumento em duas vias de igual teor e forma.

São Paulo, ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}.`;

export default function ContractSign() {
  const { id } = useParams();
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (agreed && hasSignature) {
      setSigned(true);
    }
  };

  if (signed) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card className="p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-success mb-4">
            Contrato Assinado com Sucesso!
          </h1>
          <p className="text-muted-foreground mb-8">
            Obrigado por confiar na JR Technology Solutions. Você receberá uma cópia do contrato assinado por email.
          </p>
          
          <div className="p-4 rounded-lg bg-muted/30 mb-6 text-left">
            <h3 className="font-medium mb-3">Resumo do Contrato</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contratante:</span>
                <span className="font-medium">{proposalData.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">{proposalData.totalValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-medium">{proposalData.deliveryDays} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-success">Assinado</span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar Contrato (PDF)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Assinatura de Contrato</h1>
        <p className="text-muted-foreground">
          Leia atentamente o contrato gerado a partir da sua proposta aceita e assine digitalmente.
        </p>
      </div>

      {/* Resumo dos dados */}
      <Card className="p-4 mb-6">
        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Contratante</p>
              <p className="font-medium">{proposalData.client}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Empresa</p>
              <p className="font-medium">{proposalData.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Valor Total</p>
              <p className="font-medium">{proposalData.totalValue}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Prazo</p>
              <p className="font-medium">{proposalData.deliveryDays} dias</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contract */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contrato de Prestação de Serviços</h3>
          </div>

          <div className="h-[500px] overflow-y-auto p-6 rounded-lg bg-muted/30 border border-border">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {contractContent}
            </pre>
          </div>
        </Card>

        {/* Signature Panel */}
        <Card className="p-6 h-fit">
          <h3 className="font-semibold mb-4">Sua Assinatura</h3>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3 mb-6 p-4 rounded-lg bg-muted/30">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="agree" className="text-sm cursor-pointer">
              Li e concordo com todos os termos e condições do contrato acima.
            </label>
          </div>

          {/* Signature Pad */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Pen className="w-4 h-4" />
              Desenhe sua assinatura
            </label>
            <div className="signature-pad">
              <canvas
                ref={canvasRef}
                width={280}
                height={120}
                className="w-full rounded-xl cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              className="mt-2 text-xs"
            >
              Limpar assinatura
            </Button>
          </div>

          {/* Warning */}
          {!agreed && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Você precisa concordar com os termos para prosseguir.</span>
            </div>
          )}

          {/* Sign Button */}
          <Button
            onClick={handleSign}
            disabled={!agreed || !hasSignature}
            className="w-full gradient-bg gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Assinar Contrato
          </Button>
        </Card>
      </div>
    </div>
  );
}
