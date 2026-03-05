import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "Administrador" | "Técnico N1" | "Auditor";

interface AuthContextType {
    userRole: Role;
    setUserRole: (role: Role) => void;
    hasPermission: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<Role, string[]> = {
    "Administrador": ["Dashboard", "Inventário", "Rede", "Contratos", "Wiki", "Acessos", "Configurações", "Rotinas", "Calendário"],
    "Técnico N1": ["Dashboard", "Inventário", "Wiki", "Rotinas", "Calendário"],
    "Auditor": ["Dashboard", "Auditoria", "Inventário", "Wiki", "Calendário"]
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
