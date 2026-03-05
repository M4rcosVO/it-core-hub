import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Monitor,
    Network,
    Key,
    FileSignature,
    BookOpen
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { computers, mobiles, acessosData, ipList } from "@/data/mockData";

export function GlobalSearch() {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Digite um comando, IP, ativo ou senha para buscar..." />
            <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Módulos Rápidos">
                    <CommandItem onSelect={() => runCommand(() => navigate("/inventario"))}>
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>Ir para Inventário</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/acessos"))}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>Ir para Cofre de Senhas</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/rede"))}>
                        <Network className="mr-2 h-4 w-4" />
                        <span>Ir para Rede (IPAM & VLANs)</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/contratos"))}>
                        <FileSignature className="mr-2 h-4 w-4" />
                        <span>Ir para Contratos</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/wiki"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Ir para Wiki (Base de Conhecimento)</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Máquinas e Equipamentos">
                    {computers.slice(0, 3).map(comp => (
                        <CommandItem key={comp.id} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{comp.hostname}</span>
                            <span className="ml-2 text-xs text-muted-foreground">- {comp.responsavel}</span>
                        </CommandItem>
                    ))}
                    {mobiles.slice(0, 2).map(mob => (
                        <CommandItem key={`mob-${mob.id}`} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{mob.modelo}</span>
                            <span className="ml-2 text-xs text-muted-foreground">- {mob.responsavel}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Acessos e Senhas">
                    {acessosData.slice(0, 3).map(acesso => (
                        <CommandItem key={`acc-${acesso.id}`} onSelect={() => runCommand(() => navigate("/acessos"))}>
                            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{acesso.nome}</span>
                            <span className="ml-2 text-xs text-muted-foreground">- {acesso.usuario}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Rede">
                    {ipList.slice(0, 3).map(ip => (
                        <CommandItem key={`ip-${ip.ip}`} onSelect={() => runCommand(() => navigate("/rede"))}>
                            <Network className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{ip.ip}</span>
                            <span className="ml-2 text-xs text-muted-foreground">- {ip.dispositivo}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Configurações">
                    <CommandItem onSelect={() => runCommand(() => navigate("/configuracoes"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Equipe de TI</span>
                        <CommandShortcut>⌘P</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/configuracoes"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Aparência e Dark Mode</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
