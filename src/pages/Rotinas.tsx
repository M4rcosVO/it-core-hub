import { useState } from "react";
import {
    UserPlus,
    UserMinus,
    CheckSquare,
    Square,
    Plus,
    Search,
    Calendar,
    Briefcase,
    AlertCircle,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Typings for our checklist tasks
type CheckTask = {
    id: string;
    label: string;
    done: boolean;
};

// Mock data for Onboarding (Admissão) Checklists
const initialOnboarding = [
    {
        id: 1,
        nome: "Fernanda Costa",
        setor: "Financeiro",
        cargo: "Analista Contábil",
        dataInicio: "15/03/2026",
        status: "Em Andamento", // or "Concluído"
        progresso: 40,
        tasks: [
            { id: "o1-t1", label: "Criação de e-mail corporativo", done: true },
            { id: "o1-t2", label: "Conta no Active Directory (AD)", done: true },
            { id: "o1-t3", label: "Separar Notebook + Periféricos", done: false },
            { id: "o1-t4", label: "Acesso ao ERP (Módulo Faturamento)", done: false },
            { id: "o1-t5", label: "Mapeamento de Impressora", done: false },
        ],
    },
    {
        id: 2,
        nome: "Lucas Mendes",
        setor: "Comercial",
        cargo: "Executivo de Vendas",
        dataInicio: "10/03/2026",
        status: "Atrasado",
        progresso: 80,
        tasks: [
            { id: "o2-t1", label: "Criação de e-mail corporativo", done: true },
            { id: "o2-t2", label: "Conta no Active Directory (AD)", done: true },
            { id: "o2-t3", label: "Separar Notebook + Celular Corporativo", done: true },
            { id: "o2-t4", label: "Acesso à VPN e CRM", done: true },
            { id: "o2-t5", label: "Assinatura do Termo de Responsabilidade", done: false },
        ],
    },
];

// Mock data for Offboarding (Demissão) Checklists
const initialOffboarding = [
    {
        id: 1,
        nome: "Beto Souza",
        setor: "Marketing",
        cargo: "Designer Pleno",
        dataSaida: "05/03/2026",
        status: "Concluído",
        progresso: 100,
        tasks: [
            { id: "of1-t1", label: "Bloqueio de AD e E-mail", done: true },
            { id: "of1-t2", label: "Recolhimento do Notebook", done: true },
            { id: "of1-t3", label: "Revogação Adobe Creative Cloud", done: true },
            { id: "of1-t4", label: "Backup do OneDrive/Arquivos", done: true },
        ],
    },
];

export default function Rotinas() {
    const [onboarding, setOnboarding] = useState(initialOnboarding);
    const [offboarding, setOffboarding] = useState(initialOffboarding);
    const [search, setSearch] = useState("");

    const toggleTask = (processId: number, taskId: string, type: "onboarding" | "offboarding") => {
        const list = type === "onboarding" ? onboarding : offboarding;
        const setList = type === "onboarding" ? setOnboarding : setOffboarding;

        const newList = list.map((item) => {
            if (item.id === processId) {
                let completedTally = 0;
                const newTasks = item.tasks.map((t) => {
                    if (t.id === taskId) {
                        if (!t.done) completedTally++;
                        return { ...t, done: !t.done };
                    }
                    if (t.done) completedTally++;
                    return t;
                });

                const novoProgresso = Math.round((completedTally / newTasks.length) * 100);
                let novoStatus = item.status;
                if (novoProgresso === 100) novoStatus = "Concluído";
                else if (novoProgresso > 0 && novoStatus === "Concluído") novoStatus = "Em Andamento";

                return { ...item, tasks: newTasks, progresso: novoProgresso, status: novoStatus };
            }
            return item;
        });

        setList(newList);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Concluído": return <Badge className="bg-success hover:bg-success/90"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>;
            case "Atrasado": return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Atrasado</Badge>;
            default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> {status}</Badge>;
        }
    }

    const renderChecklistCard = (item: any, type: "onboarding" | "offboarding") => (
        <Card key={item.id} className="shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-3 bg-muted/20 border-b">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {type === "onboarding" ? <UserPlus className="w-4 h-4 text-primary" /> : <UserMinus className="w-4 h-4 text-destructive" />}
                            {item.nome}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-3 mt-1.5 text-xs">
                            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {item.cargo} ({item.setor})</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {type === "onboarding" ? "Início" : "Saída"}: {type === "onboarding" ? item.dataInicio : item.dataSaida}</span>
                        </CardDescription>
                    </div>
                    {getStatusBadge(item.status)}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
                {/* ProgressBar */}
                <div className="h-1.5 w-full bg-muted">
                    <div
                        className={`h-full transition-all duration-500 ${item.progresso === 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${item.progresso}%` }}
                    />
                </div>

                {/* Tasks */}
                <div className="p-4 space-y-3 flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        <span>Progresso ({item.progresso}%)</span>
                    </div>
                    {item.tasks.map((task: CheckTask) => (
                        <div
                            key={task.id}
                            className="flex items-start gap-3 group cursor-pointer"
                            onClick={() => toggleTask(item.id, task.id, type)}
                        >
                            <button className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors focus:outline-none">
                                {task.done ? <CheckSquare className="w-4 h-4 text-success" /> : <Square className="w-4 h-4" />}
                            </button>
                            <span className={`text-sm leading-tight transition-all ${task.done ? 'line-through text-muted-foreground opacity-70' : 'text-foreground font-medium'}`}>
                                {task.label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Rotinas & Checklists</h1>
                    <p className="text-muted-foreground text-sm mt-1">Acompanhamento de processos de Admissão e Desligamento</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Processo
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar colaborador..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            <Tabs defaultValue="onboarding">
                <TabsList>
                    <TabsTrigger value="onboarding" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Admissão (Onboarding)
                    </TabsTrigger>
                    <TabsTrigger value="offboarding" className="gap-2">
                        <UserMinus className="h-4 w-4" />
                        Desligamento (Offboarding)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="onboarding" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {onboarding
                            .filter(o => search === "" || o.nome.toLowerCase().includes(search.toLowerCase()))
                            .map(item => renderChecklistCard(item, "onboarding"))
                        }
                    </div>
                </TabsContent>

                <TabsContent value="offboarding" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {offboarding
                            .filter(o => search === "" || o.nome.toLowerCase().includes(search.toLowerCase()))
                            .map(item => renderChecklistCard(item, "offboarding"))
                        }
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
