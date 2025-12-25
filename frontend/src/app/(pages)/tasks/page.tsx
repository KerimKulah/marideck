"use client"

import { Search, Plus, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, MoreHorizontal, Filter, Grid3x3, Pencil, Trash2, CheckCircle, AlertTriangle, User, Briefcase, List, Ship, Users, Mail, Phone, Anchor, ClipboardList } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, useEffect, useMemo, useRef } from "react"
import { debounce } from "lodash"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getTasks, deleteTask, updateTask, getTaskStatistics, Task, TaskStatus, TaskPriority } from "@/redux/slices/taskSlice"
import { toast } from "sonner"
import { TaskAddOrEditModal } from "@/components/task-addoredit-modal"
import { MiniLoading } from "@/components/ui/mini-loading"
import { useSearchParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'in_progress': <Clock className="h-4 w-4 text-blue-500" />,
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />
};

const priorityBadges = {
    high: <Badge variant="destructive">Yüksek</Badge>,
    medium: <Badge variant="outline" className="border-amber-500 text-amber-600">Orta</Badge>,
    low: <Badge variant="outline">Düşük</Badge>
};

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    // Use date-fns for consistent formatting if desired, or keep locale string
    return format(new Date(dateString), 'dd.MM.yyyy');
};

const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
        case 'in_progress':
            return 'Devam Ediyor';
        case 'completed':
            return 'Tamamlandı';
        case 'pending':
            return 'Bekliyor';
        default:
            return status;
    }
};

const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
        case 'pending':
            return 'outline';
        case 'in_progress':
            return 'default'; // Blue-ish in many themes or default primary
        case 'completed':
            return 'secondary'; // Green-ish in Operations page context usually
        default:
            return 'outline';
    }
};

const getStatusBadge = (status: TaskStatus) => {
    const label = getStatusLabel(status);
    switch (status) {
        case 'pending':
            return <Badge variant="outline">{label}</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-500 hover:bg-blue-600">{label}</Badge>
        case 'completed':
            return <Badge className="bg-green-500 hover:bg-green-600">{label}</Badge>
        default:
            return <Badge variant="outline">{label}</Badge>
    }
}

export default function TasksPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    // State
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    // Main tab: 'my-tasks' | 'all-tasks'
    // Sub tab: 'all' | 'pending' | 'in_progress' | 'completed'
    const [mainTab, setMainTab] = useState<'my-tasks' | 'all-tasks'>('my-tasks')
    const [subTab, setSubTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
    const searchInputRef = useRef(searchInput)

    // Keep ref in sync with state
    useEffect(() => {
        searchInputRef.current = searchInput
    }, [searchInput])

    // Selectors
    const { tasks, loading, totalTasks, page, limit, statistics } = useSelector(
        (state: RootState) => state.task
    )

    // Convert mainTab + subTab to backend tab format
    const getBackendTab = (main: 'my-tasks' | 'all-tasks', sub: 'all' | 'pending' | 'in_progress' | 'completed'): 'my-tasks-all' | 'my-tasks-pending' | 'my-tasks-in_progress' | 'my-tasks-completed' | 'all-tasks-all' | 'all-pending' | 'all-in_progress' | 'all-completed' => {
        if (main === 'my-tasks') {
            if (sub === 'pending') return 'my-tasks-pending'
            if (sub === 'in_progress') return 'my-tasks-in_progress'
            if (sub === 'completed') return 'my-tasks-completed'
            return 'my-tasks-all'
        } else {
            if (sub === 'pending') return 'all-pending'
            if (sub === 'in_progress') return 'all-in_progress'
            if (sub === 'completed') return 'all-completed'
            return 'all-tasks-all'
        }
    }

    // Tab counts from statistics
    const tabCounts = useMemo(() => {
        if (!statistics) return {
            myTasksPending: 0,
            myTasksInProgress: 0,
            myTasksCompleted: 0,
            myTasksAll: 0,
            allPending: 0,
            allInProgress: 0,
            allCompleted: 0,
            allTasksAll: 0
        };

        return {
            myTasksPending: statistics.myTasksPending || 0,
            myTasksInProgress: statistics.myTasksInProgress || 0,
            myTasksCompleted: statistics.myTasksCompleted || 0,
            myTasksAll: statistics.myTasksAll || 0,
            allPending: statistics.allPending || 0,
            allInProgress: statistics.allInProgress || 0,
            allCompleted: statistics.allCompleted || 0,
            allTasksAll: statistics.allTasksAll || 0
        };
    }, [statistics]);

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((value: string, mainTab: 'my-tasks' | 'all-tasks', subTab: 'all' | 'pending' | 'in_progress' | 'completed') => {
            setSearchTerm(value)
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getTasks({
                page: 1,
                limit: 10,
                search: value || '',
                tab: backendTab
            }))
        }, 500),
        [dispatch]
    )

    // Fetch tasks when tab changes
    useEffect(() => {
        const mainTabParam = searchParams.get('mainTab') as 'my-tasks' | 'all-tasks' || 'my-tasks'
        const subTabParam = searchParams.get('subTab') as 'all' | 'pending' | 'in_progress' | 'completed' || 'all'

        setMainTab(mainTabParam)
        setSubTab(subTabParam)

        const currentSearch = searchInputRef.current || ''
        const backendTab = getBackendTab(mainTabParam, subTabParam)

        dispatch(getTasks({
            page: 1,
            limit: 10,
            search: currentSearch,
            tab: backendTab
        }))
    }, [searchParams, dispatch])

    // Handle search input with debounce
    useEffect(() => {
        if (searchInput === undefined) return

        if (searchInput === '') {
            setSearchTerm('')
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getTasks({
                page: 1,
                limit: 10,
                search: '',
                tab: backendTab
            }))
        } else {
            debouncedSearch(searchInput, mainTab, subTab)
        }

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchInput, debouncedSearch, mainTab, subTab, dispatch])

    // Fetch statistics
    useEffect(() => {
        dispatch(getTaskStatistics())
    }, [dispatch])

    // Handle main filter change
    const handleMainFilterChange = (tab: 'my-tasks' | 'all-tasks') => {
        setMainTab(tab)
        setSubTab('all')
        router.push(`/tasks?mainTab=${tab}&subTab=all`)
    }

    // Handle sub filter change
    const handleSubFilterChange = (tab: 'all' | 'pending' | 'in_progress' | 'completed') => {
        setSubTab(tab)
        router.push(`/tasks?mainTab=${mainTab}&subTab=${tab}`)
    }

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    // Handle mark as completed
    const handleMarkAsCompleted = async (task: Task) => {
        try {
            const updateData = {
                title: task.title,
                description: task.description,
                status: 'completed' as TaskStatus,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                assignedToId: task.assignedTo.map(u => u.id),
            }

            await dispatch(updateTask({
                id: task.id.toString(),
                data: updateData
            })).unwrap()

            toast.success("Görev tamamlandı olarak işaretlendi")
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getTasks({ page, limit, search: searchTerm, tab: backendTab }))
            dispatch(getTaskStatistics())
        } catch (error) {
            console.error("Görev güncellenirken hata oluştu:", error)
            toast.error("Görev güncellenirken bir hata oluştu")
        }
    }

    // Handle delete - open dialog
    const handleDeleteClick = (task: Task) => {
        setTaskToDelete(task)
        setIsDeleteDialogOpen(true)
    }

    // Confirm delete
    const handleConfirmDelete = async () => {
        if (!taskToDelete) return

        setIsDeleting(true)
        try {
            await dispatch(deleteTask(taskToDelete.id.toString())).unwrap()
            toast.success("Görev başarıyla silindi")
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getTasks({ page, limit, search: searchTerm, tab: backendTab }))
            dispatch(getTaskStatistics())
        } catch (error) {
            console.error("Görev silinirken hata oluştu:", error)
            toast.error("Görev silinirken bir hata oluştu")
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
            setTaskToDelete(null)
        }
    }

    // Get initials for avatar
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    return (
        <div className="grid space-y-4 overflow-x-auto">
            {/* Premium Filter & Search Bar - Two Row Layout (Matching Operations Page) */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Görev ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>

                {/* Main Tab Buttons */}
                <div className="flex items-center gap-1.5 rounded-lg border bg-muted/30 p-1">
                    <Button
                        variant={mainTab === 'my-tasks' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleMainFilterChange('my-tasks')}
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
                        Görevlerim
                    </Button>
                    <Button
                        variant={mainTab === 'all-tasks' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleMainFilterChange('all-tasks')}
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <List className="h-3.5 w-3.5 mr-1.5" />
                        Tüm Görevler
                    </Button>
                </div>

                {/* Right: Filter Button + Add Button */}
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
                                onClick={() => handleSubFilterChange('pending')}
                                className={`${subTab === 'pending' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        <span>Beklemede Olanlar</span>
                                    </div>
                                    {(mainTab === 'my-tasks' && tabCounts.myTasksPending > 0) ||
                                        (mainTab === 'all-tasks' && tabCounts.allPending > 0) ? (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {mainTab === 'my-tasks' ? tabCounts.myTasksPending : tabCounts.allPending}
                                        </span>
                                    ) : null}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSubFilterChange('in_progress')}
                                className={`${subTab === 'in_progress' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Devam Ediyor</span>
                                    </div>
                                    {(mainTab === 'my-tasks' && tabCounts.myTasksInProgress > 0) ||
                                        (mainTab === 'all-tasks' && tabCounts.allInProgress > 0) ? (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {mainTab === 'my-tasks' ? tabCounts.myTasksInProgress : tabCounts.allInProgress}
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
                                    {(mainTab === 'my-tasks' && tabCounts.myTasksCompleted > 0) ||
                                        (mainTab === 'all-tasks' && tabCounts.allCompleted > 0) ? (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {mainTab === 'my-tasks' ? tabCounts.myTasksCompleted : tabCounts.allCompleted}
                                        </span>
                                    ) : null}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Yeni Görev</span>
                    </Button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[700px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Görev</TableHead>
                            <TableHead>Atanan Kişiler</TableHead>
                            <TableHead>İlişkili</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Öncelik</TableHead>
                            <TableHead>Son Tarih</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    <MiniLoading />
                                </TableCell>
                            </TableRow>
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'Aramanızla eşleşen görev bulunamadı' : 'Henüz görev bulunmuyor'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="font-medium">{task.title}</span>
                                            {task.description && (
                                                <span className="text-xs text-muted-foreground max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {task.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <TooltipProvider delayDuration={0}>
                                            <div className="flex items-center -space-x-2">
                                                {task.assignedTo.map((user) => (
                                                    <Tooltip key={user.id}>
                                                        <TooltipTrigger asChild>
                                                            <Avatar className="h-8 w-8 border-2 border-background cursor-default hover:translate-y-[-2px] transition-transform">
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                                    {getInitials(user.firstName, user.lastName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">{user.firstName} {user.lastName}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ))}
                                                {task.assignedTo.length === 0 && (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {task.customer && (
                                                <div className="flex items-center gap-1.5 text-sm" title="Müşteri">
                                                    <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="truncate max-w-[140px]">{task.customer.name}</span>
                                                </div>
                                            )}
                                            {task.ship && (
                                                <div className="flex items-center gap-1.5 text-sm" title="Gemi">
                                                    <Anchor className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="truncate max-w-[140px]">{task.ship.name}</span>
                                                </div>
                                            )}
                                            {task.operation && (
                                                <div className="flex items-center gap-1.5 text-sm" title="Operasyon">
                                                    <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="truncate max-w-[140px]">{task.operation.name}</span>
                                                </div>
                                            )}
                                            {!task.customer && !task.ship && !task.operation && (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(task.status as TaskStatus)}
                                    </TableCell>
                                    <TableCell>
                                        {priorityBadges[task.priority as keyof typeof priorityBadges]}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{formatDate(task.dueDate)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">İşlemler</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedTask(task)
                                                    setIsAddModalOpen(true)
                                                }}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Düzenle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleMarkAsCompleted(task)}
                                                    disabled={task.status === 'completed'}
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Tamamlandı Olarak İşaretle
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteClick(task)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
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

            {/* Add/Edit Modal */}
            <TaskAddOrEditModal
                open={isAddModalOpen}
                onOpenChange={(open) => {
                    setIsAddModalOpen(open)
                    if (!open) {
                        setSelectedTask(null)
                    }
                }}
                task={selectedTask}
                onSuccess={() => {
                    const backendTab = getBackendTab(mainTab, subTab)
                    dispatch(getTasks({ page, limit, search: searchTerm, tab: backendTab }))
                    dispatch(getTaskStatistics())
                    setSelectedTask(null)
                    setIsAddModalOpen(false)
                }}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-lg font-semibold">
                                    Görevi Sil
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                                    Bu işlem geri alınamaz.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">"{taskToDelete?.title}"</span> görevini silmek istediğinize emin misiniz?
                        </p>
                    </div>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="mt-0"
                        >
                            İptal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Siliniyor...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Evet, Sil
                                </span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
