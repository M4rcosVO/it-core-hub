import { useState } from "react";
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Search,
    Plus,
    Clock,
    Server,
    Globe,
    FileText,
    Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { incidentesData, Incidente } from "@/data/mockData";
import { useAudit } from "@/components/AuditContext";

const CORE_SERVICES = [
    { id: "erp", name: "Sistema ERP", icon: Database, status: "online", uptime: "99.8%" },
    { id: "internet_matriz", name: "Internet Matriz (Vivo)", icon: Globe, status: "online", uptime: "99.9%" },
    { id: "internet_backup", name: "Internet Matriz (Claro)", icon: Globe, status: "online", uptime: "100%" },
    { id: "file_server", name: "Servidor de Arquivos", icon: Server, status: "warning", uptime: "98.5%" },
    { id: "voip", name: "Telefonia IP", icon: Activity, status: "online", uptime: "99.1%" },
];

export default function Status() {
    const [incidentes, setIncidentes] = useState<Incidente[]>(incidentesData);
    const [search, setSearch] = useState("");
    const { addLog } = useAudit();

    const filteredIncidentes = incidentes.filter(i =>
        search === "" ||
        i.titulo.toLowerCase().includes(search.toLowerCase()) ||
        i.servico.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        if (status === "online") return <CheckCircle2 className="h-5 w-5 text-success" />;
        if (status === "warning") return <AlertCircle className="h-5 w-5 text-warning" />;
        if (status === "offline") return <XCircle className="h-5 w-5 text-destructive" />;
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    };

    const getStatusColor = (status: string) => {
        if (status === "online") return "bg-success/10 border-success/20 text-success";
        if (status === "warning") return "bg-warning/10 border-warning/20 text-warning";
        if (status === "offline") return "bg-destructive/10 border-destructive/20 text-destructive";
        return "bg-muted";
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="h-6 w-6 text-primary" /> Status dos Serviços
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Gestão de incidentes (Post-mortem) e saúde dos sistemas críticos.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button className="gap-2 shrink-0 h-9">
                        <Plus className="h-4 w-4" /> Registrar Incidente
                    </Button>
                </div>
            </div>

            {/* Current Status Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {CORE_SERVICES.map(service => {
                    const Icon = service.icon;
                    return (
                        <Card key={service.id} className={`border ${getStatusColor(service.status)}`}>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <Icon className="h-8 w-8 mb-3 opacity-80" />
                                <h3 className="font-bold text-sm tracking-tight">{service.name}</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    {getStatusIcon(service.status)}
                                    <span className="text-xs font-bold uppercase tracking-wider">{service.status}</span>
                                </div>
                                <p className="text-[10px] font-mono mt-3 opacity-70">Uptime: {service.uptime}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Layout Split: History vs Analytics */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Incidents History */}
                <Card className="md:col-span-2 border shadow-sm flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                        <div>
                            <CardTitle className="text-lg">Histórico de Incidentes (Post-mortem)</CardTitle>
                            <CardDescription>Registro das últimas falhas documentadas.</CardDescription>
                        </div>
                        <div className="relative w-[200px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar incidente..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="flex flex-col">
                            {filteredIncidentes.map((incidente, index) => (
                                <div key={incidente.id} className={`p-4 flex flex-col gap-3 ${index !== filteredIncidentes.length - 1 ? 'border-b border-border/50' : ''} hover:bg-muted/30 transition-colors`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-destructive" />
                                            <h4 className="font-bold text-sm">{incidente.titulo}</h4>
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{incidente.servico}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Duração: {incidente.duracao}</span>
                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{incidente.data}</span>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4 ml-6">
                                        <div className="bg-destructive/5 border border-destructive/20 rounded-md p-3">
                                            <h5 className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1 flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> Causa Raiz</h5>
                                            <p className="text-xs text-muted-foreground">{incidente.causaRaiz}</p>
                                        </div>
                                        <div className="bg-success/5 border border-success/20 rounded-md p-3">
                                            <h5 className="text-[10px] font-bold text-success uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Resolução Aplicada</h5>
                                            <p className="text-xs text-muted-foreground">{incidente.resolucao}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredIncidentes.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                                    <p className="text-sm">Nenhum incidente documentado encontrado.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Policies or Stats */}
                <div className="flex flex-col gap-4">
                    <Card className="border shadow-sm bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Qualidade do Serviço
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-primary tracking-tighter">99.7%</div>
                            <p className="text-xs text-muted-foreground mt-1">SLA Global acumulado neste ano.</p>

                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Incidentes Críticos (Mês)</span>
                                    <span className="font-bold">0</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">MTTR (Tempo Médio Resolução)</span>
                                    <span className="font-bold">45 min</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-muted-foreground">Boas Práticas Post-mortem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Um incidente só é considerado encerrado após a documentação da <b>causa raiz</b> e da <b>resolução</b>. O objetivo do Post-mortem é ser <i>blameless</i> (focado no problema, não em culpar pessoas).
                            </p>
                            <Button variant="outline" className="w-full text-xs h-8">Ler Política de SLA</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

        </div>
    );
}
