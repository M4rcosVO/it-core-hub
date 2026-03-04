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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Mock data
const contratosData = [
    {
        id: 1,
        fornecedor: "Vivo Empresas",
        servico: "Link Internet Dedicado 1Gbps",
        tipo: "Conectividade",
        vencimento: "15/12/2026",
        valorMensal: "R$ 1.250,00",
        status: "Ativo",
        contatoNome: "Ana Gerente de Contas",
        contatoTelefone: "(11) 99999-1111",
        contatoEmail: "ana.corp@vivo.com.br",
        sla: "99.9% uptime, 4h reparo",
        observacoes: "Link primário da matriz. Possui IP Fixo x.x.x.x.",
    },
    {
        id: 2,
        fornecedor: "Claro Fibra",
        servico: "Link Backup 600Mbps",
        tipo: "Conectividade",
        vencimento: "20/05/2025",
        valorMensal: "R$ 300,00",
        status: "Atenção",
        contatoNome: "Suporte B2B Claro",
        contatoTelefone: "0800 720 1234",
        contatoEmail: "b2b@claro.com.br",
        sla: "24h reparo",
        observacoes: "Link secundário configurado em failover no FortiGate.",
    },
    {
        id: 3,
        fornecedor: "Simpress",
        servico: "Outsourcing de Impressão (3 Maq.)",
        tipo: "Equipamentos",
        vencimento: "10/01/2025",
        valorMensal: "R$ 850,00",
        status: "Ativo",
        contatoNome: "Técnico Regional",
        contatoTelefone: "(11) 4004-9999",
        contatoEmail: "suporte@simpress.com.br",
        sla: "NBD (Next Business Day) para peças",
        observacoes: "Inclui franquia de 10.000 cópias P&B mês.",
    },
    {
        id: 4,
        fornecedor: "Locaweb",
        servico: "Hospedagem Site + E-mail",
        tipo: "Software/Cloud",
        vencimento: "05/08/2025",
        valorMensal: "R$ 120,00",
        status: "Ativo",
        contatoNome: "Painel Locaweb",
        contatoTelefone: "(11) 3544-0444",
        contatoEmail: "—",
        sla: "99.8% uptime",
        observacoes: "Renovação automática no cartão corporativo.",
    },
    {
        id: 5,
        fornecedor: "Dell Computadores",
        servico: "Garantia ProSupport Servers",
        tipo: "Equipamentos",
        vencimento: "20/11/2024",
        valorMensal: "Pagamento Anual",
        status: "Crítico",
        contatoNome: "Dell ProSupport",
        contatoTelefone: "0800 970 3355",
        contatoEmail: "—",
        sla: "Atendimento on-site 4h",
        observacoes: "Urgente: Renovar para manter cobertura do SRV-ERP-01.",
    },
];

const tiposContrato = ["Todos", "Conectividade", "Equipamentos", "Software/Cloud", "Serviços"];

export default function Contratos() {
    const [search, setSearch] = useState("");
    const [tipoFilter, setTipoFilter] = useState("Todos");
    const [selectedContrato, setSelectedContrato] = useState<any>(null);

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
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Contrato
                </Button>
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
