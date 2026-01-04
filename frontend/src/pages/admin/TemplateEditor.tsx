import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useModelo,
  useCreateModelo,
  useUpdateModelo,
} from "@/hooks/use-api";

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
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== "novo";

  // Hooks da API
  const { data: modeloData, isLoading: isLoadingModelo } = useModelo(
    id || "",
    { enabled: isEditing }
  );
  const createModelo = useCreateModelo();
  const updateModelo = useUpdateModelo();

  const [templateName, setTemplateName] = useState("Contrato de Prestação de Serviços");
  const [content, setContent] = useState(defaultContent);
  const [showPreview, setShowPreview] = useState(false);
  const [variables, setVariables] = useState<Variable[]>(defaultVariables);
  
  // Dialog state for adding new variable
  const [newVariableDialogOpen, setNewVariableDialogOpen] = useState(false);
  const [newVariableKey, setNewVariableKey] = useState("");
  const [newVariableLabel, setNewVariableLabel] = useState("");

  // Carregar dados do modelo se estiver editando
  useEffect(() => {
    if (modeloData) {
      setTemplateName(modeloData.nome);
      setContent(modeloData.template_texto);
      
      // Converter variáveis do formato do banco para o formato do componente
      if (modeloData.variaveis && Array.isArray(modeloData.variaveis)) {
        const loadedVariables = modeloData.variaveis.map((v: any) => ({
          key: v.key || v,
          label: v.label || v,
          isDefault: defaultVariables.some(dv => dv.key === (v.key || v)),
        }));
        
        // Combinar com variáveis padrão que não estão no banco
        const allVariables = [...defaultVariables];
        loadedVariables.forEach((lv: Variable) => {
          if (!allVariables.some(av => av.key === lv.key)) {
            allVariables.push(lv);
          }
        });
        
        setVariables(allVariables);
      } else {
        setVariables(defaultVariables);
      }
    }
  }, [modeloData]);

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

  // Gerar preview substituindo variáveis
  const previewContent = (() => {
    let preview = content;
    // Substituir todas as variáveis encontradas no template
    variables.forEach((variable) => {
      const regex = new RegExp(variable.key.replace(/[{}]/g, "\\$&"), "g");
      // Valores de exemplo para preview
      const exampleValues: Record<string, string> = {
        "{{nome_cliente}}": "João da Silva",
        "{{empresa_cliente}}": "Tech Corp Ltda",
        "{{cnpj_cliente}}": "00.000.000/0001-00",
        "{{email_cliente}}": "joao@techcorp.com",
        "{{descricao_servicos}}": "• Desenvolvimento de Software\n• Desenvolvimento Web",
        "{{servico_personalizado}}": "Serviço formado com as seguintes telas:\n- Tela 1\n- Tela 2\n- Tela 3",
        "{{valor_total}}": "R$ 45.000,00",
        "{{prazo_execucao}}": "90 dias",
        "{{data_inicio}}": "01/01/2025",
        "{{data_entrega}}": "01/04/2025",
        "{{condicoes_pagamento}}": "50% na assinatura do contrato e 50% na entrega final.",
      };
      preview = preview.replace(
        regex,
        exampleValues[variable.key] || `[${variable.label}]`
      );
    });
    return preview;
  })();

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("O nome do modelo é obrigatório");
      return;
    }

    if (!content.trim()) {
      toast.error("O conteúdo do modelo é obrigatório");
      return;
    }

    // Converter variáveis para o formato do banco (salvar todas)
    const variablesToSave = variables.map((v) => ({
      key: v.key,
      label: v.label,
    }));

    try {
      if (isEditing && id) {
        // Atualizar modelo existente
        await updateModelo.mutateAsync({
          id,
          data: {
            nome: templateName.trim(),
            template_texto: content,
            variaveis: variablesToSave,
          },
        });
        navigate("/admin/modelos");
      } else {
        // Criar novo modelo
        await createModelo.mutateAsync({
          nome: templateName.trim(),
          template_texto: content,
          variaveis: variablesToSave,
        });
        navigate("/admin/modelos");
      }
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  if (isLoadingModelo && isEditing) {
    return (
      <div className="animate-fade-in">
        <AdminTopbar
          title="Editor de Modelo"
          subtitle="Carregando modelo..."
        />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando modelo...</p>
          </div>
        </div>
      </div>
    );
  }

  const isSaving = createModelo.isPending || updateModelo.isPending;

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title={isEditing ? "Editar Modelo" : "Novo Modelo"}
        subtitle={isEditing ? "Edite o modelo de contrato" : "Crie um novo modelo de contrato"}
      />

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/modelos")}
              className="gap-2"
              disabled={isSaving}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
                disabled={isSaving}
              >
                <Eye className="w-4 h-4" />
                {showPreview ? "Editar" : "Preview"}
              </Button>
              <Button
                className="gradient-bg gap-2"
                onClick={handleSave}
                disabled={isSaving || !templateName.trim() || !content.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Modelo
                  </>
                )}
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
