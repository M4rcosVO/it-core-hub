import React, { useState } from "react";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    FileSignature,
    Clock,
    Printer,
    Wrench,
    Search,
    Filter,
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
    eachDayOfInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";

// Mock events based on simulated data
const events = [
    { id: 1, date: new Date(2026, 2, 15), title: "Garantia: WKS-ADM-001", type: "hardware", icon: ShieldAlert, color: "text-destructive bg-destructive/10" },
    { id: 2, date: new Date(2026, 2, 20), title: "Contrato: Claro Fibra (Review)", type: "contract", icon: FileSignature, color: "text-warning bg-warning/10" },
    { id: 3, date: new Date(2026, 2, 10), title: "Rotina: Backup Mensal", type: "routine", icon: Clock, color: "text-primary bg-primary/10" },
    { id: 4, date: new Date(2026, 2, 25), title: "Garantia: HP EliteDesk", type: "hardware", icon: ShieldAlert, color: "text-destructive bg-destructive/10" },
    { id: 5, date: new Date(2026, 2, 5), title: "Manutenção: Ar Condicionado DC", type: "maintenance", icon: Wrench, color: "text-indigo-500 bg-indigo-500/10" },
    { id: 6, date: new Date(2026, 2, 28), title: "Contrato: Dell ProSupport (Urgente)", type: "contract", icon: FileSignature, color: "text-destructive bg-destructive/10 border border-destructive/20" },
];

export default function Calendario() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1)); // Fixed starting month for demo consistency
    const [selectedDate, setSelectedDate] = useState(new Date(2026, 2, 10));

    const nextMonth = () => {
        const newMonth = addMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        setSelectedDate(startOfMonth(newMonth));
    };
    const prevMonth = () => {
        const newMonth = subMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        setSelectedDate(startOfMonth(newMonth));
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-2 mb-6">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CalendarDays className="h-6 w-6 text-primary" /> Calendário Mestre TI
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">Acompanhamento de prazos, contratos e manutenções agendadas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2"><Filter className="h-3.5 w-3.5" /> Filtrar</Button>
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
    };

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
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const dayEvents = events.filter(e => isSameDay(e.date, cloneDay));

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[110px] p-2 border-r border-b border-border/40 transition-colors hover:bg-muted/20 ${!isSameMonth(day, monthStart) ? "bg-muted/10 opacity-40 text-muted-foreground" : ""
                            } ${isSameDay(day, new Date()) ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}`}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-medium ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center -ml-1 -mt-1" : ""}`}>
                                {format(day, "d")}
                            </span>
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
                            <CardTitle className="text-sm">Evento Selecionado</CardTitle>
                            <CardDescription className="text-[10px] text-slate-400">
                                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-6">
                            {events.filter(e => isSameDay(e.date, selectedDate)).length > 0 ? (
                                <div className="space-y-4">
                                    {events.filter(e => isSameDay(e.date, selectedDate)).map(event => (
                                        <div key={event.id} className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-full ${event.color}`}>
                                                    <event.icon className="h-3.5 w-3.5" />
                                                </div>
                                                <h4 className="text-sm font-bold tracking-tight leading-none">{event.title}</h4>
                                            </div>
                                            <p className="text-[11px] text-slate-400">Prazos e ações necessárias para manter o SLA do serviço.</p>
                                            <Button size="sm" variant="outline" className="w-full h-8 text-[11px] bg-transparent border-white/10 hover:bg-white/5 hover:text-white">Ver Detalhes</Button>
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

                    <Card className="shadow-sm overflow-hidden group">
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estatísticas Mensais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Garantias a Vencer</span>
                                <span className="font-bold text-destructive">2</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Renovações de Contrato</span>
                                <span className="font-bold text-warning">2</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Rotinas Concluídas</span>
                                <span className="font-bold text-success">15/20</span>
                            </div>
                            <Button size="sm" className="w-full gap-2 mt-2">
                                <Printer className="h-3.5 w-3.5" /> Gerar Relatório Mensal
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
