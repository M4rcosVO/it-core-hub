import React, { createContext, useContext, useState, ReactNode } from "react";
import {
    computers as initialComputers,
    mobiles as initialMobiles,
    softwares as initialSoftwares,
    emprestimos as initialEmprestimos,
    peripherals as initialPeripherals,
    ipList as initialIpList,
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
    contatoNome: string;
    contatoTelefone: string;
    contatoEmail: string;
    sla: string;
    observacoes: string;
};

type Acesso = {
    id: number;
    nome: string;
    url: string;
    usuario: string;
    senha: string;
    categoria: string;
    setor: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
};

type IpEntry = {
    ip: string;
    dispositivo: string;
    setor: string;
};

// ─────────────────────────────────────────────
// Initial contract and access data (single source)
// ─────────────────────────────────────────────
import { Shield, Database, Globe, Mail, Key } from "lucide-react";

const initialContratos: Contrato[] = [
    { id: 1, fornecedor: "Vivo Empresas", servico: "Link Internet Dedicado 1Gbps", tipo: "Conectividade", vencimento: "15/12/2026", valorMensal: "R$ 1.250,00", status: "Ativo", contatoNome: "Ana Gerente de Contas", contatoTelefone: "(11) 99999-1111", contatoEmail: "ana.corp@vivo.com.br", sla: "99.9% uptime, 4h reparo", observacoes: "Link primário da matriz. Possui IP Fixo." },
    { id: 2, fornecedor: "Claro Fibra", servico: "Link Backup 600Mbps", tipo: "Conectividade", vencimento: "20/05/2025", valorMensal: "R$ 300,00", status: "Atenção", contatoNome: "Suporte B2B Claro", contatoTelefone: "0800 720 1234", contatoEmail: "b2b@claro.com.br", sla: "24h reparo", observacoes: "Link secundário configurado em failover no FortiGate." },
    { id: 3, fornecedor: "Simpress", servico: "Outsourcing de Impressão (3 Maq.)", tipo: "Equipamentos", vencimento: "10/01/2025", valorMensal: "R$ 850,00", status: "Ativo", contatoNome: "Técnico Regional", contatoTelefone: "(11) 4004-9999", contatoEmail: "suporte@simpress.com.br", sla: "NBD (Next Business Day) para peças", observacoes: "Inclui franquia de 10.000 cópias P&B mês." },
    { id: 4, fornecedor: "Locaweb", servico: "Hospedagem Site + E-mail", tipo: "Software/Cloud", vencimento: "05/08/2025", valorMensal: "R$ 120,00", status: "Ativo", contatoNome: "Painel Locaweb", contatoTelefone: "(11) 3544-0444", contatoEmail: "—", sla: "99.8% uptime", observacoes: "Renovação automática no cartão corporativo." },
    { id: 5, fornecedor: "Dell Computadores", servico: "Garantia ProSupport Servers", tipo: "Equipamentos", vencimento: "20/11/2024", valorMensal: "Pagamento Anual", status: "Crítico", contatoNome: "Dell ProSupport", contatoTelefone: "0800 970 3355", contatoEmail: "—", sla: "Atendimento on-site 4h", observacoes: "Urgente: Renovar para manter cobertura do SRV-ERP-01." },
];

const initialAcessos: Acesso[] = [
    { id: 1, nome: "FortiGate VPN", url: "vpn.gellak.com.br", usuario: "admin.ti", senha: "SuperSecretPassword123!", categoria: "VPN", setor: "TI", icon: Shield },
    { id: 2, nome: "Totvs Protheus", url: "192.168.1.10:8080", usuario: "admin_erp", senha: "ErpPassword2024", categoria: "ERP", setor: "Geral", icon: Database },
    { id: 3, nome: "Painel Admin Site", url: "gellak.com.br/wp-admin", usuario: "webmaster", senha: "Wp#Admin$2024", categoria: "Web", setor: "Marketing", icon: Globe },
    { id: 4, nome: "Office 365 Admin", url: "admin.microsoft.com", usuario: "ti@gellak.com.br", senha: "O365@Gellak2024", categoria: "E-mail", setor: "TI", icon: Mail },
    { id: 5, nome: "OpenVPN Filial SP", url: "sp.vpn.gellak.com.br", usuario: "joao.almeida", senha: "VpnSp2024!", categoria: "VPN", setor: "Comercial", icon: Shield },
];

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
type DataContextType = {
    // Contratos
    contratos: Contrato[];
    addContrato: (c: Omit<Contrato, "id">) => void;
    updateContrato: (c: Contrato) => void;
    removeContrato: (id: number) => void;

    // Acessos
    acessos: Acesso[];
    addAcesso: (a: Omit<Acesso, "id">) => void;
    updateAcesso: (a: Acesso) => void;
    removeAcesso: (id: number) => void;

    // IP List
    ipList: IpEntry[];
    addIp: (entry: IpEntry) => void;
    removeIp: (ip: string) => void;

    // Re-exported read-only from mockData
    computers: typeof initialComputers;
    mobiles: typeof initialMobiles;
    softwares: typeof initialSoftwares;
    emprestimos: typeof initialEmprestimos;
    peripherals: typeof initialPeripherals;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
    const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
    const [acessos, setAcessos] = useState<Acesso[]>(initialAcessos);
    const [ipList, setIpList] = useState<IpEntry[]>(initialIpList);

    const addContrato = (c: Omit<Contrato, "id">) =>
        setContratos((prev) => [...prev, { ...c, id: Date.now() }]);
    const updateContrato = (c: Contrato) =>
        setContratos((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    const removeContrato = (id: number) =>
        setContratos((prev) => prev.filter((x) => x.id !== id));

    const addAcesso = (a: Omit<Acesso, "id">) =>
        setAcessos((prev) => [...prev, { ...a, id: Date.now() }]);
    const updateAcesso = (a: Acesso) =>
        setAcessos((prev) => prev.map((x) => (x.id === a.id ? a : x)));
    const removeAcesso = (id: number) =>
        setAcessos((prev) => prev.filter((x) => x.id !== id));

    const addIp = (entry: IpEntry) =>
        setIpList((prev) => [...prev, entry]);
    const removeIp = (ip: string) =>
        setIpList((prev) => prev.filter((x) => x.ip !== ip));

    return (
        <DataContext.Provider
            value={{
                contratos,
                addContrato,
                updateContrato,
                removeContrato,
                acessos,
                addAcesso,
                updateAcesso,
                removeAcesso,
                ipList,
                addIp,
                removeIp,
                computers: initialComputers,
                mobiles: initialMobiles,
                softwares: initialSoftwares,
                emprestimos: initialEmprestimos,
                peripherals: initialPeripherals,
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
