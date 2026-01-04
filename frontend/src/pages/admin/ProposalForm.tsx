import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Send,
  User,
  Briefcase,
  DollarSign,
  Calendar,
  Plus,
  X,
  FileText,
  Copy,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useModelos,
  useProposta,
  useCreateProposta,
  useUpdateProposta,
} from "@/hooks/use-api";

const steps = [
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Serviços", icon: Briefcase },
  { id: 3, label: "Valores", icon: DollarSign },
  { id: 4, label: "Prazo", icon: Calendar },
  { id: 5, label: "Contrato", icon: FileText },
];

const defaultServices = [
  "Desenvolvimento de Software",
  "Desenvolvimento Web",
  "Aplicativo Mobile",
  "Consultoria em TI",
  "Suporte Técnico",
  "Manutenção de Sistemas",
];

// Função para calcular prazo de execução em dias
function calculateExecutionPeriod(startDate: string, deliveryDate: string): string {
  if (!startDate || !deliveryDate) return "";
  try {
    const start = new Date(startDate);
    const delivery = new Date(deliveryDate);
    const diffTime = Math.abs(delivery.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  } catch {
    return "";
  }
}

// Função para converter valor de string para número
function parseValue(value: string): number {
  if (!value) return 0;
  // Remove R$, espaços e converte vírgula para ponto
  const cleaned = value
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export default function ProposalForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const { data: modelos, isLoading: modelosLoading } = useModelos();
  const { data: proposta, isLoading: propostaLoading } = useProposta(id || "");
  const createProposta = useCreateProposta();
  const updateProposta = useUpdateProposta();

  const [currentStep, setCurrentStep] = useState(1);
  const [serviceOptions, setServiceOptions] = useState<string[]>(defaultServices);
  const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [proposalLink, setProposalLink] = useState("");
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientCNPJ: "",
    services: [] as string[],
    customService: "",
    totalValue: "",
    paymentTerms: "",
    startDate: "",
    deliveryDate: "",
    observations: "",
    contractTemplateId: "",
  });

  // Carregar dados da proposta se estiver editando
  useEffect(() => {
    if (proposta && isEditing) {
      setFormData({
        clientName: proposta.cliente_nome || "",
        clientEmail: proposta.cliente_email || "",
        clientPhone: proposta.cliente_telefone || "",
        clientCompany: proposta.cliente_empresa || "",
        clientCNPJ: proposta.cliente_cnpj || "",
        services: proposta.servicos || [],
        customService: proposta.servico_personalizado || "",
        totalValue: proposta.valor_total
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(proposta.valor_total)
          : "",
        paymentTerms: proposta.condicoes_pagamento || "",
        startDate: proposta.data_inicio || "",
        deliveryDate: proposta.data_entrega || "",
        observations: proposta.observacoes || "",
        contractTemplateId: proposta.modelo_contrato_id || "",
      });
    }
  }, [proposta, isEditing]);

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) {
      toast.error("Digite o nome do serviço");
      return;
    }
    if (serviceOptions.includes(newServiceName.trim())) {
      toast.error("Este serviço já existe");
      return;
    }
    setServiceOptions((prev) => [...prev, newServiceName.trim()]);
    setNewServiceName("");
    setNewServiceDialogOpen(false);
    toast.success("Serviço adicionado!");
  };

  const handleRemoveService = (service: string) => {
    setServiceOptions((prev) => prev.filter((s) => s !== service));
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
    }));
    toast.success("Serviço removido");
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateForm = (): boolean => {
    if (!formData.clientName.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return false;
    }
    if (!formData.clientEmail.trim()) {
      toast.error("Email do cliente é obrigatório");
      return false;
    }
    if (!formData.totalValue || parseValue(formData.totalValue) <= 0) {
      toast.error("Valor total é obrigatório e deve ser maior que zero");
      return false;
    }
    return true;
  };

  const prepareProposalData = () => {
    const valorTotal = parseValue(formData.totalValue);
    const prazoExecucao = calculateExecutionPeriod(
      formData.startDate,
      formData.deliveryDate
    );

    // Validar valor_total
    if (!valorTotal || isNaN(valorTotal) || valorTotal <= 0) {
      throw new Error("Valor total inválido. Por favor, insira um valor válido.");
    }

    return {
      cliente_nome: formData.clientName?.trim() || "",
      cliente_email: formData.clientEmail?.trim() || "",
      cliente_telefone: formData.clientPhone?.trim() || undefined,
      cliente_empresa: formData.clientCompany?.trim() || undefined,
      cliente_cnpj: formData.clientCNPJ?.trim() || undefined,
      servicos: formData.services || [],
      servico_personalizado: formData.customService?.trim() || undefined,
      valor_total: valorTotal,
      condicoes_pagamento: formData.paymentTerms?.trim() || undefined,
      prazo_execucao: prazoExecucao || undefined,
      data_inicio: formData.startDate || undefined,
      data_entrega: formData.deliveryDate || undefined,
      observacoes: formData.observations?.trim() || undefined,
      modelo_contrato_id: formData.contractTemplateId || undefined,
    };
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    const data = {
      ...prepareProposalData(),
      status: "rascunho",
    };

    try {
      if (isEditing) {
        await updateProposta.mutateAsync({ id: id!, data });
      } else {
        await createProposta.mutateAsync(data);
      }
      navigate("/admin/propostas");
    } catch (error) {
      // Erro já tratado pelo hook
    }
  };

  const handleSendProposal = async () => {
    if (!validateForm()) return;
    if (!formData.contractTemplateId) {
      toast.error("Selecione um modelo de contrato");
      return;
    }

    try {
      const data = {
        ...prepareProposalData(),
        status: "enviada",
      };

      console.log("Enviando proposta:", data);

      let propostaId: string;
      if (isEditing) {
        const updated = await updateProposta.mutateAsync({ id: id!, data });
        propostaId = updated.id;
      } else {
        const created = await createProposta.mutateAsync(data);
        propostaId = created.id;
      }

      // Gerar link da proposta
      const link = `${window.location.origin}/cliente/proposta/${propostaId}`;
      setProposalLink(link);
      // Abrir modal após um pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        setSendModalOpen(true);
      }, 100);
    } catch (error: any) {
      // Erro já tratado pelo hook, mas vamos logar para debug
      console.error("Erro ao enviar proposta:", error);
      if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposalLink);
    toast.success("Link copiado!");
  };

  const shareWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá ${formData.clientName}! Sua proposta comercial está pronta. Acesse: ${proposalLink}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Proposta Comercial - JR Technology Solutions");
    const body = encodeURIComponent(
      `Olá ${formData.clientName},\n\nSua proposta comercial está pronta para visualização.\n\nAcesse o link: ${proposalLink}\n\nAtenciosamente,\nJR Technology Solutions`
    );
    window.open(`mailto:${formData.clientEmail}?subject=${subject}&body=${body}`, "_blank");
  };

  const selectedTemplate = modelos?.find(
    (t) => t.id === formData.contractTemplateId
  );

  if (isEditing && propostaLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Editar Proposta"
          subtitle="Edite os dados da proposta"
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando proposta...</p>
          </div>
        </div>
      </div>
    );
  }

  if (modelosLoading) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title={isEditing ? "Editar Proposta" : "Nova Proposta"}
          subtitle={
            isEditing
              ? "Edite os dados da proposta"
              : "Crie uma nova proposta comercial"
          }
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando modelos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title={isEditing ? "Editar Proposta" : "Nova Proposta"}
        subtitle={
          isEditing
            ? "Edite os dados da proposta"
            : "Crie uma nova proposta comercial"
        }
      />

      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="stepper-item">
                      <div
                        className={`stepper-circle ${
                          isCompleted
                            ? "stepper-circle-completed"
                            : isActive
                            ? "stepper-circle-active"
                            : "stepper-circle-pending"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? "bg-success" : "bg-border"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Form */}
            <Card className="lg:col-span-2 p-6">
              {/* Step 1: Client */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold">Dados do Cliente</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Cliente *</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nome completo"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="email@empresa.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefone</label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="(00) 00000-0000"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Empresa</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Nome da empresa"
                        value={formData.clientCompany}
                        onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">CNPJ</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="00.000.000/0000-00"
                        value={formData.clientCNPJ}
                        onChange={(e) => setFormData({ ...formData, clientCNPJ: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Services */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Serviços Contratados</h3>
                    <Dialog open={newServiceDialogOpen} onOpenChange={setNewServiceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar Serviço
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Serviço</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Nome do Serviço</label>
                            <Input
                              placeholder="Ex: Integração de APIs"
                              value={newServiceName}
                              onChange={(e) => setNewServiceName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddService()}
                            />
                          </div>
                          <Button className="w-full gradient-bg" onClick={handleAddService}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviceOptions.map((service) => (
                      <div
                        key={service}
                        className={`relative p-4 rounded-lg border text-left transition-all cursor-pointer ${
                          formData.services.includes(service)
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                              formData.services.includes(service)
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.services.includes(service) && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="font-medium">{service}</span>
                        </div>
                        {/* Remove button for all services */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveService(service);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Serviço Personalizado</label>
                    <textarea
                      className="input-field min-h-[100px] resize-none"
                      placeholder="Descreva outros serviços específicos..."
                      value={formData.customService}
                      onChange={(e) => setFormData({ ...formData, customService: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Values */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold">Valores e Pagamento</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Valor Total *</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="R$ 0,00"
                        value={formData.totalValue}
                        onChange={(e) => {
                          let value = e.target.value;
                          // Remove tudo exceto números, vírgula e ponto
                          value = value.replace(/[^\d,.-]/g, "");
                          // Garante apenas uma vírgula ou ponto
                          const parts = value.split(/[,.]/);
                          if (parts.length > 2) {
                            value = parts[0] + "," + parts.slice(1).join("");
                          }
                          setFormData({ ...formData, totalValue: value });
                        }}
                        onBlur={(e) => {
                          // Formata como moeda ao perder o foco
                          const numValue = parseValue(e.target.value);
                          if (numValue > 0) {
                            const formatted = new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(numValue);
                            setFormData({ ...formData, totalValue: formatted });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Condições de Pagamento</label>
                      <textarea
                        className="input-field min-h-[120px] resize-none"
                        placeholder="Ex: 50% na assinatura, 50% na entrega"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Timeline */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold">Prazos e Observações</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Início</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Previsão de Entrega</label>
                      <input
                        type="date"
                        className="input-field"
                        value={formData.deliveryDate}
                        onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Observações</label>
                    <textarea
                      className="input-field min-h-[150px] resize-none"
                      placeholder="Observações adicionais..."
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Contract Template */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold">Modelo de Contrato</h3>
                  <p className="text-muted-foreground text-sm">
                    Selecione o modelo de contrato que será usado automaticamente quando o cliente aceitar esta proposta.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Modelo de Contrato *</label>
                      <Select
                        value={formData.contractTemplateId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, contractTemplateId: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelos && modelos.length > 0 ? (
                            modelos.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.nome}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-models" disabled>
                              Nenhum modelo disponível
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.contractTemplateId && selectedTemplate && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-medium">{selectedTemplate.nome}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          As seguintes variáveis serão preenchidas automaticamente com os dados desta proposta:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{nome_cliente}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{formData.clientName || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{empresa_cliente}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{formData.clientCompany || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{cnpj_cliente}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{formData.clientCNPJ || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{email_cliente}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{formData.clientEmail || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{descricao_servicos}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {formData.services.length > 0
                                ? `${formData.services.length} serviço(s)`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{servico_personalizado}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {formData.customService || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{valor_total}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">{formData.totalValue || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{prazo_execucao}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {calculateExecutionPeriod(
                                formData.startDate,
                                formData.deliveryDate
                              ) || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{data_inicio}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {formData.startDate
                                ? new Date(formData.startDate).toLocaleDateString("pt-BR")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{data_entrega}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {formData.deliveryDate
                                ? new Date(formData.deliveryDate).toLocaleDateString("pt-BR")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{condicoes_pagamento}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span className="truncate">
                              {formData.paymentTerms || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={currentStep === 1 ? () => navigate("/admin/propostas") : handlePrev}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {currentStep === 1 ? "Cancelar" : "Anterior"}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleSaveDraft}
                    disabled={
                      createProposta.isPending || updateProposta.isPending
                    }
                  >
                    {createProposta.isPending || updateProposta.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Salvar Rascunho
                      </>
                    )}
                  </Button>
                  {currentStep < 5 ? (
                    <Button onClick={handleNext} className="gradient-bg gap-2">
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      className="gradient-bg gap-2"
                      onClick={handleSendProposal}
                      disabled={
                        !formData.contractTemplateId ||
                        createProposta.isPending ||
                        updateProposta.isPending
                      }
                    >
                      {createProposta.isPending || updateProposta.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Proposta
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Preview */}
            <Card className="p-6 h-fit sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{formData.clientName || "—"}</p>
                  <p className="text-muted-foreground text-xs">{formData.clientEmail || "—"}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-1">Serviços</p>
                  {formData.services.length > 0 ? (
                    <ul className="space-y-1">
                      {formData.services.map((s) => (
                        <li key={s} className="font-medium">• {s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-medium">—</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-xl font-bold text-primary">
                    {formData.totalValue || "R$ 0,00"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-1">Prazo</p>
                  <p className="font-medium">
                    {formData.startDate && formData.deliveryDate
                      ? `${formData.startDate} até ${formData.deliveryDate}`
                      : "—"}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground mb-1">Modelo de Contrato</p>
                  <p className="font-medium">
                    {selectedTemplate?.name || "—"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Proposta Enviada */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold mb-2">Proposta Enviada com Sucesso!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              A proposta foi salva e está pronta para ser enviada ao cliente.
            </p>

            {/* Link da proposta */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-left">
                  Link da Proposta
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={proposalLink}
                    className="text-sm font-mono"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      copyToClipboard();
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    title="Copiar link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={shareWhatsApp}
                  disabled={!proposalLink || !formData.clientName}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={shareEmail}
                  disabled={!proposalLink || !formData.clientEmail}
                >
                  <ExternalLink className="w-4 h-4" />
                  Email
                </Button>
              </div>

              <Button
                className="w-full gradient-bg"
                onClick={() => {
                  setSendModalOpen(false);
                  navigate("/admin/propostas");
                }}
              >
                Ir para Lista de Propostas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
