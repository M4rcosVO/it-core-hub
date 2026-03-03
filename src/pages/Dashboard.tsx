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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const kpis = [
  { label: "Computadores", value: 142, icon: Monitor, trend: "+3 este mês" },
  { label: "Dispositivos Móveis", value: 67, icon: Smartphone, trend: "+1 este mês" },
  { label: "VPNs Ativas", value: 34, icon: Shield, trend: "2 pendentes" },
  { label: "IPs em Uso", value: 89, icon: Globe, trend: "de 254 disponíveis" },
];

const statusChecks = [
  { name: "Link Internet Primário", status: "online" as const, provider: "Vivo Fibra" },
  { name: "Link Backup", status: "online" as const, provider: "Claro Dedicado" },
  { name: "Servidor de Dados (ERP)", status: "offline" as const, provider: "SRV-ERP-01" },
];

const alerts = [
  { id: 1, message: "Termo de Responsabilidade pendente — Notebook Dell #045", type: "warning" as const, date: "Hoje" },
  { id: 2, message: "Certificado SSL expira em 15 dias — portal.gellak.com.br", type: "warning" as const, date: "Hoje" },
  { id: 3, message: "Backup noturno concluído com sucesso", type: "success" as const, date: "Ontem" },
  { id: 4, message: "Novo dispositivo registrado — iPhone 15 Pro (Maria S.)", type: "info" as const, date: "Ontem" },
  { id: 5, message: "Senha de VPN expirada — João Almeida", type: "warning" as const, date: "2 dias atrás" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do ambiente de TI
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-1 tracking-tight">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <kpi.icon className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
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
                {alert.type === "warning" && <FileWarning className="h-4 w-4 text-warning mt-0.5 shrink-0" />}
                {alert.type === "success" && <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />}
                {alert.type === "info" && <Monitor className="h-4 w-4 text-info mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
