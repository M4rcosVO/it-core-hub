import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppProviders } from "./AppProviders";

// Lazy loaded routes (O1)
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Inventario = lazy(() => import("@/pages/Inventario"));
const Celulares = lazy(() => import("@/pages/Celulares"));
const Login = lazy(() => import("@/pages/Login"));
const PublicColeta = lazy(() => import("@/pages/PublicColeta"));
const Rede = lazy(() => import("@/pages/Rede"));
const Wiki = lazy(() => import("@/pages/Wiki"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const Acessos = lazy(() => import("@/pages/Acessos"));
const Contratos = lazy(() => import("@/pages/Contratos"));
const Rotinas = lazy(() => import("@/pages/Rotinas"));
const Calendario = lazy(() => import("@/pages/Calendario"));
const Relatorios = lazy(() => import("@/pages/Relatorios"));
const Demandas = lazy(() => import("@/pages/Demandas"));
const FinOps = lazy(() => import("@/pages/FinOps"));
const Status = lazy(() => import("@/pages/Status"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Compras = lazy(() => import("@/pages/Compras"));
const Noc = lazy(() => import("@/pages/Noc"));
const Cmdb = lazy(() => import("@/pages/Cmdb"));
const ServiceDesk = lazy(() => import("@/pages/ServiceDesk"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Fallback spinner while loading chunks
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <AppProviders>
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/celulares" element={<Celulares />} />
            <Route path="/rede" element={<Rede />} />
            <Route path="/acessos" element={<Acessos />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/rotinas" element={<Rotinas />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/demandas" element={<Demandas />} />
            <Route path="/finops" element={<FinOps />} />
            <Route path="/status" element={<Status />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/cmdb" element={<Cmdb />} />
            <Route path="/portal" element={<ServiceDesk />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          {/* NOC route outside AppLayout to remove sidebar & topbar entirely */}
          <Route path="/noc" element={<Noc />} />
          {/* Public satellite page — isolated from admin chrome and navigation */}
          <Route path="/coleta-aparelho" element={<PublicColeta />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AppProviders>
);

export default App;
