import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Default Admin User
  const hashedPassword = await bcrypt.hash('GellakIT2026', 10);
  await prisma.user.upsert({
    where: { name: 'admin.ti' },
    update: {},
    create: {
      name: 'admin.ti',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // 2. Computers
  const computers = [
    { hostname: "WKS-ADM-001", modelo: "Dell OptiPlex 7090", processador: "Intel Core i7-11700", ram: "16 GB", armazenamento: "512 GB SSD", so: "Windows 11 Pro", responsavel: "Carlos Silva", setor: "Administrativo", status: "Ativo", patrimonio: "TI-001", garantiaVencimento: "15/03/2026", dataCompra: "15/03/2023", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "15/03/2023", usuario: "Admin TI" }, { evento: "Manutenção", data: "10/07/2024", usuario: "Suporte N2" }] },
    { hostname: "WKS-FIN-012", modelo: "HP EliteDesk 800 G8", processador: "Intel Core i5-11500", ram: "8 GB", armazenamento: "256 GB SSD", so: "Windows 11 Pro", responsavel: "Ana Costa", setor: "Financeiro", status: "Ativo", patrimonio: "TI-002", garantiaVencimento: "22/07/2025", dataCompra: "22/07/2022", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "22/07/2022", usuario: "Admin TI" }] },
    { hostname: "WKS-COM-033", modelo: "Lenovo ThinkCentre M70q", processador: "Intel Core i3-10100T", ram: "8 GB", armazenamento: "256 GB SSD", so: "Windows 10 Pro", responsavel: "Pedro Mendes", setor: "Comercial", status: "Em Manutenção", patrimonio: "TI-003", garantiaVencimento: "05/11/2024", dataCompra: "05/11/2021", termoAssinado: true, historico: [{ evento: "Entrega ao usuário", data: "05/11/2021", usuario: "Admin TI" }, { evento: "Troca de Tela", data: "15/01/2025", usuario: "Técnico Externo" }] },
    { hostname: "SRV-ERP-01", modelo: "Dell PowerEdge R550", processador: "Intel Xeon Silver 4314", ram: "64 GB", armazenamento: "2 TB NVMe RAID", so: "Windows Server 2022", responsavel: "TI", setor: "Datacenter", status: "Ativo", patrimonio: "TI-SRV-001", garantiaVencimento: "30/06/2027", dataCompra: "30/06/2024", termoAssinado: false, historico: [] },
  ];

  for (const c of computers) {
    await prisma.computer.upsert({
      where: { patrimonio: c.patrimonio },
      update: {},
      create: { ...c, historico: c.historico as any },
    });
  }

  // 3. Credenciais (Acessos)
  const acessos = [
    { nome: "FortiGate VPN", url: "vpn.gellak.com.br", usuario: "admin.ti", senha: "SuperSecretPassword123!", categoria: "VPN", setor: "TI" },
    { nome: "Totvs Protheus", url: "192.168.1.10:8080", usuario: "admin_erp", senha: "ErpPassword2024", categoria: "ERP", setor: "Geral" },
    { nome: "Painel Admin Site", url: "gellak.com.br/wp-admin", usuario: "webmaster", senha: "Wp#Admin$2024", categoria: "Web", setor: "Marketing" },
  ];

  for (const a of acessos) {
    await prisma.acesso.create({ data: a });
  }

  // 4. Incidentes
  const incidentes = [
    { servico: "Internet Matriz (Link A)", titulo: "Queda na operadora", data: "05/03/2026", duracao: "1h 15m", causaRaiz: "Rompimento de fibra ótica na região central.", resolucao: "Failover automático para Link B. Reparo concluído pela operadora." },
  ];

  for (const i of incidentes) {
    await prisma.incidente.create({ data: i });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
