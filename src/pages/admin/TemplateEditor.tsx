import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Type,
  Code,
} from "lucide-react";

const availableVariables = [
  { key: "{{nome_cliente}}", label: "Nome do Cliente" },
  { key: "{{empresa_cliente}}", label: "Empresa do Cliente" },
  { key: "{{cnpj_cliente}}", label: "CNPJ do Cliente" },
  { key: "{{email_cliente}}", label: "Email do Cliente" },
  { key: "{{descricao_servicos}}", label: "Descrição dos Serviços" },
  { key: "{{valor_total}}", label: "Valor Total" },
  { key: "{{prazo_execucao}}", label: "Prazo de Execução" },
  { key: "{{data_inicio}}", label: "Data de Início" },
  { key: "{{data_entrega}}", label: "Data de Entrega" },
  { key: "{{condicoes_pagamento}}", label: "Condições de Pagamento" },
];

const defaultContent = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{nome_cliente}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{cnpj_cliente}}, com sede em [endereço].

CONTRATADA: JR TECHNOLOGY SOLUTIONS, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em [endereço].

1. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação dos seguintes serviços:

{{descricao_servicos}}

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

export default function TemplateEditor() {
  const navigate = useNavigate();
  const [templateName, setTemplateName] = useState("Contrato de Prestação de Serviços");
  const [content, setContent] = useState(defaultContent);
  const [showPreview, setShowPreview] = useState(false);

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

  const previewContent = content
    .replace(/{{nome_cliente}}/g, "João da Silva")
    .replace(/{{empresa_cliente}}/g, "Tech Corp Ltda")
    .replace(/{{cnpj_cliente}}/g, "00.000.000/0001-00")
    .replace(/{{email_cliente}}/g, "joao@techcorp.com")
    .replace(/{{descricao_servicos}}/g, "Desenvolvimento de sistema web personalizado")
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
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                Variáveis
              </h3>
              <div className="space-y-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.key}
                    onClick={() => insertVariable(variable.key)}
                    className="w-full text-left p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <span className="variable-tag text-xs">{variable.key}</span>
                    <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                      {variable.label}
                    </p>
                  </button>
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
    </div>
  );
}
