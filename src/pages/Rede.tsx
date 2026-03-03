import { useState } from "react";
import {
  Shield,
  Globe,
  Phone,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const providers = [
  { nome: "Vivo Fibra", contrato: "CT-2024-VF-001", suporte: "0800 775 1212", tipo: "Link Primário" },
  { nome: "Claro Dedicado", contrato: "CT-2024-CL-042", suporte: "0800 720 1234", tipo: "Link Backup" },
  { nome: "Fortinet Support", contrato: "FC-SUP-BR-8812", suporte: "+55 11 3044-8800", tipo: "Firewall" },
];

export default function Rede() {
  const [searchVpn, setSearchVpn] = useState("");
  const [searchIp, setSearchIp] = useState("");

  const filteredVpn = vpnUsers.filter((v) =>
    searchVpn === "" || v.nome.toLowerCase().includes(searchVpn.toLowerCase()) || v.login.toLowerCase().includes(searchVpn.toLowerCase())
  );

  const filteredIps = ipList.filter((i) =>
    searchIp === "" || Object.values(i).some((v) => v.toLowerCase().includes(searchIp.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rede & VPN</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerenciamento de conectividade e acesso remoto</p>
      </div>

      <Tabs defaultValue="vpn">
        <TabsList>
          <TabsTrigger value="vpn" className="gap-2">
            <Shield className="h-4 w-4" />
            VPN
          </TabsTrigger>
          <TabsTrigger value="ipam" className="gap-2">
            <Globe className="h-4 w-4" />
            IPAM
          </TabsTrigger>
          <TabsTrigger value="provedores" className="gap-2">
            <Phone className="h-4 w-4" />
            Provedores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vpn" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou login..." value={searchVpn} onChange={(e) => setSearchVpn(e.target.value)} className="pl-9" />
            </div>
            <Button className="gap-2"><Plus className="h-4 w-4" />Novo Acesso</Button>
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar IP, dispositivo ou setor..." value={searchIp} onChange={(e) => setSearchIp(e.target.value)} className="pl-9" />
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

        <TabsContent value="provedores" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {providers.map((p) => (
              <Card key={p.contrato} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.nome}</CardTitle>
                  <Badge variant="outline" className="w-fit">{p.tipo}</Badge>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contrato</span>
                    <span className="font-mono text-xs">{p.contrato}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Suporte</span>
                    <span className="font-mono text-xs">{p.suporte}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
