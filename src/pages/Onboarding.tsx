import { useState } from "react";
import {
    UserPlus,
    UserMinus,
    CheckCircle2,
    Settings,
    Laptop,
    Fingerprint,
    Mail,
    FileText,
    ArrowRight,
    ArrowLeft,
    Download,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAudit } from "@/components/AuditContext";
import { useToast } from "@/hooks/use-toast";

const JOB_ROLES = [
    { title: "Analista Financeiro", hardware: "Notebook Padrão", accesses: ["ERP Financeiro", "E-mail M365", "VPN Matriz"] },
    { title: "Desenvolvedor", hardware: "Notebook Alta Perf. + 2 Monitores", accesses: ["GitHub Enterprise", "AWS", "Jira", "E-mail M365", "VPN Dev"] },
    { title: "Diretor", hardware: "Ultrabook + iPhone Corporativo", accesses: ["E-mail M365", "VPN Matriz", "Pasta Confidencial"] },
];

export default function Onboarding() {
    const [mode, setMode] = useState<"onboarding" | "offboarding">("onboarding");
    const [step, setStep] = useState(1);
    const { addLog } = useAudit();
    const { toast } = useToast();

    // Form State
    const [nome, setNome] = useState("");
    const [cargo, setCargo] = useState("");
    const [dataInicio, setDataInicio] = useState("");

    const activeRole = JOB_ROLES.find(r => r.title === cargo);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleFinish = () => {
        addLog({
            user: "Usuário Logado",
            action: mode === "onboarding" ? "Novo Onboarding" : "Novo Offboarding",
            details: `Processo concluído para o funcionário: ${nome} (${cargo})`,
            module: 'Onboarding'
        });

        toast({
            title: "Processo Concluído!",
            description: `A jornada de ${mode} foi finalizada com sucesso.`,
            variant: "default",
        });

        setStep(1);
        setNome("");
        setCargo("");
        setDataInicio("");
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {mode === "onboarding" ? <UserPlus className="h-6 w-6 text-primary" /> : <UserMinus className="h-6 w-6 text-destructive" />}
                        Automação de {mode === "onboarding" ? "Onboarding" : "Offboarding"}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Guia interativo para provisionamento ou revogação de acessos e hardware.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto p-1 bg-muted rounded-lg">
                    <Button
                        variant={mode === "onboarding" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => { setMode("onboarding"); setStep(1); }}
                    >
                        Onboarding
                    </Button>
                    <Button
                        variant={mode === "offboarding" ? "default" : "ghost"}
                        className={mode === "offboarding" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                        size="sm"
                        onClick={() => { setMode("offboarding"); setStep(1); }}
                    >
                        Offboarding
                    </Button>
                </div>
            </div>

            {/* Wizard Steps Indicator */}
            <div className="flex items-center justify-between relative px-2 mb-8 mt-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-300 rounded-full" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                {[1, 2, 3, 4].map((s, idx) => {
                    const isActive = step === s;
                    const isPassed = step > s;
                    return (
                        <div key={s} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${isActive ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-md ring-4 ring-primary/20' :
                                isPassed ? 'bg-primary text-primary-foreground border-primary' :
                                    'bg-muted text-muted-foreground border-muted-foreground/30'
                                }`}>
                                {isPassed ? <CheckCircle2 className="h-5 w-5" /> : s}
                            </div>
                            <span className={`text-[10px] uppercase font-bold tracking-wider hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                {idx === 0 ? "Dados Iniciais" : idx === 1 ? "Equipamentos" : idx === 2 ? "Acessos" : "Conclusão"}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Form Area */}
            <Card className="border-border/50 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {step === 1 && <><Settings className="h-5 w-5 text-muted-foreground" /> Passo 1: Informações Cadastrais</>}
                        {step === 2 && <><Laptop className="h-5 w-5 text-muted-foreground" /> Passo 2: Alocação de Equipamento</>}
                        {step === 3 && <><Fingerprint className="h-5 w-5 text-muted-foreground" /> Passo 3: Provisionamento de Acessos</>}
                        {step === 4 && <><FileText className="h-5 w-5 text-muted-foreground" /> Passo 4: Termo de Responsabilidade</>}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Preencha os dados básicos do novo colaborador alinhado com o RH."}
                        {step === 2 && "Selecione a máquina que será entregue e adicione observações."}
                        {step === 3 && "O sistema sugere as permissões baseando-se no cargo selecionado."}
                        {step === 4 && "Gere o documento legal para assinatura do usuário antes da entrega."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px]">
                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input placeholder="Ex: João da Silva" value={nome} onChange={e => setNome(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Início previsto</Label>
                                    <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Cargo / Perfil de Acesso</Label>
                                    <Select value={cargo} onValueChange={setCargo}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o perfil do cargo..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {JOB_ROLES.map(r => (
                                                <SelectItem key={r.title} value={r.title}>{r.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            {!cargo ? (
                                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg flex flex-col items-center">
                                    <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                                    <p>Por favor, selecione um cargo no Passo 1 para ver as sugestões de hardware.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                        <h4 className="font-bold text-sm text-primary mb-1 flex items-center gap-2">
                                            <Laptop className="h-4 w-4" /> Hardware Sugerido (Padrão RH)
                                        </h4>
                                        <p className="text-sm">{activeRole?.hardware}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Vincular Patrimônio no Inventário</Label>
                                        <div className="flex gap-2">
                                            <Input placeholder="Código GELLAK-XXXX" />
                                            <Button variant="secondary" onClick={() => toast({ title: "Verificação Automática", description: "O script de automação checou o inventário e reservou o equipamento." })}>Buscar em Estoque</Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 text-warning flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Apenas 2 máquinas deste perfil no estoque atual.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            {!cargo ? (
                                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg">
                                    Volte e escolha um cargo no Passo 1.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm font-medium">Os seguintes acessos devem ser criados e configurados:</p>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {activeRole?.accesses.map(acesso => (
                                            <div key={acesso} className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg border border-border/50">
                                                <input type="checkbox" id={acesso} className="h-4 w-4 rounded border-gray-300 accent-primary" defaultChecked />
                                                <label htmlFor={acesso} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    {acesso}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                        <Label>E-mail Corporativo Sugerido</Label>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <Input readOnly value={nome ? `${nome.split(' ')[0].toLowerCase()}.${nome.split(' ').pop()?.toLowerCase()}@gellak.com.br` : ""} className="bg-muted font-mono" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4 */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-success/10 border border-success/20 p-6 rounded-lg text-center flex flex-col items-center">
                                <CheckCircle2 className="h-12 w-12 text-success mb-2" />
                                <h3 className="font-bold text-lg">Tudo pronto para integração</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                    O pacote de hardware e os acessos lógicos foram definidos de acordo com as políticas do cargo de <b>{cargo}</b> para o funcionário <b>{nome}</b>.
                                </p>
                            </div>

                            <Card className="bg-muted/30 border-dashed">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                    <FileText className="h-8 w-8 text-muted-foreground mb-3" />
                                    <h4 className="font-bold text-sm mb-1">Termo de Responsabilidade Gerado</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Este documento inclui o aceite das regras de segurança da informação e a custódia do notebook listado.
                                    </p>
                                    <Button className="gap-2">
                                        <Download className="h-4 w-4" /> Baixar PDF para Assinatura
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border/50 bg-muted/10 p-4">
                    <Button variant="outline" onClick={handlePrev} disabled={step === 1} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>

                    {step < 4 ? (
                        <Button onClick={handleNext} disabled={step === 1 && (!nome || !cargo || !dataInicio)} className="gap-2">
                            Avançar <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleFinish} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                            <CheckCircle2 className="h-4 w-4" /> Concluir Processo
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
