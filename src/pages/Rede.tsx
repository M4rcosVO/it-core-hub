import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Shield,
  Globe,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Network as NetworkIcon,
  Server,
  Activity,
  GitGraph,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  Cpu,
  Smartphone as Phone,
  Printer as Print,
  ArrowRight,
  Monitor
} from "lucide-react";
import { usePrivacy } from "@/components/PrivacyContext";
import { useToast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";

const initialVpnUsers = [
  { id: 1, nome: "Carlos Silva", login: "carlos.silva", status: "Ativo", criacao: "15/01/2024" },
  { id: 2, nome: "Ana Costa", login: "ana.costa", status: "Ativo", criacao: "20/03/2024" },
  { id: 3, nome: "João Almeida", login: "joao.almeida", status: "Inativo", criacao: "10/06/2023" },
  { id: 4, nome: "Maria Santos", login: "maria.santos", status: "Ativo", criacao: "05/09/2024" },
  { id: 5, nome: "Pedro Mendes", login: "pedro.mendes", status: "Inativo", criacao: "22/11/2023" },
];

const initialIpList = [
  { ip: "192.168.1.10", dispositivo: "SRV-ERP-01", setor: "Datacenter" },
  { ip: "192.168.1.11", dispositivo: "SRV-FILE-01", setor: "Datacenter" },
  { ip: "192.168.1.20", dispositivo: "WKS-ADM-001", setor: "Administrativo" },
  { ip: "192.168.1.50", dispositivo: "HP LaserJet M404", setor: "Administrativo" },
  { ip: "192.168.1.55", dispositivo: "Fujitsu ScanSnap", setor: "Financeiro" },
  { ip: "192.168.1.100", dispositivo: "AP-WIFI-01", setor: "TI" },
  { ip: "192.168.1.101", dispositivo: "AP-WIFI-02", setor: "Comercial" },
  { ip: "10.0.0.1", dispositivo: "Firewall Fortinet", setor: "Datacenter" },
];

const vlansList = [
  { id: 10, nome: "Servidores & Infra", faixa: "10.0.10.0/24", gateway: "10.0.10.1", dhcp: false, observacao: "Datacenter e Core" },
  { id: 20, nome: "Administrativo", faixa: "10.0.20.0/24", gateway: "10.0.20.1", dhcp: true, observacao: "PCs, Impressoras ADM" },
  { id: 30, nome: "Wi-Fi Corporativo", faixa: "10.0.30.0/24", gateway: "10.0.30.1", dhcp: true, observacao: "Acesso de funcionarios" },
  { id: 40, nome: "Wi-Fi Visitantes", faixa: "192.168.100.0/24", gateway: "192.168.100.1", dhcp: true, observacao: "Isolada da rede interna" },
];

const switchList = [
  {
    hostname: "SW-CORE-01",
    modelo: "Cisco Catalyst 9300",
    ip: "10.0.10.2",
    local: "Rack 01 - Datacenter",
    portas: [
      { porta: "Gi1/0/1", status: "up", vlan: 10, conectado: "Firewall Fortinet (Uplink)" },
      { porta: "Gi1/0/2", status: "up", vlan: 10, conectado: "SRV-ERP-01" },
      { porta: "Gi1/0/3", status: "up", vlan: 10, conectado: "SRV-FILE-01" },
      { porta: "Gi1/0/4", status: "down", vlan: 10, conectado: "Livre" },
      { porta: "Gi1/0/24", status: "up", vlan: "Trunk", conectado: "SW-ACCESS-01 (Cascata)" },
    ],
  },
  {
    hostname: "SW-ACCESS-01",
    modelo: "Aruba 2930F 24G",
    ip: "10.0.10.3",
    local: "Rack 02 - ADM",
    portas: [
      { porta: "1", status: "up", vlan: 20, conectado: "WKS-ADM-001 (Mesa Carlos)" },
      { porta: "2", status: "up", vlan: 20, conectado: "WKS-FIN-012 (Mesa Ana)" },
      { porta: "3", status: "up", vlan: 20, conectado: "Impressora HP Adm" },
      { porta: "4", status: "down", vlan: 20, conectado: "Livre" },
      { porta: "24", status: "up", vlan: 30, conectado: "AP-WIFI-01 (Teto Recepção)" },
    ],
  },
];

function TopologyNode({ icon, label, type }: { icon: React.ReactNode, label: string, type: string }) {
  return (
    <div className="flex flex-col items-center space-y-2 group cursor-pointer">
      <div className="relative">
        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md group-hover:bg-slate-900 transition-all">
          {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 text-slate-500 group-hover:text-slate-300" })}
        </div>
        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[9px] font-medium leading-none">{label}</p>
        <p className="text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{type}</p>
      </div>
    </div>
  );
}

export default function Rede() {
  const [vpnUsers, setVpnUsers] = useState(initialVpnUsers);
  const [ipListState, setIpListState] = useState(initialIpList);
  const [searchVpn, setSearchVpn] = useState("");
  const [searchIp, setSearchIp] = useState("");
  const [searchVlan, setSearchVlan] = useState("");
  // VPN form
  const [vpnDialogOpen, setVpnDialogOpen] = useState(false);
  const [newVpnNome, setNewVpnNome] = useState("");
  const [newVpnLogin, setNewVpnLogin] = useState("");
  // IP form
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [newIpAddr, setNewIpAddr] = useState("");
  const [newIpDevice, setNewIpDevice] = useState("");
  const [newIpSetor, setNewIpSetor] = useState("");

  const { isPrivacyMode } = usePrivacy();
  const { toast } = useToast();
  const { addLog } = useAudit();

  const { search: searchParams } = useLocation();
  const queryTab = new URLSearchParams(searchParams).get("tab");
  const [activeTab, setActiveTab] = useState(queryTab || "vpn");

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const filteredVpn = vpnUsers.filter((v) =>
    searchVpn === "" || v.nome.toLowerCase().includes(searchVpn.toLowerCase()) || v.login.toLowerCase().includes(searchVpn.toLowerCase())
  );

  const filteredIps = ipListState.filter((i) =>
    searchIp === "" || Object.values(i).some((v) => v.toLowerCase().includes(searchIp.toLowerCase()))
  );

  const filteredVlans = vlansList.filter((v) =>
    searchVlan === "" || v.nome.toLowerCase().includes(searchVlan.toLowerCase()) || String(v.id).includes(searchVlan)
  );

  const handleSaveVpn = () => {
    if (!newVpnNome.trim() || !newVpnLogin.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha Nome e Login.", variant: "destructive" });
      return;
    }
    const today = new Date().toLocaleDateString("pt-BR");
    setVpnUsers(prev => [...prev, { id: Date.now(), nome: newVpnNome, login: newVpnLogin, status: "Ativo", criacao: today }]);
    addLog({ user: "Admin", action: "VPN Criada", details: `Acesso VPN liberado para ${newVpnNome} (${newVpnLogin}).`, module: "Rede" });
    setNewVpnNome(""); setNewVpnLogin("");
    setVpnDialogOpen(false);
    toast({ title: "Acesso VPN criado!", description: `Login '${newVpnLogin}' adicionado com sucesso.` });
  };

  const handleSaveIp = () => {
    if (!newIpAddr.trim() || !newIpDevice.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha IP e Dispositivo.", variant: "destructive" });
      return;
    }
    if (ipListState.some(i => i.ip === newIpAddr)) {
      toast({ title: "IP já reservado", description: `O endereço ${newIpAddr} já existe no IPAM.`, variant: "destructive" });
      return;
    }
    setIpListState(prev => [...prev, { ip: newIpAddr, dispositivo: newIpDevice, setor: newIpSetor || "—" }]);
    addLog({ user: "Admin", action: "IP Reservado", details: `Reserva do IP ${newIpAddr} para o dispositivo ${newIpDevice}.`, module: "Rede" });
    setNewIpAddr(""); setNewIpDevice(""); setNewIpSetor("");
    setIpDialogOpen(false);
    toast({ title: "IP Reservado!", description: `${newIpAddr} adicionado ao IPAM.` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rede & Infraestrutura</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerenciamento de acessos, endereçamentos e topologia física</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vpn" className="gap-2">
            <Shield className="h-4 w-4" />
            VPN (Acesso Remoto)
          </TabsTrigger>
          <TabsTrigger value="ipam" className="gap-2">
            <Globe className="h-4 w-4" />
            IPs Reservados
          </TabsTrigger>
          <TabsTrigger value="vlans" className="gap-2">
            <NetworkIcon className="h-4 w-4" />
            VLANs (Subredes)
          </TabsTrigger>
          <TabsTrigger value="switches" className="gap-2">
            <Server className="h-4 w-4" />
            Mapeamento de Switches
          </TabsTrigger>
          <TabsTrigger value="topologia" className="gap-2">
            <GitGraph className="h-4 w-4" />
            Topologia Visual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vpn" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou login..." value={searchVpn} onChange={(e) => setSearchVpn(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={vpnDialogOpen} onOpenChange={setVpnDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Novo Acesso</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Acesso VPN</DialogTitle>
                  <DialogDescription>Libere acesso remoto para um colaborador.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Colaborador *</label>
                    <Input placeholder="Ex: Carlos Silva" value={newVpnNome} onChange={(e) => setNewVpnNome(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Login AD *</label>
                    <Input placeholder="Ex: carlos.silva" value={newVpnLogin} onChange={(e) => setNewVpnLogin(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setVpnDialogOpen(false)}>Cancelar</Button>
                  <Button type="button" onClick={handleSaveVpn}>Salvar Acesso</Button>
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
                      <th className="text-left p-3 font-medium text-muted-foreground">Colaborador</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Login</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Criação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVpn.map((v) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{v.nome}</td>
                        <td className="p-3 font-mono text-xs">{v.login}</td>
                        <td className="p-3">
                          <Badge variant={v.status === "Ativo" ? "default" : "secondary"} className={v.status === "Ativo" ? "bg-success hover:bg-success/90 gap-1" : "gap-1"}>
                            {v.status === "Ativo" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {v.status}
                          </Badge>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted-foreground">{v.criacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ipam" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar IP, dispositivo ou setor..." value={searchIp} onChange={(e) => setSearchIp(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={ipDialogOpen} onOpenChange={setIpDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Reservar IP</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reserva de IP</DialogTitle>
                  <DialogDescription>Cadastre um novo endereço IP estático no IPAM.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço IP *</label>
                    <Input placeholder="Ex: 192.168.1.105" value={newIpAddr} onChange={(e) => setNewIpAddr(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dispositivo *</label>
                    <Input placeholder="Ex: Impressora RH" value={newIpDevice} onChange={(e) => setNewIpDevice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Setor</label>
                    <Input placeholder="Ex: RH" value={newIpSetor} onChange={(e) => setNewIpSetor(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIpDialogOpen(false)}>Cancelar</Button>
                  <Button type="button" onClick={handleSaveIp}>Salvar IP</Button>
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
                      <th className="text-left p-3 font-medium text-muted-foreground">Endereço IP</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Dispositivo</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Setor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIps.map((i, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs font-medium">
                          {isPrivacyMode ? i.ip.replace(/\d+\.\d+$/, "***.***") : i.ip}
                        </td>
                        <td className="p-3">{i.dispositivo}</td>
                        <td className="p-3">{i.setor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vlans" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou ID..." value={searchVlan} onChange={(e) => setSearchVlan(e.target.value)} className="pl-9" />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Nova Subrede</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova VLAN</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">VLAN ID</label>
                      <Input type="number" placeholder="Ex: 50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Faixa de IP</label>
                      <Input placeholder="Ex: 10.0.50.0/24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome da Rede</label>
                    <Input placeholder="Ex: Comercial" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">Salvar VLAN</Button>
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
                      <th className="text-center p-3 font-medium text-muted-foreground w-16">VLAN ID</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Nome da Rede</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Faixa de IP (CIDR)</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Gateway</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">DHCP</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVlans.map((v) => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-center font-mono font-medium">{v.id}</td>
                        <td className="p-3 font-medium">{v.nome}</td>
                        <td className="p-3 font-mono text-xs">
                          {isPrivacyMode ? v.faixa.replace(/\d+\.\d+\//, "***.***/") : v.faixa}
                        </td>
                        <td className="p-3 font-mono text-xs hidden sm:table-cell">
                          {isPrivacyMode ? v.gateway.replace(/\d+\.\d+$/, "***.***") : v.gateway}
                        </td>
                        <td className="p-3 text-center">
                          {v.dhcp ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Estático</Badge>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{v.observacao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="switches" className="mt-4">
          <div className="space-y-6">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" />Adicionar Equipamento</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Switch</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Hostname</label>
                      <Input placeholder="Ex: SW-CORE-02" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">IP de Gerenciamento</label>
                      <Input placeholder="Ex: 10.0.10.4" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button">Salvar Equipamento</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            {switchList.map((sw) => (
              <Card key={sw.hostname} className="shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-background border rounded-lg shadow-sm">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {sw.hostname}
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {isPrivacyMode ? sw.ip.replace(/\d+\.\d+$/, "***.***") : sw.ip}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-4">
                          <span>{sw.modelo}</span>
                          <span className="flex items-center gap-1"><NetworkIcon className="w-3 h-3" /> {sw.local}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Visual Port Map */}
                  <div className="mb-8 overflow-x-auto pb-4">
                    <div className="min-w-[700px]">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mapa Portas Frontais</h4>
                        <div className="flex items-center gap-4 text-[10px] font-medium uppercase text-muted-foreground">
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success" /> UP</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> DOWN</div>
                          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-primary w-2 h-2" /> TRUNK</div>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-4 rounded-md border-4 border-slate-800 shadow-xl ring-1 ring-white/10">
                        <TooltipProvider>
                          <div className="grid grid-cols-12 gap-2">
                            {/* Generative grid for 24 ports simulation */}
                            {Array.from({ length: 24 }).map((_, i) => {
                              const portNum = i + 1;
                              const portData = sw.portas.find(p => p.porta === String(portNum) || p.porta.endsWith(`/${portNum}`)) || { status: 'down', vlan: 0, conectado: 'Livre' };
                              return (
                                <Tooltip key={i}>
                                  <TooltipTrigger asChild>
                                    <div className="group relative">
                                      <div className={`h-10 w-full rounded border-2 flex items-center justify-center transition-all cursor-crosshair
                                        ${portData.status === 'up' ? 'bg-success/20 border-success shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-slate-800 border-slate-700'}
                                        ${portData.vlan === 'Trunk' ? 'border-primary' : ''}
                                      `}>
                                        <div className={`w-3 h-3 rounded-sm border border-black/20 ${portData.status === 'up' ? 'bg-success animate-pulse' : 'bg-slate-900'}`} />
                                      </div>
                                      <div className="text-[9px] text-center mt-1 font-mono text-slate-400 group-hover:text-white transition-colors">
                                        {portNum}
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="p-3 max-w-[200px]">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs font-bold">Porta {portNum}</span>
                                        <Badge variant={portData.status === 'up' ? 'default' : 'secondary'} className="text-[10px] uppercase h-4">
                                          {portData.status}
                                        </Badge>
                                      </div>
                                      <div className="text-[10px]">
                                        <p className="text-muted-foreground uppercase font-bold tracking-tighter">Conectado:</p>
                                        <p className="font-medium text-foreground">{portData.conectado}</p>
                                      </div>
                                      <div className="text-[10px] flex justify-between border-t pt-1.5 mt-1.5">
                                        <span className="text-muted-foreground uppercase font-bold">VLAN:</span>
                                        <span className="font-mono text-primary">{portData.vlan}</span>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border-t">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/10">
                          <th className="text-left p-3 font-medium text-muted-foreground pl-6 w-24">Porta</th>
                          <th className="text-left p-3 font-medium text-muted-foreground w-24">Link</th>
                          <th className="text-center p-3 font-medium text-muted-foreground w-20">VLAN</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Dispositivo Conectado / Patch Panel</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sw.portas.map((porta, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="p-3 pl-6 font-mono font-medium">{porta.porta}</td>
                            <td className="p-3">
                              <span className={`flex items-center gap-1.5 text-xs font-medium ${porta.status === 'up' ? 'text-success' : 'text-muted-foreground opacity-50'}`}>
                                <Activity className="w-3.5 h-3.5" />
                                {porta.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant={porta.vlan === "Trunk" ? "default" : "secondary"} className="font-mono">
                                {porta.vlan}
                              </Badge>
                            </td>
                            <td className={`p-3 ${porta.conectado === 'Livre' ? 'text-muted-foreground italic' : 'font-medium'}`}>
                              {porta.conectado}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topologia" className="mt-4">
          <Card className="shadow-sm overflow-hidden bg-slate-950 border-slate-800">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" /> Visualização de Infraestrutura (L2/L3)
              </CardTitle>
              <CardDescription>Mapeamento lógico de interconexões entre ativos críticos e terminais.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative min-h-[500px] flex flex-col items-center justify-center space-y-12">

                {/* Core Layer */}
                <div className="flex flex-col items-center space-y-2 group cursor-pointer relative z-10">
                  <div className="p-4 bg-primary/20 border-2 border-primary rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">Gateway / FW</p>
                    <p className="text-[10px] font-mono text-muted-foreground/60 tracking-tighter">Fortinet 100F</p>
                  </div>
                </div>

                {/* Vertical Connector */}
                <div className="h-10 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/30" />

                {/* Switch Layer */}
                <div className="flex flex-col md:flex-row gap-20 items-center justify-center relative">

                  {/* Switch 1 */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-col items-center space-y-2 group cursor-pointer px-4 py-2 border border-white/5 rounded-lg bg-black/40 hover:border-primary/50 transition-colors">
                      <Server className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-[11px] font-bold">SW-CORE-01</p>
                        <Badge variant="outline" className="text-[9px] h-4 bg-slate-900/50">Cisco 9300</Badge>
                      </div>
                    </div>

                    {/* Connections Down */}
                    <div className="flex gap-8 mt-4">
                      <TopologyNode icon={<Cpu />} label="SRV-ERP-01" type="Server" />
                      <TopologyNode icon={<Monitor />} label="WKS-ADM-001" type="Client" />
                      <TopologyNode icon={<Print />} label="PRT-HP-ADM" type="Printer" />
                    </div>
                  </div>

                  {/* Switch 2 (Cascata) */}
                  <div className="relative flex flex-col items-center space-y-4">
                    {/* Connection lines to the left (Cascata) */}
                    <div className="absolute -left-12 top-1/4 w-12 h-px bg-gradient-to-r from-slate-700 to-transparent hidden md:block" />

                    <div className="flex flex-col items-center space-y-2 group cursor-pointer px-4 py-2 border border-white/5 rounded-lg bg-black/40 hover:border-primary/50 transition-colors">
                      <Server className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-[11px] font-bold">SW-ACCESS-01</p>
                        <Badge variant="outline" className="text-[9px] h-4 bg-slate-900/50">Aruba 2930F</Badge>
                      </div>
                    </div>

                    {/* Connections Down */}
                    <div className="flex gap-8 mt-4">
                      <TopologyNode icon={<Phone />} label="AP-WIFI-01" type="Infra" />
                      <TopologyNode icon={<Monitor />} label="WKS-FIN-012" type="Client" />
                    </div>
                  </div>

                </div>

                {/* Legend */}
                <div className="absolute bottom-4 right-4 p-4 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md hidden md:block">
                  <h5 className="text-[10px] font-bold uppercase mb-2 text-muted-foreground tracking-widest">Legenda</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(59,130,246,1)]" /> Camada Core
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-slate-600" /> Acesso / Periférico
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <div className="h-0.5 w-3 bg-slate-700" /> Link Físico
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
