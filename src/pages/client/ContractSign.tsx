import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  CheckCircle2,
  Pen,
  Download,
  AlertCircle,
} from "lucide-react";

const contractContent = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: João da Silva, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 00.000.000/0001-00, com sede em São Paulo - SP.

CONTRATADA: JR TECHNOLOGY SOLUTIONS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em [endereço].

1. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação dos seguintes serviços:

• Desenvolvimento de Sistema Web
• Aplicativo Mobile (iOS e Android)
• Consultoria em TI

2. VALOR E FORMA DE PAGAMENTO

O valor total dos serviços é de R$ 45.000,00 (quarenta e cinco mil reais).

Condições de pagamento: 50% na assinatura do contrato e 50% na entrega final.

3. PRAZO DE EXECUÇÃO

O prazo para execução dos serviços é de 90 dias, com início em 01/01/2025 e término previsto para 01/04/2025.

4. OBRIGAÇÕES DA CONTRATADA

a) Executar os serviços conforme especificações acordadas;
b) Manter sigilo sobre informações confidenciais;
c) Entregar o projeto no prazo estipulado;
d) Fornecer suporte técnico durante o período de desenvolvimento.

5. OBRIGAÇÕES DO CONTRATANTE

a) Efetuar os pagamentos nas datas acordadas;
b) Fornecer informações necessárias para execução do projeto;
c) Disponibilizar recursos e acessos quando solicitados;
d) Validar as entregas em tempo hábil.

6. DISPOSIÇÕES GERAIS

Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.

E, por estarem assim justas e acordadas, as partes assinam o presente instrumento.

São Paulo, 18 de dezembro de 2024.`;

export default function ContractSign() {
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
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar Contrato (PDF)
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Assinatura de Contrato</h1>
        <p className="text-muted-foreground">
          Leia atentamente o contrato e assine digitalmente para prosseguir.
        </p>
      </div>

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
