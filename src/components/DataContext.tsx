import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Shield, Database, Globe, Mail, Key } from "lucide-react";
import {
    computers as initialComputers,
    mobiles as initialMobiles,
     softwares as initialSoftwares,
    emprestimos as initialEmprestimos,
    peripherals as initialPeripherals,
    setores as initialSetores,
} from "@/data/mockData";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Contrato = {
    id: number;
    fornecedor: string;
    servico: string;
    tipo: string;
    vencimento: string;
    valorMensal: string;
    status: string;
    contatoNome?: string;
    contatoTelefone?: string;
    contatoEmail?: string;
    sla?: string;
    observacoes?: string;
};

type Acesso = {
    id: number;
    nome: string;
    url?: string;
    usuario: string;
    senha: string;
    categoria: string;
    setor: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
};

type IpEntry = {
    ip: string;
    dispositivo: string;
    setor: string;
};

type User = {
    id: number;
    name: string;
    role: string;
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
type DataContextType = {
    // Auth
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;

    // Data
    contratos: Contrato[];
    acessos: Acesso[];
    ipList: IpEntry[];
    computers: any[];
    mobiles: any[];
    softwares: any[];
    emprestimos: any[];
    peripherals: any[];
    
    loading: boolean;
    error: string | null;
};

const DataContext = createContext<DataContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export function DataProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(JSON.parse(localStorage.getItem("it_core_user") || "null"));
    const [token, setToken] = useState<string | null>(localStorage.getItem("it_core_token"));
    
    const [contratos, setContratos] = useState<Contrato[]>([]);
    const [acessos, setAcessos] = useState<Acesso[]>([]);
    const [ipList, setIpList] = useState<IpEntry[]>([]);
    const [computers, setComputers] = useState<any[]>([]);
    const [mobiles, setMobiles] = useState<any[]>([]);
    const [softwares, setSoftwares] = useState<any[]>([]);
    const [emprestimos, setEmprestimos] = useState<any[]>([]);
    const [peripherals, setPeripherals] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const login = async (username: string, password: string) => {
        try {
            const resp = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            const data = await resp.json();
            if (data.token) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem("it_core_token", data.token);
                localStorage.setItem("it_core_user", JSON.stringify(data.user));
                return true;
            }
            return false;
        } catch (err) {
            console.error("Login Error:", err);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("it_core_token");
        localStorage.removeItem("it_core_user");
    };

    const fetchData = async () => {
        if (!token) {
            // If no token, we might want to fallback to mock data for demo purposes
            // or just stay in loading/error state if authentication is mandatory
            setComputers(initialComputers);
            setMobiles(initialMobiles);
            setSoftwares(initialSoftwares);
            setEmprestimos(initialEmprestimos);
            setPeripherals(initialPeripherals);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            // In a real implementation, we would fetch all these.
            // For now, we fetch what's available and fallback for others.
            const compsResp = await fetch(`${API_URL}/computers`, { headers });
            if (compsResp.ok) {
                const comps = await compsResp.json();
                setComputers(comps);
            } else {
                setComputers(initialComputers);
            }

            // Fallback for missing endpoints
            setMobiles(initialMobiles);
            setSoftwares(initialSoftwares);
            setEmprestimos(initialEmprestimos);
            setPeripherals(initialPeripherals);
            
            setError(null);
        } catch (err) {
            setError("Falha ao conectar ao servidor local.");
            // Fallback to mock on error so UI doesn't break
            setComputers(initialComputers);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    return (
        <DataContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                contratos,
                acessos,
                ipList,
                computers,
                mobiles,
                softwares,
                emprestimos,
                peripherals,
                loading,
                error
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useData must be used inside <DataProvider>");
    return ctx;
}

// Re-export icon helpers so callers can resolve icon by categoria
export const iconByCategoria: Record<string, React.ElementType> = {
    VPN: Shield,
    ERP: Database,
    Web: Globe,
    "E-mail": Mail,
};
export const defaultIcon = Key;
