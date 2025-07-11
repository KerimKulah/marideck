"use client"

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, ChevronDown, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { Logout } from "./logout"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"

const getCurrentMenuItem = (pathname: string) => {
    const navItems = [
        { title: "Gösterge Paneli", path: "/dashboard" },
        { title: "Müşteriler", path: "/dashboard/customers" },
        { title: "Gemi Listesi", path: "/dashboard/ships" },
        { title: "Operasyonlar", path: "/dashboard/operations" },
        { title: "Belgeler", path: "/dashboard/documents" },
        { title: "Finans", path: "/dashboard/finance" },
    ]

    // Find exact match first
    const exactMatch = navItems.find(item => item.path === pathname)
    if (exactMatch) return exactMatch

    // If no exact match, check for partial matches (for nested routes)
    const partialMatch = navItems.find(item =>
        pathname.startsWith(item.path) && item.path !== '/'
    )

    return partialMatch || { title: "Gösterge Paneli", path: "/dashboard" }
}

export function Header() {
    const pathname = usePathname() || ''
    const currentPage = useMemo(() => getCurrentMenuItem(pathname), [pathname])
    const { user, loading } = useSelector((state: RootState) => state.auth)

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
                {/* Notifications Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full h-9 w-9 hover:bg-gray-100"
                    aria-label="Bildirimler"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-medium">
                        3
                    </span>
                </Button>

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
                                <Button variant="ghost" className="h-9 px-2 gap-2 hover:bg-gray-100">
                                    <Avatar className="h-8 w-8 rounded-lg">
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
                                        <Avatar className="h-10 w-10 rounded-lg">
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
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profil</span>
                                    </DropdownMenuItem>
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