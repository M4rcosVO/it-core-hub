import { useMemo } from "react";
import {
    DollarSign,
    TrendingUp,
    Download,
    TrendingDown,
    AlertCircle,
    Database,
    Cloud,
    Server,
    Laptop,
    User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/components/DataContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from "recharts";
import { finopsMonthlyData, finopsCategoryData } from "@/data/mockData";

export default function FinOps() {
    const { contratos } = useData();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Summing OPEX safely from mock strings "R$ 1.250,00"
    const currentOpex = useMemo(() => {
        return contratos.reduce((acc, c) => {
            if (c.valorMensal === "Pagamento Anual" || !c.valorMensal) return acc;
            const numericValue = parseFloat(c.valorMensal.replace("R$ ", "").replace(".", "").replace(",", "."));
            return acc + (isNaN(numericValue) ? 0 : numericValue);
        }, 0);
    }, [contratos]);

    const budgetMensal = 7500;
    const isOverBudget = currentOpex > budgetMensal;
    const progressBudget = Math.min((currentOpex / budgetMensal) * 100, 100);

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-primary" /> FinOps & Orçamento
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Gestão financeira, controle de OPEX/CAPEX e otimização de custos de TI.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={() => toast({ title: "Exportação Iniciada", description: "O Relatório Financeiro (PDF) está sendo gerado." })}>
                    <Download className="h-4 w-4" /> Exportar Relatório Financeiro
                </Button>
            </div>

            {/* Top Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">OPEX Mensal Projetado</CardTitle>
                        <TrendingUp className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentOpex)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-destructive flex items-center gap-1">
                            +4% em relação ao mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orçamento Consumido (Mês)</CardTitle>
                        <AlertCircle className={`h-4 w-4 ${isOverBudget ? 'text-destructive' : 'text-success'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progressBudget.toFixed(1)}%</div>
                        <Progress value={progressBudget} className={`mt-2 ${isOverBudget ? '[&>div]:bg-destructive' : '[&>div]:bg-success'}`} />
                        <p className="text-xs text-muted-foreground mt-1">
                            Limite: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgetMensal)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Economia Encontrada</CardTitle>
                        <TrendingDown className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">R$ 1.850,00</div>
                        <p className="text-xs text-muted-foreground mt-1">Oportunidades mapeadas (Licenses/Links ativos em desuso)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custo por Usuário (Unit Economics)</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ 145,20</div>
                        <p className="text-xs text-muted-foreground mt-1">Calculado considerando 48 colaboradores ativos</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Historico Chart */}
                <Card className="lg:col-span-4 border shadow-sm">
                    <CardHeader>
                        <CardTitle>Histórico de Custos (YTD)</CardTitle>
                        <CardDescription>
                            Comparativo entre investimentos em hardware (CAPEX) e custos recorrentes (OPEX).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={finopsMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCapex" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `R$${val / 1000}k`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <Tooltip
                                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                                />
                                <Legend />
                                <Area type="monotone" name="OPEX (Recorrente)" dataKey="opex" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorOpex)" strokeWidth={2} />
                                <Area type="monotone" name="CAPEX (Investimentos)" dataKey="capex" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCapex)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Categories Breakdown */}
                <Card className="lg:col-span-3 border shadow-sm">
                    <CardHeader>
                        <CardTitle>Distribuição OPEX por Categoria</CardTitle>
                        <CardDescription>
                            Onde o orçamento mensal está sendo alocado.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={finopsCategoryData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                <YAxis dataKey="name" type="category" width={140} fontSize={11} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                <Tooltip
                                    formatter={(value: number) => [`${value}%`, 'Fatia']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Alerts */}
            <h3 className="text-lg font-bold tracking-tight mt-8 mb-4">Recomendações de Otimização</h3>
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-warning/50 bg-warning/5">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="bg-warning/20 p-2 rounded-lg text-warning shrink-0">
                            <Cloud className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-warning-foreground">Licenças Ociosas (Microsoft 365)</h4>
                            <p className="text-xs text-muted-foreground mt-1">Identificamos 3 licenças 'Microsoft 365 Business' não atribuídas há mais de 30 dias.</p>
                            <Button variant="outline" size="sm" className="mt-3 text-xs border-warning text-warning hover:bg-warning/10" onClick={() => navigate("/inventario?tab=softwares")}>Revisar Licenças</Button>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-primary/30">
                    <CardContent className="p-4 flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                            <Server className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">Renovação de Garantia SRV-ERP-01</h4>
                            <p className="text-xs text-muted-foreground mt-1">A garantia de servidor expira no próximo mês. Recomendada avaliação de extensão ProSupport (Est. R$ 2.400/ano).</p>
                            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => navigate("/inventario?tab=infra")}>Acessar Inventário</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
