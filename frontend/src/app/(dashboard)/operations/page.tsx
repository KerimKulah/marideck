"use client"

import { Search, Plus, Ship, Users, Clock, AlertCircle, CheckCircle, XCircle, MoreHorizontal, MessageSquare, Package, Info, X, Calendar, Pencil, Filter, User, Mail, Phone, MessageCircle, Anchor, Briefcase, List, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useMemo, useRef } from "react"
import { debounce } from "lodash"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getOperations, getOperation, createOperation, updateOperation, deleteOperation, getOperationStatistics } from "@/redux/slices/operationSlice"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { OperationAddOrEditModal } from "@/components/operation-addoredit-modal"
import { OperationDetailsModal } from "@/components/operation-details-modal"
import { MiniLoading } from "@/components/ui/mini-loading"
import OperationStatsCards from "@/components/operation-stats-card"
import { OperationRoom } from "@/components/operation-room"
import { OperationStatus, getOperationStatusTranslation } from "@/lib/operation-status"

export interface Operation {
    id: number
    name: string
    type: string
    status: OperationStatus
    startDate: string
    endDate: string
    details: string
    port: string
    cargoType?: string
    cargoDetails?: string
    customer: {
        id: number
        name: string
        email: string
        phone?: string
    }
    ship: {
        id: number
        name: string
        imoNumber: string
    }
    users: Array<{ id: number; name: string; role?: string }>
    operationLogs: Array<{
        id: number
        description: string
        createdAt: string
        createdBy: {
            id: number
            name: string
        }
    }>
    createdAt: string
    updatedAt: string
}

export default function OperationsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    // State
    const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTab, setSelectedTab] = useState<'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed'>('my-operations-active')
    const [isOperationRoomOpen, setIsOperationRoomOpen] = useState(false)
    const searchInputRef = useRef(searchInput)

    // Keep ref in sync with state
    useEffect(() => {
        searchInputRef.current = searchInput
    }, [searchInput])

    // Selectors
    const { operations, loading, totalOperations, page, limit, totalPages, statistics } = useSelector(
        (state: RootState) => state.operation
    )
    const { user } = useSelector((state: RootState) => state.auth)

    // Mock data - Replace with actual API calls
    const [users] = useState([
        { id: 1, name: 'Ahmet Yılmaz', role: 'Operasyon Sorumlusu' },
        { id: 2, name: 'Mehmet Demir', role: 'Liman Görevlisi' },
        { id: 3, name: 'Ayşe Kaya', role: 'Güvenlik Sorumlusu' },
    ])

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((value: string, tab: 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed') => {
            setSearchTerm(value)
            dispatch(getOperations({
                page: 1,
                limit: 10,
                search: value || '', // Always send search, even if empty
                tab: tab
            }))
        }, 500),
        [dispatch]
    )

    // Fetch operations when tab changes
    useEffect(() => {
        const tab = searchParams.get('tab') as 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed' || 'my-operations-active'
        setSelectedTab(tab)

        const currentSearch = searchInputRef.current || ''

        // Use current searchInput value from ref (always up-to-date)
        dispatch(getOperations({
            page: 1,
            limit: 10,
            search: currentSearch, // Always send search, even if empty
            tab: tab
        }))
    }, [searchParams, user, dispatch])

    // Handle search input with debounce
    useEffect(() => {
        // Skip on initial mount
        if (searchInput === undefined) return

        const tab = selectedTab || 'my-operations-active'

        if (searchInput === '') {
            // Search cleared - immediately update and fetch
            setSearchTerm('')
            dispatch(getOperations({
                page: 1,
                limit: 10,
                search: '', // Always send search, even if empty
                tab: tab
            }))
        } else {
            // Search has value - use debounce
            debouncedSearch(searchInput, tab)
        }

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchInput, debouncedSearch, selectedTab, dispatch])

    // Fetch statistics
    useEffect(() => {
        dispatch(getOperationStatistics())
    }, [dispatch])

    // Tab counts from statistics
    const tabCounts = useMemo(() => {
        if (!statistics) return {
            myOperationsActive: 0,
            myOperationsCompleted: 0,
            allActive: 0,
            allCompleted: 0
        };

        const stats = statistics as any; // Type assertion for new statistics structure

        return {
            myOperationsActive: stats.myOperationsActive || stats.myOperations || 0, // Aktif olanlar
            myOperationsCompleted: stats.myOperationsCompleted || 0, // Tamamlanan olanlar (kullanıcıya atanmış)
            allActive: statistics.activeOperations, // Tüm aktif operasyonlar
            allCompleted: statistics.completedOperations // Tüm tamamlanan operasyonlar
        };
    }, [statistics]);

    // Operations are already filtered by backend
    const filteredOperations = operations

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setSelectedTab(tab as 'my-operations-active' | 'my-operations-completed' | 'all-active' | 'all-completed')
        router.push(`/operations?tab=${tab}`)
    }

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    // Handle view details
    const handleViewDetails = async (operation: Operation) => {
        try {
            const resultAction = await dispatch(getOperation(operation.id.toString()))
            if (getOperation.fulfilled.match(resultAction)) {
                setSelectedOperation(resultAction.payload)
                setIsDetailsModalOpen(true)
            }
        } catch (error) {
            console.error("Operasyon detayları yüklenirken hata oluştu:", error)
            toast.error("Operasyon detayları yüklenirken bir hata oluştu")
        }
    }

    // Handle mark as completed
    const handleMarkAsCompleted = async (operation: Operation) => {
        try {
            // Mevcut operasyonun tüm verilerini al ve sadece status ve finishedAt'i güncelle
            const updateData = {
                name: operation.name,
                type: operation.type,
                details: operation.details,
                port: operation.port,
                customerId: operation.customer.id,
                shipId: operation.ship.id,
                userId: operation.users?.map(u => u.id) || [],
                startDate: new Date(operation.startDate).toISOString(),
                endDate: new Date(operation.endDate).toISOString(),
                status: OperationStatus.COMPLETED,
                finishedAt: new Date().toISOString(),
                cargoType: operation.cargoType,
                cargoDetails: operation.cargoDetails
            }

            const resultAction = await dispatch(updateOperation({
                id: operation.id.toString(),
                data: updateData
            }))
            if (updateOperation.fulfilled.match(resultAction)) {
                toast.success("Operasyon tamamlandı olarak işaretlendi")
                dispatch(getOperations({ page, limit, search: searchTerm }))
            } else {
                toast.error("Operasyon güncellenirken bir hata oluştu")
            }
        } catch (error) {
            console.error("Operasyon güncellenirken hata oluştu:", error)
            toast.error("Operasyon güncellenirken bir hata oluştu")
        }
    }

    // Handle delete
    const handleDelete = async (operation: Operation) => {
        if (!confirm(`"${operation.name}" operasyonunu silmek istediğinize emin misiniz?`)) {
            return
        }

        try {
            const resultAction = await dispatch(deleteOperation(operation.id.toString()))
            if (deleteOperation.fulfilled.match(resultAction)) {
                toast.success("Operasyon başarıyla silindi")
                dispatch(getOperations({ page, limit, search: searchTerm }))
            } else {
                toast.error("Operasyon silinirken bir hata oluştu")
            }
        } catch (error) {
            console.error("Operasyon silinirken hata oluştu:", error)
            toast.error("Operasyon silinirken bir hata oluştu")
        }
    }

    // Get status badge
    const getStatusBadge = (status: OperationStatus) => {
        const translation = getOperationStatusTranslation(status);
        switch (status) {
            case OperationStatus.PLANNED:
                return <Badge variant="outline">{translation}</Badge>
            case OperationStatus.IN_PROGRESS:
                return <Badge className="bg-blue-500">{translation}</Badge>
            case OperationStatus.COMPLETED:
                return <Badge className="bg-green-500">{translation}</Badge>
            case OperationStatus.CANCELLED:
                return <Badge variant="destructive">{translation}</Badge>
            default:
                return <Badge variant="outline">{translation}</Badge>
        }
    }

    const getStatusVariant = (status: OperationStatus) => {
        switch (status) {
            case OperationStatus.PLANNED:
                return 'outline';
            case OperationStatus.IN_PROGRESS:
                return 'default';
            case OperationStatus.COMPLETED:
                return 'secondary';
            case OperationStatus.CANCELLED:
                return 'destructive';
            default:
                return 'outline';
        }
    }

    return (
        <div className="grid space-y-3 overflow-x-auto">
            <OperationStatsCards statistics={statistics} />
            {/* Arama ve Yeni Operasyon Ekle Butonu */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                {/* Arama Inputu */}
                <div className="relative w-full ">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Operasyon ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>

                {/* Yeni Operasyon Ekle Butonu */}
                <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Operasyon Ekle</span>
                </Button>
            </div>

            {/* Main Content */}
            <Tabs value={selectedTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1.5 h-auto gap-1.5 rounded-xl border">
                    <TabsTrigger
                        value="my-operations-active"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
                    >
                        <Briefcase className="h-4 w-4" />
                        <span className="hidden sm:inline">Mevcut Operasyonlarım</span>
                        <span className="sm:hidden">Mevcut</span>
                        {tabCounts.myOperationsActive > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold">
                                {tabCounts.myOperationsActive}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="my-operations-completed"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
                    >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Tamamlanan Operasyonlarım</span>
                        <span className="sm:hidden">Tamamlananım</span>
                        {tabCounts.myOperationsCompleted > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold">
                                {tabCounts.myOperationsCompleted}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="all-active"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
                    >
                        <List className="h-4 w-4" />
                        <span className="hidden sm:inline">Tüm Aktif Operasyonlar</span>
                        <span className="sm:hidden">Aktif</span>
                        {tabCounts.allActive > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold">
                                {tabCounts.allActive}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="all-completed"
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-lg"
                    >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">Tüm Tamamlanan Operasyonlar</span>
                        <span className="sm:hidden">Tamamlanan</span>
                        {tabCounts.allCompleted > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold">
                                {tabCounts.allCompleted}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="rounded-lg border overflow-x-auto">
                <Table className="w-full min-w-[700px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Operasyon</TableHead>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>Gemi</TableHead>
                            <TableHead>Liman</TableHead>
                            <TableHead>Başlangıç</TableHead>
                            <TableHead>Bitiş</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    <MiniLoading />
                                </TableCell>
                            </TableRow>
                        ) : filteredOperations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'Aramanızla eşleşen operasyon bulunamadı' : 'Henüz operasyon bulunmuyor'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOperations.map((operation: Operation) => (
                                <TableRow key={operation.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex flex-col items-start">

                                            <div >{operation.name}</div>
                                            <div className="text-xs text-muted-foreground">{operation.details}</div>
                                        </div>
                                    </TableCell>


                                    <TableCell>
                                        <div className="flex flex-col justify-center items-start">
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 justify-center flex items-center"><User className="h-3 w-3" /></div>
                                                <span className="text-sm">{operation.customer?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 justify-center flex items-center"><Mail className="h-2.5 w-2.5" /></div>
                                                <span className="text-sm">{operation.customer?.email || '-'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="h-4 w-4 justify-center flex items-center"><Phone className="h-2.5 w-2.5" /></div>
                                                <span className="text-sm">{operation.customer?.phone || '-'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start">
                                            <div className="">{operation.ship?.name || '-'}</div>
                                            <div className="text-xs text-muted-foreground">IMO:{operation.ship?.imoNumber || '-'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{operation.port || '-'}</TableCell>
                                    <TableCell>{format(new Date(operation.startDate), 'dd.MM.yyyy')}</TableCell>
                                    <TableCell>{format(new Date(operation.endDate), 'dd.MM.yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(operation.status)}>
                                            {getOperationStatusTranslation(operation.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">İşlemler</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOperation(operation);
                                                    setIsAddModalOpen(true);
                                                }}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOperation(operation);
                                                    setIsDetailsModalOpen(true);
                                                }}>
                                                    <Info className="mr-2 h-4 w-4" />
                                                    Detayları Görüntüle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOperation(operation);
                                                    setIsOperationRoomOpen(true);

                                                }}>
                                                    <Anchor className="mr-2 h-4 w-4" />
                                                    Operasyon Odası
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsCompleted(operation);
                                                    }}
                                                    disabled={operation.status === OperationStatus.COMPLETED}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Tamamlandı Olarak İşaretle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(operation);
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                    Sil
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modals */}
            <OperationAddOrEditModal
                open={isAddModalOpen}
                onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (!open) {
                        setSelectedOperation(null);
                    }
                }}
                operation={selectedOperation}
                onSuccess={() => {
                    dispatch(getOperations({ page, limit, search: searchTerm, tab: selectedTab }));
                    setSelectedOperation(null);
                    setIsAddModalOpen(false);
                }}
            />

            {
                selectedOperation && (
                    <OperationDetailsModal
                        open={isDetailsModalOpen}
                        onOpenChange={setIsDetailsModalOpen}
                        operation={selectedOperation}
                        onOperationUpdate={(updatedOperation) => {
                            // Update the operation in the list
                            const updatedOperations = operations.map(op =>
                                op.id === updatedOperation.id ? updatedOperation : op
                            );
                            dispatch({
                                type: 'operation/getOperations/fulfilled',
                                payload: {
                                    operations: updatedOperations,
                                    totalOperations,
                                    page,
                                    limit
                                }
                            });
                        }}
                    />
                )
            }


            <OperationRoom
                open={isOperationRoomOpen}
                onOpenChange={setIsOperationRoomOpen}
                operation={selectedOperation}
                onOperationUpdate={(updatedOperation) => {
                    // Update the selected operation in the state
                    setSelectedOperation(updatedOperation);

                    // Also update the operations list
                    dispatch(getOperations({
                        page,
                        limit,
                        search: searchTerm,
                        tab: selectedTab
                    }));
                }}
            />
        </div >
    )
}