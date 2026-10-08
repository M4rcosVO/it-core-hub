import React, { useState, useEffect, useMemo } from "react";
import {
  Smartphone,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
  User,
  Hash,
  Tag,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export type MobileStatus = "DISPONIVEL" | "EM_USO" | "MANUTENCAO" | "DESATIVADO";

export interface MobileDevice {
  id: number;
  imei: string;
  brand: string;
  model: string;
  phoneNumber?: string | null;
  status: MobileStatus;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
};

export default function Celulares() {
  const { userRole } = useAuth();
  const isReadOnly = userRole === "Auditor";
  const { toast } = useToast();

  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    brand: "",
    model: "",
    imei: "",
    phoneNumber: "",
    status: "DISPONIVEL" as MobileStatus,
    assignedTo: "",
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<MobileDevice | null>(null);
  const [editForm, setEditForm] = useState({
    brand: "",
    model: "",
    imei: "",
    phoneNumber: "",
    status: "DISPONIVEL" as MobileStatus,
    assignedTo: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<MobileDevice | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  // Fetch devices
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices`);
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
      const term = search.toLowerCase();
      const matchesSearch =
        device.brand.toLowerCase().includes(term) ||
        device.model.toLowerCase().includes(term) ||
        device.imei.toLowerCase().includes(term) ||
        (device.phoneNumber && device.phoneNumber.toLowerCase().includes(term)) ||
        (device.assignedTo && device.assignedTo.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [devices, search, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: devices.length,
      emUso: devices.filter((d) => d.status === "EM_USO").length,
      disponivel: devices.filter((d) => d.status === "DISPONIVEL").length,
      manutencao: devices.filter((d) => d.status === "MANUTENCAO").length,
    };
  }, [devices]);

  // Handle Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.brand.trim() || !createForm.model.trim() || !createForm.imei.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Marca, Modelo e IMEI são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCreate(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });

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
      imei: device.imei,
      phoneNumber: device.phoneNumber || "",
      status: device.status,
      assignedTo: device.assignedTo || "",
    });
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/mobile-devices/${editingDevice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

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
      });

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
                Gestão de Celulares
              </h1>
              <p className="text-sm text-muted-foreground">
                Controle de inventário móvel, linhas telefônicas e aparelhos corporativos
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total de Aparelhos
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Dispositivos cadastrados</p>
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
            <p className="text-xs text-muted-foreground mt-1">Atribuídos a colaboradores</p>
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
            <p className="text-xs text-muted-foreground mt-1">Prontos para entrega</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Em Manutenção
            </CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.manutencao}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Assistência ou reparo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Lista de Dispositivos</CardTitle>
              <CardDescription>
                Exibindo {filteredDevices.length} de {devices.length} aparelhos
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar modelo, IMEI, linha..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-background/50"
                />
              </div>

              {/* Status Select */}
              <div className="w-full sm:w-44">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 bg-background/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODOS">Todos os Status</SelectItem>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_USO">Em Uso</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[180px]">Marca & Modelo</TableHead>
                  <TableHead className="w-[170px]">IMEI</TableHead>
                  <TableHead className="w-[150px]">Número da Linha</TableHead>
                  <TableHead className="w-[180px]">Colaborador / Atribuído</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[120px]">Cadastrado em</TableHead>
                  {!isReadOnly && <TableHead className="w-[90px] text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 6 : 7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <span>Carregando inventário móvel...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isReadOnly ? 6 : 7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                        <span className="font-medium">Nenhum aparelho encontrado</span>
                        <span className="text-xs">
                          {search || statusFilter !== "TODOS"
                            ? "Tente ajustar os filtros de busca."
                            : "Clique em 'Novo Celular' para adicionar o primeiro aparelho."}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => {
                    const statusInfo = statusConfig[device.status] || statusConfig.DISPONIVEL;
                    const StatusIcon = statusInfo.icon;
                    const formattedDate = device.createdAt
                      ? new Date(device.createdAt).toLocaleDateString("pt-BR")
                      : "—";

                    return (
                      <TableRow key={device.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Smartphone className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {device.model}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {device.brand}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {device.imei}
                        </TableCell>
                        <TableCell>
                          {device.phoneNumber ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {device.phoneNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Sem linha</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {device.assignedTo ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                              <User className="h-3 w-3 text-primary" />
                              {device.assignedTo}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Não atribuído</span>
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
                        <TableCell className="text-xs text-muted-foreground">
                          {formattedDate}
                        </TableCell>
                        {!isReadOnly && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
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
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Cadastro de Novo Celular */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Cadastrar Novo Celular
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do aparelho corporativo para registrar no inventário.
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
                  placeholder="Ex: iPhone 13, S23"
                  value={createForm.model}
                  onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                  required
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Número da Linha</label>
                <Input
                  placeholder="Ex: (11) 98765-4321"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                />
              </div>

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
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Colaborador / Responsável
              </label>
              <Input
                placeholder="Nome do colaborador atribuído"
                value={createForm.assignedTo}
                onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={submittingCreate}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingCreate}>
                {submittingCreate ? "Salvando..." : "Salvar Aparelho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Edição de Celular */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Editar Celular
            </DialogTitle>
            <DialogDescription>
              Altere as informações do aparelho ou atualize a atribuição de usuário.
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">IMEI *</label>
              <Input
                value={editForm.imei}
                onChange={(e) => setEditForm({ ...editForm, imei: e.target.value })}
                required
                className="font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Número da Linha</label>
                <Input
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status *</label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) =>
                    setEditForm({ ...editForm, status: val as MobileStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                    <SelectItem value="EM_USO">Em Uso</SelectItem>
                    <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                    <SelectItem value="DESATIVADO">Desativado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Colaborador / Responsável
              </label>
              <Input
                value={editForm.assignedTo}
                onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                placeholder="Nome do colaborador atribuído"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={submittingEdit}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingEdit}>
                {submittingEdit ? "Salvando..." : "Atualizar Aparelho"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmação de Exclusão */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Excluir Aparelho
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o aparelho{" "}
              <strong className="text-foreground">
                {deviceToDelete?.brand} {deviceToDelete?.model}
              </strong>{" "}
              (IMEI: {deviceToDelete?.imei})? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={submittingDelete}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
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
