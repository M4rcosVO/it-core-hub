import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, Role } from "@/components/AuthContext";
import { useData } from "@/components/DataContext";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUserRole } = useAuth();
  const dataContext = useData();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Atenção",
        description: "Preencha o usuário e a senha para acessar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Credenciais inválidas. Verifique seu usuário e senha.");
      }

      // Persistir token conforme requerido
      localStorage.setItem("token", data.token);
      localStorage.setItem("it_core_token", data.token);

      if (data.user) {
        localStorage.setItem("it_core_user", JSON.stringify(data.user));

        // Mapear role para o AuthContext
        const roleMap: Record<string, Role> = {
          admin: "Administrador",
          editor: "Técnico N1",
          viewer: "Auditor",
        };
        if (data.user.role && roleMap[data.user.role]) {
          setUserRole(roleMap[data.user.role]);
        }
      }

      // Se houver método login no contexto, garantir sincronização
      if (dataContext?.login) {
        dataContext.login(username.trim(), password).catch(() => {});
      }

      toast({
        title: "Acesso autorizado",
        description: `Bem-vindo, ${data.user?.name || username}!`,
      });

      navigate("/celulares");
    } catch (err: any) {
      console.error("Erro no login:", err);
      toast({
        title: "Falha na autenticação",
        description: err.message || "Não foi possível realizar o login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/40 to-background relative overflow-hidden">
      {/* Elementos visuais de fundo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-2xl border-border/80 backdrop-blur-md bg-card/95 relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner mb-2 ring-1 ring-primary/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            IT-Core Hub
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Acesse o painel central de governança e inventário de TI
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin.ti"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              className="w-full gap-2 font-semibold shadow-md transition-all hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground mt-2">
              Credenciais padrão: <span className="font-mono text-foreground font-semibold">admin.ti</span> / <span className="font-mono text-foreground font-semibold">GellakIT2026</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
