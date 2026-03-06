import {
  Monitor,
  Smartphone,
  Globe,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  AppWindow,
  FileSignature,
  Key,
  ArrowRight,
  Activity,
  History,
  ShieldCheck,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAudit } from "@/components/AuditContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { BarChart, PieChart } from "@/components/InventoryCharts";
import { format, parse, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

import { useData } from "@/components/DataContext";
import { setores } from "@/data/mockData";

const getDaysRemaining = (dateStr: string) => {
  if (!dateStr || dateStr === "—" || dateStr.includes("Automática") || dateStr === "Pagamento Anual") return null;
  try {
    const d = parse(dateStr, "dd/MM/yyyy", new Date());
    return differenceInDays(d, new Date());
  } catch (e) {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { logs } = useAudit();
  const { toast } = useToast();
  const [isResolutionCenterOpen, setIsResolutionCenterOpen] = useState(false);
  const [snoozedAlerts, setSnoozedAlerts] = useState<string[]>([]);
  const { contratos: contratosData, acessos: acessosData, ipList, computers, mobiles, softwares, emprestimos } = useData();
  const activeComps = computers.filter(c => c.status === "Ativo").length;
  const maintComps = computers.filter(c => c.status === "Em Manutenção").length;

  const activeMobiles = mobiles.filter(m => m.status === "Ativo").length;
  const inactiveMobiles = mobiles.filter(m => m.status === "Desativado").length;

  const totalSoftwareQtd = softwares.reduce((acc, curr) => acc + curr.qtd, 0);
  const totalSoftwareAssigned = softwares.reduce((acc, curr) => acc + curr.assigned, 0);

  const activeContracts = contratosData.filter(c => c.status === "Ativo").length;
  const criticalContracts = contratosData.filter(c => c.status === "Crítico").length;

  const totalAcessos = acessosData.length;
  const vpnAcessos = acessosData.filter(a => a.categoria === "VPN").length;

  const totalIps = ipList.length;

  const kpis = [
    { label: "Computadores", value: activeComps, icon: Monitor, trend: `${activeComps} Ativos, ${maintComps} Manutenção`, route: "/inventario?tab=computers" },
    { label: "Disp. Móveis", value: activeMobiles, icon: Smartphone, trend: `${inactiveMobiles} Desativado(s)`, route: "/inventario?tab=mobiles" },
    { label: "Softwares (Licenças)", value: totalSoftwareQtd, icon: AppWindow, trend: `${totalSoftwareAssigned} em uso`, route: "/inventario?tab=softwares" },
    { label: "Contratos Ativos", value: activeContracts, icon: FileSignature, trend: `${criticalContracts} Crítico(s)`, route: "/contratos" },
    { label: "Itens Cofre/Rede", value: totalAcessos, icon: Key, trend: `${vpnAcessos} VPN(s) config.`, route: "/acessos" },
    { label: "IPs em Uso", value: totalIps, icon: Globe, trend: "Monitorados no IPAM", route: "/rede?tab=ipam" },
  ];

  // --- KPIs & ALERTS ---

  const alerts = [];

  // 1. Contracts Alerts (Precise)
  contratosData.forEach(c => {
    const days = getDaysRemaining(c.vencimento);
    if (days !== null) {
      if (days < 0 || c.status === "Crítico") {
        alerts.push({ id: `crt-${c.id}`, message: `Contrato ${c.fornecedor} EXPIRADO ou CRÍTICO`, type: "critical", module: "Contratos" });
      } else if (days <= 30 || c.status === "Atenção") {
        alerts.push({ id: `crt-${c.id}`, message: `Contrato ${c.fornecedor} vence em ${days} dias`, type: "warning", module: "Contratos" });
      }
    }
  });

  // 2. Warranty Alerts (Inventory)
  [...computers, ...mobiles].forEach((a: any) => {
    if (a.garantiaVencimento) {
      const days = getDaysRemaining(a.garantiaVencimento);
      if (days !== null) {
        if (days < 0) {
          alerts.push({ id: `gar-${a.id}`, message: `Garantia do ativo ${a.hostname || a.modelo} EXPIRADA!`, type: "critical", module: "Inventário" });
        } else if (days <= 45) {
          alerts.push({ id: `gar-${a.id}`, message: `Garantia de ${a.hostname || a.modelo} expira em ${days} dias`, type: "warning", module: "Inventário" });
        }
      }
    }
  });

  // 3. Software Limits
  softwares.forEach(s => {
    const uso = s.assigned / s.qtd;
    if (uso >= 1) {
      alerts.push({ id: `sw-${s.id}`, message: `Licença ${s.nome} ESGOTADA (100% uso)`, type: "critical", module: "Softwares" });
    } else if (uso >= 0.9) {
      alerts.push({ id: `sw-${s.id}`, message: `Uso de ${s.nome} em nível crítico (${Math.round(uso * 100)}%)`, type: "warning", module: "Softwares" });
    }
  });

  // 4. Loans Late
  emprestimos.forEach(e => {
    if (e.status === "Atrasado") {
      alerts.push({ id: `emp-${e.id}`, message: `Empréstimo de ${e.equipamento} para ${e.solicitante} ATRASADO`, type: "critical", module: "Inventário" });
    }
  });

  // Sort: Critical first
  alerts.sort((a, b) => (a.type === "critical" ? -1 : 1));

  // Filter out snoozed alerts
  const activeAlerts = alerts.filter(a => !snoozedAlerts.includes(a.id));

  const criticalCount = activeAlerts.filter(a => a.type === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.type === 'warning').length;

  // --- BI CHART DATA ---
  const computersBySector = setores.filter(s => s !== "Todos").map(s => ({
    label: s,
    value: computers.filter(c => c.setor === s).length,
    color: s === "TI" ? "#3b82f6" : s === "Financeiro" ? "#10b981" : s === "Administrativo" ? "#f59e0b" : "#6366f1"
  }));

  const assetsByStatus = [
    { label: "Ativo", value: [...computers, ...mobiles].filter(a => a.status === "Ativo").length, color: "#10b981" },
    { label: "Manutenção", value: [...computers, ...mobiles].filter(a => a.status === "Em Manutenção").length, color: "#f59e0b" },
    { label: "Estoque", value: [...computers, ...mobiles].filter(a => a.status === "Estoque").length, color: "#3b82f6" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do ambiente de TI
        </p>
      </div>

      {/* Advanced Alert Banner */}
      {activeAlerts.length > 0 && (
        <Card className={`relative overflow-hidden shadow-lg border-2 animate-in slide-in-from-top-4 duration-700 ${criticalCount > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-destructive animate-pulse" />
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ring-4 ${criticalCount > 0 ? 'bg-destructive/10 ring-destructive/5 text-destructive' : 'bg-amber-500/10 ring-amber-500/5 text-amber-600'}`}>
                  <AlertTriangle className={`h-6 w-6 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${criticalCount > 0 ? 'text-destructive' : 'text-amber-700'}`}>
                    Atenção Operacional
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1 max-w-lg">
                    Detectamos <span className="text-destructive font-bold">{criticalCount} itens críticos</span> e <span className="text-amber-600 font-bold">{warningCount} avisos</span> que requerem análise na gestão do parque tecnológico.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Summary Badges */}
                <div className="flex -space-x-2">
                  {["Inventário", "Contratos", "Softwares"].map((mod, i) => {
                    const count = activeAlerts.filter(a => a.module === mod).length;
                    if (count === 0) return null;
                    return (
                      <div key={mod} className="h-8 px-3 flex items-center gap-2 rounded-full bg-background border shadow-sm text-xs font-bold" title={`${count} alertas em ${mod}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${activeAlerts.some(a => a.module === mod && a.type === 'critical') ? 'bg-destructive animate-pulse' : 'bg-amber-500'}`} />
                        {mod}
                      </div>
                    );
                  })}
                </div>
                <Button
                  className={`${criticalCount > 0 ? 'bg-destructive hover:bg-destructive/90' : 'bg-amber-600 hover:bg-amber-700'} text-white shadow-md`}
                  onClick={() => setIsResolutionCenterOpen(true)}
                >
                  Ver Detalhes e Resolver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Central de Resolução - Modal */}
      <Dialog open={isResolutionCenterOpen} onOpenChange={setIsResolutionCenterOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-r from-primary/10 via-background to-background">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-2xl ring-8 ring-primary/5">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black tracking-tight italic uppercase">
                  Central de Resolução
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-muted-foreground/80">
                  Gestão estratégica de alertas e conformidade do parque tecnológico.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-8 pb-8 mt-2 min-h-[400px]">
            <ScrollArea className="h-[500px] pr-6">
              <div className="space-y-5 py-4">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex gap-5 p-5 rounded-2xl border-2 transition-all group hover:scale-[1.01] hover:shadow-xl ${alert.type === 'critical' ? 'border-destructive/20 bg-destructive/5 shadow-destructive/5' : 'border-amber-500/20 bg-amber-500/5 shadow-amber-500/5'}`}
                  >
                    <div className={`mt-1.5 h-4 w-4 rounded-full shrink-0 border-4 border-background shadow-sm ${alert.type === 'critical' ? 'bg-destructive animate-pulse' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-base font-bold leading-tight group-hover:text-primary transition-colors slashed-zero">
                          {alert.message}
                        </p>
                        <Badge variant="outline" className={`text-[10px] shrink-0 uppercase tracking-widest font-black px-2 py-1 ${alert.type === 'critical' ? 'text-destructive border-destructive/30 bg-destructive/10' : 'border-amber-500/30 text-amber-700 bg-amber-500/10'}`}>
                          {alert.module}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 font-semibold leading-relaxed opacity-70">
                        {alert.type === 'critical' ? 'CRÍTICO: Impacto imediato na conformidade. Requer intervenção urgente.' : 'AVISO: Recomendamos análise preventiva para garantir a continuidade.'}
                      </p>

                      <div className="flex items-center gap-4 mt-6 pt-5 border-t border-muted/30">
                        <Button
                          size="sm"
                          variant={alert.type === 'critical' ? 'destructive' : 'default'}
                          className="h-10 px-6 text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                          onClick={() => {
                            setIsResolutionCenterOpen(false);
                            if (alert.module === 'Contratos') {
                              navigate('/contratos');
                            } else if (alert.id.startsWith('sw-')) {
                              navigate('/inventario?tab=softwares');
                            } else if (alert.id.startsWith('emp-')) {
                              navigate('/inventario?tab=emprestimos');
                            } else {
                              navigate('/inventario');
                            }
                          }}
                        >
                          {alert.id.startsWith('sw-') ? 'Renovar Licença' : alert.id.startsWith('emp-') ? 'Ver Empréstimo' : 'Ver Detalhes'}
                          <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 px-4 text-[11px] font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          onClick={() => {
                            setSnoozedAlerts(prev => [...prev, alert.id]);
                            toast({ title: "Lembrete adiado", description: "O alerta foi removido temporariamente da sua visão principal." });
                          }}
                        >
                          Lembrar depois
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="py-12 text-center space-y-4">
                    <div className="bg-success/10 text-success inline-flex p-4 rounded-full ring-8 ring-success/5 mb-2">
                      <ShieldCheck className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-bold italic uppercase tracking-tighter">Conformidade Total</h3>
                    <p className="text-muted-foreground text-sm px-12">Nenhuma pendência crítica detectada no momento. Bom trabalho!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* KPI Cards - clickable, route to module */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => navigate(kpi.route)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center justify-center relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent mb-3 group-hover:bg-primary/10 transition-colors">
                <kpi.icon className="h-5 w-5 text-accent-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-[10px] text-muted-foreground mt-2 bg-muted/50 px-2 py-0.5 rounded-full">{kpi.trend}</p>
              <ArrowRight className="absolute top-3 right-3 h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* BI Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart title="Computadores por Setor" data={computersBySector} />
        <PieChart title="Disponibilidade Global" data={assetsByStatus} />
      </div>



      {/* Activity Feed (Audit Log) */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Log de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px]">
            <div className="divide-y">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold bg-accent px-2 py-0.5 rounded text-accent-foreground">
                        {log.module}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <History className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma atividade registrada hoje.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
