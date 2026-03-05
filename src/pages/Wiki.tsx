import { useState } from "react";
import {
  BookOpen,
  FileText,
  Search,
  Plus,
  Edit2,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const initialArticles = [
  {
    id: 1,
    title: "Onboarding de Novos Colaboradores",
    category: "Processos",
    content: `# Onboarding de Novos Colaboradores

## Objetivo
Padronizar o processo de configuração do ambiente de trabalho para novos colaboradores.

## Etapas

### 1. Solicitação de Equipamento
- Receber formulário de RH com dados do novo colaborador
- Verificar disponibilidade de hardware no inventário
- Separar: notebook/desktop, mouse, teclado, headset

### 2. Configuração do Sistema
- Instalar sistema operacional (Windows 11 Pro)
- Aplicar políticas de grupo (GPO)
- Instalar pacote de software padrão: Office 365, antivírus, VPN client
- Configurar e-mail corporativo

### 3. Criação de Acessos
- Criar conta no Active Directory
- Configurar acesso ao ERP (solicitar ao gestor o perfil)
- VPN: apenas se aprovado pela diretoria
- Entregar credenciais em envelope lacrado

### 4. Documentação
- Gerar Termo de Responsabilidade
- Coletar assinatura
- Fazer upload no sistema (módulo Inventário)

---

**Tempo médio:** 2h por colaborador  
**Responsável:** Equipe de Suporte N1`,
  },
  {
    id: 2,
    title: "Procedimento de Backup",
    category: "Infraestrutura",
    content: `# Procedimento de Backup

## Política
Backups diários incrementais e semanais completos.

## Servidores cobertos
- SRV-ERP-01 (banco de dados)
- SRV-FILE-01 (arquivos compartilhados)

## Rotina
1. **Diário (22h):** Backup incremental via Veeam
2. **Semanal (Sábado 02h):** Backup completo
3. **Mensal:** Cópia offsite para storage em nuvem

## Verificação
- Checar logs toda manhã
- Teste de restauração mensal obrigatório
- Alertas configurados no Zabbix`,
  },
  {
    id: 3,
    title: "Reset de Senha - Active Directory",
    category: "Suporte",
    content: `# Reset de Senha - Active Directory

## Quando usar
Quando o colaborador esquece a senha ou a conta é bloqueada.

## Procedimento
1. Abrir o console do Active Directory (ADUC)
2. Localizar o usuário
3. Clique direito > "Reset Password"
4. Definir senha temporária: \`Gellak@2024!\`
5. Marcar "User must change password at next logon"
6. Desbloquear conta se necessário

## Importante
- Solicitar confirmação de identidade (nome completo + matrícula)
- Registrar o chamado no sistema de tickets`,
  },
  {
    id: 4,
    title: "Configuração de Impressoras em Rede",
    category: "Suporte",
    content: `# Configuração de Impressoras em Rede

## Modelos suportados
- HP LaserJet Pro M404
- HP Color LaserJet Pro M454

## Passos
1. Verificar IP fixo da impressora no IPAM
2. Painel de Controle > Impressoras > Adicionar
3. Porta TCP/IP com o IP da impressora
4. Instalar driver do site do fabricante
5. Definir como padrão se necessário
6. Imprimir página de teste`,
  },
];

type Article = typeof initialArticles[0];

export default function Wiki() {
  const [articles, setArticles] = useState(initialArticles);
  const [selectedId, setSelectedId] = useState(articles[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const selected = articles.find((a) => a.id === selectedId);
  const filtered = articles.filter(
    (a) =>
      searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (article: Article) => {
    setEditTitle(article.title);
    setEditCategory(article.category);
    setEditContent(article.content);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleStartCreate = () => {
    setEditTitle("");
    setEditCategory("Processos");
    setEditContent("# Título do Artigo\n\n## Seção\nConteúdo aqui...");
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editTitle.trim()) {
      toast({ title: "Título obrigatório", description: "Preencha o título do artigo.", variant: "destructive" });
      return;
    }
    if (isCreating) {
      const newArticle = { id: Date.now(), title: editTitle, category: editCategory || "Geral", content: editContent };
      setArticles(prev => [...prev, newArticle]);
      setSelectedId(newArticle.id);
      toast({ title: "Artigo criado!", description: `"${editTitle}" foi adicionado à Wiki.` });
    } else {
      setArticles(prev => prev.map(a => a.id === selectedId ? { ...a, title: editTitle, category: editCategory, content: editContent } : a));
      toast({ title: "Artigo salvo!", description: `"${editTitle}" foi atualizado.` });
    }
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    const remaining = articles.filter(a => a.id !== id);
    setArticles(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
    toast({ title: "Artigo excluído." });
  };

  const renderContent = (content: string) =>
    content.split("\n").map((line, i) => {
      if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-0 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm leading-relaxed">{line.slice(2)}</li>;
      if (line.match(/^\d+\./)) return <li key={i} className="ml-4 text-sm leading-relaxed list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
      if (line.startsWith("---")) return <Separator key={i} className="my-4" />;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-sm font-semibold">{line.replace(/\*\*/g, "")}</p>;
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm leading-relaxed">{line.replace(/`([^`]+)`/g, "«$1»")}</p>;
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wiki & Procedimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Documentação técnica e SOPs</p>
        </div>
        <Button className="gap-2" onClick={handleStartCreate}>
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[500px] lg:h-auto">
            <div className="space-y-1">
              {filtered.map((article) => (
                <button
                  key={article.id}
                  onClick={() => { setSelectedId(article.id); setIsEditing(false); }}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${selectedId === article.id && !isCreating
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground"
                    }`}
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate">{article.title}</p>
                    <p className="text-xs opacity-60">{article.category}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Content / Editor */}
        <Card className="flex-1 shadow-sm">
          <CardContent className="p-6 lg:p-8">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-semibold flex-1">{isCreating ? "Novo Artigo" : "Editando Artigo"}</h2>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> Salvar
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Título *</label>
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Título do artigo" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Categoria</label>
                    <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Ex: Suporte, Infraestrutura" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Conteúdo (Markdown suportado)</label>
                  <textarea
                    className="w-full min-h-[350px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="# Título&#10;&#10;## Seção&#10;Conteúdo..."
                  />
                </div>
              </div>
            ) : selected ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    <BookOpen className="h-3 w-3 inline mr-1" />{selected.category}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => handleStartEdit(selected)}>
                      <Edit2 className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(selected.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Apagar
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  {renderContent(selected.content)}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Selecione um artigo na lista ao lado.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
