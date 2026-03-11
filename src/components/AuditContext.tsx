import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AuditEntry = {
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
    module: 'Inventário' | 'Acessos' | 'Rede' | 'Contratos' | 'Wiki' | 'Config' | 'Dashboard' | 'Rotinas' | 'Relatórios & BI' | 'Demandas' | 'FinOps' | 'Onboarding' | 'Compras' | 'Cmdb';
};

interface AuditContextType {
    logs: AuditEntry[];
    addLog: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
    clearLogs: () => void;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logs, setLogs] = useState<AuditEntry[]>([]);

    const addLog = (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
        const newEntry: AuditEntry = {
            ...entry,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleString('pt-BR'),
        };
        setLogs((prev) => [newEntry, ...prev]);
    };

    const clearLogs = () => setLogs([]);

    return (
        <AuditContext.Provider value={{ logs, addLog, clearLogs }}>
            {children}
        </AuditContext.Provider>
    );
};

export const useAudit = () => {
    const context = useContext(AuditContext);
    if (context === undefined) {
        throw new Error('useAudit must be used within an AuditProvider');
    }
    return context;
};
