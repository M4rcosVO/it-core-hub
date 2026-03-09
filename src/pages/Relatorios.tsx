import { BarChart, Search, Download, FileText, Monitor, Network, Key, FileSignature } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";
import { computers, mobiles, peripherals, softwares } from "@/data/mockData";

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
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Relatórios & BI</h1>
                <p className="text-muted-foreground text-sm mt-1">Central de extração de dados e geração de documentos operacionais</p>
            </div>

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
                                {report.type === "CSV" ? <Download className="h-4 w-4" /> : <BarChart className="h-4 w-4" />}
                                Extrair {report.type}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
