import { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Printer,
  Search,
  Plus,
  QrCode,
  Upload,
  Download,
  FileText,
  X,
  ChevronDown,
  History,
  Calendar,
  AppWindow,
  CheckCircle,
  Clock,
  Archive,
  Wrench,
  BriefcaseBusiness,
  ShieldAlert,
  Info,
  Network,
  GitGraph,
  Layers,
  Printer as PrintIcon,
  CheckSquare,
  Square,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { computers, mobiles, peripherals, softwares, emprestimos, setores } from "@/data/mockData";
import { useAuth } from "@/components/AuthContext";
import { useAudit } from "@/components/AuditContext";
import { TableSkeleton } from "@/components/LoadingSkeletons";



const dependencies = [
  { service: "ERP Gellak (Totvs)", critical: "Alta", deps: ["SRV-ERP-01 (Servidor)", "SW-CORE-01 (Switch)", "Link Vivo (Internet)"], status: "Ativo" },
  { service: "E-mail Corporativo", critical: "Alta", deps: ["Office 365 (SaaS)", "Link Vivo", "Link Claro (Backup)"], status: "Ativo" },
  { service: "Arquivos Compartilhados", critical: "Média", deps: ["SRV-FILE-01", "SW-CORE-01"], status: "Ativo" },
  { service: "VPN Matriz", critical: "Média", deps: ["Firewall Fortinet", "Link Vivo"], status: "Ativo" },
];

export default function Inventario() {
  const { userRole } = useAuth();
  const isReadOnly = userRole === "Auditor";
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState("Todos");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assetType, setAssetType] = useState<"computer" | "mobile" | "peripheral" | "software" | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<number[]>([]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const { toast } = useToast();
  const { addLog } = useAudit();

  const [selectedAuditAsset, setSelectedAuditAsset] = useState<any | null>(null);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  const [auditSearchId, setAuditSearchId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulateScan = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const allAssets = [...computers, ...mobiles, ...peripherals];
      const randomAsset = allAssets[Math.floor(Math.random() * allAssets.length)];
      setSelectedAuditAsset(randomAsset);
      setIsVerifying(false);
      toast({ title: "Ativo Identificado", description: `Patrimônio ${randomAsset.patrimonio} lido com sucesso.` });
      addLog({
        user: "Usuário Logado", // Fallback until actual user name is available
        action: "Auditoria QR",
        details: `Escaneou ativo ${randomAsset.patrimonio} (${(randomAsset as any).hostname || (randomAsset as any).modelo})`,
        module: 'Inventário'
      });
    }, 1500);
  };

  const togglePrintSelection = (id: number) => {
    setSelectedForPrint(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const assetsToPrint = [
    ...computers,
    ...mobiles,
    ...peripherals
  ].filter(a => selectedForPrint.includes(a.id));

  const handlePrint = () => {
    window.print();
  };

  const filteredComputers = computers.filter((c) => {
    const matchSearch = search === "" || Object.values(c).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchSetor = setorFilter === "Todos" || c.setor === setorFilter;
    return matchSearch && matchSetor;
  });

  const filteredMobiles = mobiles.filter((m) => {
    const matchSearch = search === "" || Object.values(m).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  const filteredPeripherals = peripherals.filter((p) => {
    const matchSearch = search === "" || Object.values(p).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchSetor = setorFilter === "Todos" || p.setor === setorFilter;
    return matchSearch && matchSetor;
  });

  const filteredSoftwares = softwares.filter((s) => {
    return search === "" || Object.values(s).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDetail = (asset: any, type: "computer" | "mobile" | "peripheral" | "software") => {
    setSelectedAsset(asset);
    setAssetType(type);
  };

  const handleGenerateQR = () => {
    toast({ title: "QR Code Gerado", description: `QR Code do ativo gerado com sucesso.` });
  };

  const handleExportCSV = () => {
    let dataToExport: Record<string, unknown>[] = [];
    let filename = "";

    // Exportação simples da aba ativa focada nos Computadores por enquanto
    dataToExport = filteredComputers.map(c => ({
      ...c,
      termoAssinado: c.termoAssinado ? "Sim" : "Não"
    }));
    filename = "IT_Inventario_Computadores";

    if (dataToExport.length === 0) return;

    // Converte para CSV
    const headers = Object.keys(dataToExport[0]).filter(k => k !== "historico").join(",");
    const rows = dataToExport.map(obj =>
      Object.keys(obj)
        .filter(k => k !== "historico")
        .map(k => `"${String(obj[k]).replace(/"/g, '""')}"`)
        .join(",")
    ).join("\n");

    const csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(headers + "\n" + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Exportação Concluída",
      description: "O arquivo CSV foi baixado com sucesso.",
    });

    addLog({
      user: "Usuário Logado",
      action: "Exportação CSV",
      details: "Exportou inventário de computadores",
      module: 'Inventário'
    });
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de ativos de hardware</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Auditoria QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Auditoria de Ativos por QR</DialogTitle>
                  <DialogDescription>
                    Escaneie o QR Code ou digite o ID do patrimônio para verificar o status e detalhes do ativo.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                  <div className={`relative h-48 w-48 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30 overflow-hidden transition-all ${isVerifying ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    {isVerifying ? (
                      <div className="absolute inset-x-0 h-1 bg-primary animate-scan-line top-0 shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                    ) : (
                      <QrCode className="h-20 w-20 text-muted-foreground/40" />
                    )}
                    {selectedAuditAsset && !isVerifying && (
                      <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-4">
                        <CheckCircle className="h-10 w-10 text-success mb-2" />
                        <p className="text-xs font-bold font-mono">{selectedAuditAsset.patrimonio}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedAuditAsset.hostname || selectedAuditAsset.modelo}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">ID Patrimônio</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: TI-001"
                        value={auditSearchId}
                        onChange={(e) => setAuditSearchId(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <Button size="icon" onClick={handleSimulateScan} disabled={isVerifying}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedAuditAsset && (
                    <div className="w-full bg-accent/30 rounded-lg p-3 space-y-2 border animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="default" className="bg-success text-[9px] h-4">{selectedAuditAsset.status}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Responsável:</span>
                        <span className="font-medium text-right">{selectedAuditAsset.responsavel}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Setor:</span>
                        <span className="font-medium">{selectedAuditAsset.setor}</span>
                      </div>
                    </div>
                  )}

                  <Button className="w-full gap-2" variant="secondary" onClick={handleSimulateScan} disabled={isVerifying}>
                    <QrCode className="h-4 w-4" />
                    Simular Scan de Câmera
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => {
                    setSelectedAuditAsset(null);
                    setAuditSearchId("");
                    setIsAuditDialogOpen(false);
                  }}>Concluir</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Ativo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Ativo</DialogTitle>
                  <DialogDescription>
                    Adicione um novo hardware ou software ao inventário da TI.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo de Ativo</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer">Computador / Notebook</SelectItem>
                        <SelectItem value="mobile">Smartphone / Tablet</SelectItem>
                        <SelectItem value="peripheral">Periférico (Monitor, Impressora)</SelectItem>
                        <SelectItem value="software">Software / Licença</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Identificador (Hostname / Modelo / Nome)</label>
                    <Input placeholder="Ex: WKS-ADM-002" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Responsável / Setor</label>
                    <Input placeholder="Ex: Financeiro" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Aquisição</label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Garantia / Vencimento</label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">Salvar Ativo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por hostname, responsável, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={setorFilter} onValueChange={setSetorFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {setores.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {selectedForPrint.length > 0 && !isReadOnly && (
            <>
              <Button variant="outline" className="gap-2 border-primary text-primary" onClick={() => setIsPrintDialogOpen(true)}>
                <PrintIcon className="h-4 w-4" />
                Etiquetas ({selectedForPrint.length})
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    Ações em Massa <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações ({selectedForPrint.length} ativos)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast({ title: "Setor Alterado", description: "Ativos movidos para o novo setor com sucesso." })}>
                    <Share2 className="mr-2 h-4 w-4" /> Alterar Setor
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => {
                    setSelectedForPrint([]);
                    toast({ title: "Ativos Excluídos", description: "Os itens selecionados foram removidos do sistema." });
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Selecionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            CSV
          </Button>

          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <FileText className="h-4 w-4" />
            Relatório PDF
          </Button>
        </div>
      </div>

      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PrintIcon className="h-5 w-5" /> Gerador de Etiquetas em Lote
            </DialogTitle>
            <DialogDescription>
              Visualize e imprima as etiquetas dos ativos selecionados. Use 'Ctrl + P' ou o botão Imprimir.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-8 print:p-0 print:grid-cols-3 print:gap-4 print:block">
            {assetsToPrint.map((asset) => (
              <div key={asset.id} className="border-2 border-black p-4 rounded-none flex flex-col items-center justify-center space-y-2 bg-white text-black print:page-break-inside-avoid print:mb-8 print:border print:w-[6cm] print:h-[4cm] print:inline-flex mx-auto">
                <div className="text-[10px] font-bold uppercase tracking-tighter text-center line-clamp-1 w-full border-b border-black pb-1 mb-1">
                  GELLAK IT - {asset.patrimonio || `ID: ${asset.id}`}
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="bg-white p-1">
                    <QRCode value={`https://it.gellak.com.br/asset/${asset.id}`} size={64} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[11px] font-bold truncate leading-none">{(asset as any).modelo || (asset as any).nome}</p>
                    <p className="text-[9px] text-gray-700 truncate">{(asset as any).setor || "Estoque"}</p>
                    <p className="text-[8px] font-mono mt-1 opacity-70">SN: {(asset as any).serial || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="ghost" onClick={() => setSelectedForPrint([])}>Limpar Seleção</Button>
            <Button onClick={handlePrint} className="gap-2">
              <PrintIcon className="h-4 w-4" /> Imprimir Etiquetas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="computers">
        <TabsList>
          <TabsTrigger value="computers" className="gap-2">
            <Monitor className="h-4 w-4" />
            Computadores
          </TabsTrigger>
          <TabsTrigger value="mobiles" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Móveis
          </TabsTrigger>
          <TabsTrigger value="peripherals" className="gap-2">
            <Printer className="h-4 w-4" />
            Periféricos
          </TabsTrigger>
          <TabsTrigger value="softwares" className="gap-2">
            <AppWindow className="h-4 w-4" />
            Softwares
          </TabsTrigger>
          <TabsTrigger value="emprestimos" className="gap-2">
            <BriefcaseBusiness className="h-4 w-4" />
            Empréstimos
          </TabsTrigger>
          <TabsTrigger value="deps" className="gap-2">
            <GitGraph className="h-4 w-4" />
            Dependências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="computers" className="mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-[40px] p-3 text-center">
                        <PrintIcon className="h-3 w-3 inline" />
                      </th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Hostname</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">CPU</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">RAM</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Setor</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Termo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComputers.map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${selectedForPrint.includes(c.id) ? 'bg-primary/5' : ''}`}
                        onClick={() => openDetail(c, "computer")}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => togglePrintSelection(c.id)}
                            className={`p-1 rounded border transition-colors ${selectedForPrint.includes(c.id) ? 'bg-primary border-primary text-primary-foreground' : 'text-muted-foreground border-border hover:border-primary'}`}
                          >
                            {selectedForPrint.includes(c.id) ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                          </button>
                        </td>
                        <td className="p-3 font-mono text-xs font-medium">{c.hostname}</td>
                        <td className="p-3 hidden md:table-cell">{c.processador}</td>
                        <td className="p-3 hidden lg:table-cell">{c.ram}</td>
                        <td className="p-3">{c.setor}</td>
                        <td className="p-3">{c.responsavel}</td>
                        <td className="p-3">
                          <Badge variant={c.termoAssinado ? "default" : "destructive"} className={c.termoAssinado ? "bg-success hover:bg-success/90" : ""}>
                            {c.termoAssinado ? "SIM" : "NÃO"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* ... Other Tabs contents would follow similar pattern ... */}
      </Tabs>

      <Sheet open={!!selectedAsset} onOpenChange={() => { setSelectedAsset(null); setAssetType(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between mt-2">
              <SheetTitle>
                {assetType === "computer" && selectedAsset?.hostname}
                {assetType === "mobile" && selectedAsset?.modelo}
                {assetType === "peripheral" && selectedAsset?.modelo}
                {assetType === "software" && selectedAsset?.nome}
              </SheetTitle>
              {selectedAsset?.status && (
                <Badge variant={selectedAsset.status === "Ativo" ? "default" : selectedAsset.status === "Em Manutenção" ? "secondary" : "destructive"}
                  className={selectedAsset.status === "Ativo" ? "bg-success hover:bg-success/90" : ""}>
                  {selectedAsset.status}
                </Badge>
              )}
            </div>
            <SheetDescription>Detalhes do ativo</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {/* Simple details view */}
            {selectedAsset && Object.entries(selectedAsset).filter(([k]) => k !== 'historico' && k !== 'icon').map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 border-b last:border-0 border-dashed">
                <span className="text-xs text-muted-foreground uppercase font-bold">{key}</span>
                <span className="text-sm font-medium">{String(val)}</span>
              </div>
            ))}

            <Separator className="my-4" />

            {/* Lifecycle Timeline */}
            <div className="space-y-4 pb-8">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Linha do Tempo do Ativo
              </h3>
              <div className="relative pl-4 border-l-2 border-muted space-y-6 ml-2">
                {(selectedAsset?.historico || []).length > 0 ? (selectedAsset as any).historico.map((h: any, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 px-1 bg-background">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{h.evento}</span>
                      <span className="text-[10px] text-muted-foreground">{h.data} • {h.usuario}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-muted-foreground italic">Nenhum evento registrado.</div>
                )}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 px-1 bg-background">
                    <div className="h-2 w-2 rounded-full bg-muted border-2 border-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Estado Atual: {selectedAsset?.status}</span>
                    <span className="text-[10px] text-muted-foreground">Monitorado via IT Core Hub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
