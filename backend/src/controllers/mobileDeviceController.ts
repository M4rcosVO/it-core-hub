import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { MobileStatus } from '@prisma/client';
import { encryptPassword, decryptPassword } from '../utils/crypto';

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
        { deviceEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const devices = await prisma.mobileDevice.findMany({
      where: whereClause,
      include: {
        assignmentHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
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
      include: {
        assignmentHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
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

/**
 * Descriptografa e retorna credenciais sob demanda para equipe de T.I autenticada
 */
export const getDeviceCredentials = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const device = await prisma.mobileDevice.findUnique({
      where: { id },
      select: {
        id: true,
        deviceEmail: true,
        deviceEmailPassword: true,
      },
    });

    if (!device) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    const plainPassword = device.deviceEmailPassword ? decryptPassword(device.deviceEmailPassword) : null;

    res.json({
      id: device.id,
      deviceEmail: device.deviceEmail,
      deviceEmailPassword: plainPassword,
    });
  } catch (error: any) {
    console.error('Error retrieving credentials:', error);
    res.status(500).json({ error: 'Erro ao recuperar credenciais', details: error.message });
  }
};

/**
 * Retorna o histórico de custódia do aparelho
 */
export const getDeviceAssignmentHistory = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const history = await prisma.deviceAssignmentHistory.findMany({
      where: { deviceId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(history);
  } catch (error: any) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de custódia', details: error.message });
  }
};

/**
 * Registra a devolução formal de um aparelho, arquivando no histórico de custódia
 */
export const registerDeviceReturn = async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = parseInt(rawId, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { returnCondition, returnNotes, targetStatus } = req.body;

    const device = await prisma.mobileDevice.findUnique({
      where: { id },
    });

    if (!device) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    const now = new Date();

    // Se havia um colaborador vinculado, cria o registro histórico
    if (device.assignedTo) {
      await prisma.deviceAssignmentHistory.create({
        data: {
          deviceId: device.id,
          assignedTo: device.assignedTo,
          cpf: device.cpf,
          department: device.department || 'Desconhecido',
          phoneNumber: device.phoneNumber || '',
          signerIp: device.signerIp,
          termAcceptedAt: device.termAcceptedAt || device.createdAt,
          returnedAt: now,
          returnCondition: returnCondition || 'Devolvido à T.I',
        },
      });
    }

    const newStatus =
      targetStatus && Object.values(MobileStatus).includes(targetStatus)
        ? (targetStatus as MobileStatus)
        : MobileStatus.DISPONIVEL;

    const updated = await prisma.mobileDevice.update({
      where: { id },
      data: {
        assignedTo: null,
        cpf: null,
        signerIp: null,
        termAcceptedAt: null,
        status: newStatus,
        returnNotes: returnNotes || device.returnNotes,
      },
      include: {
        assignmentHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json({
      message: 'Devolução registrada com sucesso.',
      device: updated,
    });
  } catch (error: any) {
    console.error('Error registering device return:', error);
    res.status(500).json({ error: 'Erro ao registrar devolução', details: error.message });
  }
};

export const createMobileDevice = async (req: Request, res: Response) => {
  try {
    const {
      imei,
      brand,
      model,
      phoneNumber,
      status,
      assignedTo,
      department,
      cpf,
      deviceEmail,
      deviceEmailPassword,
      inPulsus,
      hasCharger,
      hasCable,
      hasCase,
      hasScreenProtector,
      returnNotes,
    } = req.body;

    if (!brand || !model) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: brand e model são necessários.',
      });
    }

    const imeiValue = typeof imei === 'string' && imei.trim() ? imei.trim() : null;

    // Validação estrita de IMEI obrigatório para cadastro manual da T.I
    if (!imeiValue) {
      return res.status(400).json({
        error: 'O campo IMEI é obrigatório no cadastro pela equipe de T.I.',
      });
    }

    const existing = await prisma.mobileDevice.findUnique({
      where: { imei: imeiValue },
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
          error: `Status inválido. Valores aceitos: ${Object.values(MobileStatus).join(', ')}`,
        });
      }
    }

    // Criptografar senha do e-mail corporativo com AES-256
    const encryptedPassword = deviceEmailPassword?.trim() ? encryptPassword(deviceEmailPassword.trim()) : null;

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
        deviceEmail: deviceEmail?.trim() || null,
        deviceEmailPassword: encryptedPassword,
        inPulsus: inPulsus === true || inPulsus === 'true',
        hasCharger: hasCharger !== undefined ? Boolean(hasCharger) : true,
        hasCable: hasCable !== undefined ? Boolean(hasCable) : true,
        hasCase: hasCase !== undefined ? Boolean(hasCase) : false,
        hasScreenProtector: hasScreenProtector !== undefined ? Boolean(hasScreenProtector) : false,
        returnNotes: returnNotes?.trim() || null,
      },
      include: {
        assignmentHistory: true,
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

    const {
      imei,
      brand,
      model,
      phoneNumber,
      status,
      assignedTo,
      department,
      cpf,
      deviceEmail,
      deviceEmailPassword,
      inPulsus,
      hasCharger,
      hasCable,
      hasCase,
      hasScreenProtector,
      returnNotes,
    } = req.body;

    const existingDevice = await prisma.mobileDevice.findUnique({ where: { id } });
    if (!existingDevice) {
      return res.status(404).json({ error: 'Aparelho não encontrado' });
    }

    if (imei !== undefined) {
      const nextImei = typeof imei === 'string' && imei.trim() ? imei.trim() : null;
      if (!nextImei) {
        return res.status(400).json({
          error: 'O campo IMEI é obrigatório no cadastro pela equipe de T.I.',
        });
      }
      if (nextImei !== existingDevice.imei) {
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
        error: `Status inválido. Valores aceitos: ${Object.values(MobileStatus).join(', ')}`,
      });
    }

    // Se houve mudança de colaborador responsável, arquivar histórico
    const nextAssignedTo = assignedTo !== undefined ? (assignedTo ? assignedTo.trim() : null) : existingDevice.assignedTo;
    const nextCpf = cpf !== undefined ? (cpf ? cpf.trim() : null) : existingDevice.cpf;

    const isReassigned =
      existingDevice.assignedTo &&
      nextAssignedTo &&
      (existingDevice.assignedTo.trim().toLowerCase() !== nextAssignedTo.toLowerCase() ||
        (existingDevice.cpf && nextCpf && existingDevice.cpf.trim() !== nextCpf));

    if (isReassigned) {
      await prisma.deviceAssignmentHistory.create({
        data: {
          deviceId: existingDevice.id,
          assignedTo: existingDevice.assignedTo!,
          cpf: existingDevice.cpf,
          department: existingDevice.department || 'Desconhecido',
          phoneNumber: existingDevice.phoneNumber || '',
          signerIp: existingDevice.signerIp,
          termAcceptedAt: existingDevice.termAcceptedAt || existingDevice.createdAt,
          returnedAt: new Date(),
          returnCondition: 'Reatribuição Manual pela Equipe de T.I',
        },
      });
    }

    // Tratamento de criptografia da senha se informada nova senha
    let encryptedPassword = undefined;
    if (deviceEmailPassword !== undefined) {
      encryptedPassword = deviceEmailPassword ? encryptPassword(deviceEmailPassword.trim()) : null;
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
        ...(assignedTo !== undefined && { assignedTo: nextAssignedTo }),
        ...(cpf !== undefined && { cpf: nextCpf }),
        ...(deviceEmail !== undefined && { deviceEmail: deviceEmail ? deviceEmail.trim() : null }),
        ...(encryptedPassword !== undefined && { deviceEmailPassword: encryptedPassword }),
        ...(inPulsus !== undefined && { inPulsus: inPulsus === true || inPulsus === 'true' }),
        ...(hasCharger !== undefined && { hasCharger: Boolean(hasCharger) }),
        ...(hasCable !== undefined && { hasCable: Boolean(hasCable) }),
        ...(hasCase !== undefined && { hasCase: Boolean(hasCase) }),
        ...(hasScreenProtector !== undefined && { hasScreenProtector: Boolean(hasScreenProtector) }),
        ...(returnNotes !== undefined && { returnNotes: returnNotes ? returnNotes.trim() : null }),
      },
      include: {
        assignmentHistory: {
          orderBy: { createdAt: 'desc' },
        },
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
      'Pulsus MDM',
      'Email Aparelho',
      'Responsavel',
      'CPF',
      'Setor',
      'Carregador',
      'Cabo',
      'Capa',
      'Pelicula',
      'Obs Devolucao',
      'IP Signatario',
      'Termo Aceito Em (UTC)',
      'Criado Em',
      'Atualizado Em',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = devices.map((d) =>
      [
        d.id,
        escapeCsv(d.brand),
        escapeCsv(d.model),
        escapeCsv(d.deviceRawModel || ''),
        escapeCsv(d.osVersion || ''),
        escapeCsv(d.imei || ''),
        escapeCsv(d.phoneNumber || ''),
        escapeCsv(d.status),
        escapeCsv(d.inPulsus ? 'Sim' : 'Não'),
        escapeCsv(d.deviceEmail || ''),
        escapeCsv(d.assignedTo || ''),
        escapeCsv(d.cpf || ''),
        escapeCsv(d.department || ''),
        escapeCsv(d.hasCharger ? 'Sim' : 'Não'),
        escapeCsv(d.hasCable ? 'Sim' : 'Não'),
        escapeCsv(d.hasCase ? 'Sim' : 'Não'),
        escapeCsv(d.hasScreenProtector ? 'Sim' : 'Não'),
        escapeCsv(d.returnNotes || ''),
        escapeCsv(d.signerIp || ''),
        escapeCsv(d.termAcceptedAt ? d.termAcceptedAt.toISOString() : ''),
        escapeCsv(d.createdAt ? d.createdAt.toISOString() : ''),
        escapeCsv(d.updatedAt ? d.updatedAt.toISOString() : ''),
      ].join(';')
    );

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="dispositivos_moveis.csv"');
    res.status(200).send(csvContent);
  } catch (error: any) {
    console.error('Error exporting mobile devices:', error);
    res.status(500).json({ error: 'Erro ao exportar aparelhos móveis', details: error.message });
  }
};
