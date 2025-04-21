import {
  Home,
  Settings,
  ChevronUp,
  Map,
  Plus,
  ChevronRight,
  Users,
  Satellite,
  CalendarDays,
  BarChart,
} from "lucide-react";

import {
  SidebarGroupAction,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

import React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import Image from "next/image";
import { useTheme } from "next-themes";

// Menu items.
export const items_pages = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Pilotos",
    icon: Users,
    submenu: [
      { title: "Lista de Pilotos", url: "/pilotos/lista-de-pilotos" },
      { title: "Estatísticas", url: "#" },
      { title: "Comparação de Pilotos", url: "#" },
    ],
  },
  {
    title: "Traçados",
    url: "#",
    icon: Map,
    submenu: [
      { title: "Mapa de Circuitos", url: "/tracados/mapa-de-circuitos" },
      { title: "Criar Novo Traçado", url: "#" },
      { title: "Análise de Traçados", url: "#" },
    ],
  },
  {
    title: "Dispositivos",
    url: "#",
    icon: Satellite,
    submenu: [
      {
        title: "Lista de Dispositivos",
        url: "/dispositivos/lista-de-dispositivos",
      },
      { title: "Gerenciar Dispositivos", url: "#" },
    ],
  },
  {
    title: "Calendário",
    url: "#",
    icon: CalendarDays,
    submenu: [
      { title: "Próximas Corridas", url: "/calendario/proximas-corridas" },
      { title: "Histórico de Corridas", url: "#" },
      { title: "Criar Novo Evento", url: "#" },
    ],
  },
  {
    title: "Estatísticas",
    url: "#",
    icon: BarChart,
    submenu: [
      { title: "Visão Geral", url: "#" },
      { title: "Histórico de Tempos", url: "#" },
      { title: "Exportação de Dados", url: "#" },
    ],
  },
  {
    title: "Configurações",
    url: "#",
    icon: Settings,
    submenu: [
      { title: "Perfil do Usuário", url: "#" },
      { title: "Configuração da Corrida", url: "#" },
      { title: "Preferências do Sistema", url: "#" },
    ],
  },
];

export function AppSidebar() {
  const { open, toggleSidebar } = useSidebar();
  const { theme } = useTheme();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="items-center justify-center">
        {open ? (
          <Image
            src={theme === "dark" ? "/logo_dark.png" : "/logo_white.png"}
            width={500}
            height={100}
            alt="Logo racemap"
            className="p-5"
          />
        ) : (
          <Image
            src="/icon_logo.png"
            width={50}
            height={50}
            alt="Logo racemap"
          />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {items_pages.map((item) => (
              <Collapsible key={item.title} className="group/collapsible">
                <SidebarMenu>
                  {/* Botão principal da sidebar */}
                  <CollapsibleTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 w-full"
                          onClick={!open ? toggleSidebar : undefined}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                          {item.submenu && (
                            <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleTrigger>

                  {/* Renderizar submenus apenas se existirem */}
                  {item.submenu && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.submenu.map((subitem) => (
                          <SidebarMenuSubItem key={subitem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subitem.url}>{subitem.title}</a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenu>
              </Collapsible>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Corridas</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className="sr-only">Iniciar Corrida</span>
          </SidebarGroupAction>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <h1>Yuri</h1>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function LayoutAside({ children, defaultOpen }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-col gap-4 min-w-full max-w-full min-h-screen max-h-screen">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
