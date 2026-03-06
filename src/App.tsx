import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { AppProviders } from "./AppProviders";

// Lazy loaded routes (O1)
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Inventario = lazy(() => import("@/pages/Inventario"));
const Rede = lazy(() => import("@/pages/Rede"));
const Wiki = lazy(() => import("@/pages/Wiki"));
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const Acessos = lazy(() => import("@/pages/Acessos"));
const Contratos = lazy(() => import("@/pages/Contratos"));
const Rotinas = lazy(() => import("@/pages/Rotinas"));
const Calendario = lazy(() => import("@/pages/Calendario"));
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
      </Suspense>
    </BrowserRouter>
  </AppProviders>
);

export default App;
