import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Type,
  Code,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const defaultVariables = [
  { key: "{{nome_cliente}}", label: "Nome do Cliente", isDefault: true },
  { key: "{{empresa_cliente}}", label: "Empresa do Cliente", isDefault: true },
  { key: "{{cnpj_cliente}}", label: "CNPJ do Cliente", isDefault: true },
  { key: "{{email_cliente}}", label: "Email do Cliente", isDefault: true },
  { key: "{{descricao_servicos}}", label: "Descrição dos Serviços", isDefault: true },
  { key: "{{servico_personalizado}}", label: "Serviço Personalizado", isDefault: true },
  { key: "{{valor_total}}", label: "Valor Total", isDefault: true },
  { key: "{{prazo_execucao}}", label: "Prazo de Execução", isDefault: true },
  { key: "{{data_inicio}}", label: "Data de Início", isDefault: true },
  { key: "{{data_entrega}}", label: "Data de Entrega", isDefault: true },
  { key: "{{condicoes_pagamento}}", label: "Condições de Pagamento", isDefault: true },
];

const defaultContent = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{nome_cliente}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{cnpj_cliente}}, com sede em [endereço].

CONTRATADA: JR TECHNOLOGY SOLUTIONS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em [endereço].

1. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação dos seguintes serviços:

{{descricao_servicos}}

{{servico_personalizado}}

2. VALOR E FORMA DE PAGAMENTO

O valor total dos serviços é de {{valor_total}}.

{{condicoes_pagamento}}

3. PRAZO DE EXECUÇÃO

O prazo para execução dos serviços é de {{prazo_execucao}}, com início em {{data_inicio}} e término previsto para {{data_entrega}}.

4. OBRIGAÇÕES DAS PARTES

[Incluir obrigações]

5. DISPOSIÇÕES GERAIS

[Incluir disposições]

E, por estarem assim justas e acordadas, as partes assinam o presente instrumento.`;

interface Variable {
  key: string;
  label: string;
  isDefault: boolean;
}

export default function TemplateEditor() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("Contrato de Prestação de Serviços");
  const [content, setContent] = useState(defaultContent);
  const [showPreview, setShowPreview] = useState(false);
  const [variables, setVariables] = useState<Variable[]>(defaultVariables);
  
  // Dialog state for adding new variable
  const [newVariableDialogOpen, setNewVariableDialogOpen] = useState(false);
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableLabel, setNewVariableLabel] = useState("");

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("editor") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + variable + content.slice(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleAddVariable = () => {
    if (!newVariableKey.trim() || !newVariableLabel.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Format the key properly
    const formattedKey = newVariableKey
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    
    const variableKey = `{{${formattedKey}}}`;

    // Check if already exists
    if (variables.some(v => v.key === variableKey)) {
      toast.error("Esta variável já existe");
      return;
    }

    setVariables([...variables, {
      key: variableKey,
      label: newVariableLabel.trim(),
      isDefault: false,
    }]);

    setNewVariableKey("");
    setNewVariableLabel("");
    setNewVariableDialogOpen(false);
    toast.success("Variável adicionada com sucesso!");
  };

  const handleRemoveVariable = (key: string) => {
    setVariables(variables.filter(v => v.key !== key));
    toast.success("Variável removida");
  };

  const previewContent = content
    .replace(/{{nome_cliente}}/g, "João da Silva")
    .replace(/{{empresa_cliente}}/g, "Tech Corp Ltda")
    .replace(/{{cnpj_cliente}}/g, "00.000.000/0001-00")
    .replace(/{{email_cliente}}/g, "joao@techcorp.com")
    .replace(/{{descricao_servicos}}/g, "• Desenvolvimento de Software\n• Desenvolvimento Web")
    .replace(/{{servico_personalizado}}/g, "Serviço formado com as seguintes telas:\n- Tela 1\n- Tela 2\n- Tela 3")
    .replace(/{{valor_total}}/g, "R$ 45.000,00")
    .replace(/{{prazo_execucao}}/g, "90 dias")
    .replace(/{{data_inicio}}/g, "01/01/2025")
    .replace(/{{data_entrega}}/g, "01/04/2025")
    .replace(/{{condicoes_pagamento}}/g, "50% na assinatura do contrato e 50% na entrega final.");

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Editor de Modelo"
        subtitle="Crie ou edite um modelo de contrato"
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/modelos")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Editar" : "Preview"}
              </Button>
              <Button className="gradient-bg gap-2">
                <Save className="w-4 h-4" />
                Salvar Modelo
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar - Variables */}
            <Card className="p-4 h-fit lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="w-4 h-4 text-primary" />
                  Variáveis
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNewVariableDialogOpen(true)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {variables.map((variable) => (
                  <div
                    key={variable.key}
                    className="group relative"
                  >
                    <button
                      onClick={() => insertVariable(variable.key)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors pr-8"
                    >
                      <span className="variable-tag text-xs">{variable.key}</span>
                      <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                        {variable.label}
                      </p>
                    </button>
                    {!variable.isDefault && (
                      <button
                        onClick={() => handleRemoveVariable(variable.key)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Editor / Preview */}
            <Card className="p-6 lg:col-span-3">
              {/* Template Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Nome do Modelo
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  {showPreview ? "Preview do Contrato" : "Conteúdo do Modelo"}
                </label>

                {showPreview ? (
                  <div className="min-h-[500px] p-6 rounded-lg border border-border bg-card whitespace-pre-wrap text-sm leading-relaxed">
                    {previewContent}
                  </div>
                ) : (
                  <textarea
                    id="editor"
                    className="input-field min-h-[500px] font-mono text-sm resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog para adicionar nova variável */}
      <Dialog open={newVariableDialogOpen} onOpenChange={setNewVariableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Variável</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="variableKey">Identificador da Variável</Label>
              <Input
                id="variableKey"
                placeholder="ex: telefone_cliente"
                value={newVariableKey}
                onChange={(e) => setNewVariableKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Será convertido para: {`{{${newVariableKey.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "identificador"}}}`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="variableLabel">Descrição</Label>
              <Input
                id="variableLabel"
                placeholder="ex: Telefone do Cliente"
                value={newVariableLabel}
                onChange={(e) => setNewVariableLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewVariableDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddVariable} className="gradient-bg">
              Adicionar Variável
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
