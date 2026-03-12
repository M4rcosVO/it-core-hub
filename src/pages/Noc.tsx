import { useState, useEffect } from "react";
import { Activity, AlertCircle, Clock, CheckCircle2, XCircle, ShieldAlert, MonitorPlay, Maximize2, Server, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { incidentesData } from "@/data/mockData";
import { useData } from "@/components/DataContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NOC_SERVICES = [
    { id: "erp", name: "Sistema ERP", status: "online", ping: "12ms" },
    { id: "internet_A", name: "Internet Vivo (Link A)", status: "online", ping: "8ms" },
    { id: "internet_B", name: "Internet Claro (Link B)", status: "online", ping: "14ms" },
    { id: "file_server", name: "File Server (Matriz)", status: "warning", ping: "245ms" },
    { id: "voip", name: "Telefonia PABX", status: "online", ping: "45ms" },
    { id: "firewall", name: "Firewall Borda", status: "online", ping: "2ms" },
    { id: "site", name: "Site Institucional", status: "online", ping: "120ms" },
    { id: "sap", name: "Integração SAP", status: "offline", ping: "Timeout" },
];

export default function Noc() {
    const { computers, mobiles, peripherals } = useData();
    const navigate = useNavigate();
    const equipamentosCount = computers.length + mobiles.length + peripherals.length;

    // Fallback static alerts for NOC display
    const criticalAlerts = [
        { id: "a1", tipo: "erro", origem: "Firewall", mensagem: "Tráfego intenso anômalo detectado na porta 443." },
        { id: "a2", tipo: "vencimento", origem: "Contrato", mensagem: "Suporte do Servidor Host expira em 5 dias." }
    ];

    const [time, setTime] = useState(new Date());

    // Clock effect
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusIcon = (status: string) => {
        if (status === "online") return <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-pulse" />;
        if (status === "warning") return <AlertCircle className="h-6 w-6 text-amber-500" />;
        if (status === "offline") return <XCircle className="h-6 w-6 text-red-500 animate-bounce" />;
        return <Activity className="h-6 w-6 text-gray-400" />;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const getStatusColor = (status: string) => {
        if (status === "online") return "border-emerald-500/30 bg-emerald-500/10";
        if (status === "warning") return "border-amber-500/50 bg-amber-500/20";
        if (status === "offline") return "border-red-500 bg-red-500/20";
        return "border-gray-800 bg-gray-900";
    };

    return (
        <div className="dark min-h-screen bg-[#0a0a0a] text-zinc-100 p-6 font-sans flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={() => navigate("/")} title="Voltar ao Dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
                        <MonitorPlay className="h-8 w-8 text-blue-500" />
                        <div>
                            <h1 className="text-2xl font-black tracking-widest text-zinc-100 uppercase">Gellak NOC</h1>
                            <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">Network Operations Center</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-3xl font-mono font-black tracking-tight text-white">{format(time, "HH:mm:ss")}</div>
                        <div className="text-zinc-500 text-sm font-medium">{format(time, "dd 'de' MMM, yyyy", { locale: ptBR })}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" title="Toggle Fullscreen" onClick={toggleFullScreen}>
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6 overflow-hidden">

                {/* Left Column: Live Services Grid */}
                <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <Activity className="h-5 w-5" /> Status em Tempo Real
                        </h2>
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10 animate-pulse">
                            MONITORAMENTO ATIVO
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        {NOC_SERVICES.map(service => (
                            <div key={service.id} className={`rounded-xl border ${getStatusColor(service.status)} p-5 flex flex-col justify-between transition-colors shadow-2xl`}>
                                <div className="flex justify-between items-start">
                                    {getStatusIcon(service.status)}
                                    <span className="font-mono text-xs text-zinc-400 bg-black/40 px-2 py-1 rounded-md">{service.ping}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight mt-4 text-white shadow-black">{service.name}</h3>
                                    <p className="text-xs uppercase font-black tracking-widest mt-2" style={{
                                        color: service.status === 'online' ? '#10b981' : service.status === 'offline' ? '#ef4444' : '#f59e0b'
                                    }}>{service.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Infrastructure Highlights */}
                    <div className="grid grid-cols-3 gap-4 shrink-0">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase">Ativos Gerenciados</p>
                                <p className="text-2xl font-black text-white">{equipamentosCount}</p>
                            </div>
                            <Server className="h-8 w-8 text-zinc-700" />
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 text-xs font-bold uppercase">Incidentes no Mês</p>
                                <p className="text-2xl font-black text-white">{incidentesData.length}</p>
                            </div>
                            <ShieldAlert className="h-8 w-8 text-zinc-700" />
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-xs font-bold uppercase">SLA Global</p>
                                <p className="text-2xl font-black text-blue-400">99.8%</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-500/50" />
                        </div>
                    </div>
                </div>

                {/* Right Column: Attention Requested */}
                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-red-400 flex items-center gap-2 shrink-0">
                        <AlertCircle className="h-5 w-5" /> Foco de Atenção
                    </h2>

                    {/* Critical Alerts Stream */}
                    <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {criticalAlerts.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-zinc-600 font-mono text-sm">
                                NENHUM ALERTA CRÍTICO
                            </div>
                        ) : (
                            criticalAlerts.map(alerta => (
                                <div key={alerta.id} className="bg-zinc-950 border-l-4 border-l-red-500 p-3 rounded-r-lg shadow-md">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/20 border-red-500/50 text-[10px] uppercase">
                                            {alerta.origem}
                                        </Badge>
                                        <span className="text-[10px] text-zinc-500 font-mono"><Clock className="inline h-3 w-3 mr-1" /> Há 5 min</span>
                                    </div>
                                    <p className="text-sm font-medium text-zinc-200">{alerta.mensagem}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Active Incidents Summary */}
                    <Card className="bg-zinc-900 border-zinc-800 shrink-0">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm text-zinc-400 font-bold uppercase tracking-wider">Último Incidente Post-mortem</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {incidentesData.length > 0 && (
                                <div>
                                    <p className="font-bold text-white text-sm">{incidentesData[0].titulo}</p>
                                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{incidentesData[0].causaRaiz}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
