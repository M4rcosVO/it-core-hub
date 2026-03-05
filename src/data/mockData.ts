import { Shield, Database, Globe, Mail } from "lucide-react";

// ============================================================
// Shared Mock Data – imported by both page components and
// GlobalSearch so there are no cross-page circular deps.
// ============================================================

export const setores = ["Todos", "Administrativo", "Financeiro", "Comercial", "RH", "TI"];

// Inventário – Computadores
export const computers = [
    { id: 1, hostname: "WKS-ADM-001", modelo: "Dell OptiPlex 7090", processador: "Intel Core i7-11700", ram: "16 GB", armazenamento: "512 GB SSD", so: "Windows 11 Pro", responsavel: "Carlos Silva", setor: "Administrativo", status: "Ativo", patrimonio: "TI-001", garantiaVencimento: "15/03/2026", dataCompra: "15/03/2023", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "15/03/2023", usuario: "Admin TI" }, { evento: "Manutenção", data: "10/07/2024", usuario: "Suporte N2" }] },
    { id: 2, hostname: "WKS-FIN-012", modelo: "HP EliteDesk 800 G8", processador: "Intel Core i5-11500", ram: "8 GB", armazenamento: "256 GB SSD", so: "Windows 11 Pro", responsavel: "Ana Costa", setor: "Financeiro", status: "Ativo", patrimonio: "TI-002", garantiaVencimento: "22/07/2025", dataCompra: "22/07/2022", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "22/07/2022", usuario: "Admin TI" }] },
    { id: 3, hostname: "WKS-COM-033", modelo: "Lenovo ThinkCentre M70q", processador: "Intel Core i3-10100T", ram: "8 GB", armazenamento: "256 GB SSD", so: "Windows 10 Pro", responsavel: "Pedro Mendes", setor: "Comercial", status: "Em Manutenção", patrimonio: "TI-003", garantiaVencimento: "05/11/2024", dataCompra: "05/11/2021", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "05/11/2021", usuario: "Admin TI" }, { evento: "Troca de Tela", data: "15/01/2025", usuario: "Técnico Externo" }] },
    { id: 4, hostname: "SRV-ERP-01", modelo: "Dell PowerEdge R550", processador: "Intel Xeon Silver 4314", ram: "64 GB", armazenamento: "2 TB NVMe RAID", so: "Windows Server 2022", responsavel: "TI", setor: "Datacenter", status: "Ativo", patrimonio: "TI-SRV-001", garantiaVencimento: "30/06/2027", dataCompra: "30/06/2024", termoAssinado: false, historico: [] },
];

// Inventário – Celulares / Tablets
export const mobiles = [
    { id: 1, modelo: "iPhone 13 128GB", imei: "354612109876543", chip: "Vivo - (11) 91234-5678", responsavel: "Gerente Comercial", status: "Ativo", patrimonio: "TI-MOB-001", historico: [{ evento: "Entrega do Ativo", data: "10/01/2024", usuario: "Admin TI" }] },
    { id: 2, modelo: "Samsung Galaxy A54", imei: "490154203237518", chip: "Claro - (11) 98765-4321", responsavel: "Equipe de Campo", status: "Disponível", patrimonio: "TI-MOB-002", historico: [{ evento: "Devolução", data: "01/03/2026", usuario: "Camila Souza" }] },
];

// Inventário – Softwares
export const softwares = [
    { id: 1, nome: "Microsoft 365 Business", fabricante: "Microsoft", licenca: "Mensal por Usuário", qtd: 20, assigned: 17, vencimento: "Renovação Automática" },
    { id: 2, nome: "Adobe Acrobat Pro", fabricante: "Adobe", licenca: "Anual por Usuário", qtd: 5, assigned: 4, vencimento: "01/08/2025" },
    { id: 3, nome: "Totvs Protheus", fabricante: "Totvs", licenca: "Vitalícia", qtd: 1, assigned: 1, vencimento: "—" },
    { id: 4, nome: "AutoCAD 2024", fabricante: "Autodesk", licenca: "Subscrição Anual", qtd: 2, assigned: 1, vencimento: "20/03/2025" },
];

// Inventário – Empréstimos
export const emprestimos = [
    { id: 1, equipamento: "Notebook Dell Vostro (NTB-COM-045)", solicitante: "Pedro Mendes", dataRetirada: "04/03/2026", previsaoDevolucao: "06/03/2026", status: "Emprestado", motivo: "Viagem a Filial SP" },
    { id: 2, equipamento: "Modem 4G Vivo (MOD-4G-02)", solicitante: "Juliana Rocha", dataRetirada: "01/03/2026", previsaoDevolucao: "03/03/2026", status: "Atrasado", motivo: "Evento Externo" },
    { id: 3, equipamento: "Projetor Epson WXGA", solicitante: "Carlos Silva", dataRetirada: "10/02/2026", previsaoDevolucao: "10/02/2026", status: "Devolvido", motivo: "Reunião de Diretoria" },
];

// Inventário – Periféricos
export const peripherals = [
    { id: 1, tipo: "Impressora", modelo: "HP LaserJet M404dn", serial: "CNB4G12345", setor: "Administrativo", status: "Ativo", ip: "192.168.1.50", patrimonio: "TI-PER-001", historico: [{ evento: "Instalação", data: "05/01/2025", usuario: "Rafael Lima" }] },
    { id: 2, tipo: "Scanner", modelo: "Fujitsu ScanSnap iX1600", serial: "SCN2024001", setor: "Financeiro", status: "Ativo", ip: "192.168.1.55", patrimonio: "TI-PER-002", historico: [{ evento: "Instalação", data: "12/03/2024", usuario: "Admin TI" }] },
    { id: 3, tipo: "Switch", modelo: "Cisco Catalyst 9300", serial: "FHH2412345", setor: "Datacenter", status: "Ativo", ip: "10.0.10.2", patrimonio: "TI-PER-003", historico: [{ evento: "Instalação no Rack 01", data: "20/06/2024", usuario: "Rafael Lima" }] },
];

// Cofre de Acessos
export const acessosData = [
    { id: 1, nome: "FortiGate VPN", url: "vpn.gellak.com.br", usuario: "admin.ti", senha: "SuperSecretPassword123!", categoria: "VPN", setor: "TI", icon: Shield },
    { id: 2, nome: "Totvs Protheus", url: "192.168.1.10:8080", usuario: "admin_erp", senha: "ErpPassword2024", categoria: "ERP", setor: "Geral", icon: Database },
    { id: 3, nome: "Painel Admin Site", url: "gellak.com.br/wp-admin", usuario: "webmaster", senha: "Wp#Admin$2024", categoria: "Web", setor: "Marketing", icon: Globe },
    { id: 4, nome: "Office 365 Admin", url: "admin.microsoft.com", usuario: "ti@gellak.com.br", senha: "O365@Gellak2024", categoria: "E-mail", setor: "TI", icon: Mail },
    { id: 5, nome: "OpenVPN Filial SP", url: "sp.vpn.gellak.com.br", usuario: "joao.almeida", senha: "VpnSp2024!", categoria: "VPN", setor: "Comercial", icon: Shield },
];

// Rede – IPs Reservados
export const ipList = [
    { ip: "192.168.1.10", dispositivo: "SRV-ERP-01", setor: "Datacenter" },
    { ip: "192.168.1.11", dispositivo: "SRV-FILE-01", setor: "Datacenter" },
    { ip: "192.168.1.20", dispositivo: "WKS-ADM-001", setor: "Administrativo" },
    { ip: "192.168.1.50", dispositivo: "HP LaserJet M404", setor: "Administrativo" },
    { ip: "192.168.1.55", dispositivo: "Fujitsu ScanSnap", setor: "Financeiro" },
    { ip: "192.168.1.100", dispositivo: "AP-WIFI-01", setor: "TI" },
    { ip: "192.168.1.101", dispositivo: "AP-WIFI-02", setor: "Comercial" },
    { ip: "10.0.0.1", dispositivo: "Firewall Fortinet", setor: "Datacenter" },
];

// Contratos
export const contratosData = [
    { id: 1, fornecedor: "Vivo Empresas", servico: "Link Internet Dedicado 1Gbps", tipo: "Conectividade", vencimento: "15/12/2026", valorMensal: "R$ 1.250,00", status: "Ativo", contatoNome: "Ana Gerente de Contas", contatoTelefone: "(11) 99999-1111", contatoEmail: "ana.corp@vivo.com.br", sla: "99.9% uptime, 4h reparo", observacoes: "Link primário da matriz. Possui IP Fixo." },
    { id: 2, fornecedor: "Claro Fibra", servico: "Link Backup 600Mbps", tipo: "Conectividade", vencimento: "20/05/2025", valorMensal: "R$ 300,00", status: "Atenção", contatoNome: "Suporte B2B Claro", contatoTelefone: "0800 720 1234", contatoEmail: "b2b@claro.com.br", sla: "24h reparo", observacoes: "Link secundário configurado em failover no FortiGate." },
    { id: 3, fornecedor: "Simpress", servico: "Outsourcing de Impressão (3 Maq.)", tipo: "Equipamentos", vencimento: "10/01/2025", valorMensal: "R$ 850,00", status: "Ativo", contatoNome: "Técnico Regional", contatoTelefone: "(11) 4004-9999", contatoEmail: "suporte@simpress.com.br", sla: "NBD (Next Business Day) para peças", observacoes: "Inclui franquia de 10.000 cópias P&B mês." },
    { id: 4, fornecedor: "Locaweb", servico: "Hospedagem Site + E-mail", tipo: "Software/Cloud", vencimento: "05/08/2025", valorMensal: "R$ 120,00", status: "Ativo", contatoNome: "Painel Locaweb", contatoTelefone: "(11) 3544-0444", contatoEmail: "—", sla: "99.8% uptime", observacoes: "Renovação automática no cartão corporativo." },
    { id: 5, fornecedor: "Dell Computadores", servico: "Garantia ProSupport Servers", tipo: "Equipamentos", vencimento: "20/11/2024", valorMensal: "Pagamento Anual", status: "Crítico", contatoNome: "Dell ProSupport", contatoTelefone: "0800 970 3355", contatoEmail: "—", sla: "Atendimento on-site 4h", observacoes: "Urgente: Renovar para manter cobertura do SRV-ERP-01." },
];
