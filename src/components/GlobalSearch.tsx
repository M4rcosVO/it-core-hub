import * as React from "react";
import {
    Settings,
    User,
    Monitor,
    Network,
    Key,
    FileSignature,
    BookOpen,
    Smartphone,
    Printer,
    AppWindow,
    BriefcaseBusiness,
    Search
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
import {
    computers,
    mobiles,
    softwares,
    emprestimos,
    peripherals,
    acessosData,
    ipList,
    contratosData
} from "@/data/mockData";

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
            <CommandList className="max-h-[450px]">
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

                <CommandGroup heading="Ações Rápidas">
                    <CommandItem onSelect={() => runCommand(() => navigate("/inventario"))}>
                        <Monitor className="mr-2 h-4 w-4" />
                        <span>Ver Inventário</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/acessos"))}>
                        <Key className="mr-2 h-4 w-4" />
                        <span>Acessar Cofre</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/wiki"))}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Consultar Wiki</span>
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Hardware e Inventário">
                    {computers.map(comp => (
                        <CommandItem key={`comp-${comp.id}`} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{comp.hostname}</span>
                            <span className="ml-2 text-[10px] text-muted-foreground opacity-70 uppercase">({comp.setor})</span>
                            <span className="ml-auto text-xs text-muted-foreground">{comp.responsavel}</span>
                        </CommandItem>
                    ))}
                    {mobiles.map(mob => (
                        <CommandItem key={`mob-${mob.id}`} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <Smartphone className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{mob.modelo}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{mob.responsavel}</span>
                        </CommandItem>
                    ))}
                    {peripherals.map(per => (
                        <CommandItem key={`per-${per.id}`} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <Printer className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{per.modelo}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({per.tipo})</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Software e Licenças">
                    {softwares.map(sw => (
                        <CommandItem key={`sw-${sw.id}`} onSelect={() => runCommand(() => navigate("/inventario"))}>
                            <AppWindow className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{sw.nome}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{sw.assigned}/{sw.qtd}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Rede e Conetividade">
                    {ipList.map(ip => (
                        <CommandItem key={`ip-${ip.ip}`} onSelect={() => runCommand(() => navigate("/rede"))}>
                            <Network className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{ip.ip}</span>
                            <span className="ml-2 text-xs text-muted-foreground">- {ip.dispositivo}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Cofre e Contratos">
                    {acessosData.map(acesso => (
                        <CommandItem key={`acc-${acesso.id}`} onSelect={() => runCommand(() => navigate("/acessos"))}>
                            <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{acesso.nome}</span>
                            <span className="ml-2 text-[10px] uppercase text-muted-foreground">[{acesso.categoria}]</span>
                        </CommandItem>
                    ))}
                    {contratosData.map(cont => (
                        <CommandItem key={`cont-${cont.id}`} onSelect={() => runCommand(() => navigate("/contratos"))}>
                            <FileSignature className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{cont.fornecedor}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({cont.servico})</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Utilidades">
                    <CommandItem onSelect={() => runCommand(() => navigate("/configuracoes"))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações do Sistema</span>
                        <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => navigate("/configuracoes"))}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Gestão de Perfis</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    );
}
