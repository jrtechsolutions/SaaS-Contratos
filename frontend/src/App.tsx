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

// Auth Pages
import Login from "./pages/admin/Login";
import { auth } from "./lib/auth";

const queryClient = new QueryClient();

// Componente para redirecionar baseado em autenticação
function RootRedirect() {
  const isAuthenticated = auth.isAuthenticated();
  return <Navigate to={isAuthenticated ? "/admin" : "/login"} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root baseado em autenticação */}
          <Route path="/" element={<RootRedirect />} />

          {/* Login Route */}
          <Route path="/login" element={<Login />} />

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
