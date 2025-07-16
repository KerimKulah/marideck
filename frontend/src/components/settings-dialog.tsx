"use client"

import * as React from "react"
import {
    Bell,
    Check,
    Globe,
    Home,
    Keyboard,
    Link,
    Lock,
    Menu,
    MessageCircle,
    Paintbrush,
    Settings,
    Video,
} from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"

const data = {
    nav: [
        { name: "Bildirimler", icon: Bell },
        { name: "Navigasyon", icon: Menu },
        { name: "Ev", icon: Home },
        { name: "Görünüm", icon: Paintbrush },
        { name: "Mesajlar & medya", icon: MessageCircle },
        { name: "Dil & bölge", icon: Globe },
        { name: "Erişilebilirlik", icon: Keyboard },
        { name: "Okundu olarak işaretle", icon: Check },
        { name: "Ses & video", icon: Video },
        { name: "Bağlantılar", icon: Link },
        { name: "Gizlilik & görünürlük", icon: Lock },
        { name: "Gelişmiş", icon: Settings },
    ],
}

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
                <DialogTitle className="sr-only">Ayarlar</DialogTitle>
                <DialogDescription className="sr-only">
                    Customize your settings here.
                </DialogDescription>
                <SidebarProvider className="items-start">
                    <Sidebar collapsible="none" className="hidden md:flex">
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {data.nav.map((item) => (
                                            <SidebarMenuItem key={item.name}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={item.name === "Mesajlar &     Medya"}
                                                >
                                                    <a href="#">
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
                        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <div className="flex items-center gap-2 px-4">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="#">Ayarlar</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>Mesajlar & Medya</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-muted/50 aspect-video max-w-3xl rounded-xl"
                                />
                            ))}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsDialog
