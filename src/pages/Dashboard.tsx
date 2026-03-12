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
  LayoutDashboard,
  Headset,
  Server,
  DollarSign,
  BrainCircuit,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Lightbulb,
  Clock,
  Ticket,
  Users,
  HardDrive,
  HeartPulse,
  ShieldCheck as ShieldCheckIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { useState } from "react";
import { useData } from "@/components/DataContext";
import { setores, demandasData, incidentesData, agendamentosRotinas, infraestrutura } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const serviceDeskOrigin = [
  { name: "Comercial", chamados: 145 },
  { name: "Financeiro", chamados: 82 },
  { name: "RH", chamados: 54 },
  { name: "Operação", chamados: 120 },
  { name: "Diretoria", chamados: 12 },
];

const slaData = [
  { name: "Dentro do SLA", value: 88, color: "hsl(var(--success))" },
  { name: "Atrasado", value: 12, color: "hsl(var(--destructive))" },
];

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

  const activeIncidents = incidentesData.filter(i => !i.resolucao.includes("Reparo concluído") && !i.resolucao.includes("Rollback")).length; // Simulating active vs resolved based on text for mock
  const activeDemands = demandasData.filter(d => d.status === "DOING" || d.status === "REVIEW").length;
  const pendingRoutines = agendamentosRotinas.filter(r => r.status === "Agendado").length;

  // --- KPIs & ALERTS ---
  const alerts: any[] = [];

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

  alerts.sort((a, b) => (a.type === "critical" ? -1 : 1));
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

  // --- AI INSIGHTS ENGINE ---
  const generateInsights = () => {
    const generated = [];
    
    // Insight 1: Softwares
    const softwareOcioso = softwares.reduce((acc, curr) => acc + (curr.qtd - curr.assigned), 0);
    const taxaUsoSoftware = totalSoftwareAssigned / totalSoftwareQtd;
    if (softwareOcioso > 0) {
      generated.push({
        id: "in-sf-1",
        title: "Otimização de Licenças (FinOps)",
        description: `Identificamos ${softwareOcioso} licenças de software ociosas no inventário. O reaproveitamento (Harvesting) ou cancelamento pode reduzir instantaneamente o OPEX da TI.`,
        type: "positive",
        icon: DollarSign,
        action: () => navigate("/inventario?tab=softwares")
      });
    } else if (taxaUsoSoftware >= 0.95) {
      generated.push({
        id: "in-sf-2",
        title: "Gargalo de Licenciamento",
        description: `O parque de softwares atingiu ${(taxaUsoSoftware * 100).toFixed(1)}% de ocupação. Antecipe a aquisição de novas licenças (CAPEX) para evitar bloqueios em novos onboardings.`,
        type: "warning",
        icon: AppWindow,
        action: () => navigate("/inventario?tab=softwares")
      });
    }

    // Insight 2: Garantias Vencendo
    const expirandoEm90Dias = computers.filter(c => {
      const days = getDaysRemaining(c.garantiaVencimento);
      return days !== null && days >= 0 && days <= 90;
    }).length;
    
    if (expirandoEm90Dias > 0) {
      generated.push({
        id: "in-hw-1",
        title: "Previsibilidade de Renovação",
        description: `${expirandoEm90Dias} computadores perderão a garantia de fábrica no próximo trimestre. Prepare o orçamento para extensão de garantia ou ciclo de renovação (Hardware Refresh).`,
        type: "warning",
        icon: Monitor,
        action: () => navigate("/inventario?tab=computers")
      });
    } else {
      generated.push({
        id: "in-hw-2",
        title: "Saúde de Hardware Alta",
        description: `O parque de máquinas possui excelente cobertura de garantia. Nenhum gargalo financeiro de manutenção não-planejada previsto a curto prazo.`,
        type: "positive",
        icon: ShieldCheck,
        action: null
      });
    }

    // Insight 3: SLAs Service Desk
    generated.push({
      id: "in-sd-1",
      title: "Concentração de Demanda (Comercial)",
      description: `Historicamente, o setor Comercial representa o maior volume absoluto de chamados (36.8%). Adoção de trilhas padrão e auto-serviço (KB) neste setor pode reduzir o MTTR geral estruturalmente em até 15%.`,
      type: "info",
      icon: TrendingUp,
      action: () => navigate("/wiki")
    });

    return generated;
  };

  const aiInsights = generateInsights();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NOC & Business Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Central de Comando e Análise Profunda da Infraestrutura Tecnológica
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-muted p-1 pt-1.5 pb-1.5 w-full justify-start h-auto flex flex-wrap gap-2 rounded-xl border-b border-r shadow-inner overflow-x-auto whitespace-nowrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold gap-2 rounded-lg px-4 py-2 transition-all"><LayoutDashboard className="h-4 w-4" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="servicedesk" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-blue-500/20 data-[state=active]:shadow-lg font-semibold gap-2 rounded-lg px-4 py-2 transition-all"><Headset className="h-4 w-4" /> Service Desk</TabsTrigger>
          <TabsTrigger value="infra" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-indigo-500/20 data-[state=active]:shadow-lg font-semibold gap-2 rounded-lg px-4 py-2 transition-all"><Server className="h-4 w-4" /> Capacidade & Infra</TabsTrigger>
          <TabsTrigger value="finops" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-emerald-500/20 data-[state=active]:shadow-lg font-semibold gap-2 rounded-lg px-4 py-2 transition-all"><DollarSign className="h-4 w-4" /> Otimização FinOps</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-purple-500/20 data-[state=active]:shadow-lg font-bold gap-2 rounded-lg px-4 py-2 transition-all border border-transparent data-[state=active]:border-purple-400/50"><BrainCircuit className="h-5 w-5 animate-pulse" /> Recomendações e IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-300">
          {/* Advanced Alert Banner (Preserved) */}
          {activeAlerts.length > 0 && (
            <Card className={`relative overflow-hidden shadow-xl border-2 animate-in fade-in duration-700 ${criticalCount > 0 ? 'border-destructive/30 bg-destructive/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
              <div className="absolute top-0 left-0 w-2 h-full bg-destructive animate-pulse" />
              <CardContent className="p-4 sm:p-6 ml-2">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ring-4 ${criticalCount > 0 ? 'bg-destructive/10 ring-destructive/5 text-destructive shadow-inner' : 'bg-amber-500/10 ring-amber-500/5 text-amber-600'}`}>
                      <AlertTriangle className={`h-6 w-6 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-black ${criticalCount > 0 ? 'text-destructive' : 'text-amber-700'}`}>
                        Atenção Sistêmica Requerida
                      </h2>
                      <p className="text-sm font-medium text-muted-foreground mt-1 max-w-xl">
                        A plataforma detectou monitorativamente <span className="text-destructive font-bold">{criticalCount} pendências críticas</span> e <span className="text-amber-600 font-bold">{warningCount} alertas paralelos</span> no registro operacional.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex -space-x-2">
                      {["Inventário", "Contratos", "Softwares"].map((mod, i) => {
                        const count = activeAlerts.filter(a => a.module === mod).length;
                        if (count === 0) return null;
                        return (
                          <div key={mod} className="h-9 px-4 flex items-center gap-2 rounded-full bg-background border shadow-md text-xs font-bold" title={`${count} alertas em ${mod}`}>
                            <div className={`h-2 w-2 rounded-full ${activeAlerts.some(a => a.module === mod && a.type === 'critical') ? 'bg-destructive animate-pulse' : 'bg-amber-500'}`} />
                            {mod}
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      className={`h-9 px-6 font-bold shadow-xl ${criticalCount > 0 ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                      onClick={() => setIsResolutionCenterOpen(true)}
                    >
                      Resolver Pendências
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpis.map((kpi) => (
              <Card
                key={kpi.label}
                className="shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300 cursor-pointer group bg-card"
                onClick={() => navigate(kpi.route)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center justify-center relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent mb-4 group-hover:bg-primary/10 transition-colors shadow-inner">
                    <kpi.icon className="h-6 w-6 text-accent-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-3xl font-black tracking-tight slashed-zero">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground font-bold mt-2 uppercase tracking-widest">{kpi.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-3 bg-muted/60 px-3 py-1 rounded-full">{kpi.trend}</p>
                  <ArrowRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground/0 group-hover:text-primary/60 transition-all group-hover:translate-x-1" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Second Row: Activity Feed + Mini Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <Card className="shadow-sm border-t-4 border-t-muted lg:col-span-1">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  Fluxo de Auditoria (Live)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[350px]">
                  <div className="divide-y divide-border/50">
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors group">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase font-black tracking-wider bg-accent px-2 py-0.5 rounded text-accent-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                              {log.module}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">{log.timestamp}</span>
                          </div>
                          <p className="text-sm font-semibold">{log.action}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed opacity-80">{log.details}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-muted-foreground">
                        <History className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Nenhuma trilha hoje.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Quick Insights Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Equipe & Tarefas */}
               <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full bg-gradient-to-br from-blue-500/5 to-transparent">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                           <Activity className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs font-bold text-blue-600 bg-blue-500/5 border-blue-500/20">{activeDemands} em Andamento</Badge>
                     </div>
                     <h3 className="text-lg font-black tracking-tight mb-1">Demandas da TI</h3>
                     <p className="text-sm text-muted-foreground flex-1">Projetos estruturais e solicitações ativas no Kanban.</p>
                     <Button variant="ghost" size="sm" className="w-full mt-4 justify-between bg-background border shadow-sm group hover:border-blue-500/30" onClick={() => navigate('/demandas')}>
                        Gerenciar Projetos <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </CardContent>
               </Card>

               {/* Status dos Serviços */}
               <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full bg-gradient-to-br from-indigo-500/5 to-transparent">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-600">
                           <Globe className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs font-bold text-indigo-600 bg-indigo-500/5 border-indigo-500/20">{incidentesData.length} Registros Mês</Badge>
                     </div>
                     <h3 className="text-lg font-black tracking-tight mb-1">Status (Uptime)</h3>
                     <p className="text-sm text-muted-foreground flex-1">Monitoramento de links de internet, telefonia e ERP.</p>
                     <Button variant="ghost" size="sm" className="w-full mt-4 justify-between bg-background border shadow-sm group hover:border-indigo-500/30" onClick={() => navigate('/status')}>
                        Ver Histórico (Status Page) <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </Button>
                  </CardContent>
               </Card>

               {/* Rotinas */}
               <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow sm:col-span-2">
                  <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-center bg-gradient-to-tr from-muted/30 to-background border-l-4 border-l-primary">
                     <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                        <CheckCircle2 className="h-6 w-6" />
                     </div>
                     <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-black tracking-tight">Suporte Zero-Trust & Manutenções</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Existem <strong className="text-foreground">{pendingRoutines} rotinas programadas</strong> (auditorias, backups, preventivas) aguardando execução da equipe técnica.</p>
                     </div>
                     <Button variant="default" size="sm" className="shrink-0 shadow-md w-full sm:w-auto" onClick={() => navigate('/rotinas')}>
                        Acessar Rotinas Diárias
                     </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Service Desk */}
        <TabsContent value="servicedesk" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Service Desk Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-t-4 border-t-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl ring-4 ring-blue-500/5">
                  <Ticket className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Abertos Hoje</p>
                  <p className="text-3xl font-black text-foreground">14<span className="text-sm font-medium text-muted-foreground ml-2">tickets</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-indigo-500 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl ring-4 ring-indigo-500/5">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">MTTR Geral (Mês)</p>
                  <p className="text-3xl font-black text-foreground">1.8<span className="text-sm font-medium text-muted-foreground ml-2">horas med.</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-emerald-500 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl ring-4 ring-emerald-500/5">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Satisfação (CSAT)</p>
                  <p className="text-3xl font-black text-foreground">96.5<span className="text-sm font-medium text-muted-foreground ml-2">% aprovação</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md border-t-4 border-t-blue-500">
                <CardHeader className="bg-blue-500/5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <BarChartIcon className="w-5 h-5" /> Origem de Chamados (Por Setor)
                    </CardTitle>
                    <CardDescription>Distribuição volumétrica absoluta para detecção de anomalias setoriais.</CardDescription>
                </CardHeader>
                <CardContent className="h-[380px] pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={serviceDeskOrigin} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.15)" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                cursor={{ fill: 'hsl(var(--muted-foreground)/0.1)' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', background: 'hsl(var(--background))' }}
                            />
                            <Bar dataKey="chamados" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="shadow-md border-t-4 border-t-emerald-500">
                <CardHeader className="bg-emerald-500/5">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                        <PieChartIcon className="w-5 h-5" /> Acordo de Nível de Serviço (SLA)
                    </CardTitle>
                    <CardDescription>Eficiência temporal da esteira de resolução de chamados operacionais.</CardDescription>
                </CardHeader>
                <CardContent className="h-[380px] flex items-center justify-center relative pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                            <Pie
                                data={slaData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={140}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {slaData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number) => [`${value}% da base operada`, 'Cobertura']}
                                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', background: 'hsl(var(--background))', fontWeight: 'bold' }}
                            />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                        <span className="text-5xl font-black text-success tracking-tighter drop-shadow-sm">{slaData[0].value}%</span>
                        <span className="text-sm text-muted-foreground uppercase font-black tracking-widest mt-2">Score SLA</span>
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Infra & Capacidade */}
        <TabsContent value="infra" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Infra Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-t-4 border-t-purple-500 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl ring-4 ring-purple-500/5">
                  <HardDrive className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Datacenter & Borda</p>
                  <p className="text-3xl font-black text-foreground">{infraestrutura.filter(i => i.status === "Ativo").length}<span className="text-sm font-medium text-muted-foreground ml-2">ativos core</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-teal-500 bg-gradient-to-br from-teal-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-teal-500/10 text-teal-600 rounded-2xl ring-4 ring-teal-500/5">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Saúde do Parque</p>
                  <p className="text-3xl font-black text-foreground">{Math.round((activeComps / (activeComps + maintComps)) * 100)}<span className="text-sm font-medium text-muted-foreground ml-2">% operantes</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-t-4 border-t-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl ring-4 ring-amber-500/5">
                  <ShieldCheckIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Garantia Ativa (SLA)</p>
                  {/* Calcs dynamically based on mockData dates being mostly in the future for "Ativos" */}
                  <p className="text-3xl font-black text-foreground">{Math.round((computers.filter(c => getDaysRemaining(c.garantiaVencimento) !== null && (getDaysRemaining(c.garantiaVencimento) ?? -1) > 0).length / computers.length) * 100)}<span className="text-sm font-medium text-muted-foreground ml-2">% cobertos</span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="shadow-md rounded-xl overflow-hidden border">
                <BarChart title="Mapemento Físico (Desktops/Notebooks por Setor)" data={computersBySector} />
            </div>
            <div className="shadow-md rounded-xl overflow-hidden border">
                <PieChart title="Estado de Disponibilidade de Ativos" data={assetsByStatus} />
            </div>
          </div>
        </TabsContent>

        {/* Tab: FinOps */}
        <TabsContent value="finops" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col items-center justify-center p-12 text-center bg-emerald-500/5 border-2 border-emerald-500/20 border-dashed rounded-2xl h-[450px]">
             <div className="bg-emerald-500/10 p-6 rounded-3xl mb-6 ring-8 ring-emerald-500/5">
                <DollarSign className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
             </div>
             <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-400 bg-clip-text text-transparent italic tracking-tight">Otimização Financeira Avançada (FinOps)</h3>
             <p className="text-muted-foreground font-medium mt-4 max-w-xl mx-auto leading-relaxed">
               Este módulo demanda acompanhamento granular de OPEX (Licenças e Cloud) vs CAPEX (Equipamentos Permanentes), além de rateios nativos por centro de custos.
             </p>
             <Button className="mt-8 h-12 px-8 text-base font-bold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/finops")}>
                Acessar Portal Avançado de FinOps <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
           </div>
        </TabsContent>

        {/* Tab: AI INSIGHTS ENGINE - ABA EXPLOSIVA DE VALOR */}
        <TabsContent value="insights" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid gap-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-br from-purple-600/10 via-purple-600/5 to-transparent border border-purple-500/30 rounded-2xl shadow-inner">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-purple-500/10 rounded-2xl ring-4 ring-purple-500/10">
                            <BrainCircuit className="h-8 w-8 text-purple-600 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-purple-700 dark:text-purple-400 tracking-tight flex items-center gap-2">
                                Motor de Insights Preditivos & Resoluções Autônomas
                            </h2>
                            <p className="text-sm font-medium text-muted-foreground mt-2 max-w-3xl leading-relaxed">
                                A heurística analisa continuamente as entidades lógicas em cache (Contratos, Ativos, Incidentes e Licenças) identificando ociosidade, anomalias e provendo chamadas e rotas diretas para ação curativa ou preventiva.
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-600 uppercase font-black tracking-widest bg-purple-500/10 p-2 px-4 shadow-sm text-sm">
                        {aiInsights.length} Insight{aiInsights.length !== 1 ? 's' : ''} Gerado{aiInsights.length !== 1 ? 's' : ''}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {aiInsights.map(insight => (
                        <Card key={insight.id} className={`shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${insight.type === 'positive' ? 'border-success/50 bg-success/5' : insight.type === 'warning' ? 'border-warning/50 bg-warning/5' : 'border-blue-500/50 bg-blue-500/5'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-5">
                                    <div className={`p-4 rounded-xl shadow-sm ${insight.type === 'positive' ? 'bg-success text-success-foreground' : insight.type === 'warning' ? 'bg-warning text-warning-foreground' : 'bg-blue-500 text-white'}`}>
                                        <insight.icon className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-3 flex-1">
                                        <h3 className="font-black text-xl tracking-tight text-foreground">{insight.title}</h3>
                                        <p className="text-sm text-muted-foreground/90 font-semibold leading-relaxed">
                                            {insight.description}
                                        </p>
                                        
                                        {insight.action && (
                                            <Button variant="default" className={`mt-4 gap-2 font-bold shadow-md w-full sm:w-auto ${insight.type === 'positive' ? 'bg-success hover:bg-success/90' : insight.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={insight.action}>
                                                <Lightbulb className="h-4 w-4" /> Realizar Ação Recomendada
                                            </Button>
                                        )}
                                        {!insight.action && (
                                            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                                                <CheckCircle2 className="h-3 w-3" /> Nenhuma ação sistêmica requerida no momento
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </TabsContent>
      </Tabs>

      {/* Central de Resolução - Modal */}
      <Dialog open={isResolutionCenterOpen} onOpenChange={setIsResolutionCenterOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-2xl">
          <DialogHeader className="p-8 pb-5 bg-gradient-to-r from-destructive/10 via-background to-background border-b shadow-sm relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-destructive/10 rounded-2xl ring-8 ring-destructive/5 text-destructive">
                <Shield className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black tracking-tighter italic uppercase text-foreground">
                  Central de Resolução
                </DialogTitle>
                <DialogDescription className="text-sm font-bold text-muted-foreground/80 tracking-wide">
                  Gestão estratégica de conformidade e mitigação de gargalos.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-8 pb-8 mt-4 min-h-[400px]">
            <ScrollArea className="h-[500px] pr-6">
              <div className="space-y-5 pb-8">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex gap-5 p-6 rounded-2xl border transition-all duration-300 group hover:scale-[1.01] hover:shadow-xl ${alert.type === 'critical' ? 'border-destructive/40 bg-destructive/5 shadow-destructive/10' : 'border-amber-500/40 bg-amber-500/5 shadow-amber-500/10'}`}
                  >
                    <div className={`mt-1.5 h-5 w-5 rounded-full shrink-0 border-4 border-background shadow-md ${alert.type === 'critical' ? 'bg-destructive animate-pulse' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-lg font-black leading-tight group-hover:text-primary transition-colors slashed-zero">
                          {alert.message}
                        </p>
                        <Badge variant="outline" className={`text-[10px] shrink-0 uppercase tracking-widest font-black px-3 py-1 shadow-sm ${alert.type === 'critical' ? 'text-destructive border-destructive/50 bg-destructive/10' : 'border-amber-500/50 text-amber-700 bg-amber-500/10'}`}>
                          {alert.module}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/70 mt-3 font-semibold leading-relaxed">
                        {alert.type === 'critical' ? 'CRÍTICO: Impacto imediato na continuidade do negócio ou risco financeiro (compliance). Requer intervenção urgente do Head de operações.' : 'AVISO: Recomendamos análise de integridade preventiva para garantir estabilidade continuada da rede ou ativo.'}
                      </p>

                      <div className="flex items-center gap-4 mt-6 pt-5 border-t border-muted/50">
                        <Button
                          size="sm"
                          variant={alert.type === 'critical' ? 'destructive' : 'default'}
                          className={`h-10 px-6 text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform ${alert.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
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
                          {alert.id.startsWith('sw-') ? 'Renovar Licença (Fornecedor)' : alert.id.startsWith('emp-') ? 'Ver Empréstimo em Inventário' : 'Visualizar Detalhes do Log'}
                          <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 px-4 text-[11px] font-bold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          onClick={() => {
                            setSnoozedAlerts(prev => [...prev, alert.id]);
                            toast({ title: "Revisão Postergada", description: "O log crítico foi mascarado temporariamente da sua visão principal. Ele persistirá nos relatórios diários." });
                          }}
                        >
                          Lembrar amanhã
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <div className="py-16 text-center space-y-5 animate-in fade-in zoom-in duration-500">
                    <div className="bg-success/10 text-success inline-flex p-5 rounded-full ring-8 ring-success/5 mb-3 shadow-inner">
                      <ShieldCheck className="h-14 w-14" />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-success">Conformidade e Higiene Total</h3>
                    <p className="text-muted-foreground font-medium text-sm px-16 max-w-lg mx-auto leading-relaxed">Nenhuma pendência crítica, gargalo financeiro ou quebra de SLA operante detectada na sub-rotina atual do parser.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
