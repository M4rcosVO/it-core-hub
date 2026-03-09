import { useState, useMemo } from "react";
import {
    Kanban,
    Plus,
    Search,
    Clock,
    User,
    CheckCircle2,
    History,
    MoreVertical,
    FileEdit
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { demandasData, Demanda } from "@/data/mockData";
import { useAudit } from "@/components/AuditContext";

const COLUMNS = [
    { id: "BACKLOG", label: "Backlog / Pendente", color: "bg-muted text-muted-foreground border-muted-foreground/30" },
    { id: "DOING", label: "Em Andamento (WIP)", color: "bg-primary/10 text-primary border-primary/20" },
    { id: "REVIEW", label: "Aguardando Terceiro/Review", color: "bg-warning/10 text-warning border-warning/20" },
    { id: "DONE", label: "Concluído", color: "bg-success/10 text-success border-success/20 stroke-success border" }
];

export default function Demandas() {
    const [demandas, setDemandas] = useState<Demanda[]>(demandasData);
    const [search, setSearch] = useState("");
    const { addLog } = useAudit();

    // Drag and Drop native state
    const [draggedId, setDraggedId] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedId(id);
        // Required for Firefox
        e.dataTransfer.setData("text/plain", id.toString());
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault();
        if (draggedId === null) return;

        const draggedCard = demandas.find(d => d.id === draggedId);
        if (!draggedCard || draggedCard.status === targetColumnId) {
            setDraggedId(null);
            return;
        }

        const oldStatusObj = COLUMNS.find(c => c.id === draggedCard.status);
        const newStatusObj = COLUMNS.find(c => c.id === targetColumnId);

        setDemandas(prev => prev.map(d =>
            d.id === draggedId ? { ...d, status: targetColumnId as Demanda["status"] } : d
        ));

        // Audit Logging
        addLog({
            user: "Usuário Logado",
            action: "Movimentação de Kanban",
            details: `Moveu vaga "${draggedCard.titulo}" de [${oldStatusObj?.label}] para [${newStatusObj?.label}]`,
            module: 'Demandas'
        });

        setDraggedId(null);
    };

    const filteredDemandas = useMemo(() => {
        return demandas.filter(d =>
            search === "" ||
            d.titulo.toLowerCase().includes(search.toLowerCase()) ||
            d.solicitante.toLowerCase().includes(search.toLowerCase())
        );
    }, [demandas, search]);

    const getPriorityBadge = (p: string) => {
        if (p === "Alta" || p === "Crítica") return <Badge variant="destructive" className="h-5 text-[10px] uppercase font-bold px-1.5">{p}</Badge>;
        if (p === "Média") return <Badge variant="outline" className="h-5 text-[10px] uppercase font-bold text-warning border-warning/50 px-1.5">{p}</Badge>;
        return <Badge variant="secondary" className="h-5 text-[10px] uppercase font-bold px-1.5">{p}</Badge>;
    };

    return (
        <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-theme(spacing.16)-2rem)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Kanban className="h-6 w-6 text-primary" /> Demandas & Projetos
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Gerenciamento ágil (Kanban) das tarefas internas da TI</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 w-full sm:w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar demanda..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 w-full"
                        />
                    </div>
                    <Button className="gap-2 shrink-0 h-9">
                        <Plus className="h-4 w-4" /> Nova Demanda
                    </Button>
                </div>
            </div>

            {/* Kanban Board Container - Takes remaining height and horizontal scrolls if needed */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-6 h-full min-w-[max-content] md:min-w-0">
                    {COLUMNS.map(col => {
                        const colItems = filteredDemandas.filter(d => d.status === col.id);

                        return (
                            <div
                                key={col.id}
                                className="w-[320px] shrink-0 h-full flex flex-col bg-muted/20 border border-border/50 rounded-xl overflow-hidden"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                {/* Column Header */}
                                <div className={`p-3 border-b border-border/50 flex items-center justify-between ${col.color}`}>
                                    <h3 className="font-bold text-sm">{col.label}</h3>
                                    <span className="text-xs font-bold w-6 h-6 flex items-center justify-center bg-background rounded-full shrink-0">
                                        {colItems.length}
                                    </span>
                                </div>

                                {/* Column Content (Scrollable) */}
                                <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                                    {colItems.map(demanda => (
                                        <Card
                                            key={demanda.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, demanda.id)}
                                            className={`shadow-sm border border-border/60 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${draggedId === demanda.id ? 'opacity-50 border-primary border-dashed' : ''} ${demanda.status === 'DONE' ? 'opacity-70' : ''}`}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    {getPriorityBadge(demanda.prioridade)}
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem><FileEdit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                                            <DropdownMenuItem><History className="mr-2 h-4 w-4" /> Log de Atividade</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive"><CheckCircle2 className="mr-2 h-4 w-4" /> Marcar Concluído</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <h4 className={`text-sm font-bold leading-tight mb-1 ${demanda.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                                                    {demanda.titulo}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {demanda.descricao}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="p-3 pt-0 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                    <div className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center border border-primary/20" title={demanda.responsavel}>
                                                        {demanda.responsavel.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <span className="truncate max-w-[80px]" title={demanda.solicitante}>{demanda.solicitante}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    {demanda.previsao || "--/--"}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                    {colItems.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-border/60 rounded-lg flex items-center justify-center text-xs text-muted-foreground font-medium">
                                            Nenhum card aqui
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
