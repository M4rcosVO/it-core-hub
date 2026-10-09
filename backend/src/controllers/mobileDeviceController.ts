import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { MobileStatus } from '@prisma/client';

export const getAllMobileDevices = async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string' && Object.values(MobileStatus).includes(status as MobileStatus)) {
      whereClause.status = status as MobileStatus;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { imei: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const devices = await prisma.mobileDevice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json(devices);
  } catch (error: any) {
    console.error('Error fetching mobile devices:', error);
    res.status(500).json({ error: 'Erro ao listar aparelhos móveis', details: error.message });
  }
};

export const getMobileDeviceById = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const device = await prisma.mobileDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    res.json(device);
  } catch (error: any) {
    console.error('Error fetching mobile device by id:', error);
    res.status(500).json({ error: 'Erro ao buscar aparelho', details: error.message });
  }
};

export const createMobileDevice = async (req: Request, res: Response) => {
  try {
    const { imei, brand, model, phoneNumber, status, assignedTo, department, cpf } = req.body;

    if (!brand || !model) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: brand e model são necessários.'
      });
    }

    const imeiValue = typeof imei === 'string' && imei.trim() ? imei.trim() : null;

    if (imeiValue) {
      const existing = await prisma.mobileDevice.findUnique({
        where: { imei: imeiValue },
      });

      if (existing) {
        return res.status(409).json({ error: 'Já existe um aparelho cadastrado com este IMEI.' });
      }
    }

    // Validate status if provided
    let deviceStatus: MobileStatus = MobileStatus.DISPONIVEL;
    if (status) {
      if (Object.values(MobileStatus).includes(status)) {
        deviceStatus = status;
      } else {
        return res.status(400).json({
          error: `Status inválido. Valores aceitos: ${Object.values(MobileStatus).join(', ')}`
        });
      }
    }

    const newDevice = await prisma.mobileDevice.create({
      data: {
        imei: imeiValue,
        brand: brand.trim(),
        model: model.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        department: department?.trim() || null,
        status: deviceStatus,
        assignedTo: assignedTo?.trim() || null,
        cpf: cpf?.trim() || null,
      },
    });

    res.status(201).json(newDevice);
  } catch (error: any) {
    console.error('Error creating mobile device:', error);
    res.status(500).json({ error: 'Erro ao cadastrar aparelho móvel', details: error.message });
  }
};

export const updateMobileDevice = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { imei, brand, model, phoneNumber, status, assignedTo, department, cpf } = req.body;

    const existingDevice = await prisma.mobileDevice.findUnique({ where: { id } });
    if (!existingDevice) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    if (imei !== undefined) {
      const nextImei = typeof imei === 'string' && imei.trim() ? imei.trim() : null;
      if (nextImei && nextImei !== existingDevice.imei) {
        const imeiConflict = await prisma.mobileDevice.findUnique({
          where: { imei: nextImei },
        });
        if (imeiConflict) {
          return res.status(409).json({ error: 'Já existe outro aparelho com este IMEI.' });
        }
      }
    }

    if (status && !Object.values(MobileStatus).includes(status)) {
      return res.status(400).json({
        error: `Status inválido. Valores aceitos: ${Object.values(MobileStatus).join(', ')}`
      });
    }

    const updated = await prisma.mobileDevice.update({
      where: { id },
      data: {
        ...(imei !== undefined && { imei: typeof imei === 'string' && imei.trim() ? imei.trim() : null }),
        ...(brand !== undefined && { brand: brand.trim() }),
        ...(model !== undefined && { model: model.trim() }),
        ...(phoneNumber !== undefined && { phoneNumber: phoneNumber ? phoneNumber.trim() : null }),
        ...(department !== undefined && { department: department ? department.trim() : null }),
        ...(status !== undefined && { status }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo ? assignedTo.trim() : null }),
        ...(cpf !== undefined && { cpf: cpf ? cpf.trim() : null }),
      },
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating mobile device:', error);
    res.status(500).json({ error: 'Erro ao atualizar aparelho', details: error.message });
  }
};

export const deleteMobileDevice = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const existingDevice = await prisma.mobileDevice.findUnique({ where: { id } });
    if (!existingDevice) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    await prisma.mobileDevice.delete({
      where: { id },
    });

    res.json({ message: 'Aparelho removido com sucesso', id });
  } catch (error: any) {
    console.error('Error deleting mobile device:', error);
    res.status(500).json({ error: 'Erro ao excluir aparelho', details: error.message });
  }
};

export const exportMobileDevices = async (req: Request, res: Response) => {
  try {
    const devices = await prisma.mobileDevice.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'ID',
      'Marca',
      'Modelo',
      'Modelo Raw (Detectado)',
      'Versao SO',
      'IMEI',
      'Telefone',
      'Status',
      'Responsavel',
      'CPF',
      'Setor',
      'IP Signatario',
      'Termo Aceito Em (UTC)',
      'Criado Em',
      'Atualizado Em'
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = devices.map(d => [
      d.id,
      escapeCsv(d.brand),
      escapeCsv(d.model),
      escapeCsv(d.deviceRawModel || ''),
      escapeCsv(d.osVersion || ''),
      escapeCsv(d.imei || ''),
      escapeCsv(d.phoneNumber || ''),
      escapeCsv(d.status),
      escapeCsv(d.assignedTo || ''),
      escapeCsv(d.cpf || ''),
      escapeCsv(d.department || ''),
      escapeCsv(d.signerIp || ''),
      escapeCsv(d.termAcceptedAt ? d.termAcceptedAt.toISOString() : ''),
      escapeCsv(d.createdAt ? d.createdAt.toISOString() : ''),
      escapeCsv(d.updatedAt ? d.updatedAt.toISOString() : '')
    ].join(';'));

    // UTF-8 BOM so Excel opens accents correctly
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dispositivos_moveis.csv"');
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error exporting mobile devices:', error);
    res.status(500).json({ error: 'Erro ao exportar aparelhos móveis', details: error.message });
  }
};
