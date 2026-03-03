import { useState } from "react";
import {
  BookOpen,
  FileText,
  ChevronRight,
  Search,
  Plus,
  Edit2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const articles = [
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

export default function Wiki() {
  const [selectedId, setSelectedId] = useState(articles[0].id);
  const [searchTerm, setSearchTerm] = useState("");

  const selected = articles.find((a) => a.id === selectedId)!;
  const filtered = articles.filter(
    (a) =>
      searchTerm === "" ||
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wiki & Procedimentos</h1>
          <p className="text-muted-foreground text-sm mt-1">Documentação técnica e SOPs</p>
        </div>
        <Button className="gap-2">
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
                  onClick={() => setSelectedId(article.id)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    selectedId === article.id
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

        {/* Content */}
        <Card className="flex-1 shadow-sm">
          <CardContent className="p-6 lg:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {selected.category}
              </span>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Edit2 className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
            <div className="prose prose-sm max-w-none">
              {selected.content.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold mt-0 mb-4">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-semibold mt-6 mb-2">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-base font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith("- ")) return <li key={i} className="ml-4 text-sm leading-relaxed">{line.slice(2)}</li>;
                if (line.match(/^\d+\./)) return <li key={i} className="ml-4 text-sm leading-relaxed list-decimal">{line.replace(/^\d+\.\s*/, "")}</li>;
                if (line.startsWith("---")) return <Separator key={i} className="my-4" />;
                if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="text-sm font-semibold">{line.replace(/\*\*/g, "")}</p>;
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="text-sm leading-relaxed">{line.replace(/`([^`]+)`/g, "«$1»")}</p>;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
