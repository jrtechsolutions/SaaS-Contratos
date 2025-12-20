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
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Cliente", icon: User },
  { id: 2, label: "Serviços", icon: Briefcase },
  { id: 3, label: "Valores", icon: DollarSign },
  { id: 4, label: "Prazo", icon: Calendar },
];

const defaultServices = [
  "Desenvolvimento de Software",
  "Desenvolvimento Web",
  "Aplicativo Mobile",
  "Consultoria em TI",
  "Suporte Técnico",
  "Manutenção de Sistemas",
];

export default function ProposalForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceOptions, setServiceOptions] = useState<string[]>(defaultServices);
  const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
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
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
                  <Button variant="outline" className="gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Rascunho
                  </Button>
                  {currentStep < 4 ? (
                    <Button onClick={handleNext} className="gradient-bg gap-2">
                      Próximo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button className="gradient-bg gap-2">
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
