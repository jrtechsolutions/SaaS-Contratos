import { useState } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Upload,
  Save,
  FileText,
} from "lucide-react";
import logoJR from "@/assets/logo-jr.png";

export default function Settings() {
  const [companyData, setCompanyData] = useState({
    name: "JR Technology Solutions",
    cnpj: "00.000.000/0001-00",
    email: "contato@jrtechnologysolutions.com.br",
    phone: "(00) 0000-0000",
    address: "Endereço da Empresa, 123",
    city: "Cidade - UF",
  });

  const [contractText, setContractText] = useState(
    "Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA."
  );

  return (
    <div className="animate-fade-in">
      <AdminTopbar
        title="Configurações"
        subtitle="Configure os dados da empresa"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Company Data */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Dados da Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  Informações que aparecem nos contratos
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Razão Social</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CNPJ</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.cnpj}
                  onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Logo Upload */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Logo da Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  Aparece nos documentos e área do cliente
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                <img src={logoJR} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Alterar Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG até 2MB. Recomendado: 200x200px
                </p>
              </div>
            </div>
          </Card>

          {/* Contract Text */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Texto Complementar</h3>
                <p className="text-sm text-muted-foreground">
                  Texto padrão adicionado ao final dos contratos
                </p>
              </div>
            </div>

            <textarea
              className="input-field min-h-[150px] resize-none"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
            />
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button className="gradient-bg gap-2">
              <Save className="w-4 h-4" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
