import { useState, useMemo } from "react";
import {
    ShoppingCart,
    Plus,
    Search,
    Clock,
    User,
    CheckCircle2,
    FileText,
    ArrowRight,
    Building2,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudit } from "@/components/AuditContext";
import { useToast } from "@/hooks/use-toast";

type SolicitacaoCompra = {
    id: number;
    titulo: string;
    solicitante: string;
    departamento: string;
    status: "Nova" | "Cotação" | "Aprovação" | "Comprado" | "Entregue";
    valorEstimado: string;
    dataSolicitacao: string;
    fornecedores: number; // Qtd de cotações recebidas
};

const solicitacoesData: SolicitacaoCompra[] = [
    { id: 1, titulo: "Licenças Adobe Creative Cloud", solicitante: "Maria Pereira", departamento: "Marketing", status: "Aprovação", valorEstimado: "R$ 6.000,00", dataSolicitacao: "08/03/2026", fornecedores: 3 },
    { id: 2, titulo: "10x Monitores Dell P2422H", solicitante: "João Almeida", departamento: "TI", status: "Cotação", valorEstimado: "R$ 14.500,00", dataSolicitacao: "10/03/2026", fornecedores: 1 },
    { id: 3, titulo: "Renovação Fortinet Antivirus", solicitante: "Rafael Lima", departamento: "Segurança", status: "Nova", valorEstimado: "R$ 18.000,00", dataSolicitacao: "11/03/2026", fornecedores: 0 },
    { id: 4, titulo: "Smartphone Diretoria (iPhone 15)", solicitante: "Carlos Silva", departamento: "Diretoria", status: "Comprado", valorEstimado: "R$ 7.200,00", dataSolicitacao: "02/03/2026", fornecedores: 2 },
];

export default function Compras() {
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoCompra[]>(solicitacoesData);
    const [search, setSearch] = useState("");
    const { addLog } = useAudit();
    const { toast } = useToast();

    const filtered = solicitacoes.filter(s =>
        search === "" ||
        s.titulo.toLowerCase().includes(search.toLowerCase()) ||
        s.solicitante.toLowerCase().includes(search.toLowerCase()) ||
        s.departamento.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusProgresso = (status: SolicitacaoCompra["status"]): { value: number, color: string } => {
        switch (status) {
            case "Nova": return { value: 20, color: "bg-muted-foreground" };
            case "Cotação": return { value: 40, color: "bg-warning" };
            case "Aprovação": return { value: 60, color: "bg-primary" };
            case "Comprado": return { value: 80, color: "bg-blue-500" };
            case "Entregue": return { value: 100, color: "bg-success" };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-primary" /> Gestão de Compras (Procurement)
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Acompanhe fluxos de cotações, solicitações e aquisições até o inventário.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 w-full sm:w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar solicitação..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 w-full"
                        />
                    </div>
                    <Button className="gap-2 shrink-0 h-9" onClick={() => toast({ title: "Nova Solicitação de Compra", description: "Formulário de requisição (Wizard) disponível em breve." })}>
                        <Plus className="h-4 w-4" /> Nova Solicitação
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map(sol => {
                    const prog = getStatusProgresso(sol.status);
                    return (
                        <Card key={sol.id} className="border shadow-sm flex flex-col hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-2 flex justify-between items-start flex-row gap-4">
                                <div>
                                    <Badge variant="outline" className="mb-2 text-[10px] font-mono leading-none">REQ-{sol.id.toString().padStart(4, '0')}</Badge>
                                    <CardTitle className="text-base leading-tight">{sol.titulo}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-4 space-y-4 flex-1">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <Building2 className="h-3.5 w-3.5" />
                                    <span>Para: {sol.departamento}</span>
                                    <span className="mx-1">•</span>
                                    <User className="h-3.5 w-3.5" />
                                    <span>Resp: {sol.solicitante}</span>
                                </div>

                                {/* Status Pipeline */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-muted-foreground">Status Atual</span>
                                        <span className="font-bold uppercase tracking-wider">{sol.status}</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${prog.color} transition-all duration-500`} style={{ width: `${prog.value}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                                        <span>Req</span>
                                        <span>Cot</span>
                                        <span>Apr</span>
                                        <span>Cmp</span>
                                        <span>OK</span>
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t border-border/50 p-4 flex items-center justify-between mt-auto">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {sol.dataSolicitacao}
                                    </p>
                                    <p className="text-xs font-bold">{sol.valorEstimado}</p>
                                </div>
                                <Button variant="secondary" size="sm" className="h-8 gap-2" onClick={() => toast({ title: "Fluxo de Aprovação", description: "Visualizador de Workflow e Tracker do Pedido." })}>
                                    {sol.status === "Nova" ? "Iniciar Cotação" :
                                        sol.status === "Cotação" ? `${sol.fornecedores} Cotações` :
                                            "Ver Detalhes"} <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full p-8 text-center text-muted-foreground flex flex-col items-center">
                        <ShoppingCart className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma solicitação encontrada.</p>
                    </div>
                )}
            </div>

        </div>
    );
}

// Temporary Component for Demo purpose inside Procurement
// Normally would put this in an external file but adding here for speed
function ProgressBar({ value, color }: { value: number, color: string }) {
    return (
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
        </div>
    )
}
