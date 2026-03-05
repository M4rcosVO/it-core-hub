import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
    data: { label: string; value: number; color: string }[];
    title: string;
}

export const BarChart: React.FC<ChartProps> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                                <span>{item.label}</span>
                                <span>{item.value}</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: item.color
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export const PieChart: React.FC<ChartProps> = ({ data, title }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let cumulativePercent = 0;

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <div className="relative h-32 w-32 rounded-full overflow-hidden flex items-center justify-center bg-muted/20">
                    <svg viewBox="0 0 32 32" className="h-full w-full -rotate-90">
                        {data.map((item) => {
                            const percent = (item.value / total) * 100;
                            const dashArray = `${percent} ${100 - percent}`;
                            const dashOffset = -cumulativePercent;
                            cumulativePercent += percent;

                            return (
                                <circle
                                    key={item.label}
                                    cx="16"
                                    cy="16"
                                    r="16"
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="32"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={dashOffset}
                                    className="transition-all duration-1000"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-4 bg-background rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xl font-bold">{total}</span>
                        <span className="text-[8px] text-muted-foreground uppercase tracking-tighter">Total</span>
                    </div>
                </div>
                <div className="ml-6 space-y-1.5">
                    {data.map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground">{Math.round((item.value / total) * 100)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
