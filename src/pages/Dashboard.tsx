import {
  Monitor,
  Smartphone,
  Shield,
  Globe,
  Wifi,
  WifiOff,
  Server,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  AppWindow,
  FileSignature,
  Key,
  ArrowRight,
  Activity,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAudit } from "@/components/AuditContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart, PieChart } from "@/components/InventoryCharts";

import { computers, mobiles, softwares, emprestimos, contratosData, acessosData, ipList, setores } from "@/data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logs } = useAudit();
  // --- DYNAMIC KPIs CALCULATION ---
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
    { label: "Computadores", value: activeComps, icon: Monitor, trend: `${activeComps} Ativos, ${maintComps} Manutenção`, route: "/inventario" },
    { label: "Disp. Móveis", value: activeMobiles, icon: Smartphone, trend: `${inactiveMobiles} Desativado(s)`, route: "/inventario" },
    { label: "Softwares (Licenças)", value: totalSoftwareQtd, icon: AppWindow, trend: `${totalSoftwareAssigned} em uso`, route: "/inventario" },
    { label: "Contratos Ativos", value: activeContracts, icon: FileSignature, trend: `${criticalContracts} Crítico(s)`, route: "/contratos" },
    { label: "Itens Cofre/Rede", value: totalAcessos, icon: Key, trend: `${vpnAcessos} VPN(s) config.`, route: "/acessos" },
    { label: "IPs em Uso", value: totalIps, icon: Globe, trend: "Monitorados no IPAM", route: "/rede" },
  ];

  // --- DYNAMIC STATUS CHECKS ---
  // Mocking status logic based on Contracts and Network
  const primaryLink = contratosData.find(c => c.fornecedor.includes("Vivo"));
  const backupLink = contratosData.find(c => c.fornecedor.includes("Claro"));
  const erpServer = computers.find(c => c.hostname === "SRV-ERP-01");

  const statusChecks = [
    { name: "Link Internet Primário", status: primaryLink?.status === "Crítico" ? "offline" : "online", provider: primaryLink?.fornecedor || "N/A" },
    { name: "Link Backup (Failover)", status: backupLink?.status === "Atenção" ? "degraded" : "online", provider: backupLink?.fornecedor || "N/A" },
    { name: "Servidor de Dados (ERP)", status: erpServer?.status === "Em Manutenção" ? "offline" : "online", provider: erpServer?.hostname || "N/A" },
  ];

  // --- DYNAMIC ALERTS ---
  const alerts = [];

  // Contracts Alerts
  contratosData.forEach(c => {
    if (c.status === "Crítico" || c.status === "Atenção") {
      alerts.push({ id: `crt-${c.id}`, message: `Contrato ${c.fornecedor} vence em ${c.vencimento}`, type: c.status === "Crítico" ? "warning" : "info", date: "Contratos" });
    }
  });

  // Software Limits
  softwares.forEach(s => {
    const uso = s.assigned / s.qtd;
    if (uso >= 0.9) {
      alerts.push({ id: `sw-${s.id}`, message: `Uso da licença ${s.nome} atingiu ${Math.round(uso * 100)}%`, type: uso >= 1 ? "warning" : "info", date: "Softwares" });
    }
  });

  // Loans Late
  emprestimos.forEach(e => {
    if (e.status === "Atrasado") {
      alerts.push({ id: `emp-${e.id}`, message: `Empréstimo de ${e.equipamento} para ${e.solicitante} está Atrasado!`, type: "warning", date: "Inventário" });
    }
  });

  // Network Offline (Mocked)
  if (primaryLink?.status === "Crítico") {
    alerts.push({ id: "link-down", message: `Queda no link principal detectada (${primaryLink.fornecedor})`, type: "warning", date: "Rede" });
  }

  // Se houver poucos alertas, garante que os mais importantes (Warnings) fiquem em cima
  alerts.sort((a, b) => (a.type === "warning" ? -1 : 1));

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

      {/* Central de Alertas - Proactive notifications */}
      {alerts.filter(a => a.type === 'warning').length > 0 && (
        <Card className="bg-destructive/5 border-destructive/20 shadow-sm animate-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="flex h-1 bg-destructive/20 w-full overflow-hidden">
            <div className="h-full bg-destructive animate-pulse w-1/3" />
          </div>
          <CardContent className="p-4 flex items-start gap-4">
            <div className="p-2 bg-destructive/10 rounded-full ring-4 ring-destructive/5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-destructive flex items-center gap-2">
                Atenção: {alerts.filter(a => a.type === 'warning').length} itens críticos detectados
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Existem contratos vencendo e ativos em manutenção que requerem sua atenção imediata na gestão do parque.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => navigate('/inventario')}>
              Gerenciar Tudo
            </Button>
          </CardContent>
        </Card>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BI Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <BarChart title="Computadores por Setor" data={computersBySector} />
          <PieChart title="Disponibilidade Global" data={assetsByStatus} />
        </div>

        {/* Alerts & Critical Items */}
        <Card className="shadow-sm border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Ações Necessárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-4">
                {alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <div key={alert.id} className="flex gap-4 p-3 rounded-lg bg-accent/20 border border-accent/30 group hover:border-primary/30 transition-all">
                      <div className={`mt-1 h-2 w-2 rounded-full ${alert.type === 'warning' ? 'bg-destructive animate-pulse' : 'bg-primary'}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">{alert.date}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="link" className="p-0 h-auto text-xs text-primary font-bold group-hover:underline" onClick={() => navigate(alert.date === 'Contratos' ? '/contratos' : '/inventario')}>
                            Resolver Agora
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-40">
                    <CheckCircle2 className="h-10 w-10 mb-2" />
                    <p className="text-sm">Parabéns! Nenhuma pendência crítica.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Check */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              Status dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {check.status === "online" ? (
                    <Wifi className="h-4 w-4 text-success" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{check.name}</p>
                    <p className="text-xs text-muted-foreground">{check.provider}</p>
                  </div>
                </div>
                <Badge
                  variant={check.status === "online" ? "default" : "destructive"}
                  className={check.status === "online" ? "bg-success hover:bg-success/90" : ""}
                >
                  {check.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

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
    </div>
  );
}
