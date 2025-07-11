"use client"

import * as React from "react"
import { IconAnchor, IconChartBar, IconCommand, IconDashboard, IconFileWord, IconHelp, IconSettings, IconShip, IconUsers, IconClipboardList } from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Gösterge Paneli",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Müşteriler",
      url: "/dashboard/customers",
      icon: IconUsers,
    },
    {
      title: "Gemi Listesi",
      url: "/dashboard/ships",
      icon: IconShip,
    },
    {
      title: "Operasyonlar",
      url: "/dashboard/operations",
      icon: IconAnchor,
    },
    {
      title: "Belgeler",
      url: "/dashboard/documents",
      icon: IconFileWord,
    },
    {
      title: "Finans & Fatura",
      url: "/dashboard/finance",
      icon: IconChartBar,
    },
    {
      title: "Görevler",
      url: "/dashboard/tasks",
      icon: IconClipboardList,
    },
    {
      title: "Personel",
      url: "/dashboard/personnel",
      icon: IconUsers,
    },


  ],
  navSecondary: [
    {
      title: "Ayarlar",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Yardım",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="px-2">
              <a href="#" className="w-full">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconCommand className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">K-MARITIME</span>
                  <span className="truncate text-xs">Maritime Yönetim Sistemi</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
