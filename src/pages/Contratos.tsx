import { useState } from "react";
import {
    FileSignature,
    Search,
    Plus,
    Building2,
    Phone,
    Mail,
    CalendarDays,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";
import { useData } from "@/components/DataContext";

const tiposContrato = ["Todos", "Conectividade", "Equipamentos", "Software/Cloud", "Serviços"];

export default function Contratos() {
    const { contratos: contratosData, addContrato } = useData();
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("Todos");
    const [selectedContrato, setSelectedContrato] = useState<typeof contratosData[0] | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    // form
    const [newFornecedor, setNewFornecedor] = useState("");
    const [newServico, setNewServico] = useState("");
    const [newVencimento, setNewVencimento] = useState("");
    const [newValor, setNewValor] = useState("");
    const [newTipo, setNewTipo] = useState("");
    const [newSla, setNewSla] = useState("");
    const [newObs, setNewObs] = useState("");
    const { toast } = useToast();
    const { addLog } = useAudit();

    const handleSaveContrato = () => {
        if (!newFornecedor.trim() || !newServico.trim()) {
            toast({ title: "Campos obrigatórios", description: "Preencha Fornecedor e Serviço.", variant: "destructive" });
            return;
        }
        addContrato({
            fornecedor: newFornecedor,
            servico: newServico,
            tipo: newTipo || "Serviços",
            vencimento: newVencimento || "—",
            valorMensal: newValor || "—",
            status: "Ativo",
            contatoNome: "—", contatoTelefone: "—", contatoEmail: "—",
            sla: newSla || "—",
            observacoes: newObs,
        });
        addLog({ user: "Admin", action: "Novo Contrato", details: `Contrato com ${newFornecedor} (${newServico}) cadastrado.`, module: "Contratos" });
        setNewFornecedor(""); setNewServico(""); setNewVencimento(""); setNewValor(""); setNewTipo(""); setNewSla(""); setNewObs("");
        setDialogOpen(false);
        toast({ title: "Contrato salvo!", description: `'${newFornecedor}' adicionado com sucesso.` });
    };

    const filteredContratos = contratosData.filter((c) => {
        const matchSearch =
            search === "" ||
            Object.values(c).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
        const matchTipo = tipoFilter === "Todos" || c.tipo === tipoFilter;
        return matchSearch && matchTipo;
    });

    const getStatusColor = (status: string) => {
        if (status === "Ativo") return "bg-success hover:bg-success/90";
        if (status === "Atenção") return "bg-warning hover:bg-warning/90 text-warning-foreground";
        return "bg-destructive hover:bg-destructive/90";
    };

    const getStatusIcon = (status: string) => {
        if (status === "Ativo") return <CheckCircle2 className="h-3 w-3 mr-1" />;
        if (status === "Atenção") return <AlertCircle className="h-3 w-3 mr-1 text-warning-foreground" />;
        return <AlertCircle className="h-3 w-3 mr-1" />;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contratos & Fornecedores</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Gestão de provedores, links de internet, SLAs e garantias
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Contrato
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Adicionar Novo Contrato</DialogTitle>
                            <DialogDescription>Cadastre um novo contrato de fornecedor de TI.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">Fornecedor *</label>
                                    <Input placeholder="Ex: Vivo Empresas" value={newFornecedor} onChange={(e) => setNewFornecedor(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">Serviço *</label>
                                    <Input placeholder="Ex: Link Dedicado 1Gbps" value={newServico} onChange={(e) => setNewServico(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <Select value={newTipo} onValueChange={setNewTipo}>
                                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Conectividade">Conectividade</SelectItem>
                                            <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                                            <SelectItem value="Software/Cloud">Software/Cloud</SelectItem>
                                            <SelectItem value="Serviços">Serviços</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Vencimento</label>
                                    <Input type="date" value={newVencimento} onChange={(e) => setNewVencimento(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Valor Mensal</label>
                                    <Input placeholder="R$ 0,00" value={newValor} onChange={(e) => setNewValor(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">SLA</label>
                                    <Input placeholder="Ex: 99.9% uptime" value={newSla} onChange={(e) => setNewSla(e.target.value)} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">Observações</label>
                                    <Input placeholder="Notas adicionais..." value={newObs} onChange={(e) => setNewObs(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button type="button" onClick={handleSaveContrato}>Salvar Contrato</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por fornecedor, serviço..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {tiposContrato.map((t) => (
                            <SelectItem key={t} value={t}>
                                {t}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Contracts GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredContratos.map((contrato) => (
                    <Card
                        key={contrato.id}
                        className="shadow-sm hover:shadow-md transition-all cursor-pointer border-t-4 data-[status=Ativo]:border-t-success data-[status=Atenção]:border-t-warning data-[status=Crítico]:border-t-destructive"
                        data-status={contrato.status}
                        onClick={() => setSelectedContrato(contrato)}
                    >
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-accent text-accent-foreground rounded-lg">
                                        <Building2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground line-clamp-1">
                                            {contrato.fornecedor}
                                        </h3>
                                        <p className="text-xs text-muted-foreground">{contrato.tipo}</p>
                                    </div>
                                </div>
                                <Badge variant={contrato.status === "Ativo" ? "default" : "destructive"} className={getStatusColor(contrato.status)}>
                                    {getStatusIcon(contrato.status)}
                                    {contrato.status}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="font-medium text-sm border p-2 rounded-md bg-muted/40">
                                    {contrato.servico}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <CalendarDays className="h-4 w-4" /> Vencimento
                                    </span>
                                    <span className={`font-mono font-medium ${contrato.status === 'Crítico' ? 'text-destructive' : ''}`}>
                                        {contrato.vencimento}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Valor Mensal</span>
                                    <span className="font-mono">{contrato.valorMensal}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredContratos.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        Nenhum contrato ou fornecedor encontrado para o filtro atual.
                    </div>
                )}
            </div>

            {/* Contract Details Dialog */}
            <Dialog open={!!selectedContrato} onOpenChange={() => setSelectedContrato(null)}>
                <DialogContent className="sm:max-w-lg">
                    {selectedContrato && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between mt-1 mb-2">
                                    <Badge variant="outline" className="uppercase text-[10px]">
                                        {selectedContrato.tipo}
                                    </Badge>
                                    <Badge variant="secondary" className={getStatusColor(selectedContrato.status)}>
                                        {selectedContrato.status}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-xl flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    {selectedContrato.fornecedor}
                                </DialogTitle>
                                <DialogDescription className="text-base font-medium text-foreground">
                                    {selectedContrato.servico}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-5 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CalendarDays className="h-3 w-3" /> Data de Vencimento
                                        </span>
                                        <p className={`font-mono text-sm font-medium ${selectedContrato.status === 'Crítico' ? 'text-destructive' : ''}`}>
                                            {selectedContrato.vencimento}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs text-muted-foreground">Valor</span>
                                        <p className="font-mono text-sm font-medium">{selectedContrato.valorMensal}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <FileSignature className="h-4 w-4 text-muted-foreground" />
                                        Detalhes do Acordo (SLA)
                                    </h4>
                                    <p className="text-sm border p-3 rounded-md bg-muted/30">
                                        {selectedContrato.sla}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Contatos do Fornecedor</h4>
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Responsável</span>
                                            <span className="font-medium">{selectedContrato.contatoNome}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Telefones</span>
                                            <span className="font-mono">{selectedContrato.contatoTelefone}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> E-mail</span>
                                            <span className="font-medium text-primary hover:underline cursor-pointer">
                                                {selectedContrato.contatoEmail}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {selectedContrato.observacoes && (
                                    <div className="pt-2">
                                        <p className="text-xs text-muted-foreground">
                                            <strong className="text-foreground">Obs:</strong> {selectedContrato.observacoes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t">
                                <Button variant="outline" onClick={() => setSelectedContrato(null)}>Fechar</Button>
                                <Button className="gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Ver Arquivo (PDF)
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
