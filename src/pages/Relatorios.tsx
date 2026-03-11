import { BarChart as BarChartIcon, Search, Download, FileText, Monitor, Network, Key, FileSignature, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";
import { computers, mobiles, peripherals, softwares } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const serviceDeskOrigin = [
    { name: "Comercial", chamados: 145 },
    { name: "Financeiro", chamados: 82 },
    { name: "RH", chamados: 54 },
    { name: "Operação", chamados: 120 },
    { name: "Diretoria", chamados: 12 },
];

const slaData = [
    { name: "Dentro do SLA", value: 88, color: "hsl(var(--success))" },
    { name: "Atrasado", value: 12, color: "hsl(var(--destructive))" },
];

export default function Relatorios() {
    const { addLog } = useAudit();

    const handleExportInventarioCSV = () => {
        const dataToExport = [...computers, ...mobiles, ...peripherals];
        if (dataToExport.length === 0) {
            toast({ title: "Nenhum dado", description: "O inventário está vazio." });
            return;
        }

        const headers = Object.keys(dataToExport[0]).filter(k => k !== "historico").join(",");
        const rows = dataToExport.map(obj =>
            Object.keys(obj)
                .filter(k => k !== "historico")
                .map(k => `"${String((obj as any)[k]).replace(/"/g, '""')}"`)
                .join(",")
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(headers + "\n" + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", `IT_Inventario_Geral_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: "Exportação Concluída", description: "O arquivo CSV do Inventário foi baixado com sucesso." });
        addLog({ user: "Admin", action: "Exportação CSV", details: "Exportou inventário geral", module: "Relatórios & BI" });
    };

    const handleSimulatePDF = (reportName: string) => {
        toast({ title: "Relatório Gerado", description: `O relatório PDF de ${reportName} foi processado e salvo na sua máquina.` });
        addLog({ user: "Admin", action: "Geração de PDF", details: `Gerou relatório de ${reportName}`, module: "Relatórios & BI" });
    };

    const reportCards = [
        {
            title: "Inventário Geral",
            description: "Extração completa de todos os ativos computacionais, móveis e periféricos em formato de planilha.",
            icon: Monitor,
            type: "CSV",
            action: handleExportInventarioCSV,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Licenciamento de Software",
            description: "Relatório de conformidade e uso das licenças de software adquiridas.",
            icon: FileText,
            type: "PDF",
            action: () => handleSimulatePDF("Softwares e Licenças"),
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        {
            title: "Topologia e IPs",
            description: "Documento com o mapeamento atual de IPs estáticos e infraestrutura física.",
            icon: Network,
            type: "PDF",
            action: () => handleSimulatePDF("Infraestrutura de Rede"),
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Acessos Corporativos",
            description: "Extrato de credenciais ativas no cofre de senhas da TI.",
            icon: Key,
            type: "CSV",
            action: () => handleSimulatePDF("Acessos"),
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Vencimento de Contratos",
            description: "Visão gerencial dos contratos de fornecedores próximos ao vencimento.",
            icon: FileSignature,
            type: "PDF",
            action: () => handleSimulatePDF("Contratos Críticos"),
            color: "text-red-500",
            bg: "bg-red-500/10"
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatórios Executivos & BI</h1>
                <p className="text-muted-foreground text-sm mt-1">Visão macro de indicadores e central de exportação de dados operacionais</p>
            </div>

            {/* BI Charts Section */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <TrendingUp className="h-5 w-5 text-primary" /> Visão Estratégica (Mês Atual)
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Origin of Service Desk Calls */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChartIcon className="w-5 h-5 text-blue-500" /> Origem de Chamados (Setores)
                            </CardTitle>
                            <CardDescription>Volume de chamados abertos no Service Desk por área.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={serviceDeskOrigin} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'hsl(var(--muted-foreground)/0.1)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="chamados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* SLA Compliance */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-emerald-500" /> Cumprimento de SLA (Geral)
                            </CardTitle>
                            <CardDescription>Taxa de resolução de demandas dentro do prazo estipulado.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={slaData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {slaData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        formatter={(value: number) => [`${value}%`, 'Porcentagem']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-success">{slaData[0].value}%</span>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">Dentro do SLA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Export Cards Section */}
            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                    <Download className="h-5 w-5 text-primary" /> Extração de Dados (Data Dumps)
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {reportCards.map((report, idx) => (
                        <Card key={idx} className="flex flex-col hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className={`p-3 rounded-lg ${report.bg}`}>
                                    <report.icon className={`h-6 w-6 ${report.color}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{report.title}</CardTitle>
                                    <CardDescription className="text-xs uppercase font-medium mt-1">{report.type} Export</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 text-sm text-muted-foreground pt-4">
                                {report.description}
                            </CardContent>
                            <CardFooter className="pt-4 border-t">
                                <Button variant="secondary" className="w-full gap-2" onClick={report.action}>
                                    {report.type === "CSV" ? <Download className="h-4 w-4" /> : <BarChartIcon className="h-4 w-4" />}
                                    Extrair {report.type}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            );
}
