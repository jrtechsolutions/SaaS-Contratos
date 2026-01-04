import { useState, useRef, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { publicApi, ContratoPublico } from "@/lib/api";
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

export default function ContractSign() {
  const { id } = useParams<{ id: string }>();
  const [contrato, setContrato] = useState<ContratoPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Carregar contrato
  useEffect(() => {
    async function loadContrato() {
      if (!id) {
        setError("ID do contrato não fornecido");
        setLoading(false);
        return;
      }

      try {
        const data = await publicApi.get<ContratoPublico>(`/public/contrato/${id}`);
        setContrato(data);
        
        // Se já estiver assinado, mostrar tela de sucesso
        if (data.status === 'assinado') {
          setSigned(true);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar contrato");
        toast.error(err.message || "Erro ao carregar contrato");
      } finally {
        setLoading(false);
      }
    }

    loadContrato();
  }, [id]);

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

  const handleSign = async () => {
    if (!agreed || !hasSignature || !id || !contrato) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Converter assinatura para base64
    const signatureData = canvas.toDataURL('image/png');

    setIsSigning(true);

    try {
      await publicApi.post(`/public/contrato/${id}/assinar`, {
        assinatura_cliente: signatureData,
      });

      setSigned(true);
      toast.success("Contrato assinado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao assinar contrato");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando contrato...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contrato) {
    return (
      <div className="max-w-5xl mx-auto animate-fade-in">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Contrato não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            {error || "O contrato solicitado não existe ou não está mais disponível."}
          </p>
        </Card>
      </div>
    );
  }

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
                <span className="font-medium">
                  {contrato.proposta?.cliente_nome || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">
                  {contrato.proposta?.valor_total
                    ? formatCurrency(contrato.proposta.valor_total)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prazo:</span>
                <span className="font-medium">
                  {contrato.proposta?.prazo_execucao || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-success">Assinado</span>
              </div>
              {contrato.data_assinatura && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data de Assinatura:</span>
                  <span className="font-medium">
                    {formatDate(contrato.data_assinatura)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              if (!id) return;
              try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const pdfResponse = await fetch(
                  `${API_BASE_URL}/public/contrato/${id}/pdf`
                );
                
                if (!pdfResponse.ok) {
                  const error = await pdfResponse.json().catch(() => ({}));
                  throw new Error(error.error || 'Erro ao gerar PDF');
                }
                
                const blob = await pdfResponse.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `contrato-${contrato.proposta?.cliente_nome || id}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast.success("PDF baixado com sucesso!");
              } catch (err: any) {
                toast.error(err.message || "Erro ao baixar PDF");
              }
            }}
            disabled={!signed || !contrato || contrato.status !== 'assinado'}
          >
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
              <p className="font-medium">
                {contrato.proposta?.cliente_nome || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Empresa</p>
              <p className="font-medium">
                {contrato.proposta?.cliente_empresa || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Valor Total</p>
              <p className="font-medium">
                {contrato.proposta?.valor_total
                  ? formatCurrency(contrato.proposta.valor_total)
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Prazo</p>
              <p className="font-medium">
                {contrato.proposta?.prazo_execucao || "—"}
              </p>
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
              {contrato.texto_contrato}
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
            disabled={!agreed || !hasSignature || isSigning || contrato.status === 'assinado'}
            className="w-full gradient-bg gap-2"
          >
            {isSigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assinando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Assinar Contrato
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
