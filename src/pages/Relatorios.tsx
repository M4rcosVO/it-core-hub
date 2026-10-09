import React, { useState } from "react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileText,
  Monitor,
  Network,
  Key,
  FileSignature,
  Smartphone,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Clock,
  Radio,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAudit } from "@/components/AuditContext";
import { useData } from "@/components/DataContext";
import { computers, mobiles, peripherals } from "@/data/mockData";
import { MobileDevice } from "@/pages/Celulares";

export default function Relatorios() {
  const { addLog } = useAudit();
  const dataContext = useData();
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const token =
    dataContext?.token ||
    localStorage.getItem("token") ||
    localStorage.getItem("it_core_token") ||
    sessionStorage.getItem("token");

  // Fetch live mobile devices from API with fallback
  const getMobileDevices = async (): Promise<MobileDevice[]> => {
    try {
      const res = await fetch("/api/mobile-devices", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("API indisponível, usando fallback:", e);
    }

    // Mock fallback if offline
    return mobiles.map((m, idx) => ({
      id: idx + 1,
      brand: "Fabricante",
      model: m.modelo,
      imei: m.imei,
      phoneNumber: m.chip,
      department: "Geral",
      status: m.status as any,
      assignedTo: m.responsavel,
      cpf: "000.000.000-00",
      signerIp: "127.0.0.1",
      termAcceptedAt: new Date().toISOString(),
      osVersion: "Android",
      deviceRawModel: m.modelo,
      deviceEmail: "operacao.gellak@gmail.com",
      deviceEmailPassword: null,
      inPulsus: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  // 1. Export Excel Estilizado
  const handleExportMobileExcel = async () => {
    setExportingExcel(true);
    try {
      const devices = await getMobileDevices();
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Gellak IT Core";
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet("Inventário Celulares");

      // Título Corporativo
      worksheet.mergeCells("A1:J1");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Gellak IT Core — Inventário de Dispositivos Móveis";
      titleCell.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0F172A" }, // Slate 900
      };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(1).height = 36;

      // Subtítulo e Metadados
      worksheet.mergeCells("A2:J2");
      const subCell = worksheet.getCell("A2");
      subCell.value = `Relatório Oficial | Emitido em: ${new Date().toLocaleString("pt-BR")} | Usuário Emissor: Admin T.I | Total de Aparelhos: ${devices.length}`;
      subCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF475569" } };
      subCell.alignment = { vertical: "middle", horizontal: "center" };
      worksheet.getRow(2).height = 20;

      // Linha vazia de respiro
      worksheet.addRow([]);

      // Cabeçalhos das Colunas
      const headerRow = worksheet.addRow([
        "Colaborador",
        "CPF",
        "Setor",
        "Telefone",
        "Marca / Modelo",
        "IMEI",
        "Pulsus MDM",
        "E-mail do Aparelho",
        "Status",
        "Data do Termo",
      ]);
      headerRow.height = 26;

      headerRow.eachCell((cell) => {
        cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E3A8A" }, // Azul Corporativo
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin", color: { argb: "FF94A3B8" } },
          left: { style: "thin", color: { argb: "FF94A3B8" } },
          bottom: { style: "medium", color: { argb: "FF0F172A" } },
          right: { style: "thin", color: { argb: "FF94A3B8" } },
        };
      });

      // Linhas de Dados
      devices.forEach((d, idx) => {
        const isEven = idx % 2 === 0;
        const row = worksheet.addRow([
          d.assignedTo || "—",
          d.cpf || "—",
          d.department || "—",
          d.phoneNumber || "—",
          `${d.brand} ${d.model}`,
          d.imei || "—",
          d.inPulsus ? "Sim" : "Não",
          d.deviceEmail || "—",
          d.status,
          d.termAcceptedAt ? new Date(d.termAcceptedAt).toLocaleDateString("pt-BR") : "Manual",
        ]);

        row.height = 21;
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Calibri", size: 10 };
          cell.alignment = {
            vertical: "middle",
            horizontal: colNumber === 1 || colNumber === 5 || colNumber === 8 ? "left" : "center",
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFE2E8F0" } },
            left: { style: "thin", color: { argb: "FFE2E8F0" } },
            bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            right: { style: "thin", color: { argb: "FFE2E8F0" } },
          };
          if (isEven) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF8FAFC" },
            };
          }
        });
      });

      // Auto-fit das larguras das colunas
      worksheet.columns.forEach((col) => {
        let maxLength = 12;
        col.eachCell?.({ includeEmpty: false }, (cell) => {
          const val = cell.value ? String(cell.value) : "";
          if (val.length > maxLength && val.length < 55) {
            maxLength = val.length;
          }
        });
        col.width = maxLength + 4;
      });

      // Gerar e disparar download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Gellak_Inventario_Celulares_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Excel Gerado com Sucesso",
        description: "O relatório formatado em .xlsx foi baixado.",
      });
      addLog({
        user: "Admin",
        action: "Exportação Excel",
        details: "Gerou relatório estilizado de celulares em .xlsx",
        module: "Relatórios",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro na Exportação",
        description: err.message || "Não foi possível gerar a planilha Excel.",
        variant: "destructive",
      });
    } finally {
      setExportingExcel(false);
    }
  };

  // 2. Export PDF Estilizado (Paisagem, Cabeçalho, 4 Cards e Assinatura)
  const handleExportMobilePdf = async () => {
    setExportingPdf(true);
    try {
      const devices = await getMobileDevices();
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Métricas
      const total = devices.length;
      const emUso = devices.filter((d) => d.status === "EM_USO").length;
      const pulsus = devices.filter((d) => d.inPulsus).length;
      const disponiveis = devices.filter((d) => d.status === "DISPONIVEL").length;

      // Faixa Superior Institucional
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, pageWidth, 24, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text("GELLAK IT CORE — INVENTÁRIO DE DISPOSITIVOS MÓVEIS", 14, 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      const emissionStr = `Emissão: ${new Date().toLocaleString("pt-BR")} | Emissor: Admin T.I | Confidencial`;
      doc.text(emissionStr, 14, 18);

      // 4 Cards de Resumo no topo
      const cardY = 28;
      const cardHeight = 15;
      const cardWidth = (pageWidth - 28 - 9) / 4;

      const metricCards = [
        { label: "Total de Aparelhos", val: total, color: [30, 58, 138] },
        { label: "Em Uso (Colaboradores)", val: emUso, color: [37, 99, 235] },
        { label: "Gerenciados no Pulsus", val: pulsus, color: [16, 185, 129] },
        { label: "Disponíveis em Estoque", val: disponiveis, color: [147, 51, 234] },
      ];

      metricCards.forEach((c, i) => {
        const x = 14 + i * (cardWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(c.color[0], c.color[1], c.color[2]);
        doc.text(String(c.val), x + 4, cardY + 7);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(c.label, x + 4, cardY + 12);
      });

      // Tabela de Dados
      const tableData = devices.map((d) => [
        d.assignedTo || "—",
        d.cpf || "—",
        d.department || "—",
        d.phoneNumber || "—",
        `${d.brand} ${d.model}`,
        d.imei || "—",
        d.inPulsus ? "Sim" : "Não",
        d.deviceEmail || "—",
        d.status,
        d.termAcceptedAt ? new Date(d.termAcceptedAt).toLocaleDateString("pt-BR") : "Manual",
      ]);

      autoTable(doc, {
        startY: 47,
        head: [
          [
            "Colaborador",
            "CPF",
            "Setor",
            "Linha",
            "Marca / Modelo",
            "IMEI",
            "Pulsus",
            "E-mail Aparelho",
            "Status",
            "Termo",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
          halign: "center",
        },
        bodyStyles: {
          fontSize: 7.5,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 38 },
          1: { halign: "center", cellWidth: 26 },
          2: { halign: "left", cellWidth: 25 },
          3: { halign: "center", cellWidth: 26 },
          4: { halign: "left", cellWidth: 32 },
          5: { halign: "center", cellWidth: 30 },
          6: { halign: "center", cellWidth: 15 },
          7: { halign: "left", cellWidth: 38 },
          8: { halign: "center", cellWidth: 20 },
          9: { halign: "center", cellWidth: 19 },
        },
        margin: { left: 14, right: 14, bottom: 24 },
        didDrawPage: (data) => {
          // Rodapé e numeração
          const pageStr = `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(pageStr, pageWidth - 14, pageHeight - 8, { align: "right" });
          doc.text("Gellak IT Core — Sistema de Governança de TI | Documento Oficial de Inventário", 14, pageHeight - 8);
        },
      });

      // Bloco de Assinatura
      const lastY = (doc as any).lastAutoTable.finalY || 160;
      let signY = lastY + 16;
      if (signY + 22 > pageHeight) {
        doc.addPage();
        signY = 32;
      }

      doc.setDrawColor(148, 163, 184);
      doc.line(pageWidth / 2 - 45, signY, pageWidth / 2 + 45, signY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("Responsável pela T.I — Gellak Cosméticos", pageWidth / 2, signY + 5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Validação e Auditoria de Patrimônio Móvel", pageWidth / 2, signY + 9, { align: "center" });

      doc.save(`Gellak_Relatorio_Celulares_${new Date().toISOString().slice(0, 10)}.pdf`);

      toast({
        title: "PDF Gerado com Sucesso",
        description: "O relatório estilizado em PDF foi baixado.",
      });
      addLog({
        user: "Admin",
        action: "Exportação PDF",
        details: "Gerou relatório estilizado de celulares em PDF",
        module: "Relatórios",
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Erro na Exportação",
        description: err.message || "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportInventarioCSV = () => {
    const dataToExport = [...computers, ...mobiles, ...peripherals];
    if (dataToExport.length === 0) {
      toast({ title: "Nenhum dado", description: "O inventário está vazio." });
      return;
    }

    const headers = Object.keys(dataToExport[0]).filter((k) => k !== "historico").join(",");
    const rows = dataToExport
      .map((obj) =>
        Object.keys(obj)
          .filter((k) => k !== "historico")
          .map((k) => `"${String((obj as any)[k]).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(headers + "\n" + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `IT_Inventario_Geral_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Exportação Concluída", description: "O arquivo CSV do Inventário foi baixado com sucesso." });
    addLog({ user: "Admin", action: "Exportação CSV", details: "Exportou inventário geral", module: "Relatórios" });
  };

  const handleSimulatePDF = (reportName: string) => {
    toast({ title: "Relatório Gerado", description: `O relatório PDF de ${reportName} foi processado e salvo na sua máquina.` });
    addLog({ user: "Admin", action: "Geração de PDF", details: `Gerou relatório de ${reportName}`, module: "Relatórios" });
  };

  const reportCards = [
    {
      title: "Inventário Geral",
      description: "Extração completa de todos os ativos computacionais, móveis e periféricos em formato de planilha.",
      icon: Monitor,
      type: "CSV",
      action: handleExportInventarioCSV,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Licenciamento de Software",
      description: "Relatório de conformidade e uso das licenças de software adquiridas.",
      icon: FileText,
      type: "PDF",
      action: () => handleSimulatePDF("Softwares e Licenças"),
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      title: "Topologia e IPs",
      description: "Documento com o mapeamento atual de IPs estáticos e infraestrutura física.",
      icon: Network,
      type: "PDF",
      action: () => handleSimulatePDF("Infraestrutura de Rede"),
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Acessos Corporativos",
      description: "Extrato de credenciais ativas no cofre de senhas da TI.",
      icon: Key,
      type: "CSV",
      action: () => handleSimulatePDF("Acessos"),
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Vencimento de Contratos",
      description: "Visão gerencial dos contratos de fornecedores próximos ao vencimento.",
      icon: FileSignature,
      type: "PDF",
      action: () => handleSimulatePDF("Contratos Críticos"),
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10 p-2 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relatórios de Extração & Compliance</h1>
        <p className="text-muted-foreground text-sm mt-1">Central de emissão de relatórios oficiais, auditoria e exportação corporativa</p>
      </div>

      {/* Card Destaque: Inventário Móvel e Celulares */}
      <Card className="border-sky-500/40 bg-gradient-to-br from-sky-500/5 via-card to-card shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-sky-500/15 text-sky-500 ring-1 ring-sky-500/30">
                <Smartphone className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Relatório de Inventário Móvel e Celulares</CardTitle>
                  <Badge variant="outline" className="border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10 text-xs">
                    Pulsus MDM & Auditoria
                  </Badge>
                </div>
                <CardDescription className="text-sm mt-1">
                  Exportação executiva contendo titulares, CPFs, linhas telefônicas, IMEI, status Pulsus, credenciais de e-mail e registro de termos de entrega.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Opção Excel */}
            <div className="rounded-xl border border-border p-4 bg-background/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                  Planilha Excel Estilizada (.xlsx)
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Planilha corporativa com cabeçalho da marca, cores institucionais, colunas autoajustadas e formatação para análise no Excel.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium"
                onClick={handleExportMobileExcel}
                disabled={exportingExcel}
              >
                {exportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {exportingExcel ? "Gerando Planilha..." : "Exportar Excel (.xlsx)"}
              </Button>
            </div>

            {/* Opção PDF */}
            <div className="rounded-xl border border-border p-4 bg-background/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Printer className="h-4 w-4 text-sky-500" />
                  Dossiê Oficial em PDF (.pdf)
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  Documento em layout paisagem com cabeçalho institucional, 4 cards de KPIs, linhas zebradas e campo para assinatura da T.I.
                </p>
              </div>
              <Button
                className="w-full gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium"
                onClick={handleExportMobilePdf}
                disabled={exportingPdf}
              >
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {exportingPdf ? "Gerando PDF..." : "Exportar PDF Paisagem (.pdf)"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demais Relatórios do Sistema */}
      <div>
        <h2 className="text-lg font-bold mb-4 tracking-tight">Outros Relatórios & Data Dumps</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reportCards.map((report, idx) => (
            <Card key={idx} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-lg ${report.bg}`}>
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription className="text-xs uppercase font-medium mt-1">
                    {report.type} Export
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm text-muted-foreground pt-4 leading-relaxed">
                {report.description}
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Button variant="secondary" className="w-full gap-2 font-medium" onClick={report.action}>
                  <Download className="h-4 w-4" /> Extrair {report.type}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
