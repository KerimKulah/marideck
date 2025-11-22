"use client"

import { Search, Plus, Ship, Users, Clock, AlertCircle, CheckCircle, XCircle, MoreHorizontal, MessageSquare, Package, Info, X, Calendar, Pencil, Filter, User, Mail, Phone, MessageCircle, Anchor, Briefcase, List, Trash2, Grid3x3 } from "lucide-react"
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
    // Ana tab: 'my-operations' | 'all-operations'
    // Alt tab: 'all' | 'active' | 'completed'
    const [mainTab, setMainTab] = useState<'my-operations' | 'all-operations'>('my-operations')
    const [subTab, setSubTab] = useState<'all' | 'active' | 'completed'>('all')
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

    // Convert mainTab + subTab to backend tab format
    const getBackendTab = (main: 'my-operations' | 'all-operations', sub: 'all' | 'active' | 'completed'): 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all' => {
        if (main === 'my-operations') {
            if (sub === 'active') return 'my-operations-active'
            if (sub === 'completed') return 'my-operations-completed'
            if (sub === 'all') return 'my-operations-all'
            return 'my-operations-all' // default
        } else {
            if (sub === 'active') return 'all-active'
            if (sub === 'completed') return 'all-completed'
            if (sub === 'all') return 'all-operations-all'
            return 'all-operations-all' // default
        }
    }

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((value: string, mainTab: 'my-operations' | 'all-operations', subTab: 'all' | 'active' | 'completed') => {
            setSearchTerm(value)
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getOperations({
                page: 1,
                limit: 10,
                search: value || '',
                tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all'
            }))
        }, 500),
        [dispatch]
    )

    // Fetch operations when tab changes
    useEffect(() => {
        const mainTabParam = searchParams.get('mainTab') as 'my-operations' | 'all-operations' || 'my-operations'
        const subTabParam = searchParams.get('subTab') as 'all' | 'active' | 'completed' || 'all'

        setMainTab(mainTabParam)
        setSubTab(subTabParam)

        const currentSearch = searchInputRef.current || ''
        const backendTab = getBackendTab(mainTabParam, subTabParam)

        dispatch(getOperations({
            page: 1,
            limit: 10,
            search: currentSearch,
            tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all'
        }))
    }, [searchParams, user, dispatch])

    // Handle search input with debounce
    useEffect(() => {
        // Skip on initial mount
        if (searchInput === undefined) return

        if (searchInput === '') {
            // Search cleared - immediately update and fetch
            setSearchTerm('')
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getOperations({
                page: 1,
                limit: 10,
                search: '',
                tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all'
            }))
        } else {
            // Search has value - use debounce
            debouncedSearch(searchInput, mainTab, subTab)
        }

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchInput, debouncedSearch, mainTab, subTab, dispatch])

    // Fetch statistics
    useEffect(() => {
        dispatch(getOperationStatistics())
    }, [dispatch])

    // Tab counts from statistics
    const tabCounts = useMemo(() => {
        if (!statistics) return {
            myOperationsActive: 0,
            myOperationsCompleted: 0,
            myOperationsAll: 0,
            allActive: 0,
            allCompleted: 0,
            allOperationsAll: 0
        };

        const stats = statistics as any;

        const myOperationsActive = stats.myOperationsActive || stats.myOperations || 0
        const myOperationsCompleted = stats.myOperationsCompleted || 0
        const allActive = statistics.activeOperations || 0
        const allCompleted = statistics.completedOperations || 0

        return {
            myOperationsActive,
            myOperationsCompleted,
            myOperationsAll: myOperationsActive + myOperationsCompleted,
            allActive,
            allCompleted,
            allOperationsAll: allActive + allCompleted
        };
    }, [statistics]);

    // Operations are already filtered by backend
    const filteredOperations = operations

    // Handle main filter change
    const handleMainFilterChange = (tab: 'my-operations' | 'all-operations') => {
        setMainTab(tab)
        setSubTab('all') // Reset sub filter when main filter changes
        router.push(`/operations?mainTab=${tab}&subTab=all`)
    }

    // Handle sub filter change
    const handleSubFilterChange = (tab: 'all' | 'active' | 'completed') => {
        setSubTab(tab)
        router.push(`/operations?mainTab=${mainTab}&subTab=${tab}`)
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
                const backendTab = getBackendTab(mainTab, subTab)
                dispatch(getOperations({ page, limit, search: searchTerm, tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all' }))
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
                const backendTab = getBackendTab(mainTab, subTab)
                dispatch(getOperations({ page, limit, search: searchTerm, tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all' }))
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
        <div className="grid space-y-4 overflow-x-auto">
            {/* <OperationStatsCards statistics={statistics} /> */}

            {/* Premium Filter & Search Bar - Two Row Layout */}
            {/* Top Row: Search + Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:flex-1 ">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Operasyon ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>

                {/* Right: Add Button + Filter Button */}
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrele
                                {subTab !== 'all' && (
                                    <span className="ml-2 h-4 min-w-[18px] px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center">
                                        1
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                                onClick={() => handleSubFilterChange('all')}
                                className={`${subTab === 'all' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                                        <span>Tümü</span>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSubFilterChange('active')}
                                className={`${subTab === 'active' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Aktif Olanlar</span>
                                    </div>
                                    {(mainTab === 'my-operations' && tabCounts.myOperationsActive > 0) ||
                                        (mainTab === 'all-operations' && tabCounts.allActive > 0) ? (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {mainTab === 'my-operations' ? tabCounts.myOperationsActive : tabCounts.allActive}
                                        </span>
                                    ) : null}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSubFilterChange('completed')}
                                className={`${subTab === 'completed' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        <span>Tamamlananlar</span>
                                    </div>
                                    {(mainTab === 'my-operations' && tabCounts.myOperationsCompleted > 0) ||
                                        (mainTab === 'all-operations' && tabCounts.allCompleted > 0) ? (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {mainTab === 'my-operations' ? tabCounts.myOperationsCompleted : tabCounts.allCompleted}
                                        </span>
                                    ) : null}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsAddModalOpen(true)} className="cursor-pointer w-full sm:w-auto whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Operasyon Ekle</span>
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Scope Tabs - Below Search */}
            <div className="flex items-center">
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1">
                    <Button
                        variant={mainTab === 'my-operations' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleMainFilterChange('my-operations')}
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                        Operasyonlarım
                    </Button>
                    <Button
                        variant={mainTab === 'all-operations' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleMainFilterChange('all-operations')}
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <List className="h-3.5 w-3.5 mr-1.5" />
                        Tüm Operasyonlar
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border overflow-x-auto">
                <Table className="w-full min-w-[700px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Operasyon </TableHead>
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
                    const backendTab = getBackendTab(mainTab, subTab)
                    dispatch(getOperations({ page, limit, search: searchTerm, tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all' }));
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
                    const backendTab = getBackendTab(mainTab, subTab)
                    dispatch(getOperations({
                        page,
                        limit,
                        search: searchTerm,
                        tab: backendTab as 'my-operations-active' | 'my-operations-completed' | 'my-operations-all' | 'all-active' | 'all-completed' | 'all-operations-all'
                    }));
                }}
            />
        </div >
    )
}