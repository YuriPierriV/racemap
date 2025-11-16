import { ChevronUp, Plus, ChevronRight } from "lucide-react";

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
import { aside_pages } from "models/routes";

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
            {aside_pages.map((item) => (
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
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleTrigger>
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
