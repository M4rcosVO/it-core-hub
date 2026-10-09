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
    const { assignedTo, cpf, department, phoneNumber, brand, model, osVersion, deviceRawModel } = req.body;

    const assignedToValue = trimOrNull(assignedTo);
    const departmentValue = trimOrNull(department);
    const cpfValue = trimOrNull(cpf);
    const phoneValue = trimOrNull(phoneNumber);

    if (!assignedToValue || !departmentValue) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: assignedTo e department são necessários.',
      });
    }

    const brandValue = trimOrNull(brand) || 'Desconhecido';
    const modelValue = trimOrNull(model) || 'Desconhecido';
    const forwardedHeader = req.headers['x-forwarded-for'];
    const signerIp =
      (typeof forwardedHeader === 'string' ? forwardedHeader.split(',')[0].trim() : null) ||
      req.ip ||
      req.socket.remoteAddress ||
      null;

    const now = new Date();

    // Upsert inteligente por phoneNumber (se fornecido)
    let existing = null;
    if (phoneValue) {
      existing = await prisma.mobileDevice.findFirst({
        where: { phoneNumber: phoneValue },
      });
    }

    if (existing) {
      // Se já pertencia a outro colaborador, arquiva no histórico de custódia
      const isReassignment =
        existing.assignedTo &&
        (existing.assignedTo.trim().toLowerCase() !== assignedToValue.trim().toLowerCase() ||
          (existing.cpf && cpfValue && existing.cpf.trim() !== cpfValue.trim()));

      if (isReassignment) {
        await prisma.deviceAssignmentHistory.create({
          data: {
            deviceId: existing.id,
            assignedTo: existing.assignedTo!,
            cpf: existing.cpf,
            department: existing.department || 'Desconhecido',
            phoneNumber: existing.phoneNumber || '',
            signerIp: existing.signerIp,
            termAcceptedAt: existing.termAcceptedAt || existing.createdAt,
            returnedAt: now,
            returnCondition: 'Reatribuição / Transferência via Coleta Satélite',
          },
        });
      }

      await prisma.mobileDevice.update({
        where: { id: existing.id },
        data: {
          assignedTo: assignedToValue,
          cpf: cpfValue,
          department: departmentValue,
          brand: brandValue,
          model: modelValue,
          osVersion: trimOrNull(osVersion),
          deviceRawModel: trimOrNull(deviceRawModel),
          signerIp,
          termAcceptedAt: now,
          status: MobileStatus.EM_USO,
        },
      });

      // Retorno LGPD/Privacidade estrita: apenas confirmação sem expor dados internos
      return res.status(200).json({
        success: true,
        message: 'Aparelho vinculado com sucesso.',
      });
    } else {
      await prisma.mobileDevice.create({
        data: {
          assignedTo: assignedToValue,
          cpf: cpfValue,
          department: departmentValue,
          phoneNumber: phoneValue,
          brand: brandValue,
          model: modelValue,
          osVersion: trimOrNull(osVersion),
          deviceRawModel: trimOrNull(deviceRawModel),
          status: MobileStatus.EM_USO,
          signerIp,
          termAcceptedAt: now,
          imei: null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Aparelho vinculado com sucesso.',
      });
    }
  } catch (error: any) {
    console.error('Error ingesting mobile device:', error);
    return res.status(500).json({ error: 'Erro ao registrar aparelho.', details: error.message });
  }
};
