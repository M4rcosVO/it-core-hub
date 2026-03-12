import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "Administrador" | "Técnico N1" | "Auditor";

interface AuthContextType {
    userRole: Role;
    setUserRole: (role: Role) => void;
    hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<Role, string[]> = {
    "Administrador": [
        "Dashboard", "Inventário & Licenças", "Rede & Infra", "Contratos", "Wiki", "Gestão de Acessos",
        "Configurações", "Rotinas", "Calendário", "Relatórios", "Demandas",
        "FinOps & Orçamento", "Status dos Serviços", "Onboarding (RH)",
        "Compras & Cotações", "CMDB Visual (Grafo)", "Painel NOC (TV)", "Service Desk (Portal)"
    ],
    "Técnico N1": [
        "Dashboard", "Inventário & Licenças", "Rede & Infra", "Wiki", "Rotinas", "Calendário",
        "Demandas", "Status dos Serviços", "CMDB Visual (Grafo)", "Painel NOC (TV)", "Service Desk (Portal)"
    ],
    "Auditor": ["Dashboard", "Auditoria", "Inventário & Licenças", "Wiki", "Calendário", "Relatórios", "Service Desk (Portal)"]
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userRole, setUserRole] = useState<Role>("Administrador");

    const hasPermission = (module: string) => {
        const permissions = rolePermissions[userRole];
        return permissions.includes(module) || permissions.includes(`${module} (Leitura)`);
    };

    return (
        <AuthContext.Provider value={{ userRole, setUserRole, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
