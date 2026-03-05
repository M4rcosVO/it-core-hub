import { useState } from "react";
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
} from "lucide-react";
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
import { computers, mobiles, peripherals, softwares, emprestimos } from "@/data/mockData";

const setores = ["Todos", "Administrativo", "Financeiro", "Comercial", "RH", "TI"];

const dependencies = [
  { service: "ERP Gellak (Totvs)", critical: "Alta", deps: ["SRV-ERP-01 (Servidor)", "SW-CORE-01 (Switch)", "Link Vivo (Internet)"], status: "Ativo" },
  { service: "E-mail Corporativo", critical: "Alta", deps: ["Office 365 (SaaS)", "Link Vivo", "Link Claro (Backup)"], status: "Ativo" },
  { service: "Arquivos Compartilhados", critical: "Média", deps: ["SRV-FILE-01", "SW-CORE-01"], status: "Ativo" },
  { service: "VPN Matriz", critical: "Média", deps: ["Firewall Fortinet", "Link Vivo"], status: "Ativo" },
];

export default function Inventario() {
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState("Todos");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assetType, setAssetType] = useState<"computer" | "mobile" | "peripheral" | "software" | null>(null);
  const { toast } = useToast();

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
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de ativos de hardware</p>
        </div>
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

      {/* Filters & Export */}
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
        <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Tabs defaultValue="computers">
        <TabsList>
          <TabsTrigger value="computers" className="gap-2">
            <Monitor className="h-4 w-4" />
            Computadores
          </TabsTrigger>
          <TabsTrigger value="mobiles" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Dispositivos Móveis
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
                      <th className="text-left p-3 font-medium text-muted-foreground">Hostname</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Processador</th>
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
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => openDetail(c, "computer")}
                      >
                        <td className="p-3 font-mono text-xs font-medium">{c.hostname}</td>
                        <td className="p-3 hidden md:table-cell">{c.processor}</td>
                        <td className="p-3 hidden lg:table-cell">{c.ram}</td>
                        <td className="p-3">{c.setor}</td>
                        <td className="p-3">{c.responsavel}</td>
                        <td className="p-3">
                          <Badge variant={c.termoAssinado ? "default" : "destructive"} className={c.termoAssinado ? "bg-success hover:bg-success/90" : ""}>
                            {c.termoAssinado ? "Assinado" : "Pendente"}
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

        <TabsContent value="mobiles" className="mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Modelo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Operadora</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Responsável</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Termo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMobiles.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => openDetail(m, "mobile")}
                      >
                        <td className="p-3 font-medium">{m.modelo}</td>
                        <td className="p-3 hidden md:table-cell font-mono text-xs">{m.telefone}</td>
                        <td className="p-3">{m.operadora}</td>
                        <td className="p-3">{m.responsavel}</td>
                        <td className="p-3">
                          <Badge variant={m.termoAssinado ? "default" : "destructive"} className={m.termoAssinado ? "bg-success hover:bg-success/90" : ""}>
                            {m.termoAssinado ? "Assinado" : "Pendente"}
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

        <TabsContent value="peripherals" className="mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Modelo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Serial</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Setor</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPeripherals.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => openDetail(p, "peripheral")}
                      >
                        <td className="p-3">{p.tipo}</td>
                        <td className="p-3 font-medium">{p.modelo}</td>
                        <td className="p-3 hidden md:table-cell font-mono text-xs">{p.serial}</td>
                        <td className="p-3">{p.setor}</td>
                        <td className="p-3 hidden lg:table-cell font-mono text-xs">{p.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="softwares" className="mt-4">
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Software</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Fabricante</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Licença</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-center">Uso / Total</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Vencimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSoftwares.map((s) => {
                      const usoAgendado = (s.assigned / s.qtd) * 100;
                      return (
                        <tr
                          key={s.id}
                          className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => openDetail(s, "software")}
                        >
                          <td className="p-3 font-medium">{s.nome}</td>
                          <td className="p-3">{s.fabricante}</td>
                          <td className="p-3">
                            <Badge variant="outline">{s.licenca}</Badge>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-mono ${usoAgendado >= 90 ? "text-destructive" : usoAgendado >= 75 ? "text-warning" : "text-success"}`}>
                              {s.assigned}
                            </span>
                            <span className="text-muted-foreground mx-1">/</span>
                            <span>{s.qtd}</span>
                          </td>
                          <td className="p-3 hidden md:table-cell">{s.vencimento}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emprestimos" className="mt-4">
          <div className="flex justify-end mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Registrar Empréstimo</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Empréstimo</DialogTitle>
                  <DialogDescription>
                    Registre a saída temporária de um equipamento.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Equipamento</label>
                    <Input placeholder="Ex: Notebook NTB-COM-045" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Solicitante</label>
                    <Input placeholder="Ex: Pedro Mendes" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Retirada</label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prev. Devolução</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motivo</label>
                    <Input placeholder="Ex: Viagem, Evento..." />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">Salvar Registro</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Equipamento</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Solicitante</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Retirada</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Prev. Devolução</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emprestimos.map((e) => (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{e.equipamento}</td>
                        <td className="p-3">{e.solicitante}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{e.dataRetirada}</td>
                        <td className="p-3 font-mono text-xs hidden sm:table-cell text-muted-foreground">{e.previsaoDevolucao}</td>
                        <td className="p-3">
                          <Badge variant={e.status === "Emprestado" ? "secondary" : e.status === "Atrasado" ? "destructive" : "outline"}
                            className={e.status === "Emprestado" ? "bg-warning hover:bg-warning/90 text-warning-foreground" : ""}>
                            {e.status}
                          </Badge>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{e.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deps" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4" /> Mapeamento de Dependências (ITSM)
              </CardTitle>
              <CardDescription>Visualize o impacto de falhas em ativos críticos.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dependencies.map((dep, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-sm">{dep.service}</h4>
                      <Badge variant={dep.critical === "Alta" ? "destructive" : "secondary"}>{dep.critical}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase text-muted-foreground font-semibold">Depende de:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dep.deps.map((d, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs bg-background border px-2 py-1 rounded">
                            <Network className="h-3 w-3 text-primary" />
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
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
                  className={selectedAsset.status === "Ativo" ? "bg-success hover:bg-success/90" : selectedAsset.status === "Em Manutenção" ? "bg-warning hover:bg-warning/90 text-warning-foreground" : ""}>
                  {selectedAsset.status}
                </Badge>
              )}
            </div>
            <SheetDescription>Detalhes do {assetType === "software" ? "software" : "ativo"}</SheetDescription>
          </SheetHeader>

          {selectedAsset && (
            <div className="mt-6 space-y-6">
              {/* Computer details */}
              {assetType === "computer" && (
                <div className="space-y-4">
                  <DetailRow label="Hostname" value={selectedAsset.hostname} mono />
                  <DetailRow label="Processador" value={selectedAsset.processor} />
                  <DetailRow label="Memória RAM" value={selectedAsset.ram} />
                  <DetailRow label="Armazenamento" value={selectedAsset.storage} />
                  <DetailRow label="Service Tag" value={selectedAsset.serviceTag} mono />
                  <DetailRow label="Data de Compra" value={selectedAsset.dataCompra} />
                  <DetailRow label="Vencimento Garantia" value={selectedAsset.garantia} />
                  <DetailRow label="Setor" value={selectedAsset.setor} />
                  <DetailRow label="Responsável" value={selectedAsset.responsavel} />
                  <DetailRow label="Localização" value={selectedAsset.localizacao} />
                </div>
              )}

              {/* Mobile details */}
              {assetType === "mobile" && (
                <div className="space-y-4">
                  <DetailRow label="Modelo" value={selectedAsset.modelo} />
                  <DetailRow label="IMEI 1" value={selectedAsset.imei1} mono />
                  <DetailRow label="IMEI 2" value={selectedAsset.imei2} mono />
                  <DetailRow label="Telefone" value={selectedAsset.telefone} mono />
                  <DetailRow label="Operadora" value={selectedAsset.operadora} />
                  <DetailRow label="Data de Compra" value={selectedAsset.dataCompra} />
                  <DetailRow label="Vencimento Garantia" value={selectedAsset.garantia} />
                  <DetailRow label="Conta Vinculada" value={selectedAsset.conta} mono />
                  <DetailRow label="Responsável" value={selectedAsset.responsavel} />
                </div>
              )}

              {/* Peripheral details */}
              {assetType === "peripheral" && (
                <div className="space-y-4">
                  <DetailRow label="Tipo" value={selectedAsset.tipo} />
                  <DetailRow label="Modelo" value={selectedAsset.modelo} />
                  <DetailRow label="Serial" value={selectedAsset.serial} mono />
                  <DetailRow label="Data de Compra" value={selectedAsset.dataCompra} />
                  <DetailRow label="Vencimento Garantia" value={selectedAsset.garantia} />
                  <DetailRow label="Setor" value={selectedAsset.setor} />
                  <DetailRow label="Localização" value={selectedAsset.localizacao} />
                  <DetailRow label="IP" value={selectedAsset.ip} mono />
                </div>
              )}

              {/* Software details */}
              {assetType === "software" && (
                <div className="space-y-4">
                  <DetailRow label="Software" value={selectedAsset.nome} />
                  <DetailRow label="Fabricante" value={selectedAsset.fabricante} />
                  <DetailRow label="Tipo de Licença" value={selectedAsset.licenca} />
                  <DetailRow label="Total de Licenças" value={String(selectedAsset.qtd)} mono />
                  <DetailRow label="Licenças em Uso" value={String(selectedAsset.assigned)} mono />
                  <DetailRow label="Vencimento" value={selectedAsset.vencimento} />
                </div>
              )}

              <Separator />

              {/* Termo de responsabilidade */}
              {(assetType === "computer" || assetType === "mobile") && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Termo de Responsabilidade</h3>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedAsset.termoAssinado ? "Documento assinado" : "Documento pendente"}
                      </span>
                    </div>
                    <Badge variant={selectedAsset.termoAssinado ? "default" : "destructive"} className={selectedAsset.termoAssinado ? "bg-success hover:bg-success/90" : ""}>
                      {selectedAsset.termoAssinado ? "Assinado" : "Pendente"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      Upload PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {selectedAsset.historico && selectedAsset.historico.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <History className="h-4 w-4 text-muted-foreground" />
                      Histórico do Ativo
                    </h3>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
                      {selectedAsset.historico.map((h: { evento: string; data: string; usuario: string; }, i: number) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-background bg-muted text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                            {h.evento === "Manutenção" || h.evento === "Troca de Tela" ? (
                              <Wrench className="w-2.5 h-2.5 text-warning" />
                            ) : h.evento === "Devolução" ? (
                              <Archive className="w-2.5 h-2.5 text-muted-foreground" />
                            ) : (
                              <CheckCircle className="w-2.5 h-2.5 text-success" />
                            )}
                          </div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] border rounded-lg p-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm text-foreground">{h.evento}</span>
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono font-normal">
                                {h.data}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">Responsável: <span className="text-foreground">{h.usuario}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <Separator />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <QrCode className="h-4 w-4" />
                    Visualizar QR Code de Patrimônio
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-center">Etiqueta de Patrimônio</DialogTitle>
                    <DialogDescription className="text-center">
                      Escaneie para acessar o prontuário deste ativo no sistema.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="bg-white p-4 rounded-xl border shadow-sm">
                      <QRCode
                        value={`GELLAK-ASSET-${selectedAsset.id}-${assetType}`}
                        size={180}
                        level="H"
                      />
                    </div>
                    <p className="mt-4 font-mono text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                      ID: GLK-{selectedAsset.id}-{assetType?.substring(0, 3)}
                    </p>
                  </div>
                  <DialogFooter className="sm:justify-center">
                    <Button variant="default" className="w-full gap-2" onClick={handleGenerateQR}>
                      <Printer className="h-4 w-4" />
                      Imprimir Etiqueta
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
