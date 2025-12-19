import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  FileText,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templates = [
  {
    id: "1",
    name: "Contrato de Prestação de Serviços",
    description: "Modelo padrão para serviços de desenvolvimento",
    lastModified: "18/12/2024",
    variables: 8,
  },
  {
    id: "2",
    name: "Contrato de Suporte Mensal",
    description: "Modelo para contratos de suporte recorrente",
    lastModified: "15/12/2024",
    variables: 6,
  },
  {
    id: "3",
    name: "Contrato de Consultoria",
    description: "Modelo para projetos de consultoria em TI",
    lastModified: "10/12/2024",
    variables: 7,
  },
];

export default function ContractTemplates() {
  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Modelos de Contrato"
        subtitle="Gerencie seus templates de contrato"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex justify-between">
          <p className="text-muted-foreground">
            {templates.length} modelo(s) disponível(is)
          </p>
          <Link to="/admin/modelos/novo">
            <Button className="gradient-bg gap-2">
              <Plus className="w-4 h-4" />
              Criar Modelo
            </Button>
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-6 card-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="w-4 h-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-destructive">
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{template.lastModified}</span>
                </div>
                <span className="status-badge bg-accent text-accent-foreground">
                  {template.variables} variáveis
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
