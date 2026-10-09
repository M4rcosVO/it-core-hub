import { useEffect, useState, type FormEvent } from "react";
import UAParser from "ua-parser-js";
import { CheckCircle2, Satellite, Smartphone, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "@/constants/departments";
import { formatBrazilianMobile, validateBrazilianMobile } from "@/utils/phone";

const API_BASE = "/api";

interface DetectedDevice {
  brand: string;
  model: string;
  osVersion: string;
  deviceRawModel: string;
}

const isGenericHint = (value?: string) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "unknown" ||
    normalized === "undefined" ||
    normalized.includes("not a brand") ||
    normalized === "chromium" ||
    normalized === "google chrome" ||
    normalized === "microsoft edge"
  );
};

async function detectDevice(): Promise<DetectedDevice> {
  const parser = new UAParser(navigator.userAgent);
  const parsed = parser.getResult();

  let brand = parsed.device.vendor || "";
  let model = parsed.device.model || "";
  let osVersion = [parsed.os.name, parsed.os.version].filter(Boolean).join(" ");
  let deviceRawModel = model;

  try {
    const uaData = navigator.userAgentData;
    if (uaData?.getHighEntropyValues) {
      const hints = await uaData.getHighEntropyValues(["model", "platformVersion"]);
      if (hints.model) {
        deviceRawModel = hints.model;
        if (!isGenericHint(hints.model)) {
          model = hints.model;
        }
      }
      if (hints.platformVersion) {
        const platformName = uaData.platform || parsed.os.name || "SO";
        osVersion = `${platformName} ${hints.platformVersion}`.trim();
      }
      const hintBrand = uaData.brands?.find((item) => !isGenericHint(item.brand))?.brand;
      if (hintBrand && isGenericHint(brand)) {
        brand = hintBrand;
      }
    }
  } catch {
    // Client Hints may be denied; UA-parser fallback already applied.
  }

  if (isGenericHint(brand)) {
    brand = parsed.device.vendor || parsed.os.name || "Desconhecido";
  }
  if (isGenericHint(model)) {
    model = parsed.device.model || "Desconhecido";
  }

  return {
    brand,
    model,
    osVersion: osVersion || "Não identificado",
    deviceRawModel: deviceRawModel || model,
  };
}

const RESPONSIBILITY_TERM = `TERMO DE RESPONSABILIDADE E AUDITORIA LEGAL — APARELHO CORPORATIVO
(Lei nº 14.063/2020 e Art. 462, § 1º da CLT)

1. IDENTIFICAÇÃO E RECEBIMENTO
O colaborador abaixo qualificado e identificado por Nome Completo e CPF declara ter recebido da empresa, em perfeito estado de conservação e pleno funcionamento, o aparelho celular corporativo e linha telefônica identificados tecnicamente neste formulário.

2. FINALIDADE EXCLUSIVA DE TRABALHO
O equipamento, seus acessórios e a linha telefônica destinam-se exclusivamente à execução de atividades e comunicações corporativas da empresa, sendo terminantemente proibida a cessão, empréstimo a terceiros ou utilização incompatível com a política interna de segurança.

3. RESPONSABILIDADE CIVIL, ADMINISTRATIVA E RESSARCIMENTO
O colaborador declara ciência de que tem o dever de guarda, cuidado e zelo pelo patrimônio da empresa. Fica expressamente pactuado que:
a) Danos decorrentes de dolo, culpa, negligência, imprudência ou mau uso implicarão na obrigação de integral ressarcimento financeiro dos custos de reparo ou reposição do bem à empresa, nos termos do art. 462, § 1º da CLT.
b) Em caso de perda, roubo ou furto, o colaborador deverá comunicar imediatamente o departamento de T.I. para bloqueio remoto e lavrar o respectivo Boletim de Ocorrência (B.O.).
c) A recusa na devolução ou danos injustificados ensejarão as sanções administrativas cabíveis e eventuais medidas judiciais de reparação civil e criminal.

4. DADOS E CONFIDENCIALIDADE (LGPD)
O colaborador compromete-se a não extrair dados sigilosos da empresa e a manter as credenciais de segurança e bloqueio de tela (PIN/Biometria) sempre ativas.

5. ASSINATURA ELETRÔNICA AVANÇADA
Nos termos da Lei nº 14.063/2020, ao marcar o aceite deste formulário, o signatário manifesta adesão irretratável, ficando registrados para fins de auditoria forense a data e hora UTC do aceite, endereço IP de origem e os metadados técnicos do equipamento.`;

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

export default function PublicColeta() {
  const [detected, setDetected] = useState<DetectedDevice | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
  const [cpf, setCpf] = useState("");
  const [department, setDepartment] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    detectDevice()
      .then((result) => {
        if (!cancelled) setDetected(result);
      })
      .catch(() => {
        if (!cancelled) {
          setDetected({
            brand: "Desconhecido",
            model: "Desconhecido",
            osVersion: "Não identificado",
            deviceRawModel: "Desconhecido",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatBrazilianMobile(e.target.value));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const rawCpf = cpf.replace(/\D/g, "");
    if (!assignedTo.trim()) {
      setError("Por favor, preencha o seu nome completo.");
      return;
    }

    if (rawCpf.length !== 11) {
      setError("O CPF deve conter exatamente 11 dígitos numéricos.");
      return;
    }

    if (!department.trim()) {
      setError("Selecione o seu setor corporativo.");
      return;
    }

    if (!validateBrazilianMobile(phoneNumber)) {
      setError("Informe um número de celular corporativo válido com 11 dígitos (DDD + 9XXXX-XXXX).");
      return;
    }

    if (!accepted) {
      setError("É obrigatório concordar com o Termo de Responsabilidade para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/ingest/mobile-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assignedTo.trim(),
          cpf: cpf.trim(),
          department: department.trim(),
          phoneNumber: phoneNumber.trim(),
          brand: detected?.brand,
          model: detected?.model,
          osVersion: detected?.osVersion,
          deviceRawModel: detected?.deviceRawModel,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Não foi possível registrar o aparelho.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Falha de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-950 to-slate-950" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 ring-1 ring-sky-400/30">
            <Satellite className="h-7 w-7 text-sky-300" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Satélite Corporativo</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Coleta de Celular & Termo de Posse</h1>
          <p className="mt-2 text-sm text-slate-400">
            Identifique-se e assine digitalmente a posse do seu aparelho corporativo.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 text-slate-50 shadow-2xl backdrop-blur">
          {success ? (
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-400" />
              <div>
                <p className="text-lg font-semibold text-emerald-300">Aparelho vinculado com sucesso!</p>
                <p className="mt-2 text-sm text-slate-400">
                  O termo de responsabilidade foi assinado e os dados de auditoria foram salvos na T.I.
                </p>
                <p className="mt-1 text-xs text-slate-500">Você já pode fechar esta tela com segurança.</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Identificação do Colaborador</CardTitle>
                <CardDescription className="text-slate-400">
                  Preencha os dados cadastrais. As informações técnicas do celular são detectadas automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Nome Completo</Label>
                    <Input
                      id="assignedTo"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Ex: João da Silva Santos"
                      className="border-slate-700 bg-slate-950/60"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={cpf}
                      onChange={handleCpfChange}
                      placeholder="000.000.000-00"
                      className="border-slate-700 bg-slate-950/60 font-mono"
                      inputMode="numeric"
                      maxLength={14}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Setor</Label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="department" className="border-slate-700 bg-slate-950/60 text-slate-100">
                        <SelectValue placeholder="Selecione o seu setor" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 border-slate-800 bg-slate-900 text-slate-100">
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept} className="focus:bg-slate-800 focus:text-white">
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número da Linha / Telefone</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="(31) 98888-7777"
                      className="border-slate-700 bg-slate-950/60 font-mono"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-sky-400">
                      <Smartphone className="h-3.5 w-3.5" />
                      Dispositivo Reconhecido Automaticamente
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {detected ? `${detected.brand} · ${detected.model}` : "Detectando hardware..."}
                    </p>
                    {detected?.osVersion && (
                      <p className="mt-0.5 text-xs text-slate-400">{detected.osVersion}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Termo de Compromisso e Auditoria</Label>
                      <span className="text-[11px] text-sky-400 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Lei 14.063/2020
                      </span>
                    </div>
                    <ScrollArea className="h-44 rounded-md border border-slate-800 bg-slate-950/70 p-3">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                        {RESPONSIBILITY_TERM}
                      </p>
                    </ScrollArea>
                    <label className="flex items-start gap-2.5 text-sm text-slate-300 cursor-pointer pt-1">
                      <Checkbox
                        checked={accepted}
                        onCheckedChange={(value) => setAccepted(value === true)}
                        className="mt-0.5 border-slate-500 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                      />
                      <span className="text-xs leading-snug">
                        Declaro que li e concordo integralmente com o Termo de Responsabilidade, assumindo as obrigações e o ressarcimento por avarias/mau uso.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-sky-600 text-white hover:bg-sky-500 font-medium py-2.5 shadow-lg shadow-sky-900/30"
                    disabled={submitting || !accepted}
                  >
                    {submitting ? "Processando e Assinando..." : "Assinar e Vincular Aparelho"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
