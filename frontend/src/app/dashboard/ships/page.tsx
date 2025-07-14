"use client"

import { Search, Plus, MoreHorizontal, Ship, Clock, Anchor, LocationEditIcon, Locate, MapPin, MapPinned, Circle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ships } from "@/demoDB/database"
import VesselLocationModal from "@/components/vessel-location-modal"
import React, { useState } from 'react';
import ShipStatsCards from '@/components/ship-stats-cards';

const statusColors = {
    beklemede: "bg-blue-100 text-blue-800",
    devam: "bg-yellow-100 text-yellow-800",
    tamamlandı: "bg-green-100 text-green-800"
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })
}


export default function ShipsPage() {
    const [vesselLocationModal, setVesselLocationModal] = useState<{
        isOpen: boolean;
        vessel: {
            imo: string;
            name: string;
            type?: string;
            flag?: string;
        } | null;
    }>({
        isOpen: false,
        vessel: null
    });

    const handleOpenVesselLocationModal = (ship: any) => {
        setVesselLocationModal({
            isOpen: true,
            vessel: {
                imo: ship.imo,
                name: ship.name,
                type: ship.type,
                flag: ship.flag
            }
        });
    };

    const handleCloseVesselLocationModal = () => {
        setVesselLocationModal({
            isOpen: false,
            vessel: null
        });
    };

    return (
        <div className="grid space-y-4">
            <ShipStatsCards />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Gemi veya IMO no ile ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                    />
                </div>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="sm:inline">Yeni Gemi Ekle</span>
                </Button>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[800px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>IMO No</TableHead>
                            <TableHead>Gemi Adı</TableHead>
                            <TableHead>Tipi</TableHead>
                            <TableHead className="px-4">Boy</TableHead>
                            <TableHead>Bayrağı</TableHead>
                            <TableHead>ETA</TableHead>
                            <TableHead>ETD</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Armatör</TableHead>
                            <TableHead>Son Güncelleme</TableHead>
                            <TableHead>Konum</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ships.map((ship) => (
                            <TableRow key={ship.id} className="hover:bg-muted/50">
                                <TableCell>{ship.imo}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Ship className="h-4 w-4 text-muted-foreground" />
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span>
                                                    {ship.name.length > 15 ? `${ship.name.slice(0, 15)}...` : ship.name}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{ship.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                                <TableCell>{ship.type}</TableCell>
                                <TableCell className="px-4">{ship.length} m</TableCell>
                                <TableCell>{ship.flag}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {formatDate(ship.eta)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        {formatDate(ship.etd)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`${statusColors[ship.status as keyof typeof statusColors]} capitalize`}>
                                        {ship.status}
                                        <Circle className="text-green-700 w-3 h-3 animate-pulse" fill="green" />

                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span>
                                                {ship.operator.length > 15 ? `${ship.operator.slice(0, 15)}...` : ship.operator}
                                            </span>
                                        </TooltipTrigger>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {formatDate(ship.updatedAt)} <Circle className="text-green-700 w-3 h-3 animate-pulse" fill="green" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        className="flex justify-center cursor-pointer hover:opacity-70 transition-opacity"
                                        onClick={() => handleOpenVesselLocationModal(ship)}
                                    >
                                        <MapPinned className="h-5 w-5" color="red" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Menüyü aç</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Detayları Görüntüle</DropdownMenuItem>
                                            <DropdownMenuItem>Güncelle</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Takip Listesinden Çıkar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Vessel Location Modal */}
            <VesselLocationModal
                isOpen={vesselLocationModal.isOpen}
                onClose={handleCloseVesselLocationModal}
                vessel={vesselLocationModal.vessel}
            />
        </div>
    );
}