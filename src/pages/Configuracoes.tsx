import { useState } from "react";
import {
  Users,
  ClipboardList,
  Plus,
  Search,
  Shield,
  Mail,
  Sun,
  Moon,
  Settings2,
  Lock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/ThemeContext";

const teamMembers = [
  { id: 1, nome: "Lucas Ferreira", email: "lucas.f@gellak.com", cargo: "Coordenador de TI", status: "Ativo" },
  { id: 2, nome: "Rafael Lima", email: "rafael.l@gellak.com", cargo: "Analista de Infraestrutura", status: "Ativo" },
  { id: 3, nome: "Camila Souza", email: "camila.s@gellak.com", cargo: "Suporte N1", status: "Ativo" },
  { id: 4, nome: "Diego Martins", email: "diego.m@gellak.com", cargo: "Analista de Segurança", status: "Inativo" },
];

const accessProfiles = [
  {
    id: 1,
    nome: "Administrador",
    descricao: "Controle total sobre todos os módulos e configurações do sistema.",
    usuarios: 2,
    permissoes: ["Inventário", "Rede", "Contratos", "Wiki", "Acessos", "Configurações"]
  },
  {
    id: 2,
    nome: "Técnico N1",
    descricao: "Visualização e edição básica de ativos e rotinas. Sem acesso a configurações.",
    usuarios: 5,
    permissoes: ["Inventário", "Wiki", "Rotinas"]
  },
  {
    id: 3,
    nome: "Auditor",
    descricao: "Acesso de somente leitura para logs e relatórios.",
    usuarios: 1,
    permissoes: ["Auditoria", "Inventário (Leitura)"]
  },
];

const auditLogs = [
  { id: 1, data: "03/03/2026 14:32", usuario: "Lucas Ferreira", acao: "Alterou o responsável do Notebook Dell #045 para Pedro Mendes" },
  { id: 2, data: "03/03/2026 11:15", usuario: "Rafael Lima", acao: "Adicionou novo IP estático: 192.168.1.101 (AP-WIFI-02)" },
  { id: 3, data: "02/03/2026 16:48", usuario: "Camila Souza", acao: "Upload do Termo de Responsabilidade — iPhone 14 (Ana Costa)" },
  { id: 4, data: "02/03/2026 09:22", usuario: "Lucas Ferreira", acao: "Criou acesso VPN para Maria Santos" },
  { id: 5, data: "01/03/2026 17:05", usuario: "Rafael Lima", acao: "Atualizou status do Servidor ERP para Offline" },
  { id: 6, data: "01/03/2026 10:30", usuario: "Camila Souza", acao: "Resetou senha AD do usuário João Almeida" },
  { id: 7, data: "28/02/2026 15:12", usuario: "Diego Martins", acao: "Desativou acesso VPN de Pedro Mendes" },
  { id: 8, data: "28/02/2026 08:45", usuario: "Lucas Ferreira", acao: "Publicou artigo na Wiki: Configuração de Impressoras" },
];

export default function Configuracoes() {
  const [searchLog, setSearchLog] = useState("");
  const { theme, toggleTheme } = useTheme();

  const filteredLogs = auditLogs.filter(
    (log) =>
      searchLog === "" ||
      log.usuario.toLowerCase().includes(searchLog.toLowerCase()) ||
      log.acao.toLowerCase().includes(searchLog.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão da equipe e log de auditoria</p>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="equipe" className="gap-2">
            <Users className="h-4 w-4" />
            Equipe TI
          </TabsTrigger>
          <TabsTrigger value="perfis" className="gap-2">
            <Lock className="h-4 w-4" />
            Perfis de Acesso
          </TabsTrigger>
          <TabsTrigger value="auditoria" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Aparência e Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">Modo Escuro (Dark Mode)</h4>
                  <p className="text-xs text-muted-foreground mt-1">Alterne entre o tema claro e escuro para a interface.</p>
                </div>
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                  {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipe" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2"><Plus className="h-4 w-4" />Adicionar Membro</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {member.nome.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{member.nome}</p>
                        <Badge variant={member.status === "Ativo" ? "default" : "secondary"} className={`text-[10px] ${member.status === "Ativo" ? "bg-success hover:bg-success/90" : ""}`}>
                          {member.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.cargo}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{member.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="perfis" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Configure o que cada perfil pode ver ou editar no IT Core Hub.</p>
            <Button className="gap-2" size="sm" variant="outline"><Plus className="h-3.5 w-3.5" />Novo Perfil</Button>
          </div>
          <div className="space-y-4">
            {accessProfiles.map((role) => (
              <Card key={role.id} className="shadow-sm hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <h4 className="font-bold text-sm tracking-tight">{role.nome}</h4>
                      <Badge variant="secondary" className="text-[10px] font-normal">{role.usuarios} usuários</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-md">{role.descricao}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {role.permissoes.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 bg-muted/30">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:border-l md:pl-4">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-primary">
                      <Settings2 className="h-3.5 w-3.5" /> Configurar
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="shadow-sm border-dashed bg-muted/20">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-3 bg-background rounded-full border shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Segurança e RBAC</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px]">As permissões são aplicadas em tempo real em todos os módulos para garantir integridade dos dados.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="auditoria" className="mt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por usuário ou ação..." value={searchLog} onChange={(e) => setSearchLog(e.target.value)} className="pl-9" />
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground w-40">Data/Hora</th>
                      <th className="text-left p-3 font-medium text-muted-foreground w-40">Usuário TI</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Ação Realizada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.data}</td>
                        <td className="p-3 font-medium whitespace-nowrap">{log.usuario}</td>
                        <td className="p-3">{log.acao}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
