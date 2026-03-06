import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PrivacyProvider } from "@/components/PrivacyContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { AuditProvider } from "@/components/AuditContext";
import { AuthProvider } from "@/components/AuthContext";
import { DataProvider } from "@/components/DataContext";
import Dashboard from "@/pages/Dashboard";
import Inventario from "@/pages/Inventario";
import Rede from "@/pages/Rede";
import Wiki from "@/pages/Wiki";
import Configuracoes from "@/pages/Configuracoes";
import Acessos from "@/pages/Acessos";
import Contratos from "@/pages/Contratos";
import Rotinas from "@/pages/Rotinas";
import Calendario from "@/pages/Calendario";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <PrivacyProvider>
            <AuditProvider>
              <DataProvider>
                <BrowserRouter>
                  <Routes>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/inventario" element={<Inventario />} />
                      <Route path="/rede" element={<Rede />} />
                      <Route path="/acessos" element={<Acessos />} />
                      <Route path="/contratos" element={<Contratos />} />
                      <Route path="/wiki" element={<Wiki />} />
                      <Route path="/rotinas" element={<Rotinas />} />
                      <Route path="/calendario" element={<Calendario />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </DataProvider>
            </AuditProvider>
          </PrivacyProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
