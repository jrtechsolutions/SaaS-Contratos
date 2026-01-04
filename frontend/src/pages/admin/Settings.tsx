import { useState, useEffect } from "react";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Upload,
  Save,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useConfiguracoes, useUpdateConfiguracoes } from "@/hooks/use-api";
import logoJR from "@/assets/logo-jr.png";

export default function Settings() {
  const { data: configuracoes, isLoading } = useConfiguracoes();
  const updateConfiguracoes = useUpdateConfiguracoes();

  const [companyData, setCompanyData] = useState({
    razao_social: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
  });

  const [contractText, setContractText] = useState("");

  // Carregar dados quando configurações forem carregadas
  useEffect(() => {
    if (configuracoes) {
      setCompanyData({
        razao_social: configuracoes.razao_social || "",
        cnpj: configuracoes.cnpj || "",
        email: configuracoes.email || "",
        telefone: configuracoes.telefone || "",
        endereco: configuracoes.endereco || "",
        cidade: configuracoes.cidade || "",
      });
      setContractText(configuracoes.texto_complementar || "");
    }
  }, [configuracoes]);

  const handleSave = async () => {
    try {
      await updateConfiguracoes.mutateAsync({
        ...companyData,
        texto_complementar: contractText,
      });
    } catch (error) {
      // Erro já é tratado no hook
    }
  };

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
                  value={companyData.razao_social}
                  onChange={(e) => setCompanyData({ ...companyData, razao_social: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CNPJ</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.cnpj}
                  onChange={(e) => setCompanyData({ ...companyData, cnpj: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  className="input-field"
                  value={companyData.telefone}
                  onChange={(e) => setCompanyData({ ...companyData, telefone: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.endereco}
                  onChange={(e) => setCompanyData({ ...companyData, endereco: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">Cidade - UF</label>
                <input
                  type="text"
                  className="input-field"
                  value={companyData.cidade}
                  onChange={(e) => setCompanyData({ ...companyData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo - SP"
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>

          {/* Logo Upload */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Logo da Empresa</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Aparece nos documentos e área do cliente
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src={logoJR} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
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
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">Texto Complementar</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Texto padrão adicionado ao final dos contratos
                </p>
              </div>
            </div>

            <textarea
              className="input-field min-h-[150px] resize-none w-full"
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
              disabled={isLoading}
              placeholder="Texto que será adicionado ao final dos contratos..."
            />
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <Button 
              className="gradient-bg gap-2 w-full sm:w-auto h-10 sm:h-auto"
              onClick={handleSave}
              disabled={isLoading || updateConfiguracoes.isPending}
            >
              {updateConfiguracoes.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
