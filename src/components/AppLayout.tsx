import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import { Bell, AlertTriangle, CheckCircle2, FileWarning, Search, Eye, EyeOff } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import real data for global notifications
import { softwares, emprestimos, contratosData } from "@/data/mockData";
import { GlobalSearch } from "@/components/GlobalSearch";
import { usePrivacy } from "@/components/PrivacyContext";

export function AppLayout() {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  // --- DYNAMIC ALERTS LOGIC (Same as Dashboard) ---
  const alerts = [];

  contratosData.forEach(c => {
    if (c.status === "Crítico" || c.status === "Atenção") {
      alerts.push({ id: `crt-${c.id}`, message: `Contrato ${c.fornecedor} vence em ${c.vencimento}`, type: c.status === "Crítico" ? "warning" : "info", date: "Contratos" });
    }
  });

  softwares.forEach(s => {
    const uso = s.assigned / s.qtd;
    if (uso >= 0.9) {
      alerts.push({ id: `sw-${s.id}`, message: `Uso da licença ${s.nome} atingiu ${Math.round(uso * 100)}%`, type: uso >= 1 ? "warning" : "info", date: "Softwares" });
    }
  });

  emprestimos.forEach(e => {
    if (e.status === "Atrasado") {
      alerts.push({ id: `emp-${e.id}`, message: `Empréstimo de ${e.equipamento} p/ ${e.solicitante} está Atrasado!`, type: "warning", date: "Inventário" });
    }
  });

  alerts.sort((a, b) => (a.type === "warning" ? -1 : 1));
  const unreadCount = alerts.length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b px-4 bg-card shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />

              {/* Fake Search Input Trigger */}
              <div
                className="hidden md:flex items-center gap-2 bg-muted/50 hover:bg-muted/80 transition-colors px-3 py-1.5 rounded-md border text-sm text-muted-foreground w-64 cursor-text"
                onClick={() => {
                  // Fire both ctrlKey (Windows/Linux) and metaKey (Mac) so GlobalSearch catches it
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
                }}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-left">Buscar ou pular para...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 shadow-sm">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            {/* Global Actions (Right side) */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={togglePrivacyMode}>
                      {isPrivacyMode ? (
                        <EyeOff className="h-5 w-5 text-primary" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPrivacyMode ? "Desativar Modo Privacidade" : "Ativar Modo Privacidade (Ofuscar Dados)"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                        {/* Dot indicator */}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notificações</h4>
                    <Badge variant="secondary" className="px-1.5 py-0">
                      {unreadCount} novas
                    </Badge>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {alerts.length > 0 ? (
                      <div className="flex flex-col">
                        {alerts.map((alert, i) => (
                          <div
                            key={`${alert.id}-${i}`}
                            className="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />}
                            {alert.type === "success" && <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />}
                            {alert.type === "info" && <FileWarning className="h-4 w-4 text-info mt-0.5 shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-snug">{alert.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        Nenhuma notificação no momento.
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                      Marcar todas como lidas
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <GlobalSearch />
    </SidebarProvider>
  );
}
