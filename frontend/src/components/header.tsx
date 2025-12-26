"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, ChevronDown, User, LogOut, Settings, CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { Logout } from "./logout"
import { useSelector } from "react-redux"
import Link from "next/link"
import { RootState } from "../redux/store"

const getCurrentMenuItem = (pathname: string) => {
    const navItems = [
        { title: "Gösterge Paneli", path: "/" },
        { title: "Müşteriler", path: "/customers" },
        { title: "Gemi Listesi", path: "/ships" },
        { title: "Operasyonlar", path: "/operations" },
        { title: "Belgeler", path: "/documents" },
        { title: "Finans", path: "/finance" },
        { title: "Görevler", path: "/tasks" },
        { title: "Ekip", path: "/personnels" },
        { title: "Takvim", path: "/calendar" },
        { title: "Limanlar", path: "/ports" },
        { title: "İnsan Kaynakları", path: "/human-resources" },
    ]

    // Find exact match first
    const exactMatch = navItems.find(item => item.path === pathname)
    if (exactMatch) return exactMatch

    // If no exact match, check for partial matches (for nested routes)
    const partialMatch = navItems.find(item =>
        pathname.startsWith(item.path) && item.path !== '/'
    )

    return partialMatch || { title: "Gösterge Paneli", path: "/" }
}

export function Header() {
    const pathname = usePathname() || ''
    const currentPage = useMemo(() => getCurrentMenuItem(pathname), [pathname])
    const { user, loading } = useSelector((state: RootState) => state.auth)
    const [now, setNow] = useState<Date | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        setNow(new Date())
        const id = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(id)
    }, [])

    const formattedNow = useMemo(() => {
        if (!now) return ''
        return now.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'Europe/Istanbul'
        })
    }, [now])

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={currentPage.path}>
                                {currentPage.title}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            {/* Notifications and User Profile */}
            <div className="flex items-center gap-2">
                {/* Current Date & Time */}
                {isMounted && (
                    <div className="hidden md:flex items-center text-sm text-muted-foreground mr-2">
                        {formattedNow}
                    </div>
                )}
                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative rounded-full h-9 w-9 hover:bg-gray-100 cursor-pointer"
                            aria-label="Bildirimler"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium">
                                3
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 rounded-lg" align="end" sideOffset={8}>
                        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
                            <span className="font-semibold">Bildirimler</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Tüm bildirimleri okundu olarak işaretle
                                }}
                            >
                                Tümünü okundu işaretle
                            </Button>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-1 p-1">
                                {/* Bildirim örnekleri */}
                                <div className="flex items-start gap-2 p-3 rounded-md hover:bg-accent cursor-pointer group">
                                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">Yeni Görev Atandı</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            Size yeni bir görev atandı: "Gemi belgelerini kontrol et"
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">2 dakika önce</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Bildirimi kapat
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-start gap-2 p-3 rounded-md hover:bg-accent cursor-pointer group">
                                    <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">Gemi Yaklaşıyor</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            "MS Istanbul" gemisi 2 saat içinde limana varacak
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">15 dakika önce</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="flex items-start gap-2 p-3 rounded-md hover:bg-accent cursor-pointer group">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">Operasyon Tamamlandı</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            "Yükleme Operasyonu #1234" başarıyla tamamlandı
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">1 saat önce</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                        <DropdownMenuSeparator />
                        <div className="px-3 py-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-center text-sm text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                    // Tüm bildirimleri görüntüle sayfasına git
                                }}
                            >
                                Tüm Bildirimleri Görüntüle
                            </Button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Dropdown */}
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="hidden md:flex flex-col gap-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>
                ) :
                    user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-gray-100 cursor-pointer">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage crossOrigin="anonymous" src={`http://localhost:4000/${user.photo}`} alt="Profile-Photo" />
                                        <AvatarFallback className="rounded-lg">
                                            {user.firstName.split(' ').map((n: string) => n[0]).join('')}
                                            {user.lastName.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:flex flex-col items-start min-w-[120px]">
                                        <span className="text-xs text-black truncate">{user.firstName + " " + user.lastName}</span>
                                        <span className="text-xs text-gray-500 truncate">{user.roles[0].name === "admin" ? "Yönetici" : "Personel"}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-lg" align="end" sideOffset={8}>
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 p-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage crossOrigin="anonymous" src={`http://localhost:4000/${user.photo}`} alt="Profile-Photo" />
                                            <AvatarFallback className="rounded-lg">
                                                {user.firstName.split(' ').map((n: string) => n[0]).join('')}
                                                {user.lastName.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-medium">{user.firstName + " " + user.lastName}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <Link href="/profile">
                                        <DropdownMenuItem>
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profil</span>
                                        </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuItem>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Ayarlar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                {/* Logout */}
                                <Logout />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : null}
            </div>
        </header>
    )
}