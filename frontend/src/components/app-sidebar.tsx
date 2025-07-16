"use client"

import * as React from "react"
import { IconAnchor, IconChartBar, IconCommand, IconDashboard, IconFileWord, IconHelp, IconSettings, IconShip, IconUsers, IconClipboardList } from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "@/components/ui/sidebar"
import Image from 'next/image';
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { SettingsDialog } from "./settings-dialog"

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
      title: "Takip Edilen Gemiler",
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
      title: "Finans & Faturalar",
      url: "/dashboard/finance",
      icon: IconChartBar,
    },
    {
      title: "Görevler",
      url: "/dashboard/tasks",
      icon: IconClipboardList,
    },
    {
      title: "Çalışanlar",
      url: "/dashboard/personnel",
      icon: IconUsers,
    },


  ],
  navSecondary: [
    {
      title: "Ayarlar",
      url: "",
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
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const navSecondaryItems = React.useMemo(() =>
    data.navSecondary.map(item =>
      item.title === "Ayarlar"
        ? {
          ...item,
          onClick: () => setIsSettingsOpen(true),
          url: '#' // Prevent navigation
        }
        : item
    ),
    []
  )

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader className="px-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="px-2">
                <div className="mt-1 h-15 flex items-center justify-center">
                  <Image src="/flama-maritime.png" alt="Logo" width={100} height={100} quality={100} />
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-3">
          <NavMain items={data.navMain} />
          <NavSecondary
            items={navSecondaryItems}
            className="mt-auto"
          />
        </SidebarContent>
      </Sidebar>
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  )
}
