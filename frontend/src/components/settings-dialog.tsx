"use client"

import * as React from "react"
import {
    AlertCircle,
    Bell,
    Brain,
    List,
    Mail,
    MessageSquare,
    Phone,
    Users,
} from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
        { name: "Müşteri Bildirimleri", icon: Bell },
        { name: "Operasyon Ayarları", icon: List },
        { name: "Ekip Ayarları", icon: Users },
        { name: "Yapay Zeka Ayarları", icon: Brain },
    ],
}

interface SettingsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [selectedCategory, setSelectedCategory] = React.useState("Müşteri Bildirimleri")
    const [operationViewMode, setOperationViewMode] = React.useState("all")
    const [notificationEnabled, setNotificationEnabled] = React.useState(true)
    const [notificationChannels, setNotificationChannels] = React.useState({
        sms: false,
        whatsapp: false,
        email: true,
    })
    const [maxTeamMembers, setMaxTeamMembers] = React.useState(10)
    const [aiEnabled, setAiEnabled] = React.useState(false)

    const handleChannelToggle = (channel: "sms" | "whatsapp" | "email") => {
        setNotificationChannels((prev) => ({
            ...prev,
            [channel]: !prev[channel],
        }))
    }

    const renderContent = () => {
        if (selectedCategory === "Müşteri Bildirimleri") {
            return (
                <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                        <div className="rounded-md border p-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Müşterilere operasyon detayları gönderilsin mi?</label>
                                <Select
                                    value={notificationEnabled ? "enabled" : "disabled"}
                                    onValueChange={(value) => setNotificationEnabled(value === "enabled")}
                                >
                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="enabled">Gönderilsin</SelectItem>
                                        <SelectItem value="disabled">Gönderilmesin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {notificationEnabled && (
                            <>
                                <div className="rounded-md border p-3">
                                    <label className="text-sm font-medium mb-2 block">Bildirim Kanalları</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between rounded border p-2 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <label className="text-sm cursor-pointer" htmlFor="email-checkbox">
                                                    E-posta
                                                </label>
                                            </div>
                                            <Checkbox
                                                id="email-checkbox"
                                                checked={notificationChannels.email}
                                                onCheckedChange={() => handleChannelToggle("email")}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded border p-2 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <label className="text-sm cursor-pointer" htmlFor="whatsapp-checkbox">
                                                    WhatsApp
                                                </label>
                                            </div>
                                            <Checkbox
                                                id="whatsapp-checkbox"
                                                checked={notificationChannels.whatsapp}
                                                onCheckedChange={() => handleChannelToggle("whatsapp")}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between rounded border p-2 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <label className="text-sm cursor-pointer" htmlFor="sms-checkbox">
                                                    SMS
                                                </label>
                                            </div>
                                            <Checkbox
                                                id="sms-checkbox"
                                                checked={notificationChannels.sms}
                                                onCheckedChange={() => handleChannelToggle("sms")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-md border p-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Bildirim Zamanı</label>
                                        <Select defaultValue="immediate">
                                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="immediate">Hemen gönder</SelectItem>
                                                <SelectItem value="daily">Günlük özet</SelectItem>
                                                <SelectItem value="weekly">Haftalık özet</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )
        }

        if (selectedCategory === "Operasyon Ayarları") {
            return (
                <div className="flex flex-col gap-4">
                    <div className="rounded-md border p-3">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Personel operasyon görme seçenekleri</label>
                                <Select value="all" disabled>
                                    <SelectTrigger className="w-[280px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tüm operasyonları görsünler</SelectItem>
                                        <SelectItem value="assigned">Sadece kendilerine atanan operasyonu görsünler</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Şu an diğer seçenek mevcut değil.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (selectedCategory === "Ekip Ayarları") {
            return (
                <div className="flex flex-col gap-4">
                    <div className="rounded-md border p-3">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Maksimum eklenebilecek ekip üyesi</label>
                                <Select value={maxTeamMembers.toString()} disabled>
                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Ekip üyesi sayısını arttırmak için bizimle iletişime geçin veya planınızı yükseltin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        if (selectedCategory === "Yapay Zeka Ayarları") {
            return (
                <div className="flex flex-col gap-4">
                    <div className="rounded-md border p-3">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Yapay Zeka özellikleri</label>
                                <Select value={aiEnabled ? "enabled" : "disabled"} disabled>
                                    <SelectTrigger className="w-[100px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="disabled">Kapalı</SelectItem>
                                        <SelectItem value="enabled">Açık</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Yapay Zeka özelliklerini aktifleştirmek için bizimle iletişime geçin veya planınızı yükseltin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // Default content for other categories
        return (
            <div className="flex flex-1 flex-col gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-muted/50 aspect-video max-w-3xl rounded-xl"
                    />
                ))}
            </div>
        )
    }

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
                                                    isActive={item.name === selectedCategory}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedCategory(item.name)}
                                                        className="w-full"
                                                    >
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </button>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
                        <header className="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                            <div className="flex items-center gap-2 px-3">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="#">Ayarlar</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage>{selectedCategory}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </header>
                        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 pt-0">
                            {renderContent()}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    )
}

export default SettingsDialog
