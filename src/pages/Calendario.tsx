import React, { useState, useMemo } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    FileSignature,
    Clock,
    Printer,
    Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    parse,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useData } from "@/components/DataContext";
import { computers, mobiles } from "@/data/mockData";

// ─────────────────────────────────────────────
// Event helpers
// ─────────────────────────────────────────────

type EventType = "contract" | "hardware" | "routine" | "maintenance";

type CalEvent = {
    id: string;
    date: Date;
    title: string;
    type: EventType;
    icon: React.ElementType;
    color: string;
    details?: string;
};

const typeStyles: Record<EventType, string> = {
    contract: "text-warning bg-warning/10",
    hardware: "text-destructive bg-destructive/10",
    routine: "text-primary bg-primary/10",
    maintenance: "text-indigo-500 bg-indigo-500/10",
};

function parseDate(str: string): Date | null {
    if (!str || str === "—" || str.includes("Automática") || str === "Pagamento Anual") return null;
    try {
        return parse(str, "dd/MM/yyyy", new Date());
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function Calendario() {
    const { contratos } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // ── Build dynamic events from live data ──────────────────────
    const events = useMemo<CalEvent[]>(() => {
        const evts: CalEvent[] = [];

        // Contract due dates
        contratos.forEach((c) => {
            const d = parseDate(c.vencimento);
            if (!d) return;
            const isCritical = c.status === "Crítico";
            evts.push({
                id: `crt-${c.id}`,
                date: d,
                title: `Contrato: ${c.fornecedor}`,
                type: "contract",
                icon: FileSignature,
                color: isCritical
                    ? "text-destructive bg-destructive/10 border border-destructive/20"
                    : typeStyles.contract,
                details: `${c.servico} — Valor: ${c.valorMensal}`,
            });
        });

        // Asset warranty expiry
        [...computers, ...mobiles].forEach((a: { id: number; hostname?: string; modelo?: string; garantiaVencimento?: string }) => {
            if (!a.garantiaVencimento) return;
            const d = parseDate(a.garantiaVencimento);
            if (!d) return;
            evts.push({
                id: `gar-${a.id}`,
                date: d,
                title: `Garantia: ${a.hostname || a.modelo}`,
                type: "hardware",
                icon: ShieldAlert,
                color: typeStyles.hardware,
                details: `Vencimento da garantia do ativo.`,
            });
        });

        // Fixed routine reminders (monthly cadence — always on 15th)
        const monthStart = startOfMonth(currentMonth);
        evts.push({
            id: `rot-bkp-${format(monthStart, "yyyyMM")}`,
            date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
            title: "Rotina: Backup Mensal",
            type: "routine",
            icon: Clock,
            color: typeStyles.routine,
            details: "Verificação e relatório de backup mensal.",
        });

        return evts;
    }, [contratos, currentMonth]);

    // ── Live stats (current month) ────────────────────────────────
    const statsWarranty = events.filter(
        (e) => e.type === "hardware" && isSameMonth(e.date, currentMonth)
    ).length;
    const statsContracts = events.filter(
        (e) => e.type === "contract" && isSameMonth(e.date, currentMonth)
    ).length;

    const nextMonth = () => {
        const m = addMonths(currentMonth, 1);
        setCurrentMonth(m);
        setSelectedDate(startOfMonth(m));
    };
    const prevMonth = () => {
        const m = subMonths(currentMonth, 1);
        setCurrentMonth(m);
        setSelectedDate(startOfMonth(m));
    };

    // ── Render helpers ─────────────────────────────────────────────
    const renderHeader = () => (
        <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <CalendarDays className="h-6 w-6 text-primary" /> Calendário Mestre TI
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Prazos de contratos e garantias carregados automaticamente.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-muted/30 rounded-lg p-1 border">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-4 text-sm font-semibold min-w-32 text-center capitalize">
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        return (
            <div className="grid grid-cols-7 mb-2 border-b border-border/50 pb-2">
                {days.map((day) => (
                    <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days: React.ReactNode[] = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter((e) => isSameDay(e.date, cloneDay));
                const isSelected = isSameDay(cloneDay, selectedDate);
                const isToday = isSameDay(cloneDay, new Date());

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[110px] p-2 border-r border-b border-border/40 transition-colors cursor-pointer
                            ${!isSameMonth(day, monthStart) ? "bg-muted/10 opacity-40 text-muted-foreground" : "hover:bg-muted/20"}
                            ${isToday ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}
                            ${isSelected && !isToday ? "bg-accent/30" : ""}`}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-medium ${isToday ? "bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center -ml-1 -mt-1" : ""}`}>
                                {format(day, "d")}
                            </span>
                            {dayEvents.length > 0 && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 mt-1" />
                            )}
                        </div>
                        <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    className={`text-[9px] px-1.5 py-0.5 rounded leading-tight font-medium flex items-center gap-1 truncate ${event.color}`}
                                >
                                    <event.icon className="h-2.5 w-2.5 shrink-0" />
                                    {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <p className="text-[8px] text-muted-foreground pl-1">+{dayEvents.length - 3} mais...</p>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-t border-l border-border/40 rounded-lg overflow-hidden shadow-sm">{rows}</div>;
    };

    const selectedDayEvents = events.filter((e) => isSameDay(e.date, selectedDate));

    return (
        <div className="animate-fade-in space-y-6">
            {renderHeader()}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <Card className="shadow-sm border-none bg-background/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            {renderDays()}
                            {renderCells()}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm border-white/5 bg-slate-950 text-white">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <CardTitle className="text-sm">Eventos do Dia</CardTitle>
                            <CardDescription className="text-[10px] text-slate-400">
                                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-6">
                            {selectedDayEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDayEvents.map((event) => (
                                        <div key={event.id} className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full ${event.color}`}>
                                                    <event.icon className="h-3.5 w-3.5" />
                                                </div>
                                                <h4 className="text-sm font-bold tracking-tight leading-none">{event.title}</h4>
                                            </div>
                                            {event.details && (
                                                <p className="text-[11px] text-slate-400">{event.details}</p>
                                            )}
                                            <div className="flex gap-1.5 flex-wrap mt-1">
                                                <Badge variant="outline" className="text-[9px] border-white/10 text-slate-400 uppercase">
                                                    {event.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                    <div className="p-3 bg-white/5 rounded-full">
                                        <Clock className="h-6 w-6 text-slate-500" />
                                    </div>
                                    <p className="text-xs text-slate-500">Nenhum evento crítico para este dia.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm overflow-hidden">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Estatísticas — {format(currentMonth, "MMMM", { locale: ptBR })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Garantias a Vencer</span>
                                <span className={`font-bold ${statsWarranty > 0 ? "text-destructive" : "text-success"}`}>
                                    {statsWarranty}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Renovações de Contrato</span>
                                <span className={`font-bold ${statsContracts > 0 ? "text-warning" : "text-success"}`}>
                                    {statsContracts}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Total de Eventos</span>
                                <span className="font-bold text-primary">
                                    {events.filter((e) => isSameMonth(e.date, currentMonth)).length}
                                </span>
                            </div>
                            <Button size="sm" className="w-full gap-2 mt-2" onClick={() => window.print()}>
                                <Printer className="h-3.5 w-3.5" /> Gerar Relatório Mensal
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
