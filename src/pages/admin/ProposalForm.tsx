import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";

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

const contractTemplates = [
  { id: "1", name: "Contrato de Prestação de Serviços" },
  { id: "2", name: "Contrato de Suporte Mensal" },
  { id: "3", name: "Contrato de Consultoria" },
];

export default function ProposalForm() {
  const navigate = useNavigate();
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

  const handleSaveDraft = () => {
    toast.success("Rascunho salvo com sucesso!");
  };

  const handleSendProposal = () => {
    // Gera um ID único para a proposta
    const proposalId = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/cliente/proposta/${proposalId}`;
    setProposalLink(link);
    setSendModalOpen(true);
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

  const selectedTemplate = contractTemplates.find(t => t.id === formData.contractTemplateId);

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Nova Proposta"
        subtitle="Crie uma nova proposta comercial"
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

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <Card className="lg:col-span-2 p-6">
              {/* Step 1: Client */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-lg font-semibold">Dados do Cliente</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
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
                  <div className="grid sm:grid-cols-2 gap-3">
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
                        onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
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
                  <div className="grid sm:grid-cols-2 gap-4">
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
                        onValueChange={(value) => setFormData({ ...formData, contractTemplateId: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.contractTemplateId && (
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-medium">{selectedTemplate?.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          As seguintes variáveis serão preenchidas automaticamente com os dados desta proposta:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{nome_cliente}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span>{formData.clientName || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{empresa}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span>{formData.clientCompany || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{valor_total}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span>{formData.totalValue || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 rounded bg-background">
                            <code className="text-primary">{"{{prazo}}"}</code>
                            <span className="text-muted-foreground">→</span>
                            <span>{formData.startDate && formData.deliveryDate ? `${formData.startDate} a ${formData.deliveryDate}` : "—"}</span>
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
                  <Button variant="outline" className="gap-2" onClick={handleSaveDraft}>
                    <Save className="w-4 h-4" />
                    Salvar Rascunho
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
                      disabled={!formData.contractTemplateId}
                    >
                      <Send className="w-4 h-4" />
                      Enviar Proposta
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
                <label className="block text-sm font-medium mb-2 text-left">Link da Proposta</label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={proposalLink}
                    className="text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
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
