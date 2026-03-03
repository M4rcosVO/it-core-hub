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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

// Mock data
const computers = [
  { id: 1, hostname: "WKS-ADM-001", processor: "Intel i7-13700", ram: "16GB", storage: "512GB SSD", serviceTag: "DELL-8X7K2M3", setor: "Administrativo", responsavel: "Carlos Silva", localizacao: "Sala 201", termoAssinado: true },
  { id: 2, hostname: "WKS-FIN-012", processor: "Intel i5-12400", ram: "8GB", storage: "256GB SSD", serviceTag: "DELL-3F9L1N7", setor: "Financeiro", responsavel: "Ana Costa", localizacao: "Sala 105", termoAssinado: false },
  { id: 3, hostname: "NTB-COM-045", processor: "Intel i7-1365U", ram: "16GB", storage: "512GB SSD", serviceTag: "DELL-7R2P4K8", setor: "Comercial", responsavel: "Pedro Mendes", localizacao: "Móvel", termoAssinado: false },
  { id: 4, hostname: "WKS-RH-003", processor: "AMD Ryzen 5 5600", ram: "16GB", storage: "512GB NVMe", serviceTag: "LNV-9Q3M7X1", setor: "RH", responsavel: "Juliana Rocha", localizacao: "Sala 302", termoAssinado: true },
  { id: 5, hostname: "WKS-TI-007", processor: "Intel i9-13900K", ram: "32GB", storage: "1TB NVMe", serviceTag: "DELL-2K5N8W4", setor: "TI", responsavel: "Lucas Ferreira", localizacao: "Sala 400", termoAssinado: true },
];

const mobiles = [
  { id: 1, modelo: "iPhone 15 Pro", imei1: "354832109876543", imei2: "—", telefone: "(11) 99876-5432", operadora: "Vivo", conta: "maria.s@gellak.com", responsavel: "Maria Santos", termoAssinado: true },
  { id: 2, modelo: "Samsung Galaxy S24", imei1: "352456789012345", imei2: "352456789012346", telefone: "(11) 98765-4321", operadora: "Claro", conta: "joao.a@gmail.com", responsavel: "João Almeida", termoAssinado: false },
  { id: 3, modelo: "iPhone 14", imei1: "356789012345678", imei2: "—", telefone: "(11) 97654-3210", operadora: "TIM", conta: "ana.c@gellak.com", responsavel: "Ana Costa", termoAssinado: true },
];

const peripherals = [
  { id: 1, tipo: "Impressora", modelo: "HP LaserJet Pro M404", serial: "VNB3K12345", setor: "Administrativo", localizacao: "Sala 201", ip: "192.168.1.50" },
  { id: 2, tipo: "Monitor", modelo: "Dell U2723QE 27\"", serial: "CN-0FK3M2", setor: "TI", localizacao: "Sala 400", ip: "—" },
  { id: 3, tipo: "Scanner", modelo: "Fujitsu ScanSnap iX1600", serial: "FJSC87654", setor: "Financeiro", localizacao: "Sala 105", ip: "192.168.1.55" },
];

const setores = ["Todos", "Administrativo", "Financeiro", "Comercial", "RH", "TI"];

export default function Inventario() {
  const [search, setSearch] = useState("");
  const [setorFilter, setSetorFilter] = useState("Todos");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetType, setAssetType] = useState<"computer" | "mobile" | "peripheral" | null>(null);
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

  const openDetail = (asset: any, type: "computer" | "mobile" | "peripheral") => {
    setSelectedAsset(asset);
    setAssetType(type);
  };

  const handleGenerateQR = () => {
    toast({ title: "QR Code Gerado", description: `QR Code do ativo gerado com sucesso.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão de ativos de hardware</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Ativo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por hostname, responsável, serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
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
      </Tabs>

      {/* Detail Drawer */}
      <Sheet open={!!selectedAsset} onOpenChange={() => { setSelectedAsset(null); setAssetType(null); }}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {assetType === "computer" && selectedAsset?.hostname}
              {assetType === "mobile" && selectedAsset?.modelo}
              {assetType === "peripheral" && selectedAsset?.modelo}
            </SheetTitle>
            <SheetDescription>Detalhes do ativo</SheetDescription>
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
                  <DetailRow label="Setor" value={selectedAsset.setor} />
                  <DetailRow label="Localização" value={selectedAsset.localizacao} />
                  <DetailRow label="IP" value={selectedAsset.ip} mono />
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

              <Separator />

              <Button variant="outline" className="w-full gap-2" onClick={handleGenerateQR}>
                <QrCode className="h-4 w-4" />
                Gerar QR Code do Ativo
              </Button>
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
