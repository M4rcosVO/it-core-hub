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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { computers, mobiles, softwares, emprestimos, contratosData, acessosData, ipList } from "@/data/mockData";

export default function Dashboard() {
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
    { label: "Computadores", value: activeComps, icon: Monitor, trend: `${activeComps} Ativos, ${maintComps} Manutenção` },
    { label: "Disp. Móveis", value: activeMobiles, icon: Smartphone, trend: `${inactiveMobiles} Desativado(s)` },
    { label: "Softwares (Licenças)", value: totalSoftwareQtd, icon: AppWindow, trend: `${totalSoftwareAssigned} em uso` },
    { label: "Contratos Ativos", value: activeContracts, icon: FileSignature, trend: `${criticalContracts} Crítico(s)` },
    { label: "Itens Cofre/Rede", value: totalAcessos, icon: Key, trend: `${vpnAcessos} VPN(s) config.` },
    { label: "IPs em Uso", value: totalIps, icon: Globe, trend: "Monitorados no IPAM" },
  ];

  // --- DYNAMIC STATUS CHECKS ---
  // Mocking status logic based on Contracts and Network
  const primaryLink = contratosData.find(c => c.fornecedor.includes("Vivo"));
  const backupLink = contratosData.find(c => c.fornecedor.includes("Claro"));
  const erpServer = computers.find(c => c.hostname.includes("ERP"));

  const statusChecks = [
    { name: "Link Internet Primário", status: primaryLink?.status === "Crítico" ? "offline" : "online", provider: primaryLink?.fornecedor || "N/A" },
    { name: "Link Backup", status: "online", provider: backupLink?.fornecedor || "N/A" },
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do ambiente de TI
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex flex-col items-center text-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent mb-3">
                <kpi.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-[10px] text-muted-foreground mt-2 bg-muted/50 px-2 py-0.5 rounded-full">{kpi.trend}</p>
            </CardContent>
          </Card>
        ))}
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

        {/* Recent Alerts */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Alertas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />}
                {alert.type === "success" && <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />}
                {alert.type === "info" && <FileWarning className="h-4 w-4 text-info mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Nenhum alerta crítico no momento.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
