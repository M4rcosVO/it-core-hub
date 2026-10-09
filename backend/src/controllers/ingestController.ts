import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { MobileStatus } from '@prisma/client';

const trimOrNull = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const ingestMobileDevice = async (req: Request, res: Response) => {
  try {
    const { assignedTo, department, phoneNumber, brand, model, osVersion, deviceRawModel } = req.body;

    const assignedToValue = trimOrNull(assignedTo);
    const departmentValue = trimOrNull(department);

    if (!assignedToValue || !departmentValue) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: assignedTo e department são necessários.',
      });
    }

    const brandValue = trimOrNull(brand) || 'Desconhecido';
    const modelValue = trimOrNull(model) || 'Desconhecido';
    const signerIp = req.ip || req.socket.remoteAddress || null;

    await prisma.mobileDevice.create({
      data: {
        assignedTo: assignedToValue,
        department: departmentValue,
        phoneNumber: trimOrNull(phoneNumber),
        brand: brandValue,
        model: modelValue,
        osVersion: trimOrNull(osVersion),
        deviceRawModel: trimOrNull(deviceRawModel),
        status: MobileStatus.EM_USO,
        signerIp,
        termAcceptedAt: new Date(),
        imei: null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Aparelho vinculado com sucesso.',
    });
  } catch (error: any) {
    console.error('Error ingesting mobile device:', error);
    return res.status(500).json({ error: 'Erro ao registrar aparelho.', details: error.message });
  }
};
