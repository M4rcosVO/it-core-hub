import {
  LayoutDashboard,
  Monitor,
  Network,
  BookOpen,
  Settings,
  Server,
  Key,
  FileSignature,
  CheckSquare,
  CalendarDays,
  Shield,
  ChevronDown,
  User,
  LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, Role } from "@/components/AuthContext";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventário", url: "/inventario", icon: Monitor },
  { title: "Contratos", url: "/contratos", icon: FileSignature },
  { title: "Acessos", url: "/acessos", icon: Key },
  { title: "Rede & VPN", url: "/rede", icon: Network },
  { title: "Rotinas", url: "/rotinas", icon: CheckSquare },
  { title: "Calendário", url: "/calendario", icon: CalendarDays },
  { title: "Wiki", url: "/wiki", icon: BookOpen },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { userRole, setUserRole, hasPermission } = useAuth();

  const filteredItems = menuItems.filter(item => hasPermission(item.title));

  const roles: Role[] = ["Administrador", "Técnico N1", "Auditor"];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary ring-2 ring-primary/20">
                <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-sidebar-primary-foreground tracking-wide truncate">
                    GELLAK IT
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-primary font-bold uppercase truncate">
                      {userRole}
                    </span>
                    <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Alternar Perfil (Modo Teste)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roles.map((role) => (
              <DropdownMenuItem
                key={role}
                onClick={() => setUserRole(role)}
                className={userRole === role ? "bg-accent font-semibold" : ""}
              >
                <User className="mr-2 h-4 w-4" />
                {role}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-[11px] text-sidebar-foreground/40">
            v1.0.0 · Módulo RBAC Ativo
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
