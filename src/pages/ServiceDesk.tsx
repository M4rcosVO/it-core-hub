import { useState } from "react";
import { Send, Server, Laptop, Unlock, HelpCircle, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TICKET_TYPES = [
    { id: "hardware", label: "Equipamento / Hardware", icon: Laptop, desc: "Problemas com Notebook, Monitor, Mouse" },
    { id: "software", label: "Sistema / Software", icon: Server, desc: "Acesso ao ERP, Lerdeza no Sistema" },
    { id: "acesso", label: "Acessos / Senhas", icon: Unlock, desc: "Reset de Senhas, Desbloqueio de Usuário" },
    { id: "duvida", label: "Dúvida / Outros", icon: HelpCircle, desc: "Informações gerais" },
];

export default function ServiceDesk() {
    const { addLog } = useAudit();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nome: "",
        setor: "",
        tipo: "",
        urgencia: "Media",
        assunto: "",
        descricao: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tipo) {
            toast({ title: "Erro de Validação", description: "Selecione o tipo de problema.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            setIsSubmitting(false);
            toast({
                title: "Chamado Aberto com Sucesso!",
                description: `Ticket #${Math.floor(Math.random() * 1000) + 1000} gerado. A TI já foi notificada.`,
            });
            addLog({ user: formData.nome || "Usuário FInal", action: "Abertura de Chamado", details: `Novo chamado: ${formData.assunto} (${formData.urgencia})`, module: "Demandas" });

            // Reset
            setFormData({ nome: "", setor: "", tipo: "", urgencia: "Media", assunto: "", descricao: "" });
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                    <Activity className="h-8 w-8" /> Portal de Atendimento TI
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Precisa de ajuda com equipamentos, sistemas ou acessos? Abra um chamado abaixo.
                </p>
            </div>

            <Card className="border shadow-lg">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-xl">Novo Chamado (Ticket)</CardTitle>
                        <CardDescription>Preencha os dados de forma clara para agilizar o atendimento.</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-6">

                        {/* 1. Identification */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase text-muted-foreground border-b pb-2">1. Identificação</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome">Seu Nome Completo *</Label>
                                    <Input id="nome" name="nome" placeholder="Ex: João da Silva" value={formData.nome} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="setor">Qual é o seu Setor? *</Label>
                                    <Input id="setor" name="setor" placeholder="Ex: Comercial, RH, Financeiro" value={formData.setor} onChange={handleChange} required />
                                </div>
                            </div>
                        </div>

                        {/* 2. Type */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase text-muted-foreground border-b pb-2">2. Qual o tipo de solicitação? *</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {TICKET_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, tipo: type.id })}
                                        className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all ${formData.tipo === type.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border hover:border-primary/50 bg-card'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${formData.tipo === type.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                <type.icon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-base">{type.label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground text-left">{type.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold uppercase text-muted-foreground border-b pb-2">3. Detalhes do Problema</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="assunto">Assunto Resumido *</Label>
                                    <Input id="assunto" name="assunto" placeholder="Ex: Erro ao tentar abrir o Excel" value={formData.assunto} onChange={handleChange} required maxLength={80} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="descricao">Descrição Detalhada *</Label>
                                        <span className="text-xs text-muted-foreground">Seja o mais específico possível</span>
                                    </div>
                                    <Textarea
                                        id="descricao"
                                        name="descricao"
                                        placeholder="Descreva o que aconteceu, as mensagens de erro (se houver) e o que você estava tentando fazer."
                                        rows={5}
                                        value={formData.descricao}
                                        onChange={handleChange}
                                        required
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-3 pt-2">
                                    <Label className="block">Nível de Impacto (Urgência)</Label>
                                    <RadioGroup value={formData.urgencia} onValueChange={(val) => setFormData({ ...formData, urgencia: val })} className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value="Baixa" id="urg-baixa" />
                                            <Label htmlFor="urg-baixa" className="cursor-pointer flex-1">Baixo (Dúvidas, Não afeta o trabalho)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-muted/50 transition-colors">
                                            <RadioGroupItem value="Media" id="urg-media" />
                                            <Label htmlFor="urg-media" className="cursor-pointer flex-1">Médio (Afeta parte do trabalho)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 border border-destructive/30 bg-destructive/5 p-3 rounded-lg flex-1 cursor-pointer hover:bg-destructive/10 transition-colors">
                                            <RadioGroupItem value="Alta" id="urg-alta" />
                                            <Label htmlFor="urg-alta" className="cursor-pointer flex-1 text-destructive font-bold">Crítico (Trabalho 100% parado)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>

                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t p-6 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground max-w-xs">
                            Sua solicitação entrará automaticamente na fila de atendimento da equipe de TI.
                        </p>
                        <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-r-transparent animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Enviar Chamado
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
