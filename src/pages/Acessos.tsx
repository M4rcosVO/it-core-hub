import { useState } from "react";
import {
  Key,
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Shield,
  Globe,
  Database,
  Mail,
  Download,
  Dices,
  Lock,
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
import { useToast } from "@/hooks/use-toast";
import { usePrivacy } from "@/components/PrivacyContext";
import { useAuth } from "@/components/AuthContext";

const initialAcessos = [
  { id: 1, nome: "FortiGate VPN", url: "vpn.gellak.com.br", usuario: "admin.ti", senha: "SuperSecretPassword123!", categoria: "VPN", setor: "TI", icon: Shield },
  { id: 2, nome: "Totvs Protheus", url: "192.168.1.10:8080", usuario: "admin_erp", senha: "ErpPassword2024", categoria: "ERP", setor: "Geral", icon: Database },
  { id: 3, nome: "Painel Admin Site", url: "gellak.com.br/wp-admin", usuario: "webmaster", senha: "Wp#Admin$2024", categoria: "Web", setor: "Marketing", icon: Globe },
  { id: 4, nome: "Office 365 Admin", url: "admin.microsoft.com", usuario: "ti@gellak.com.br", senha: "O365@Gellak2024", categoria: "E-mail", setor: "TI", icon: Mail },
  { id: 5, nome: "OpenVPN Filial SP", url: "sp.vpn.gellak.com.br", usuario: "joao.almeida", senha: "VpnSp2024!", categoria: "VPN", setor: "Comercial", icon: Shield },
];

const categorias = ["Todas", "VPN", "ERP", "Web", "E-mail", "Banco de Dados", "Outros"];

export default function Acessos() {
  const { userRole } = useAuth();
  const isAdmin = userRole === "Administrador";

  const [acessosData, setAcessosData] = useState(initialAcessos);
  const [search, setSearch] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states for new credential
  const [newNome, setNewNome] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newUsuario, setNewUsuario] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCategoria, setNewCategoria] = useState("");
  const [newSetor, setNewSetor] = useState("");

  const { toast } = useToast();
  const { isPrivacyMode } = usePrivacy();

  if (!isAdmin) {
    return (
      <div className="h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-lg border-destructive/20 bg-destructive/5 animate-in fade-in zoom-in duration-300">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-destructive/10 rounded-full ring-4 ring-destructive/5">
              <Lock className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight">Acesso Restrito</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você está logado como <span className="font-bold text-foreground">{userRole}</span>.
                Somente o perfil <span className="font-bold text-primary">Administrador</span> tem permissão para visualizar ou gerenciar credenciais no cofre.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar para Segurança
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredAcessos = acessosData.filter((a) => {
    const matchSearch = search === "" || Object.values(a).some((v) => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchCategoria = categoriaFilter === "Todas" || a.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: `${type} copiada para a área de transferência.` });
  };

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    navigator.clipboard.writeText(password);
    toast({ title: "Senha Gerada!", description: "Senha forte de 16 caracteres gerada e copiada." });
  };

  const handleSaveCredential = () => {
    if (!newNome.trim() || !newUsuario.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha pelo menos o Nome e o Usuário.", variant: "destructive" });
      return;
    }
    const iconMap: Record<string, typeof Shield> = { VPN: Shield, ERP: Database, Web: Globe, "E-mail": Mail };
    const newEntry = {
      id: Date.now(),
      nome: newNome,
      url: newUrl || "—",
      usuario: newUsuario,
      senha: newPassword || "—",
      categoria: newCategoria || "Outros",
      setor: newSetor || "—",
      icon: iconMap[newCategoria] ?? Key,
    };
    setAcessosData((prev) => [...prev, newEntry]);
    setNewNome(""); setNewUrl(""); setNewUsuario(""); setNewPassword(""); setNewCategoria(""); setNewSetor("");
    setDialogOpen(false);
    toast({ title: "Credencial salva!", description: `'${newEntry.nome}' adicionada ao cofre.` });
  };

  const handleExportCSV = () => {
    if (filteredAcessos.length === 0) return;
    const headers = ["ID", "Sistema/Nome", "URL", "Usuário", "Senha", "Categoria", "Setor"].join(",");
    const rows = filteredAcessos.map(a =>
      [a.id, `"${a.nome}"`, `"${a.url}"`, `"${a.usuario}"`, `"${a.senha}"`, `"${a.categoria}"`, `"${a.setor}"`].join(",")
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(headers + "\n" + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `IT_Acessos_Cofre_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportação Concluída", description: "O arquivo CSV dos acessos foi baixado com sucesso." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cofre de Acessos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão centralizada de senhas e credenciais (VPNs, Sistemas, etc)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Credencial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Credencial</DialogTitle>
              <DialogDescription>
                Cadastre um novo login para acesso a sistemas, VPNs ou ferramentas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Sistema / Ferramenta *</label>
                <Input placeholder="Ex: FortiGate VPN" value={newNome} onChange={(e) => setNewNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Base</label>
                <Input placeholder="Ex: vpn.empresa.com.br" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuário *</label>
                  <Input placeholder="Ex: admin" value={newUsuario} onChange={(e) => setNewUsuario(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Senha</label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1.5 text-muted-foreground hover:text-primary" onClick={generateStrongPassword}>
                      <Dices className="h-3 w-3" />
                      Gerar Forte
                    </Button>
                  </div>
                  <Input type="text" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={newCategoria} onValueChange={setNewCategoria}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {categorias.filter(c => c !== "Todas").map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Setor</label>
                  <Input placeholder="Ex: TI" value={newSetor} onChange={(e) => setNewSetor(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={handleSaveCredential}>Salvar Credencial</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, usuário, URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground w-[250px]">Sistema / Ferramenta</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">URL Base</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Senha</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Setor</th>
                </tr>
              </thead>
              <tbody>
                {filteredAcessos.map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                          <a.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{a.nome}</p>
                          <Badge variant="outline" className="mt-1 text-[10px] uppercase">{a.categoria}</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{a.url}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.url, "URL")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        {a.url !== "—" && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                            <a href={a.url.startsWith("http") ? a.url : `https://${a.url}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium">
                          {isPrivacyMode ? "••••••" : a.usuario}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.usuario, "Usuário")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-muted px-2 py-1 rounded font-mono text-xs min-w-[120px] tracking-widest text-center">
                          {isPrivacyMode ? "••••••••" : (visiblePasswords[a.id] ? a.senha : "••••••••")}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePasswordVisibility(a.id)}>
                          {isPrivacyMode || !visiblePasswords[a.id] ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(a.senha, "Senha")}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">{a.setor}</td>
                  </tr>
                ))}
                {filteredAcessos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Nenhuma credencial encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
