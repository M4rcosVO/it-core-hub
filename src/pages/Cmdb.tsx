import { useState } from "react";
import { Network, Server, Router, Globe, Shield, Database, LayoutTemplate, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Hardcoded Tree Structure for Visual CMDB
const CMDB_NODES = [
    { id: "internet", label: "Internet (ISP)", icon: Globe, status: "online", layer: 0 },
    { id: "firewall", label: "Fortigate 100F", icon: Shield, status: "online", layer: 1 },
    { id: "core_switch", label: "Core Switch Cisco", icon: Router, status: "online", layer: 2 },
    { id: "srv_erp", label: "Servidor ERP", icon: Database, status: "online", layer: 3 },
    { id: "srv_file", label: "File Server", icon: Server, status: "warning", layer: 3 },
    { id: "sw_access_1", label: "Tr. Access 01", icon: Router, status: "online", layer: 3 },
    { id: "sw_access_2", label: "Tr. Access 02", icon: Router, status: "offline", layer: 3 },
];

const CMDB_EDGES = [
    { from: "internet", to: "firewall" },
    { from: "firewall", to: "core_switch" },
    { from: "core_switch", to: "srv_erp" },
    { from: "core_switch", to: "srv_file" },
    { from: "core_switch", to: "sw_access_1" },
    { from: "core_switch", to: "sw_access_2" },
];

export default function Cmdb() {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    const activeNodeData = CMDB_NODES.find(n => n.id === selectedNode);

    // Get color based on status
    const getNodeColor = (status: string, isSelected: boolean) => {
        let base = "bg-background border-border text-foreground";
        if (status === "warning") base = "bg-warning/10 border-warning text-warning-foreground";
        if (status === "offline") base = "bg-destructive/10 border-destructive text-destructive-foreground";
        if (status === "online" && isSelected) base = "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]";
        else if (status === "online") base = "bg-card border-border hover:border-primary/50 text-foreground";

        return `${base} ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`;
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Network className="h-6 w-6 text-primary" /> CMDB Visual
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Mapeamento dinâmico de dependências da infraestrutura (Grafo Lógico).</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5 h-[600px]">

                {/* Visual Graph Canvas */}
                <Card className="md:col-span-3 lg:col-span-4 border shadow-sm relative overflow-hidden bg-muted/10 bg-grid-pattern">
                    <CardHeader className="absolute top-0 left-0 z-10 bg-background/80 backdrop-blur-sm border-b w-full pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4" /> Topologia de Rede (Matriz)
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="h-full pt-16 relative flex items-center justify-center">

                        {/* We use a flexbox layout to visually simulate a tree structure */}
                        <div className="flex flex-col items-center justify-center gap-12 w-full max-w-2xl relative z-10">

                            {/* SVG for connecting lines - Rendered absolutely behind the nodes */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ minHeight: '400px' }}>
                                {/* Hardcoding realistic line paths for this specific tree for visual wow factor */}
                                <line x1="50%" y1="10%" x2="50%" y2="28%" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="4" />
                                <line x1="50%" y1="36%" x2="50%" y2="52%" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />

                                {/* Branches from Core Switch */}
                                <path d="M 50% 60% L 50% 70% L 20% 70% L 20% 82%" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
                                <path d="M 50% 60% L 50% 70% L 40% 70% L 40% 82%" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
                                <path d="M 50% 60% L 50% 70% L 60% 70% L 60% 82%" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
                                <path d="M 50% 60% L 50% 70% L 80% 70% L 80% 82%" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2" className="animate-pulse" />
                            </svg>

                            {/* Layer 0: Internet */}
                            <div className="flex justify-center w-full mt-4">
                                {CMDB_NODES.filter(n => n.layer === 0).map(node => {
                                    const Icon = node.icon;
                                    return (
                                        <button key={node.id} onClick={() => setSelectedNode(node.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer shadow-md w-32 ${getNodeColor(node.status, selectedNode === node.id)}`}>
                                            <Icon className="w-8 h-8" />
                                            <span className="text-xs font-bold text-center">{node.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Layer 1: Firewall */}
                            <div className="flex justify-center w-full">
                                {CMDB_NODES.filter(n => n.layer === 1).map(node => {
                                    const Icon = node.icon;
                                    return (
                                        <button key={node.id} onClick={() => setSelectedNode(node.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer shadow-md w-32 ${getNodeColor(node.status, selectedNode === node.id)}`}>
                                            <Icon className="w-8 h-8" />
                                            <span className="text-xs font-bold text-center">{node.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Layer 2: Core */}
                            <div className="flex justify-center w-full">
                                {CMDB_NODES.filter(n => n.layer === 2).map(node => {
                                    const Icon = node.icon;
                                    return (
                                        <button key={node.id} onClick={() => setSelectedNode(node.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer shadow-md w-36 ${getNodeColor(node.status, selectedNode === node.id)}`}>
                                            <Icon className="w-8 h-8" />
                                            <span className="text-xs font-bold text-center">{node.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Layer 3: Distribution / Servers */}
                            <div className="flex justify-between w-full px-8">
                                {CMDB_NODES.filter(n => n.layer === 3).map(node => {
                                    const Icon = node.icon;
                                    return (
                                        <button key={node.id} onClick={() => setSelectedNode(node.id)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer shadow-md w-28 ${getNodeColor(node.status, selectedNode === node.id)}`}>
                                            <Icon className="w-6 h-6" />
                                            <span className="text-[10px] font-bold text-center leading-tight">{node.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* Info Panel */}
                <Card className="border shadow-sm flex flex-col">
                    <CardHeader className="pb-2 border-b bg-muted/10">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Detalhes do Ativo
                        </CardTitle>
                        <CardDescription className="text-xs">Clique num nó no grafo para ver o impacto.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex-1">
                        {!activeNodeData ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center space-y-3 opacity-50">
                                <Network className="w-12 h-12" />
                                <p className="text-sm">Nenhum ativo selecionado.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in zoom-in-95">
                                <div className="text-center space-y-2">
                                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${activeNodeData.status === 'online' ? 'bg-success/20 text-success' : activeNodeData.status === 'warning' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>
                                        {activeNodeData && (() => {
                                            const Icon = activeNodeData.icon;
                                            return <Icon className="w-8 h-8" />;
                                        })()}
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight">{activeNodeData.label}</h3>
                                    <Badge variant={activeNodeData.status === 'online' ? 'default' : activeNodeData.status === 'warning' ? 'secondary' : 'destructive'} className="uppercase">
                                        {activeNodeData.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    <div className="text-xs">
                                        <span className="font-bold text-muted-foreground block mb-1">Impacto de Queda (Raio Múltiplo):</span>
                                        <p className="font-medium text-destructive">
                                            {activeNodeData.id === 'core_switch' ? 'Paralisação Total (Matriz)' :
                                                activeNodeData.id === 'firewall' ? 'Perda de Conectividade Externa' :
                                                    activeNodeData.id === 'sw_access_2' ? 'Setor Operacional Afetado (12 Dispositivos)' :
                                                        'Impacto Isolado ao Serviço'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
