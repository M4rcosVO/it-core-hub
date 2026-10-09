import { useEffect, useState, type FormEvent } from "react";
import UAParser from "ua-parser-js";
import { CheckCircle2, Satellite, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

const RESPONSIBILITY_TERM = `TERMO DE RESPONSABILIDADE — APARELHO CORPORATIVO

1. Objeto
Declaro ter recebido, em perfeito estado de funcionamento, o aparelho celular corporativo identificado automaticamente neste formulário, para uso exclusivo em atividades profissionais da empresa.

2. Uso e guarda
Comprometo-me a utilizar o equipamento de forma diligente, zelar pela sua conservação física e lógica, não instalar aplicativos não autorizados pela T.I. e não compartilhar o dispositivo com terceiros.

3. Dados e segurança
Reconheço que o aparelho poderá conter acessos corporativos, e-mails, aplicativos e dados da empresa. Obrigo-me a manter senha/biometria ativas, comunicar imediatamente perda, furto, dano ou suspeita de incidente de segurança à equipe de T.I. e a não extrair, copiar ou divulgar informações internas.

4. Devolução
Comprometo-me a devolver o aparelho, acessórios e linha telefônica (quando aplicável) ao encerrar o vínculo, mudar de função ou quando solicitado pela T.I., no mesmo estado em que foram entregues, salvo desgaste natural de uso.

5. Responsabilidade
Estou ciente de que danos decorrentes de mau uso, negligência, perda ou furto sem comunicação imediata poderão gerar responsabilização administrativa e, quando cabível, o ressarcimento do bem.

6. Ciência
Ao marcar a caixa de aceite, confirmo que li este termo, concordo com as condições acima e autorizo o registro técnico do aparelho (marca, modelo e versão do sistema) para fins de inventário e auditoria.`;

export default function PublicColeta() {
  const [detected, setDetected] = useState<DetectedDevice | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!assignedTo.trim() || !department.trim() || !phoneNumber.trim()) {
      setError("Preencha nome completo, setor e número de telefone.");
      return;
    }
    if (!accepted) {
      setError("É necessário aceitar o Termo de Responsabilidade para enviar.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/ingest/mobile-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assignedTo.trim(),
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
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-300/80">Satélite</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Coleta de aparelho</h1>
          <p className="mt-2 text-sm text-slate-400">
            Vincule seu celular corporativo de forma rápida e segura.
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 text-slate-50 shadow-2xl backdrop-blur">
          {success ? (
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-400" />
              <div>
                <p className="text-lg font-semibold">Aparelho vinculado com sucesso.</p>
                <p className="mt-2 text-sm text-slate-400">Você já pode fechar esta página.</p>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Identificação do colaborador</CardTitle>
                <CardDescription className="text-slate-400">
                  Informe seus dados. Os dados técnicos do aparelho são capturados automaticamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Nome Completo</Label>
                    <Input
                      id="assignedTo"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      placeholder="Seu nome completo"
                      className="border-slate-700 bg-slate-950/60"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Setor</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ex: Comercial, Operações, T.I."
                      className="border-slate-700 bg-slate-950/60"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Número de Telefone</Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ex: (11) 98765-4321"
                      className="border-slate-700 bg-slate-950/60"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                      <Smartphone className="h-3.5 w-3.5" />
                      Conferência técnica
                    </div>
                    <p className="text-sm text-slate-300">
                      {detected ? `${detected.brand} · ${detected.model}` : "Detectando aparelho..."}
                    </p>
                    {detected?.osVersion && (
                      <p className="mt-0.5 text-xs text-slate-500">{detected.osVersion}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Termo de Responsabilidade</Label>
                    <ScrollArea className="h-40 rounded-md border border-slate-800 bg-slate-950/70 p-3">
                      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-400">
                        {RESPONSIBILITY_TERM}
                      </p>
                    </ScrollArea>
                    <label className="flex items-start gap-2 text-sm text-slate-300">
                      <Checkbox
                        checked={accepted}
                        onCheckedChange={(value) => setAccepted(value === true)}
                        className="mt-0.5 border-slate-500"
                      />
                      <span>Li e aceito o Termo de Responsabilidade.</span>
                    </label>
                  </div>

                  {error && (
                    <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-sky-600 text-white hover:bg-sky-500"
                    disabled={submitting || !accepted}
                  >
                    {submitting ? "Enviando..." : "Vincular aparelho"}
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
