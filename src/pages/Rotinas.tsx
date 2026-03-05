import { useState } from "react";
import {
    ListChecks,
    UserPlus,
    UserMinus,
    Laptop,
    CheckSquare,
    Square,
    Search,
    RotateCcw,
    Copy,
    ChevronRight,
    Plus,
    Trash2,
    Edit2,
    Save,
    X,
    GripVertical,
    Printer,
    LayoutGrid,
    LayoutList,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";

// Typings for our standard checklists
type CheckTask = {
    id: string;
    label: string;
    status: "pending" | "doing" | "done";
};

type Routine = {
    id: number;
    titulo: string;
    descricao: string;
    categoria: "Entrada" | "Saída" | "Operacional" | "Acessos" | "Manutenção" | "Auditoria" | "Projetos";
    icone: React.ElementType;
    tasks: CheckTask[];
};

const initialRoutines: Routine[] = [
    {
        id: 1,
        titulo: "Admissão Padrão (Onboarding)",
        categoria: "Entrada",
        descricao: "Passos necessários para configurar acessos e equipamentos de um novo colaborador.",
        icone: UserPlus,
        tasks: [
            { id: "t1", label: "Criação de e-mail corporativo", status: "pending" },
            { id: "t2", label: "Criação de usuário no Active Directory (AD)", status: "pending" },
            { id: "t3", label: "Incluir em grupos de distribuição de e-mail", status: "pending" },
            { id: "t4", label: "Acesso à rede Wi-Fi / VPN (se aplicável)", status: "pending" },
            { id: "t5", label: "Preparação de Máquina + Periféricos", status: "pending" },
            { id: "t6", label: "Instalação do pacote Office e Antivírus", status: "pending" },
            { id: "t7", label: "Geração de Termo de Responsabilidade", status: "pending" },
        ],
    },
    {
        id: 2,
        titulo: "Desligamento de Colaborador",
        categoria: "Saída",
        descricao: "Checklist de segurança para revogar acessos na saída do funcionário.",
        icone: UserMinus,
        tasks: [
            { id: "t1", label: "Alterar senha e desabilitar usuário no AD", status: "pending" },
            { id: "t2", label: "Ocultar rede do e-mail corporativo", status: "pending" },
            { id: "t3", label: "Converter e-mail para caixa compartilhada (se solicitado pelo gestor)", status: "pending" },
            { id: "t4", label: "Revogação de acesso a ERPs e Sistemas Web", status: "pending" },
            { id: "t5", label: "Desconectar contas do Office 365 e Adobe CC", status: "pending" },
            { id: "t6", label: "Recolher Equipamentos de TI", status: "pending" },
            { id: "t7", label: "Arquivar Termo de Devolução no Inventário", status: "pending" },
        ],
    },
    {
        id: 3,
        titulo: "Troca de Equipamento (Upgrade/Defeito)",
        categoria: "Operacional",
        descricao: "Ações guiadas ao substituir um notebook ou desktop de um usuário.",
        icone: Laptop,
        tasks: [
            { id: "t1", label: "Configurar o Sistema Operacional na máquina nova", status: "pending" },
            { id: "t2", label: "Fazer backup dos arquivos da máquina antiga (OneDrive ou Externo)", status: "pending" },
            { id: "t3", label: "Fazer backup e reinstalar certificados digitais (A1/A3)", status: "pending" },
            { id: "t4", label: "Trocar equipamento fisicamente na mesa do usuário", status: "pending" },
            { id: "t5", label: "Atualizar Inventário: Novo -> 'Em Uso'", status: "pending" },
            { id: "t6", label: "Atualizar Inventário: Antigo -> 'Em Manutenção' ou 'Estoque'", status: "pending" },
            { id: "t7", label: "Recolher assinatura no novo Termo de Responsabilidade", status: "pending" },
        ],
    },
];

export default function Rotinas() {
    const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
    const [search, setSearch] = useState("");
    const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(initialRoutines[0].id);
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
    const { toast } = useToast();
    const { addLog } = useAudit();

    // Editor States
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Routine | null>(null);

    const selectedRoutine = routines.find(r => r.id === selectedRoutineId);

    const handleStartCreate = () => {
        setEditForm({
            id: Date.now(),
            titulo: "",
            descricao: "",
            categoria: "Operacional",
            icone: ListChecks,
            tasks: [],
        });
        setIsEditing(true);
        setSelectedRoutineId(null);
    };

    const handleStartEdit = (routine: Routine) => {
        setEditForm({ ...routine, tasks: [...routine.tasks] });
        setIsEditing(true);
    };

    const handleDelete = (id: number) => {
        if (confirm("Tem certeza que deseja excluir esta rotina padrão?")) {
            const newRoutines = routines.filter(r => r.id !== id);
            setRoutines(newRoutines);
            if (selectedRoutineId === id) {
                setSelectedRoutineId(newRoutines.length > 0 ? newRoutines[0].id : null);
            }
        }
    };

    const handleSave = () => {
        if (!editForm || !editForm.titulo.trim()) {
            alert("O título da rotina é obrigatório.");
            return;
        }

        setRoutines(prev => {
            const exists = prev.find(r => r.id === editForm.id);
            if (exists) {
                return prev.map(r => r.id === editForm.id ? editForm : r);
            }
            return [...prev, editForm];
        });

        setSelectedRoutineId(editForm.id);
        setIsEditing(false);
        setEditForm(null);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditForm(null);
        if (routines.length > 0 && !selectedRoutineId) {
            setSelectedRoutineId(routines[0].id);
        }
    };

    const updateTaskStatus = (routineId: number, taskId: string, newStatus: CheckTask["status"]) => {
        setRoutines(prev => prev.map(r => {
            if (r.id === routineId) {
                const currentRoutine = prev.find(routine => routine.id === routineId); // Find the routine to get its title
                return {
                    ...r,
                    tasks: r.tasks.map(t => {
                        if (t.id === taskId) {
                            if (newStatus === "done" && t.status !== "done") { // Log only if status changes TO "done"
                                addLog({
                                    user: "Usuário Logado", // Replace with actual logged-in user
                                    action: "Tarefa Concluída",
                                    details: `Concluiu item: "${t.label}" na rotina "${currentRoutine?.titulo}"`,
                                    module: 'Rotinas'
                                });
                            }
                            return { ...t, status: newStatus };
                        }
                        return t;
                    })
                };
            }
            return r;
        }));
    };

    const toggleTask = (routineId: number, taskId: string) => {
        setRoutines(prev => prev.map(r => {
            if (r.id === routineId) {
                const currentRoutine = prev.find(routine => routine.id === routineId); // Find the routine to get its title
                return {
                    ...r,
                    tasks: r.tasks.map(t => {
                        if (t.id === taskId) {
                            const newStatus = t.status === "done" ? "pending" : "done";
                            if (newStatus === "done" && t.status !== "done") { // Log only if status changes TO "done"
                                addLog({
                                    user: "Usuário Logado", // Replace with actual logged-in user
                                    action: "Tarefa Concluída",
                                    details: `Concluiu item: "${t.label}" na rotina "${currentRoutine?.titulo}"`,
                                    module: 'Rotinas'
                                });
                            }
                            return { ...t, status: newStatus };
                        }
                        return t;
                    })
                };
            }
            return r;
        }));
    };

    const resetChecklist = (routineId: number) => {
        setRoutines(prev => prev.map(r => {
            if (r.id === routineId) {
                return {
                    ...r,
                    tasks: r.tasks.map(t => ({ ...t, status: "pending" }))
                };
            }
            return r;
        }));
    };

    const copyToClipboard = (routine: Routine) => {
        const text = `${routine.titulo}\n\n` + routine.tasks.map(t => `[${t.status === 'done' ? 'x' : t.status === 'doing' ? '/' : ' '}] ${t.label}`).join("\n");
        navigator.clipboard.writeText(text);
        toast({ title: "Checklist copiado!", description: `"${routine.titulo}" foi copiado para a área de transferência.` });
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case "Entrada": return "bg-success/10 text-success border-success/20";
            case "Saída": return "bg-destructive/10 text-destructive border-destructive/20";
            case "Operacional": return "bg-primary/10 text-primary border-primary/20";
            case "Acessos": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
            case "Manutenção": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "Auditoria": return "bg-teal-500/10 text-teal-600 border-teal-500/20";
            case "Projetos": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const filteredRoutines = routines.filter(r =>
        search === "" || r.titulo.toLowerCase().includes(search.toLowerCase()) || r.categoria.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rotinas & Checklists Padrão</h1>
                    <p className="text-muted-foreground text-sm mt-1">SOPs (Standard Operating Procedures) da TI para guiar tarefas diárias</p>
                </div>
                {!isEditing && (
                    <Button className="gap-2" onClick={handleStartCreate}>
                        <Plus className="h-4 w-4" />
                        Novo Padrão
                    </Button>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar com a lista de Rotinas */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar rotina..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="space-y-2">
                        {filteredRoutines.map(routine => {
                            const isSelected = selectedRoutineId === routine.id;
                            const Icon = routine.icone;
                            return (
                                <div
                                    key={routine.id}
                                    onClick={() => setSelectedRoutineId(routine.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? 'bg-accent/50 border-primary shadow-sm'
                                        : 'bg-card hover:bg-accent/30 border-border/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>{routine.titulo}</p>
                                            <Badge variant="outline" className={`mt-1 text-[10px] uppercase font-bold tracking-wider ${getCategoryColor(routine.categoria)}`}>
                                                {routine.categoria}
                                            </Badge>
                                        </div>
                                    </div>
                                    {isSelected && <ChevronRight className="w-4 h-4 text-primary" />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Workspace Central do Checklist Selecionado */}
                {isEditing && editForm ? (
                    // EDITOR VIEW
                    <Card className="flex-1 shadow-sm border-t-4 border-t-warning">
                        <CardHeader className="pb-4 border-b bg-muted/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        {editForm.titulo ? "Editando Rotina" : "Criando Nova Rotina Padrão"}
                                    </CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                        <X className="w-4 h-4 mr-1" /> Cancelar
                                    </Button>
                                    <Button size="sm" className="bg-success hover:bg-success/90 text-primary-foreground" onClick={handleSave}>
                                        <Save className="w-4 h-4 mr-1" /> Salvar Rotina
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Título da Rotina</label>
                                    <Input
                                        placeholder="Ex: Formatação de Máquina"
                                        value={editForm.titulo}
                                        onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Categoria</label>
                                    <select
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editForm.categoria}
                                        onChange={(e) => setEditForm({ ...editForm, categoria: e.target.value as Routine["categoria"] })}
                                    >
                                        <option value="Entrada">Entrada (Onboarding)</option>
                                        <option value="Saída">Saída (Offboarding)</option>
                                        <option value="Operacional">Operacional Geral</option>
                                        <option value="Acessos">Acessos & Permissões</option>
                                        <option value="Manutenção">Manutenção Técnica</option>
                                        <option value="Auditoria">Auditoria & Compliance</option>
                                        <option value="Projetos">Projetos & Implantação</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">Descrição / Objetivo</label>
                                    <Input
                                        placeholder="Para que serve este checklist?"
                                        value={editForm.descricao}
                                        onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-base font-semibold">Passos do Checklist</label>
                                    <Button variant="secondary" size="sm" onClick={() => {
                                        setEditForm({
                                            ...editForm,
                                            tasks: [...editForm.tasks, { id: `new_${Date.now()}`, label: "", status: "pending" }]
                                        })
                                    }}>
                                        <Plus className="w-4 h-4 mr-1" /> Adicionar Passo
                                    </Button>
                                </div>

                                {editForm.tasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">Nenhum passo adicionado ainda.</p>
                                )}

                                <div className="space-y-2">
                                    {editForm.tasks.map((task, index) => (
                                        <div key={task.id} className="flex items-center gap-2">
                                            <div className="h-9 w-9 flex items-center justify-center bg-muted rounded-md text-muted-foreground cursor-move">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <Input
                                                className="flex-1"
                                                placeholder="Descreva a tarefa..."
                                                value={task.label}
                                                onChange={(e) => {
                                                    const newTasks = [...editForm.tasks];
                                                    newTasks[index].label = e.target.value;
                                                    setEditForm({ ...editForm, tasks: newTasks });
                                                }}
                                            />
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => {
                                                setEditForm({
                                                    ...editForm,
                                                    tasks: editForm.tasks.filter(t => t.id !== task.id)
                                                });
                                            }}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : selectedRoutine ? (
                    // VISUALIZATION VIEW
                    <Card className="flex-1 shadow-sm border-t-4 border-t-primary flex flex-col min-h-[500px]">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ListChecks className="w-5 h-5 text-primary" />
                                        {selectedRoutine.titulo}
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-sm leading-relaxed">
                                        {selectedRoutine.descricao}
                                    </CardDescription>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyToClipboard(selectedRoutine)}>
                                        <Copy className="w-3.5 h-3.5" />
                                        Copiar
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
                                        <Printer className="w-3.5 h-3.5" />
                                        Imprimir / PDF
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => resetChecklist(selectedRoutine.id)}>
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        Limpar
                                    </Button>
                                    <Separator orientation="vertical" className="h-8 hidden sm:block" />
                                    <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => handleStartEdit(selectedRoutine)}>
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => handleDelete(selectedRoutine.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Apagar
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex bg-muted p-1 rounded-lg">
                                    <Button
                                        variant={viewMode === "list" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-8 px-3 gap-2"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <LayoutList className="h-4 w-4" /> Lista
                                    </Button>
                                    <Button
                                        variant={viewMode === "kanban" ? "secondary" : "ghost"}
                                        size="sm"
                                        className="h-8 px-3 gap-2"
                                        onClick={() => setViewMode("kanban")}
                                    >
                                        <LayoutGrid className="h-4 w-4" /> Kanban
                                    </Button>
                                </div>
                            </div>

                            {/* Progress bar - feature #10 */}
                            {selectedRoutine.tasks.length > 0 && (() => {
                                const done = selectedRoutine.tasks.filter(t => t.status === "done").length;
                                const total = selectedRoutine.tasks.length;
                                const pct = Math.round((done / total) * 100);
                                return (
                                    <div className="mb-6 space-y-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{done} de {total} passos concluídos</span>
                                            <span className={`font-bold ${pct === 100 ? 'text-success' : 'text-primary'}`}>{pct}%</span>
                                        </div>
                                        <Progress value={pct} className="h-2" />
                                    </div>
                                );
                            })()}

                            {viewMode === "list" ? (
                                <div className="space-y-4 pl-1">
                                    {selectedRoutine.tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-start gap-3 group cursor-pointer"
                                            onClick={() => toggleTask(selectedRoutine.id, task.id)}
                                        >
                                            <button className={`mt-0.5 transition-colors focus:outline-none ${task.status === "done" ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                                                {task.status === "done" ? <CheckSquare className="w-5 h-5" /> : task.status === "doing" ? <Clock className="w-5 h-5 text-warning" /> : <Square className="w-5 h-5" />}
                                            </button>
                                            <span className={`text-sm md:text-base leading-snug transition-all ${task.status === "done"
                                                ? 'text-muted-foreground line-through opacity-70'
                                                : 'text-foreground font-medium'
                                                }`}>
                                                {task.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full pb-6">
                                    {/* PENDENTE */}
                                    <div className="bg-muted/30 rounded-lg p-3 border border-dashed">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                                            <Square className="h-3 w-3" /> Pendente
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedRoutine.tasks.filter(t => t.status === "pending").map(task => (
                                                <Card key={task.id} className="p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-muted-foreground" onClick={() => updateTaskStatus(selectedRoutine.id, task.id, "doing")}>
                                                    <p className="text-sm font-medium leading-tight">{task.label}</p>
                                                    <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-[10px] text-primary">Começar →</Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    {/* EM EXECUÇÃO */}
                                    <div className="bg-warning/5 rounded-lg p-3 border border-warning/20">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-4 flex items-center gap-2">
                                            <Clock className="h-3 w-3" /> Em Execução
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedRoutine.tasks.filter(t => t.status === "doing").map(task => (
                                                <Card key={task.id} className="p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-warning" onClick={() => updateTaskStatus(selectedRoutine.id, task.id, "done")}>
                                                    <p className="text-sm font-medium leading-tight">{task.label}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px]" onClick={(e) => { e.stopPropagation(); updateTaskStatus(selectedRoutine.id, task.id, "pending"); }}>← Voltar</Button>
                                                        <Button variant="ghost" size="sm" className="flex-1 h-7 text-[10px] text-success" onClick={(e) => { e.stopPropagation(); updateTaskStatus(selectedRoutine.id, task.id, "done"); }}>Concluir ✓</Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CONCLUÍDO */}
                                    <div className="bg-success/5 rounded-lg p-3 border border-success/20">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-success mb-4 flex items-center gap-2">
                                            <CheckSquare className="h-3 w-3" /> Concluído
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedRoutine.tasks.filter(t => t.status === "done").map(task => (
                                                <Card key={task.id} className="p-3 shadow-sm opacity-60 border-l-4 border-l-success">
                                                    <p className="text-sm font-medium leading-tight line-through text-muted-foreground">{task.label}</p>
                                                    <Button variant="ghost" size="sm" className="w-full mt-2 h-7 text-[10px]" onClick={() => updateTaskStatus(selectedRoutine.id, task.id, "doing")}>Reabrir</Button>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 lg:p-24 border rounded-xl border-dashed bg-muted/10">
                        <ListChecks className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">Selecione uma rotina ao lado para visualizar o checklist padrão.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
