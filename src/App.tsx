import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { AdminLayout } from "./components/admin/AdminLayout";
import { ClientLayout } from "./components/client/ClientLayout";

// Pages
import NotFound from "./pages/NotFound";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Proposals from "./pages/admin/Proposals";
import ProposalForm from "./pages/admin/ProposalForm";
import Contracts from "./pages/admin/Contracts";
import ContractTemplates from "./pages/admin/ContractTemplates";
import TemplateEditor from "./pages/admin/TemplateEditor";
import Settings from "./pages/admin/Settings";

// Client Pages
import ClientProposal from "./pages/client/ClientProposal";
import ContractSign from "./pages/client/ContractSign";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="propostas" element={<Proposals />} />
            <Route path="propostas/nova" element={<ProposalForm />} />
            <Route path="propostas/:id" element={<ProposalForm />} />
            <Route path="contratos" element={<Contracts />} />
            <Route path="modelos" element={<ContractTemplates />} />
            <Route path="modelos/novo" element={<TemplateEditor />} />
            <Route path="modelos/:id" element={<TemplateEditor />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>

          {/* Client Routes */}
          <Route path="/cliente" element={<ClientLayout />}>
            <Route path="proposta/:id" element={<ClientProposal />} />
            <Route path="contrato/:id" element={<ContractSign />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
