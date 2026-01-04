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
  useConfiguracoes,
} from "@/hooks/use-api";

// Variáveis padrão do cliente
const defaultClientVariables = [
  { key: "{{nome_cliente}}", label: "Nome do Cliente", isDefault: true },
  { key: "{{empresa_cliente}}", label: "Empresa do Cliente", isDefault: true },
  { key: "{{cnpj_cliente}}", label: "CNPJ do Cliente", isDefault: true },
  { key: "{{email_cliente}}", label: "Email do Cliente", isDefault: true },
  { key: "{{telefone_cliente}}", label: "Telefone do Cliente", isDefault: true },
];

// Variáveis padrão dos serviços
const defaultServiceVariables = [
  { key: "{{descricao_servicos}}", label: "Descrição dos Serviços", isDefault: true },
  { key: "{{servico_personalizado}}", label: "Serviço Personalizado", isDefault: true },
  { key: "{{valor_total}}", label: "Valor Total", isDefault: true },
  { key: "{{prazo_execucao}}", label: "Prazo de Execução", isDefault: true },
  { key: "{{data_inicio}}", label: "Data de Início", isDefault: true },
  { key: "{{data_entrega}}", label: "Data de Entrega", isDefault: true },
  { key: "{{condicoes_pagamento}}", label: "Condições de Pagamento", isDefault: true },
];

// Variáveis da empresa (serão adicionadas dinamicamente)
const getCompanyVariables = (configuracoes?: any) => {
  if (!configuracoes) return [];
  
  return [
    { key: "{{razao_social_empresa}}", label: "Razão Social da Empresa (CONTRATADA)", isDefault: true },
    { key: "{{cnpj_empresa}}", label: "CNPJ da Empresa", isDefault: true },
    { key: "{{email_empresa}}", label: "Email da Empresa", isDefault: true },
    { key: "{{telefone_empresa}}", label: "Telefone da Empresa", isDefault: true },
    { key: "{{endereco_empresa}}", label: "Endereço da Empresa", isDefault: true },
    { key: "{{cidade_empresa}}", label: "Cidade da Empresa", isDefault: true },
    { key: "{{endereco_completo_empresa}}", label: "Endereço Completo (Endereço + Cidade)", isDefault: true },
    { key: "{{texto_complementar}}", label: "Texto Complementar (adicionado ao final)", isDefault: true },
  ];
};

// Combinar todas as variáveis padrão
const getDefaultVariables = (configuracoes?: any) => {
  return [
    ...defaultClientVariables,
    ...defaultServiceVariables,
    ...getCompanyVariables(configuracoes),
  ];
};

// Conteúdo padrão (será atualizado com dados da empresa)
const getDefaultContent = (configuracoes?: any) => {
  const razaoSocial = configuracoes?.razao_social || 'JR TECHNOLOGY SOLUTIONS';
  const cnpj = configuracoes?.cnpj || 'XX.XXX.XXX/0001-XX';
  const endereco = configuracoes?.endereco_completo_empresa || 
                   (configuracoes?.cidade ? `${configuracoes.endereco}, ${configuracoes.cidade}` : 
                    configuracoes?.endereco || '[endereço]');
  
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{nome_cliente}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{cnpj_cliente}}, com sede em [endereço].

CONTRATADA: ${razaoSocial}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${cnpj}, com sede em ${endereco}.`;
};

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
  const { data: configuracoes } = useConfiguracoes();
  const createModelo = useCreateModelo();
  const updateModelo = useUpdateModelo();

  const [templateName, setTemplateName] = useState("Contrato de Prestação de Serviços");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [variables, setVariables] = useState<Variable[]>([]);
  
  // Inicializar com variáveis e conteúdo padrão quando configurações carregarem
  useEffect(() => {
    if (configuracoes || !isEditing) {
      const defaultVars = getDefaultVariables(configuracoes);
      setVariables(defaultVars);
      
      // Se não estiver editando e o conteúdo estiver vazio, usar conteúdo padrão
      if (!isEditing && !content) {
        const defaultContentText = getDefaultContent(configuracoes) + `\n\n1. OBJETO DO CONTRATO\n\nO presente contrato tem por objeto a prestação dos seguintes serviços:\n\n{{descricao_servicos}}\n\n{{servico_personalizado}}\n\n2. VALOR E FORMA DE PAGAMENTO\n\nO valor total dos serviços é de {{valor_total}}.\n\n{{condicoes_pagamento}}\n\n3. PRAZO DE EXECUÇÃO\n\nO prazo para execução dos serviços é de {{prazo_execucao}}, com início em {{data_inicio}} e término previsto para {{data_entrega}}.\n\n4. OBRIGAÇÕES DAS PARTES\n\n[Incluir obrigações]\n\n5. DISPOSIÇÕES GERAIS\n\n[Incluir disposições]\n\nE, por estarem assim justas e acordadas, as partes assinam o presente instrumento.`;
        setContent(defaultContentText);
      }
    }
  }, [configuracoes, isEditing]);
  
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
        const defaultVars = getDefaultVariables(configuracoes);
        const loadedVariables = modeloData.variaveis.map((v: any) => ({
          key: v.key || v,
          label: v.label || v,
          isDefault: defaultVars.some(dv => dv.key === (v.key || v)),
        }));
        
        // Combinar com variáveis padrão que não estão no banco
        const allVariables = [...defaultVars];
        loadedVariables.forEach((lv: Variable) => {
          if (!allVariables.some(av => av.key === lv.key)) {
            allVariables.push(lv);
          }
        });
        
        setVariables(allVariables);
      } else {
        setVariables(getDefaultVariables(configuracoes));
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

  // Gerar preview substituindo variáveis com dados reais da empresa
  const previewContent = (() => {
    let preview = content;
    
    // Valores de exemplo para preview
    const exampleValues: Record<string, string> = {
      // Dados do cliente (exemplo)
      "{{nome_cliente}}": "João da Silva",
      "{{empresa_cliente}}": "Tech Corp Ltda",
      "{{cnpj_cliente}}": "00.000.000/0001-00",
      "{{email_cliente}}": "joao@techcorp.com",
      "{{telefone_cliente}}": "(11) 99999-9999",
      
      // Dados da empresa (reais das configurações)
      "{{razao_social_empresa}}": configuracoes?.razao_social || "JR Technology Solutions",
      "{{cnpj_empresa}}": configuracoes?.cnpj || "XX.XXX.XXX/0001-XX",
      "{{email_empresa}}": configuracoes?.email || "contato@jrtechnologysolutions.com.br",
      "{{telefone_empresa}}": configuracoes?.telefone || "(00) 0000-0000",
      "{{endereco_empresa}}": configuracoes?.endereco || "Endereço da Empresa",
      "{{cidade_empresa}}": configuracoes?.cidade || "Cidade - UF",
      "{{endereco_completo_empresa}}": configuracoes?.cidade 
        ? `${configuracoes.endereco}, ${configuracoes.cidade}`
        : configuracoes?.endereco || "Endereço da Empresa",
      "{{texto_complementar}}": configuracoes?.texto_complementar || "",
      
      // Dados dos serviços (exemplo)
      "{{descricao_servicos}}": "• Desenvolvimento de Software\n• Desenvolvimento Web",
      "{{servico_personalizado}}": "Serviço formado com as seguintes telas:\n- Tela 1\n- Tela 2\n- Tela 3",
      "{{valor_total}}": "R$ 45.000,00",
      "{{prazo_execucao}}": "90 dias",
      "{{data_inicio}}": "01/01/2025",
      "{{data_entrega}}": "01/04/2025",
      "{{condicoes_pagamento}}": "50% na assinatura do contrato e 50% na entrega final.",
    };
    
    // Substituir todas as variáveis encontradas no template
    variables.forEach((variable) => {
      const regex = new RegExp(variable.key.replace(/[{}]/g, "\\$&"), "g");
      preview = preview.replace(
        regex,
        exampleValues[variable.key] || `[${variable.label}]`
      );
    });
    
    // Adicionar texto complementar ao final se existir
    if (configuracoes?.texto_complementar && preview.includes("{{texto_complementar}}")) {
      preview = preview.replace(/{{texto_complementar}}/g, configuracoes.texto_complementar);
    } else if (configuracoes?.texto_complementar && !preview.includes("{{texto_complementar}}")) {
      // Se não tiver a variável mas tiver texto complementar, adicionar ao final
      preview += "\n\n" + configuracoes.texto_complementar;
    }
    
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

      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/modelos")}
              className="gap-2 w-full sm:w-auto h-10 sm:h-auto"
              disabled={isSaving}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 flex-1 sm:flex-initial h-10 sm:h-auto"
                disabled={isSaving}
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">{showPreview ? "Editar" : "Preview"}</span>
                <span className="sm:hidden">Preview</span>
              </Button>
              <Button
                className="gradient-bg gap-2 flex-1 sm:flex-initial h-10 sm:h-auto"
                onClick={handleSave}
                disabled={isSaving || !templateName.trim() || !content.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Salvar Modelo</span>
                    <span className="sm:hidden">Salvar</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar - Variables */}
            <Card className="p-3 sm:p-4 h-fit lg:col-span-1 order-2 lg:order-1">
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
            <Card className="p-4 sm:p-6 lg:col-span-3 order-1 lg:order-2">
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
