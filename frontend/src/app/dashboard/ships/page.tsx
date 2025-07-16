"use client"

import { Search, Plus, MoreHorizontal, Ship, Clock, Anchor, LocationEditIcon, Locate, MapPin, MapPinned, Circle, Edit, Trash, AlertTriangle, ChevronDown, ShipIcon, Calendar, MapPinnedIcon, X, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import React, { useState, useEffect, useMemo } from 'react';
import ShipStatsCards from '@/components/ship-stats-cards';
import { ShipAddOrEditModal } from "@/components/ship-addoredit-modal"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "@/redux/store"
import { getShips, setPage, setLimit, setSearchQuery, deleteShip, removeShipOptimistic } from "@/redux/slices/shipSlice"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { MiniLoading } from "@/components/ui/mini-loading"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import debounce from "lodash/debounce"
import { toast } from "sonner"
import ReactCountryFlag from "react-country-flag"
import tr from 'react-phone-input-2/lang/tr.json'
import { Globe } from "lucide-react"
import VesselLocationModal from "@/components/vessel-location-modal"
import { ShipDetailsModal } from "@/components/ship-details-modal"

const CountryCell = ({ countryCode }: { countryCode?: string }) => {
    if (!countryCode) return <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" />-</div>;
    const flag = <ReactCountryFlag countryCode={countryCode.toUpperCase()} svg style={{ width: '16px', height: '16px' }} />;
    const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;

    return (
        <div className="flex items-center gap-2 min-w-[120px]">
            {flag}
            <Tooltip>
                <TooltipTrigger asChild>
                    <span>
                        {countryName.length > 12 ? `${countryName.slice(0, 12)}...` : countryName}
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex items-center gap-2">
                        {flag}
                        <p >{countryName}</p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </div>
    );
};

enum Status {
    Beklemede, // 1, 7
    Limanda, // 5
    Yolda, // 0, 8, 11, 12	
    Demirde, // 1
    Gecikmeli, // 2, 3, 4, 6
    Acil, // 14
    Bilinimiyor // 15, 9, 10, 13
}

const statusColors = {
    [Status.Beklemede]: "bg-gray-100 text-blue-800",
    [Status.Limanda]: "bg-green-100 text-green-800",
    [Status.Yolda]: "bg-green-100 text-green-800",
    [Status.Demirde]: "bg-green-100 text-green-800",
    [Status.Gecikmeli]: "bg-green-100 text-green-800",
    [Status.Acil]: "bg-green-100 text-green-800",
    [Status.Bilinimiyor]: "bg-green-100 text-green-800"
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
    const dispatch = useDispatch<AppDispatch>();
    const { ships, loading, error, page, limit, totalPages, searchQuery, totalShips } = useSelector((state: RootState) => state.ship);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [selectedShip, setSelectedShip] = useState<any | null>(null);
    const [vesselLocationModal, setVesselLocationModal] = useState<{
        isOpen: boolean;
        vessel: { imo: string; name: string; type?: string; flag?: string, mmsi: string; } | null;
    }>({ isOpen: false, vessel: null });
    const [shipAddOrEditModal, setShipAddOrEditModal] = useState<{
        isOpen: boolean;
        ship: any | null;
    }>({ isOpen: false, ship: null });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [shipToDelete, setShipToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [shipDetailsModal, setShipDetailsModal] = useState({
        isOpen: false,
        ship: null,
    });

    const handleCloseShipDetailsModal = () => {
        setShipDetailsModal({ isOpen: false, ship: null });
    };

    const handleOpenShipDetailsModal = (ship: any) => {
        setShipDetailsModal({ isOpen: true, ship });
    };

    useEffect(() => {
        dispatch(getShips({ page, limit, search: searchQuery }));
    }, [dispatch, page, limit, searchQuery]);

    // toast'ı dependency array'den çıkar
    useEffect(() => {
        if (error) {
            toast(error);
        }
    }, [error]); // toast'ı buradan kaldır


    const handleSearchChange = useMemo(
        () => debounce((value: string) => {
            dispatch(setSearchQuery(value));
        }, 300),
        [dispatch]
    );

    const handlePageChange = (newPage: number) => {
        dispatch(setPage(newPage));
    };

    const handleLimitChange = (newLimit: number) => {
        dispatch(setLimit(newLimit));
    };

    const handleDeleteShip = (id: string) => {
        setShipToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        console.log("butona basıldı");
        if (!shipToDelete) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteShip(shipToDelete)).unwrap();
            // Close the dialog immediately
            setIsDeleteDialogOpen(false);
            setShipToDelete(null);
            toast("Gemi başarıyla silindi.");
            // Refresh the data
            await dispatch(getShips({ page, limit, search: searchQuery }));
        } catch (error) {
            console.error('Gemi silinirken hata oluştu:', error);
            toast("Gemi silinirken bir hata oluştu.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenVesselLocationModal = (ship: any) => {
        setVesselLocationModal({
            isOpen: true,
            vessel: { imo: ship.imoNumber, name: ship.name, type: ship.type, flag: ship.flag, mmsi: ship.mmsiNumber }
        });
    };

    const handleCloseVesselLocationModal = () => {
        setVesselLocationModal({ isOpen: false, vessel: null });
    };

    const handleOpenShipAddOrEditModal = (ship: any) => {
        setShipAddOrEditModal({ isOpen: true, ship });
    };

    const handleCloseShipAddOrEditModal = () => {
        setShipAddOrEditModal({ isOpen: false, ship: null });
    };

    const handleShipAddSuccess = () => {
        dispatch(getShips({ page, limit, search: searchQuery }));
    };

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

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
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            handleSearchChange(e.target.value);
                        }}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="sm:inline">Takip Edilecek Gemi Ekle</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleOpenShipAddOrEditModal(null)}>
                            El ile Ekle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            AIS Verisi ile Ekle
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>IMO / MMSI</TableHead>
                            <TableHead>Gemi Adı</TableHead>
                            <TableHead>Tipi</TableHead>
                            <TableHead>Bayrak</TableHead>
                            <TableHead>ETA / ETD</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="w-20">Son Güncelleme</TableHead>
                            <TableHead className="text-center">Konum</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell className="h-24 text-center">
                                    <MiniLoading />
                                </TableCell>
                            </TableRow>
                        ) : ships?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Henüz gemi kaydı bulunmuyor.
                                </TableCell>
                            </TableRow>
                        ) : (
                            ships.map((ship) => (
                                <TableRow key={ship.id}>
                                    {/* IMO / MMSI */}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">IMO: {ship.imoNumber}</span>
                                            <span className="text-sm">MMSI: {ship.mmsiNumber}</span>
                                        </div>
                                    </TableCell>
                                    {/* gemi adı */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <ShipIcon className="h-4 w-4" /> {ship.name}
                                        </div>
                                    </TableCell>
                                    {/* gemi tipi */}
                                    <TableCell>{ship.type}</TableCell>
                                    {/* bayrak */}
                                    <TableCell>
                                        <CountryCell countryCode={ship.flag} />
                                    </TableCell>
                                    {/* eta / etd */}
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <Calendar className="h-4 w-4" /> {ship.eta ? formatDate(ship.eta) : '-'}
                                            </div>
                                            <div className="flex gap-2">
                                                <Calendar className="h-4 w-4" /> {ship.etd ? formatDate(ship.etd) : '-'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* durum */}
                                    <TableCell>
                                        <Badge className={statusColors[ship.status as keyof typeof statusColors] || ''}>
                                            <Circle color="green" fill="green" className="h-4 w-4 animate-pulse" /> {ship.status}
                                        </Badge>
                                    </TableCell>
                                    {/* son güncelleme */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(ship.updatedAt)}
                                        </div>
                                    </TableCell>
                                    {/* konum */}
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center justify-center">
                                                    <MapPinnedIcon color="red" className="h-5 w-5 cursor-pointer" onClick={() => handleOpenVesselLocationModal(ship)} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Konumu Haritada Göster
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleOpenShipDetailsModal(ship)}><Eye className="mr-2 h-4 w-4" />Detayları Göster</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenShipAddOrEditModal(ship)}><Edit className="mr-2 h-4 w-4" />Gemi Bilgilerini Güncelle</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteShip(ship.id)} className="text-red-600 focus:text-red-600"><X color="red" className="mr-2 h-4 w-4" />Gemiyi Takipten Çıkart</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sayfa başına:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-15">
                                {limit}
                                <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {[5, 10, 20, 50].map((limitOption) => (
                                <DropdownMenuItem
                                    key={limitOption}
                                    onClick={() => handleLimitChange(limitOption)}
                                    className={limit === limitOption ? "bg-accent" : ""}>
                                    {limitOption}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground">
                    Toplam {totalShips} kayıt
                </div>
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        {/* Previous */}
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) handlePageChange(page - 1);
                                }}
                                aria-disabled={page === 1}
                                className={page === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>

                        {/* First Page */}
                        <PaginationItem>
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(1);
                                }}
                                aria-current={1 === page ? "page" : undefined}
                                className={1 === page ? "font-bold underline" : ""}
                            >
                                1
                            </PaginationLink>
                        </PaginationItem>

                        {/* Left Ellipsis */}
                        {page > 3 && (
                            <PaginationItem>
                                <span className="px-2">...</span>
                            </PaginationItem>
                        )}

                        {/* Middle Pages */}
                        {Array.from(
                            { length: Math.min(3, totalPages - 2) },
                            (_, i) => {
                                let pageNumber;
                                if (page <= 3) {
                                    pageNumber = i + 2;
                                } else if (page >= totalPages - 2) {
                                    pageNumber = totalPages - 3 + i;
                                } else {
                                    pageNumber = page - 1 + i;
                                }

                                if (pageNumber > 1 && pageNumber < totalPages) {
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handlePageChange(pageNumber);
                                                }}
                                                aria-current={pageNumber === page ? "page" : undefined}
                                                className={pageNumber === page ? "font-bold underline" : ""}
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            }
                        )}

                        {/* Right Ellipsis */}
                        {page < totalPages - 2 && (
                            <PaginationItem>
                                <span className="px-2">...</span>
                            </PaginationItem>
                        )}

                        {/* Last Page */}
                        {totalPages > 1 && (
                            <PaginationItem>
                                <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(totalPages);
                                    }}
                                    aria-current={totalPages === page ? "page" : undefined}
                                    className={totalPages === page ? "font-bold underline" : ""}
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        )}

                        {/* Next */}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages) handlePageChange(page + 1);
                                }}
                                aria-disabled={page === totalPages}
                                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            <DialogTitle>Gemiyi Sil</DialogTitle>
                        </div>
                        <DialogDescription className="pt-2">
                            Bu gemiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setShipToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            İptal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Siliniyor...' : 'Sil'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ShipDetailsModal
                isOpen={shipDetailsModal.isOpen}
                onClose={handleCloseShipDetailsModal}
                ship={shipDetailsModal.ship}
            />

            <VesselLocationModal
                isOpen={vesselLocationModal.isOpen}
                onClose={handleCloseVesselLocationModal}
                vessel={vesselLocationModal.vessel}
            />

            <ShipAddOrEditModal
                isOpen={shipAddOrEditModal.isOpen}
                onClose={() => setShipAddOrEditModal({ isOpen: false, ship: null })}
                ship={shipAddOrEditModal.ship}
                onSuccess={handleShipAddSuccess}
            />
        </div>
    );
}