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
    const { imei, brand, model, phoneNumber, status, assignedTo } = req.body;

    if (!imei || !brand || !model) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: imei, brand e model são necessários.'
      });
    }

    // Check unique IMEI
    const existing = await prisma.mobileDevice.findUnique({
      where: { imei: imei.trim() },
    });

    if (existing) {
      return res.status(409).json({ error: 'Já existe um aparelho cadastrado com este IMEI.' });
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
        imei: imei.trim(),
        brand: brand.trim(),
        model: model.trim(),
        phoneNumber: phoneNumber?.trim() || null,
        status: deviceStatus,
        assignedTo: assignedTo?.trim() || null,
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

    const { imei, brand, model, phoneNumber, status, assignedTo } = req.body;

    const existingDevice = await prisma.mobileDevice.findUnique({ where: { id } });
    if (!existingDevice) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    if (imei && imei.trim() !== existingDevice.imei) {
      const imeiConflict = await prisma.mobileDevice.findUnique({
        where: { imei: imei.trim() },
      });
      if (imeiConflict) {
        return res.status(409).json({ error: 'Já existe outro aparelho com este IMEI.' });
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
        ...(imei !== undefined && { imei: imei.trim() }),
        ...(brand !== undefined && { brand: brand.trim() }),
        ...(model !== undefined && { model: model.trim() }),
        ...(phoneNumber !== undefined && { phoneNumber: phoneNumber ? phoneNumber.trim() : null }),
        ...(status !== undefined && { status }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo ? assignedTo.trim() : null }),
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
