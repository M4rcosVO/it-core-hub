import { useState } from "react";
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

const vpnUsers = [
  { id: 1, nome: "Carlos Silva", login: "carlos.silva", status: "Ativo", criacao: "15/01/2024" },
  { id: 2, nome: "Ana Costa", login: "ana.costa", status: "Ativo", criacao: "20/03/2024" },
  { id: 3, nome: "João Almeida", login: "joao.almeida", status: "Inativo", criacao: "10/06/2023" },
  { id: 4, nome: "Maria Santos", login: "maria.santos", status: "Ativo", criacao: "05/09/2024" },
  { id: 5, nome: "Pedro Mendes", login: "pedro.mendes", status: "Inativo", criacao: "22/11/2023" },
];

const ipList = [
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

export { vpnUsers, ipList, vlansList, switchList };

export default function Rede() {
  const [searchVpn, setSearchVpn] = useState("");
  const [searchIp, setSearchIp] = useState("");
  const [searchVlan, setSearchVlan] = useState("");

  const filteredVpn = vpnUsers.filter((v) =>
    searchVpn === "" || v.nome.toLowerCase().includes(searchVpn.toLowerCase()) || v.login.toLowerCase().includes(searchVpn.toLowerCase())
  );

  const filteredIps = ipList.filter((i) =>
    searchIp === "" || Object.values(i).some((v) => v.toLowerCase().includes(searchIp.toLowerCase()))
  );

  const filteredVlans = vlansList.filter((v) =>
    searchVlan === "" || v.nome.toLowerCase().includes(searchVlan.toLowerCase()) || String(v.id).includes(searchVlan)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rede & Infraestrutura</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerenciamento de acessos, endereçamentos e topologia física</p>
      </div>

      <Tabs defaultValue="vpn">
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
        </TabsList>

        <TabsContent value="vpn" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou login..." value={searchVpn} onChange={(e) => setSearchVpn(e.target.value)} className="pl-9" />
            </div>
            <Dialog>
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
                    <label className="text-sm font-medium">Nome do Colaborador</label>
                    <Input placeholder="Ex: Carlos Silva" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Login AD</label>
                    <Input placeholder="Ex: carlos.silva" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">Salvar Acesso</Button>
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
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />Reservar IP</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reserva de IP</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dispositivo</label>
                    <Input placeholder="Ex: Impressora RH" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço IP</label>
                    <Input placeholder="Ex: 192.168.1.100" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button">Salvar IP</Button>
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
                        <td className="p-3 font-mono text-xs font-medium">{i.ip}</td>
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
                        <td className="p-3 font-mono text-xs">{v.faixa}</td>
                        <td className="p-3 font-mono text-xs hidden sm:table-cell">{v.gateway}</td>
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
                          <Badge variant="outline" className="font-mono text-[10px]">{sw.ip}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-4">
                          <span>{sw.modelo}</span>
                          <span className="flex items-center gap-1"><NetworkIcon className="w-3 h-3" /> {sw.local}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
