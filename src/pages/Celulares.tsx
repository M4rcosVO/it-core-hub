import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Smartphone,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  User,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  ShieldAlert,
  QrCode,
  FileText,
  Download,
  Copy,
  Printer,
  ExternalLink,
  ShieldCheck,
  IdCard,
  Mail,
  Eye,
  EyeOff,
  Radio,
  AlertTriangle,
  History,
  RotateCcw,
  CheckSquare,
  Shield,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { useData } from "@/components/DataContext";
import { DEPARTMENTS } from "@/constants/departments";
import { formatBrazilianMobile, validateBrazilianMobile } from "@/utils/phone";

export type MobileStatus = "DISPONIVEL" | "EM_USO" | "MANUTENCAO" | "DESATIVADO" | "EXTRAVIADO_ROUBADO";

export interface DeviceAssignmentHistory {
  id: number;
  deviceId: number;
  assignedTo: string;
  cpf?: string | null;
  department: string;
  phoneNumber: string;
  signerIp?: string | null;
  termAcceptedAt: string;
  returnedAt?: string | null;
  returnCondition?: string | null;
  createdAt: string;
}

export interface MobileDevice {
  id: number;
  imei?: string | null;
  brand: string;
  model: string;
  phoneNumber?: string | null;
  department?: string | null;
  status: MobileStatus;
  assignedTo?: string | null;
  cpf?: string | null;
  signerIp?: string | null;
  termAcceptedAt?: string | null;
  osVersion?: string | null;
  deviceRawModel?: string | null;
  deviceEmail?: string | null;
  deviceEmailPassword?: string | null;
  inPulsus?: boolean;
  hasCharger?: boolean;
  hasCable?: boolean;
  hasCase?: boolean;
  hasScreenProtector?: boolean;
  returnNotes?: string | null;
  assignmentHistory?: DeviceAssignmentHistory[];
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api";

const statusConfig: Record<MobileStatus, { label: string; badgeClass: string; icon: React.ElementType }> = {
  DISPONIVEL: {
    label: "Disponível",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  EM_USO: {
    label: "Em Uso",
    badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Clock,
  },
  MANUTENCAO: {
    label: "Manutenção",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Wrench,
  },
  DESATIVADO: {
    label: "Desativado",
    badgeClass: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
    icon: XCircle,
  },
  EXTRAVIADO_ROUBADO: {
    label: "Extraviado / Roubado",
    badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 ring-1 ring-rose-500/20 animate-pulse font-semibold",
    icon: ShieldAlert,
  },
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export default function Celulares() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const dataContext = useData();
  const isReadOnly = userRole === "Auditor";
  const { toast } = useToast();

  const token =
    dataContext?.token ||
    localStorage.getItem("token") ||
    localStorage.getItem("it_core_token") ||
    sessionStorage.getItem("token");

  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [departmentFilter, setDepartmentFilter] = useState<string>("TODOS");
  const [mdmPendingOnly, setMdmPendingOnly] = useState<boolean>(false);

  // Create Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    brand: "",
    model: "",
    imei: "",
    phoneNumber: "",
    status: "DISPONIVEL" as MobileStatus,
    assignedTo: "",
    cpf: "",
    department: "",
    deviceEmail: "",
    deviceEmailPassword: "",
    inPulsus: false,
    hasCharger: true,
    hasCable: true,
    hasCase: false,
    hasScreenProtector: false,
  });
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Form State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<MobileDevice | null>(null);
  const [editForm, setEditForm] = useState({
    brand: "",
    model: "",
    imei: "",
    phoneNumber: "",
    status: "DISPONIVEL" as MobileStatus,
    assignedTo: "",
    cpf: "",
    department: "",
    deviceEmail: "",
    deviceEmailPassword: "",
    inPulsus: false,
    hasCharger: true,
    hasCable: true,
    hasCase: false,
    hasScreenProtector: false,
    returnNotes: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<MobileDevice | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // QR Code Modal
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Dossiê / Ver Termo Modal
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [dossierDevice, setDossierDevice] = useState<MobileDevice | null>(null);
  const [showDossierPassword, setShowDossierPassword] = useState(false);
  const [dossierPlainPassword, setDossierPlainPassword] = useState<string | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [dossierHistory, setDossierHistory] = useState<DeviceAssignmentHistory[]>([]);

  // Modal: Marcar como Extraviado / Roubado
  const [isStolenModalOpen, setIsStolenModalOpen] = useState(false);
  const [stolenDevice, setStolenDevice] = useState<MobileDevice | null>(null);
  const [stolenChecklist, setStolenChecklist] = useState({
    pulsusBlocked: false,
    imeiBlocked: false,
    passwordChanged: false,
  });
  const [submittingStolen, setSubmittingStolen] = useState(false);

  // Modal: Registrar Devolução
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnDevice, setReturnDevice] = useState<MobileDevice | null>(null);
  const [returnCondition, setReturnCondition] = useState("Perfeito estado");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnStatus, setReturnStatus] = useState<MobileStatus>("DISPONIVEL");
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);
  const satelliteUrl = `${window.location.origin}/coleta-aparelho`;

  // Sorted departments list
  const sortedDepartments = useMemo(() => {
    return [...DEPARTMENTS].sort((a, b) => a.localeCompare("pt-BR"));
  }, []);

  // Fetch devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      } else {
        throw new Error("Falha ao carregar dispositivos");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Aviso de Conexão",
        description: "Não foi possível sincronizar com o backend em tempo real.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesStatus =
        statusFilter === "TODOS" || device.status === statusFilter;
      const matchesDepartment =
        departmentFilter === "TODOS" || device.department === departmentFilter;
      const matchesMdm =
        !mdmPendingOnly || (device.status === "EM_USO" && !device.inPulsus);

      const term = search.toLowerCase();
      const matchesSearch =
        device.brand.toLowerCase().includes(term) ||
        device.model.toLowerCase().includes(term) ||
        (device.imei && device.imei.toLowerCase().includes(term)) ||
        (device.phoneNumber && device.phoneNumber.toLowerCase().includes(term)) ||
        (device.assignedTo && device.assignedTo.toLowerCase().includes(term)) ||
        (device.cpf && device.cpf.toLowerCase().includes(term)) ||
        (device.department && device.department.toLowerCase().includes(term)) ||
        (device.deviceEmail && device.deviceEmail.toLowerCase().includes(term));

      return matchesStatus && matchesDepartment && matchesMdm && matchesSearch;
    });
  }, [devices, search, statusFilter, departmentFilter, mdmPendingOnly]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: devices.length,
      emUso: devices.filter((d) => d.status === "EM_USO").length,
      disponivel: devices.filter((d) => d.status === "DISPONIVEL").length,
      manutencao: devices.filter((d) => d.status === "MANUTENCAO").length,
      extraviado: devices.filter((d) => d.status === "EXTRAVIADO_ROUBADO").length,
      pulsus: devices.filter((d) => d.inPulsus).length,
      mdmPending: devices.filter((d) => d.status === "EM_USO" && !d.inPulsus).length,
    };
  }, [devices]);

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await fetch(`${API_BASE}/mobile-devices/export`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Erro ao gerar arquivo de exportação.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventario_celulares_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Exportação realizada",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (err: any) {
      toast({
        title: "Erro na exportação",
        description: err.message || "Não foi possível exportar os registros.",
        variant: "destructive",
      });
    }
  };

  // Handle Create Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.brand.trim() || !createForm.model.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Marca e Modelo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!createForm.imei.trim()) {
      toast({
        title: "IMEI Obrigatório",
        description: "O campo IMEI é obrigatório no cadastro pela equipe de T.I.",
        variant: "destructive",
      });
      return;
    }

    if (createForm.phoneNumber.trim() && !validateBrazilianMobile(createForm.phoneNumber)) {
      toast({
        title: "Celular Inválido",
        description: "Informe um número de celular corporativo válido com 11 dígitos (DDD + 9XXXX-XXXX).",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCreate(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(createForm),
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao cadastrar aparelho");
      }

      const created = await res.json();
      setDevices((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setCreateForm({
        brand: "",
        model: "",
        imei: "",
        phoneNumber: "",
        status: "DISPONIVEL",
        assignedTo: "",
        cpf: "",
        department: "",
        deviceEmail: "",
        deviceEmailPassword: "",
        inPulsus: false,
        hasCharger: true,
        hasCable: true,
        hasCase: false,
        hasScreenProtector: false,
      });

      toast({
        title: "Sucesso!",
        description: `Aparelho ${created.brand} ${created.model} cadastrado com sucesso.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro no cadastro",
        description: err.message || "Não foi possível cadastrar o aparelho.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Open Edit
  const openEdit = (device: MobileDevice) => {
    setEditingDevice(device);
    setEditForm({
      brand: device.brand,
      model: device.model,
      imei: device.imei || "",
      phoneNumber: device.phoneNumber || "",
      status: device.status,
      assignedTo: device.assignedTo || "",
      cpf: device.cpf || "",
      department: device.department || "",
      deviceEmail: device.deviceEmail || "",
      deviceEmailPassword: "",
      inPulsus: device.inPulsus || false,
      hasCharger: device.hasCharger !== false,
      hasCable: device.hasCable !== false,
      hasCase: Boolean(device.hasCase),
      hasScreenProtector: Boolean(device.hasScreenProtector),
      returnNotes: device.returnNotes || "",
    });
    setShowEditPassword(false);
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    if (!editForm.imei.trim()) {
      toast({
        title: "IMEI Obrigatório",
        description: "O campo IMEI é obrigatório no cadastro pela equipe de T.I.",
        variant: "destructive",
      });
      return;
    }

    if (editForm.phoneNumber.trim() && !validateBrazilianMobile(editForm.phoneNumber)) {
      toast({
        title: "Celular Inválido",
        description: "Informe um número de celular corporativo válido com 11 dígitos (DDD + 9XXXX-XXXX).",
        variant: "destructive",
      });
      return;
    }

    setSubmittingEdit(true);
    try {
      const payload: any = { ...editForm };
      if (!payload.deviceEmailPassword) {
        delete payload.deviceEmailPassword;
      }

      const res = await fetch(`${API_BASE}/mobile-devices/${editingDevice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao atualizar aparelho");
      }

      const updated = await res.json();
      setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setIsEditOpen(false);
      setEditingDevice(null);

      toast({
        title: "Aparelho atualizado",
        description: `${updated.brand} ${updated.model} foi atualizado com sucesso.`,
      });
    } catch (err: any) {
      toast({
        title: "Erro na atualização",
        description: err.message || "Não foi possível atualizar o aparelho.",
        variant: "destructive",
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open Delete
  const openDelete = (device: MobileDevice) => {
    setDeviceToDelete(device);
    setIsDeleteOpen(true);
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!deviceToDelete) return;

    setSubmittingDelete(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices/${deviceToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Erro ao excluir aparelho");
      }

      setDevices((prev) => prev.filter((d) => d.id !== deviceToDelete.id));
      setIsDeleteOpen(false);
      setDeviceToDelete(null);

      toast({
        title: "Aparelho removido",
        description: "O dispositivo foi excluído do inventário.",
      });
    } catch (err: any) {
      toast({
        title: "Erro na exclusão",
        description: err.message || "Não foi possível excluir o aparelho.",
        variant: "destructive",
      });
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Open Dossier
  const openDossier = async (device: MobileDevice) => {
    setDossierDevice(device);
    setShowDossierPassword(false);
    setDossierPlainPassword(null);
    setIsDossierOpen(true);

    try {
      const res = await fetch(`${API_BASE}/mobile-devices/${device.id}/history`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const hist = await res.json();
        setDossierHistory(hist);
      } else {
        setDossierHistory(device.assignmentHistory || []);
      }
    } catch {
      setDossierHistory(device.assignmentHistory || []);
    }
  };

  // Toggle Password in Dossier
  const toggleDossierPassword = async () => {
    if (!showDossierPassword && !dossierPlainPassword && dossierDevice) {
      setLoadingCredentials(true);
      try {
        const res = await fetch(`${API_BASE}/mobile-devices/${dossierDevice.id}/credentials`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const creds = await res.json();
          setDossierPlainPassword(creds.deviceEmailPassword || "Sem senha cadastrada");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCredentials(false);
      }
    }
    setShowDossierPassword(!showDossierPassword);
  };

  // Open Stolen Dialog
  const openStolenModal = (device: MobileDevice) => {
    setStolenDevice(device);
    setStolenChecklist({
      pulsusBlocked: false,
      imeiBlocked: false,
      passwordChanged: false,
    });
    setIsStolenModalOpen(true);
  };

  // Confirm Stolen
  const handleConfirmStolen = async () => {
    if (!stolenDevice) return;
    setSubmittingStolen(true);

    try {
      const res = await fetch(`${API_BASE}/mobile-devices/${stolenDevice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: "EXTRAVIADO_ROUBADO",
        }),
      });

      if (!res.ok) throw new Error("Erro ao marcar como extraviado.");

      const updated = await res.json();
      setDevices((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setIsStolenModalOpen(false);
      setStolenDevice(null);

      toast({
        title: "Status Atualizado",
        description: "O aparelho foi marcado como EXTRAVIADO / ROUBADO com sucesso.",
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "Erro na atualização",
        description: err.message || "Não foi possível registrar o extravio.",
        variant: "destructive",
      });
    } finally {
      setSubmittingStolen(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (device: MobileDevice) => {
    setReturnDevice(device);
    setReturnCondition("Perfeito estado");
    setReturnNotes("");
    setReturnStatus("DISPONIVEL");
    setIsReturnModalOpen(true);
  };

  // Generate Return PDF
  const generateReturnPdf = (device: MobileDevice, condition: string, notes: string) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Corporativo
      doc.setFillColor(15, 23, 42); // Navy 900
      doc.rect(0, 0, pageWidth, 28, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("GELLAK IT CORE — TERMO DE DEVOLUÇÃO E ENCERRAMENTO DE CUSTÓDIA", 14, 12);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`Emissão: ${new Date().toLocaleString("pt-BR")} | Departamento de Tecnologia da Informação`, 14, 20);

      // Bloco Identificação do Aparelho
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. IDENTIFICAÇÃO DO EQUIPAMENTO DEVOLVIDO", 14, 38);

      autoTable(doc, {
        startY: 42,
        theme: "grid",
        head: [["Marca / Modelo", "IMEI", "Linha Telefônica", "Colaborador Devolvente", "Setor"]],
        body: [[
          `${device.brand} ${device.model}`,
          device.imei || "—",
          device.phoneNumber || "—",
          device.assignedTo || "—",
          device.department || "—",
        ]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      });

      const currentY = (doc as any).lastAutoTable.finalY + 8;

      // Bloco Condições de Devolução
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("2. ESTADO E CONDIÇÕES DO EQUIPAMENTO", 14, currentY);

      autoTable(doc, {
        startY: currentY + 4,
        theme: "grid",
        head: [["Condição Declarada", "Carregador", "Cabo USB", "Capa", "Película"]],
        body: [[
          condition,
          device.hasCharger ? "Devolvido" : "Não Entregue",
          device.hasCable ? "Devolvido" : "Não Entregue",
          device.hasCase ? "Devolvido" : "Não Aplicável",
          device.hasScreenProtector ? "Instalada" : "Não Aplicável",
        ]],
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      });

      const nextY = (doc as any).lastAutoTable.finalY + 8;

      if (notes.trim()) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Observações e Avarias Registradas:", 14, nextY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(notes, 14, nextY + 5, { maxWidth: pageWidth - 28 });
      }

      // Cláusula de Quitação
      const legalY = nextY + (notes.trim() ? 22 : 8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("3. QUITAÇÃO DE CUSTÓDIA PATRIMONIAL", 14, legalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const legalText =
        "A equipe de T.I. atesta o recebimento do celular corporativo e seus acessórios supracitados na data de hoje. " +
        "Ressalvadas avarias ocultas ou débitos não autorizados em linha telefônica, dá-se por encerrada a responsabilidade direta " +
        "de custódia e guarda sobre o patrimônio pela parte do colaborador devorador.";
      doc.text(legalText, 14, legalY + 5, { maxWidth: pageWidth - 28, align: "justify" });

      // Assinaturas
      const signY = legalY + 35;
      doc.line(20, signY, 90, signY);
      doc.line(pageWidth - 90, signY, pageWidth - 20, signY);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text("Responsável pela T.I (Recebedor)", 55, signY + 5, { align: "center" });
      doc.text(device.assignedTo || "Colaborador Devolvente", pageWidth - 55, signY + 5, { align: "center" });

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Gellak Tecnologia da Informação", 55, signY + 9, { align: "center" });
      doc.text(`CPF: ${device.cpf || "Documento arquivado"}`, pageWidth - 55, signY + 9, { align: "center" });

      doc.save(`termo_devolucao_${device.brand}_${device.model}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error("Erro ao gerar PDF de devolução:", e);
    }
  };

  // Submit Return
  const handleConfirmReturn = async () => {
    if (!returnDevice) return;
    setSubmittingReturn(true);

    try {
      const res = await fetch(`${API_BASE}/mobile-devices/${returnDevice.id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          returnCondition,
          returnNotes,
          targetStatus: returnStatus,
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar devolução.");

      const result = await res.json();
      setDevices((prev) => prev.map((d) => (d.id === result.device.id ? result.device : d)));

      // Gerar PDF do Termo de Devolução automaticamente
      generateReturnPdf(returnDevice, returnCondition, returnNotes);

      setIsReturnModalOpen(false);
      setReturnDevice(null);

      toast({
        title: "Devolução Registrada!",
        description: "O histórico de custódia foi atualizado e o termo em PDF gerado.",
      });
    } catch (err: any) {
      toast({
        title: "Erro na devolução",
        description: err.message || "Não foi possível registrar a devolução.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReturn(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(satelliteUrl);
    toast({
      title: "Link copiado!",
      description: "O link da página satélite de coleta foi copiado para a área de transferência.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 md:p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Gestão de Celulares & MDM
              </h1>
              <p className="text-sm text-muted-foreground">
                Inventário móvel, controle de linhas corporativas, Pulsus MDM, histórico de custódia e auditoria jurídica
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQrOpen(true)}
            className="gap-2"
          >
            <QrCode className="h-4 w-4 text-sky-500" />
            QR Code Coleta
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDevices}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>

          {!isReadOnly && (
            <Button
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Novo Celular
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Aparelhos
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Dispositivos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Em Uso
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.emUso}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Atribuídos a colaboradores</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pulsus MDM
            </CardTitle>
            <Radio className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.pulsus}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Gerenciados ativamente</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Disponíveis
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.disponivel}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Prontos para entrega</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Manutenção
            </CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.manutencao}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Em reparo técnico</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-rose-500">
              Extraviado / Roubado
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.extraviado}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Bloqueio / Sinistro</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">
                Inventário Geral de Telefonia & Termos
              </CardTitle>
              <CardDescription className="text-xs">
                Listagem consolidada com dados de hardware, custódia, gestão MDM e auditoria jurídica
              </CardDescription>
            </div>

            {/* Quick Filters Bar */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar modelo, CPF, linha..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background/50 text-xs"
                />
              </div>

              {/* Status Select */}
              <div className="w-full sm:w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 bg-background/50 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os Status</SelectItem>
                    {["DISPONIVEL", "EM_USO", "MANUTENCAO", "EXTRAVIADO_ROUBADO", "DESATIVADO"]
                      .map((st) => (
                        <SelectItem key={st} value={st} className="text-xs">
                          {statusConfig[st as MobileStatus].label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Setor Select */}
              <div className="w-full sm:w-40">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="h-9 bg-background/50 text-xs">
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="TODOS">Todos os Setores</SelectItem>
                    {sortedDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="text-xs">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Botão Rápido Auditoria MDM */}
              <Button
                variant={mdmPendingOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setMdmPendingOnly(!mdmPendingOnly)}
                className={`h-9 text-xs gap-1.5 ${
                  mdmPendingOnly
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                }`}
                title="Exibir aparelhos em uso que ainda não estão configurados no Pulsus MDM"
              >
                <Radio className="h-3.5 w-3.5" />
                Pendentes MDM ({stats.mdmPending})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[200px]">Marca & Modelo</TableHead>
                  <TableHead className="w-[130px]">Linha Telefônica</TableHead>
                  <TableHead className="w-[190px]">Colaborador & CPF</TableHead>
                  <TableHead className="w-[120px]">Setor</TableHead>
                  <TableHead className="w-[100px]">MDM Pulsus</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[90px]">Auditoria</TableHead>
                  <TableHead className="w-[150px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <span>Carregando inventário móvel...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                        <span className="font-medium">Nenhum aparelho encontrado</span>
                        <span className="text-xs">
                          {search || statusFilter !== "TODOS" || departmentFilter !== "TODOS" || mdmPendingOnly
                            ? "Tente ajustar os filtros de busca aplicados."
                            : "Clique em 'Novo Celular' para adicionar o primeiro aparelho."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => {
                    const statusInfo = statusConfig[device.status] || statusConfig.DISPONIVEL;
                    const StatusIcon = statusInfo.icon;
                    const hasDiscrepancy =
                      device.deviceRawModel &&
                      device.deviceRawModel.trim().toLowerCase() !== device.model.trim().toLowerCase();

                    return (
                      <TableRow key={device.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate flex items-center gap-1.5">
                                {device.model}
                                {hasDiscrepancy && (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1 py-0 h-4 font-normal cursor-help"
                                    title="Aparelho reportado via satélite diverge do cadastro da T.I"
                                  >
                                    <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                                    Divergente
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {device.brand} {device.imei ? `• ${device.imei.slice(0, 8)}...` : ""}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          {device.phoneNumber ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-mono font-medium">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {device.phoneNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Sem linha</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {device.assignedTo ? (
                            <div className="min-w-0">
                              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground truncate">
                                <User className="h-3 w-3 text-primary shrink-0" />
                                {device.assignedTo}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                                <IdCard className="h-3 w-3 text-muted-foreground/70" />
                                {device.cpf || "CPF não informado"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Não atribuído</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {device.department ? (
                            <Badge variant="secondary" className="text-[11px] font-normal">
                              {device.department}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </TableCell>

                        <TableCell>
                          {device.inPulsus ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-medium gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Pulsus Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-500 border-zinc-500/30 text-[11px] font-normal">
                              Sem MDM
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`inline-flex items-center gap-1 text-[11px] font-medium ${statusInfo.badgeClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {device.termAcceptedAt ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium" title={`IP: ${device.signerIp || "—"}`}>
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                              Assinado
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60">
                              Manual
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Dossiê */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                              onClick={() => openDossier(device)}
                              title="Dossiê / Ver Termo Legal"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>

                            {/* Registrar Devolução (se estiver em uso) */}
                            {!isReadOnly && device.status === "EM_USO" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                onClick={() => openReturnModal(device)}
                                title="Registrar Devolução / Check-out"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {/* Marcar como Extraviado / Roubado */}
                            {!isReadOnly && device.status !== "EXTRAVIADO_ROUBADO" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                onClick={() => openStolenModal(device)}
                                title="Marcar como Extraviado / Roubado"
                              >
                                <ShieldAlert className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {!isReadOnly && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={() => openEdit(device)}
                                  title="Editar"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => openDelete(device)}
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: QR Code de Coleta */}
      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="sm:max-w-[440px] text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-lg">
              <QrCode className="h-5 w-5 text-sky-500" />
              QR Code de Coleta Rápida
            </DialogTitle>
            <DialogDescription>
              Aponte a câmera do celular corporativo para abrir a página satélite de autoatendimento e assinatura do termo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
              <QRCode
                value={satelliteUrl}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 200 200`}
              />
            </div>

            <div className="w-full bg-muted/60 p-2.5 rounded-lg border border-border text-xs font-mono text-muted-foreground break-all flex items-center justify-between gap-2">
              <span className="truncate">{satelliteUrl}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={handleCopyLink} title="Copiar Link">
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(satelliteUrl, "_blank")}
              className="gap-1.5 flex-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 flex-1"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 flex-1"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Marcar como Extraviado / Roubado com Checklist */}
      <Dialog open={isStolenModalOpen} onOpenChange={setIsStolenModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
              Alerta de Segurança: Extravio / Roubo
            </DialogTitle>
            <DialogDescription>
              Confirme as ações de blindagem técnica e jurídica antes de registrar o sinistro no sistema.
            </DialogDescription>
          </DialogHeader>

          {stolenDevice && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-foreground">
                <div className="font-semibold text-rose-700 dark:text-rose-400">
                  {stolenDevice.brand} {stolenDevice.model}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  IMEI: {stolenDevice.imei || "—"} | Linha: {stolenDevice.phoneNumber || "—"}
                </div>
                <div className="text-muted-foreground">
                  Titular: {stolenDevice.assignedTo || "Sem colaborador vinculado"}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Checklist de Contramedidas Obrigatórias:
                </Label>

                <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/40 border border-border/50">
                  <Checkbox
                    id="chk-pulsus"
                    checked={stolenChecklist.pulsusBlocked}
                    onCheckedChange={(c) =>
                      setStolenChecklist({ ...stolenChecklist, pulsusBlocked: Boolean(c) })
                    }
                  />
                  <label htmlFor="chk-pulsus" className="text-xs text-foreground cursor-pointer leading-tight">
                    <strong>Bloqueio no Pulsus MDM:</strong> Dispositivo bloqueado remotamente e wipe solicitado no console MDM.
                  </label>
                </div>

                <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/40 border border-border/50">
                  <Checkbox
                    id="chk-imei"
                    checked={stolenChecklist.imeiBlocked}
                    onCheckedChange={(c) =>
                      setStolenChecklist({ ...stolenChecklist, imeiBlocked: Boolean(c) })
                    }
                  />
                  <label htmlFor="chk-imei" className="text-xs text-foreground cursor-pointer leading-tight">
                    <strong>Bloqueio de IMEI / Linha:</strong> Notificada a operadora de telefonia para suspensão da linha e bloqueio de IMEI na Anatel.
                  </label>
                </div>

                <div className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/40 border border-border/50">
                  <Checkbox
                    id="chk-pwd"
                    checked={stolenChecklist.passwordChanged}
                    onCheckedChange={(c) =>
                      setStolenChecklist({ ...stolenChecklist, passwordChanged: Boolean(c) })
                    }
                  />
                  <label htmlFor="chk-pwd" className="text-xs text-foreground cursor-pointer leading-tight">
                    <strong>Credenciais Corporativas:</strong> Senhas do e-mail vinculado ({stolenDevice.deviceEmail || "e-mail"}) e contas revogadas.
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStolenModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmStolen}
              disabled={submittingStolen}
              className="gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              {submittingStolen ? "Gravando..." : "Confirmar Bloqueio & Extravio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Registrar Devolução / Check-out */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <RotateCcw className="h-5 w-5 text-emerald-500" />
              Registrar Devolução de Celular
            </DialogTitle>
            <DialogDescription>
              Registre o recolhimento formal do equipamento, estado dos acessórios e arquive o titular no histórico.
            </DialogDescription>
          </DialogHeader>

          {returnDevice && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/70">
                <div className="font-semibold text-foreground">
                  {returnDevice.brand} {returnDevice.model}
                </div>
                <div className="text-muted-foreground mt-0.5">
                  Colaborador Atual: <strong>{returnDevice.assignedTo}</strong> ({returnDevice.department})
                </div>
                <div className="text-muted-foreground font-mono">
                  IMEI: {returnDevice.imei || "—"} | Linha: {returnDevice.phoneNumber || "—"}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Condição / Estado Geral do Equipamento *</Label>
                <Select value={returnCondition} onValueChange={setReturnCondition}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Perfeito estado">Perfeito estado (Sem avarias)</SelectItem>
                    <SelectItem value="Marcas leves de uso">Marcas leves de uso</SelectItem>
                    <SelectItem value="Tela trincada / danificada">Tela trincada / danificada</SelectItem>
                    <SelectItem value="Carcaça avariada">Carcaça avariada</SelectItem>
                    <SelectItem value="Sem carregador / cabo">Sem carregador / cabo</SelectItem>
                    <SelectItem value="Inoperante / Não liga">Inoperante / Não liga</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Novo Status do Aparelho</Label>
                <Select value={returnStatus} onValueChange={(v) => setReturnStatus(v as MobileStatus)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIVEL">Disponível (Pronto para reatribuição)</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção (Necessita reparo técnico)</SelectItem>
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Observações / Detalhes de Avarias</Label>
                <Input
                  placeholder="Ex: Devolvido sem cabo USB original, risco leve na lateral traseira"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReturn}
              disabled={submittingReturn}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckSquare className="h-4 w-4" />
              {submittingReturn ? "Processando..." : "Confirmar & Baixar Termo PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Dossiê / Ver Termo & Histórico */}
      <Dialog open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Dossiê, Auditoria & Histórico de Custódia
            </DialogTitle>
            <DialogDescription>
              Documento comprobatório de entrega com validade jurídica (Lei 14.063/2020) e trilha histórica de colaboradores.
            </DialogDescription>
          </DialogHeader>

          {dossierDevice && (
            <div ref={printableRef} className="space-y-4 py-2 text-sm text-foreground">
              {/* Document Header Box */}
              <div className="border border-border/80 rounded-xl p-4 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="font-bold text-base tracking-tight text-foreground">
                    GELLAK IT CORE — TERMO Nº #{dossierDevice.id.toString().padStart(5, "0")}
                  </div>
                  <div className="flex items-center gap-2">
                    {dossierDevice.inPulsus && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                        Pulsus MDM Ativo
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {statusConfig[dossierDevice.status]?.label || dossierDevice.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Colaborador / Titular:</span>
                    <strong className="text-sm font-semibold text-foreground">
                      {dossierDevice.assignedTo || "Não atribuído (Disponível na T.I)"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">CPF:</span>
                    <strong className="text-sm font-mono text-foreground">
                      {dossierDevice.cpf || "Não informado"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Setor:</span>
                    <strong className="text-foreground">
                      {dossierDevice.department || "Não informado"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Linha Telefônica:</span>
                    <strong className="font-mono text-foreground">
                      {dossierDevice.phoneNumber || "Sem linha vinculada"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Hardware Information Box */}
              <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-primary" />
                  Especificações Técnicas & Acessórios
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block">Marca e Modelo:</span>
                    <span className="font-medium text-foreground">{dossierDevice.brand} {dossierDevice.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Modelo Detectado (Hardware):</span>
                    <span className="font-mono text-foreground">{dossierDevice.deviceRawModel || dossierDevice.model}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Sistema Operacional:</span>
                    <span className="text-foreground">{dossierDevice.osVersion || "Não detectado"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">IMEI:</span>
                    <span className="font-mono text-foreground font-semibold">{dossierDevice.imei || "Não informado"}</span>
                  </div>
                </div>

                {/* Acessórios */}
                <div className="pt-2 border-t border-border/50">
                  <span className="text-muted-foreground block text-xs mb-1">Acessórios em Posse:</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant={dossierDevice.hasCharger !== false ? "secondary" : "outline"} className="text-[11px]">
                      Carregador: {dossierDevice.hasCharger !== false ? "Sim" : "Não"}
                    </Badge>
                    <Badge variant={dossierDevice.hasCable !== false ? "secondary" : "outline"} className="text-[11px]">
                      Cabo USB: {dossierDevice.hasCable !== false ? "Sim" : "Não"}
                    </Badge>
                    <Badge variant={dossierDevice.hasCase ? "secondary" : "outline"} className="text-[11px]">
                      Capa Protetora: {dossierDevice.hasCase ? "Sim" : "Não"}
                    </Badge>
                    <Badge variant={dossierDevice.hasScreenProtector ? "secondary" : "outline"} className="text-[11px]">
                      Película: {dossierDevice.hasScreenProtector ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* MDM & Device Credentials Box */}
              <div className="border border-blue-500/30 rounded-xl p-4 bg-blue-500/5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  Credenciais e Gerenciamento Corporativo
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block">E-mail do Aparelho:</span>
                    <span className="font-medium font-mono text-foreground">
                      {dossierDevice.deviceEmail || "Nenhum e-mail vinculado"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Senha do E-mail (AES-256 Protegida):</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-medium text-foreground">
                        {dossierDevice.deviceEmailPassword
                          ? showDossierPassword
                            ? dossierPlainPassword || (loadingCredentials ? "Carregando..." : "••••••••••••")
                            : "••••••••••••"
                          : "Não cadastrada"}
                      </span>
                      {dossierDevice.deviceEmailPassword && (
                        <button
                          type="button"
                          onClick={toggleDossierPassword}
                          className="text-muted-foreground hover:text-foreground"
                          title="Revelar senha sob demanda"
                        >
                          {showDossierPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Gerenciamento Pulsus MDM:</span>
                    <span className="font-medium text-foreground">
                      {dossierDevice.inPulsus ? "Sim (Dispositivo Gerenciado)" : "Não"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custody History Timeline */}
              <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" />
                    Histórico de Usuários Anteriores (Custódia)
                  </div>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {dossierHistory.length} movimentações
                  </span>
                </div>

                {dossierHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic pt-1">
                    Nenhum colaborador anterior registrado. O titular atual é o primeiro detentor formal.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {dossierHistory.map((item) => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-background/80 border border-border/60 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.assignedTo} ({item.department})
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {item.returnCondition || "Devolvido"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <div>
                            CPF: <span className="font-mono">{item.cpf || "—"}</span> | Linha: <span className="font-mono">{item.phoneNumber || "—"}</span>
                          </div>
                          <div className="text-right">
                            Devolvido em: {item.returnedAt ? new Date(item.returnedAt).toLocaleDateString("pt-BR") : "—"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit & Legal Box */}
              <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Registro de Auditoria Eletrônica (Lei 14.063/2020)
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block">Data e Hora UTC do Aceite:</span>
                    <span className="font-mono text-foreground font-medium">
                      {dossierDevice.termAcceptedAt
                        ? `${new Date(dossierDevice.termAcceptedAt).toLocaleString("pt-BR", { timeZone: "UTC" })} (UTC)`
                        : "Registro Manual / Não assinado digitalmente"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">IP do Signatário:</span>
                    <span className="font-mono text-foreground font-medium">
                      {dossierDevice.signerIp || "—"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-2 border-t border-emerald-500/20">
                  O signatário reconheceu o recebimento do aparelho e acessórios para uso corporativo, assumindo responsabilidade civil, administrativa e a obrigação de ressarcimento em caso de extravio, dolo ou mau uso, nos termos do art. 462, § 1º da CLT.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDossierOpen(false)}>
              Fechar
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir Dossiê
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cadastro de Novo Celular */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Cadastrar Novo Celular
            </DialogTitle>
            <DialogDescription>
              Cadastre manualmente um aparelho ou linha corporativa no inventário da T.I.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Marca *</label>
                <Input
                  placeholder="Ex: Apple, Samsung"
                  value={createForm.brand}
                  onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Modelo *</label>
                <Input
                  placeholder="Ex: Galaxy A15, iPhone 13"
                  value={createForm.model}
                  onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">IMEI (15 dígitos) *</label>
                <Input
                  placeholder="Ex: 356938035643809"
                  value={createForm.imei}
                  onChange={(e) => setCreateForm({ ...createForm, imei: e.target.value })}
                  required
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Número da Linha</label>
                <Input
                  placeholder="Ex: (31) 98888-7777"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: formatBrazilianMobile(e.target.value) })}
                  className="font-mono text-xs"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status *</label>
                <Select
                  value={createForm.status}
                  onValueChange={(val) =>
                    setCreateForm({ ...createForm, status: val as MobileStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_USO">Em Uso</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    <SelectItem value="EXTRAVIADO_ROUBADO">Extraviado / Roubado</SelectItem>
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Setor</label>
                <Select
                  value={createForm.department}
                  onValueChange={(val) => setCreateForm({ ...createForm, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {sortedDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Colaborador / Titular</label>
                <Input
                  placeholder="Nome do colaborador"
                  value={createForm.assignedTo}
                  onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">CPF do Titular</label>
                <Input
                  placeholder="000.000.000-00"
                  value={createForm.cpf}
                  onChange={(e) => setCreateForm({ ...createForm, cpf: formatCpf(e.target.value) })}
                  className="font-mono text-xs"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Acessórios Entregues */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/60 space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Acessórios Entregues com o Aparelho:
              </Label>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-charger"
                    checked={createForm.hasCharger}
                    onCheckedChange={(c) => setCreateForm({ ...createForm, hasCharger: Boolean(c) })}
                  />
                  <label htmlFor="create-charger" className="cursor-pointer">Carregador de Tomada</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-cable"
                    checked={createForm.hasCable}
                    onCheckedChange={(c) => setCreateForm({ ...createForm, hasCable: Boolean(c) })}
                  />
                  <label htmlFor="create-cable" className="cursor-pointer">Cabo USB</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-case"
                    checked={createForm.hasCase}
                    onCheckedChange={(c) => setCreateForm({ ...createForm, hasCase: Boolean(c) })}
                  />
                  <label htmlFor="create-case" className="cursor-pointer">Capa Protetora</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="create-protector"
                    checked={createForm.hasScreenProtector}
                    onCheckedChange={(c) => setCreateForm({ ...createForm, hasScreenProtector: Boolean(c) })}
                  />
                  <label htmlFor="create-protector" className="cursor-pointer">Película de Tela</label>
                </div>
              </div>
            </div>

            {/* Credenciais e MDM */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/60 space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Credenciais do Dispositivo & MDM
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">E-mail do Aparelho</label>
                <Input
                  type="email"
                  placeholder="operacao.gellak@gmail.com"
                  value={createForm.deviceEmail}
                  onChange={(e) => setCreateForm({ ...createForm, deviceEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Senha do E-mail</label>
                <div className="relative">
                  <Input
                    type={showCreatePassword ? "text" : "password"}
                    placeholder="Senha corporativa da conta"
                    value={createForm.deviceEmailPassword}
                    onChange={(e) => setCreateForm({ ...createForm, deviceEmailPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <Label htmlFor="create-pulsus" className="text-xs font-medium text-foreground">
                    Dispositivo gerenciado no Pulsus MDM
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Ativa controle corporativo e inventário automatizado via MDM
                  </p>
                </div>
                <Switch
                  id="create-pulsus"
                  checked={createForm.inPulsus}
                  onCheckedChange={(checked) => setCreateForm({ ...createForm, inPulsus: checked })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? "Cadastrando..." : "Salvar Aparelho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edição de Celular */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Editar Celular
            </DialogTitle>
            <DialogDescription>
              Atualize as informações técnicas, colaborador responsável, acessórios ou status do dispositivo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Marca *</label>
                <Input
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Modelo *</label>
                <Input
                  value={editForm.model}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">IMEI (15 dígitos) *</label>
                <Input
                  value={editForm.imei}
                  onChange={(e) => setEditForm({ ...editForm, imei: e.target.value })}
                  required
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Número da Linha</label>
                <Input
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: formatBrazilianMobile(e.target.value) })}
                  className="font-mono text-xs"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status *</label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, status: val as MobileStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_USO">Em Uso</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    <SelectItem value="EXTRAVIADO_ROUBADO">Extraviado / Roubado</SelectItem>
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Setor</label>
                <Select
                  value={editForm.department}
                  onValueChange={(val) => setEditForm({ ...editForm, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {sortedDepartments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Colaborador / Titular</label>
                <Input
                  value={editForm.assignedTo}
                  onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">CPF do Titular</label>
                <Input
                  value={editForm.cpf}
                  onChange={(e) => setEditForm({ ...editForm, cpf: formatCpf(e.target.value) })}
                  className="font-mono text-xs"
                  maxLength={14}
                />
              </div>
            </div>

            {/* Acessórios Entregues */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/60 space-y-2">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Acessórios Entregues com o Aparelho:
              </Label>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-charger"
                    checked={editForm.hasCharger}
                    onCheckedChange={(c) => setEditForm({ ...editForm, hasCharger: Boolean(c) })}
                  />
                  <label htmlFor="edit-charger" className="cursor-pointer">Carregador de Tomada</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-cable"
                    checked={editForm.hasCable}
                    onCheckedChange={(c) => setEditForm({ ...editForm, hasCable: Boolean(c) })}
                  />
                  <label htmlFor="edit-cable" className="cursor-pointer">Cabo USB</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-case"
                    checked={editForm.hasCase}
                    onCheckedChange={(c) => setEditForm({ ...editForm, hasCase: Boolean(c) })}
                  />
                  <label htmlFor="edit-case" className="cursor-pointer">Capa Protetora</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-protector"
                    checked={editForm.hasScreenProtector}
                    onCheckedChange={(c) => setEditForm({ ...editForm, hasScreenProtector: Boolean(c) })}
                  />
                  <label htmlFor="edit-protector" className="cursor-pointer">Película de Tela</label>
                </div>
              </div>
            </div>

            {/* Credenciais e MDM */}
            <div className="p-3 bg-muted/30 rounded-lg border border-border/60 space-y-3">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" />
                Credenciais do Dispositivo & MDM
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">E-mail do Aparelho</label>
                <Input
                  type="email"
                  value={editForm.deviceEmail}
                  onChange={(e) => setEditForm({ ...editForm, deviceEmail: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nova Senha do E-mail (Deixe em branco para manter a atual)
                </label>
                <div className="relative">
                  <Input
                    type={showEditPassword ? "text" : "password"}
                    placeholder="Deixe em branco para não alterar"
                    value={editForm.deviceEmailPassword}
                    onChange={(e) => setEditForm({ ...editForm, deviceEmailPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-pulsus" className="text-xs font-medium text-foreground">
                    Dispositivo gerenciado no Pulsus MDM
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Ativa controle corporativo e inventário automatizado via MDM
                  </p>
                </div>
                <Switch
                  id="edit-pulsus"
                  checked={editForm.inPulsus}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, inPulsus: checked })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Observações / Avarias</label>
              <Input
                placeholder="Observações internas da T.I..."
                value={editForm.returnNotes}
                onChange={(e) => setEditForm({ ...editForm, returnNotes: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingEdit}>
                {submittingEdit ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Excluir Celular */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Excluir Celular
            </DialogTitle>
            <DialogDescription>
              Esta ação removerá permanentemente o aparelho e todo o seu histórico de auditoria.
            </DialogDescription>
          </DialogHeader>

          {deviceToDelete && (
            <div className="py-2 text-xs space-y-1">
              <p>
                Tem certeza de que deseja excluir o aparelho{" "}
                <strong>
                  {deviceToDelete.brand} {deviceToDelete.model}
                </strong>
                ?
              </p>
              {deviceToDelete.assignedTo && (
                <p className="text-muted-foreground">
                  Atribuído a: <strong>{deviceToDelete.assignedTo}</strong>
                </p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSubmit}
              disabled={submittingDelete}
            >
              {submittingDelete ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
