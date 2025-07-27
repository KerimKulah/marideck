"use client"

import * as React from "react"
import { IconCommand, type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Image from 'next/image'

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
    onClick?: () => void
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <SidebarSeparator className="mx-0" />

      <div className="flex flex-col items-center mt-2 px-2">
        <div className="flex items-center gap-2">
          <Image src="/kmaritime-logo.png" alt="Logo" width={15} height={15} quality={90} />
          <span className="text-xs font-bold">MARITIME DESK (BETA)</span>
        </div>
        <span className="text-xs text-gray-600">Maritime Yönetim Sistemi</span>
      </div>
    </SidebarGroup>
  )
}
