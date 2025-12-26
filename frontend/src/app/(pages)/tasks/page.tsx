"use client"

import { Search, Plus, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, MoreHorizontal, Filter, Grid3x3, Pencil, Trash2, CheckCircle, AlertTriangle, User, Briefcase, List, Ship, Users, Mail, Phone, Anchor, ClipboardList, CheckSquare, CircleDot, TrendingUp, Minus, TrendingDown, CircleDashed, CircleFadingArrowUp, CircleCheck } from "lucide-react"
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
import { TaskDetailModal } from "@/components/task-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams, useRouter } from "next/navigation"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"

const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'in_progress': <Clock className="h-4 w-4 text-blue-500" />,
    pending: <AlertCircle className="h-4 w-4 text-yellow-500" />
};

const priorityBadges = {
    high: (
        <Badge className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 text-red-700 dark:text-red-300 border-0 shadow-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            <span>Yüksek</span>
        </Badge>
    ),
    medium: (
        <Badge className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 text-amber-700 dark:text-amber-300 border-0 shadow-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Minus className="h-3 w-3" />
            <span>Orta</span>
        </Badge>
    ),
    low: (
        <Badge className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-0 shadow-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <TrendingDown className="h-3 w-3" />
            <span>Düşük</span>
        </Badge>
    )
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
    const isMobile = useIsMobile()

    // State
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
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
                dueDate: task.dueDate,
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

    // Handle status change
    const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
        try {
            const updateData = {
                title: task.title,
                description: task.description,
                status: newStatus,
                priority: task.priority,
                dueDate: task.dueDate,
                assignedToId: task.assignedTo.map(u => u.id),
            }

            await dispatch(updateTask({
                id: task.id.toString(),
                data: updateData
            })).unwrap()

            toast.success("Görev durumu güncellendi")
            const backendTab = getBackendTab(mainTab, subTab)
            dispatch(getTasks({ page, limit, search: searchTerm, tab: backendTab }))
            dispatch(getTaskStatistics())
        } catch (error) {
            console.error("Görev güncellenirken hata oluştu:", error)
            toast.error("Görev güncellenirken bir hata oluştu")
        }
    }

    // Get icon color (green for completed, red if overdue, normal otherwise)
    const getIconColor = (dueDate?: string, status?: TaskStatus) => {
        if (status === 'completed') {
            return 'text-emerald-600 dark:text-emerald-500'
        }

        // Eğer tarih geçtiyse kırmızı
        if (dueDate) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const due = new Date(dueDate)
            due.setHours(0, 0, 0, 0)
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return 'text-red-700 dark:text-red-300'
            }
        }

        return 'text-foreground'
    }

    // Get date text color (green for completed, red if overdue, normal otherwise)
    const getDateTextColor = (dueDate?: string, status?: TaskStatus) => {
        if (status === 'completed') {
            return 'text-emerald-600 dark:text-emerald-500'
        }

        // Eğer tarih geçtiyse kırmızı
        if (dueDate) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const due = new Date(dueDate)
            due.setHours(0, 0, 0, 0)
            const diffTime = due.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return 'text-red-700 dark:text-red-300'
            }
        }

        return 'text-foreground'
    }

    // Get color for the days info in parentheses (only this part gets colored)
    const getDaysInfoColor = (dueDate?: string, status?: TaskStatus) => {
        if (!dueDate || status === 'completed') return ''

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            // Geçmiş - Kırmızı
            return 'text-red-700 dark:text-red-300'
        } else if (diffDays <= 3) {
            // 3 gün veya daha az kaldı - Turuncu
            return 'text-orange-600 dark:text-orange-400'
        } else if (diffDays <= 7) {
            // 4-7 gün kaldı - Yeşil
            return 'text-emerald-600 dark:text-emerald-500'
        } else {
            // 7+ gün kaldı - Normal renk (renk yok)
            return ''
        }
    }

    // Get due date with days info (returns object with date and daysInfo for separate styling)
    const getDueDateWithDays = (dueDate?: string, status?: TaskStatus) => {
        if (!dueDate) return { date: '-', daysInfo: null }

        // Eğer görev tamamlandıysa, "Tamamlandı" göster
        if (status === 'completed') {
            return { date: 'Tamamlandı', daysInfo: null }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(dueDate)
        due.setHours(0, 0, 0, 0)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        const formattedDate = formatDate(dueDate)

        let daysInfo = null
        if (diffDays < 0) {
            // Geçmiş - göster
            const daysPast = Math.abs(diffDays)
            daysInfo = `(${daysPast} ${daysPast === 1 ? 'gün' : 'gün'} geçti)`
        } else if (diffDays === 0) {
            // Bugün - göster
            daysInfo = '(Bugün)'
        } else if (diffDays === 1) {
            // Yarın - göster
            daysInfo = '(Yarın)'
        } else if (diffDays <= 7) {
            // 2-7 gün kaldı - göster
            daysInfo = `(${diffDays} gün kaldı)`
        } else {
            // 7+ gün kaldı - gösterme (normal tarih)
            daysInfo = null
        }

        return { date: formattedDate, daysInfo }
    }

    // Get status icon with diamond shape (for main display)
    const getStatusIcon = (status: TaskStatus, size: 'sm' | 'md' = 'md') => {
        const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

        switch (status) {
            case 'completed':
                // Yeşil CircleCheck
                return (
                    <CircleCheck className={`${iconSize} text-green-800`} />
                )
            case 'in_progress':
                // Mavi CircleFadingArrowUp (fill)
                return (
                    <CircleFadingArrowUp className={`${iconSize} text-blue-600`} />
                )
            case 'pending':
                // Gri CircleDashed (koyu ama rahat gözüken)
                return (
                    <CircleDashed className={`${iconSize} text-gray-600 dark:text-gray-400`} />
                )
            default:
                return (
                    <CircleDashed className={`${iconSize} text-muted-foreground`} />
                )
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
        <div className="grid space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Görev ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>

                <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="sm:inline">Yeni Görev</span>
                </Button>
            </div>

            {/* Main Tab Buttons & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
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

                {/* Filter Button */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 w-full sm:w-auto">
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
                                    <CheckCircle className="h-4 w-4 text-muted-foreground " />
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
            </div>

            {/* Tasks Table */}
            <div className="rounded-lg border overflow-x-auto">
                {isMobile ? (
                    // Mobil görünüm - Kompakt liste görünümü
                    <div className="divide-y">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={`skeleton-${index}`} className="p-3 flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : tasks.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                {searchTerm ? 'Aramanızla eşleşen görev bulunamadı' : 'Henüz görev bulunmuyor'}
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="p-3 flex items-center gap-3 hover:bg-muted/50"
                                >
                                    <div
                                        className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedTask(task)
                                            setIsDetailModalOpen(true)
                                        }}
                                    >
                                        <CheckSquare className="h-6 w-6 text-primary" />
                                    </div>
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedTask(task)
                                            setIsDetailModalOpen(true)
                                        }}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-100  rounded-md transition-all duration-200 hover:scale-105 hover:shadow-sm border border-transparent hover:border-gray-300"
                                                    >
                                                        {getStatusIcon(task.status as TaskStatus)}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-48">
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(task, 'pending')}
                                                        className={`cursor-pointer ${task.status === 'pending' ? 'bg-accent font-medium' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {getStatusIcon('pending', 'sm')}
                                                            <span>Bekliyor</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(task, 'in_progress')}
                                                        className={`cursor-pointer ${task.status === 'in_progress' ? 'bg-accent font-medium' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {getStatusIcon('in_progress', 'sm')}
                                                            <span>Devam Ediyor</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(task, 'completed')}
                                                        className={`cursor-pointer ${task.status === 'completed' ? 'bg-accent font-medium' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {getStatusIcon('completed', 'sm')}
                                                            <span>Tamamlandı</span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <p className="font-medium text-sm truncate flex-1">{task.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {priorityBadges[task.priority as keyof typeof priorityBadges]}
                                            {task.dueDate && (() => {
                                                const dateInfo = getDueDateWithDays(task.dueDate, task.status as TaskStatus)
                                                const daysColor = getDaysInfoColor(task.dueDate, task.status as TaskStatus)
                                                const iconColor = getIconColor(task.dueDate, task.status as TaskStatus)
                                                const textColor = getDateTextColor(task.dueDate, task.status as TaskStatus)

                                                return (
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className={`h-3 w-3 ${iconColor}`} />
                                                        <span className={`text-xs ${textColor}`}>
                                                            {dateInfo.date}
                                                            {dateInfo.daysInfo && (
                                                                <span className={daysColor}> {dateInfo.daysInfo}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedTask(task)
                                                setIsDetailModalOpen(true)
                                            }}>
                                                <ClipboardList className="mr-2 h-4 w-4" />
                                                Detayları Görüntüle
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedTask(task)
                                                setIsAddModalOpen(true)
                                            }}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Düzenle
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteClick(task)
                                                }}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Sil
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    // Desktop görünüm - Tablo görünümü
                    <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-48">Görev</TableHead>
                                <TableHead className="w-36 hidden md:table-cell">Son Tarih</TableHead>
                                <TableHead className="w-28 hidden xl:table-cell">Öncelik</TableHead>
                                <TableHead className="w-40">Atanan Kişiler</TableHead>
                                <TableHead className="w-48 hidden lg:table-cell">İlişkili</TableHead>
                                <TableHead className="w-16">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                // Skeleton loading rows - prevents layout shift
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                                        {/* Görev */}
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </TableCell>
                                        {/* Son Tarih */}
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-4 rounded" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </TableCell>
                                        {/* Öncelik */}
                                        <TableCell className="hidden xl:table-cell">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </TableCell>
                                        {/* Atanan Kişiler */}
                                        <TableCell>
                                            <div className="flex items-center -space-x-2">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </div>
                                        </TableCell>
                                        {/* İlişkili */}
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </TableCell>
                                        {/* İşlemler */}
                                        <TableCell>
                                            <Skeleton className="h-8 w-8 rounded" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? 'Aramanızla eşleşen görev bulunamadı' : 'Henüz görev bulunmuyor'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((task) => (
                                    <TableRow key={task.id} className="hover:bg-muted/50">
                                        <TableCell className="min-w-[150px]">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-1.5 w-full">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                                                            >
                                                                {getStatusIcon(task.status as TaskStatus)}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-48">
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusChange(task, 'pending')}
                                                                className={`cursor-pointer ${task.status === 'pending' ? 'bg-accent font-medium' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2 w-full">
                                                                    {getStatusIcon('pending', 'sm')}
                                                                    <span>Bekliyor</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusChange(task, 'in_progress')}
                                                                className={`cursor-pointer ${task.status === 'in_progress' ? 'bg-accent font-medium' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2 w-full">
                                                                    {getStatusIcon('in_progress', 'sm')}
                                                                    <span>Devam Ediyor</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleStatusChange(task, 'completed')}
                                                                className={`cursor-pointer ${task.status === 'completed' ? 'bg-accent font-medium' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2 w-full">
                                                                    {getStatusIcon('completed', 'sm')}
                                                                    <span>Tamamlandı</span>
                                                                </div>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                    <span className="font-medium truncate flex-1">{task.title}</span>
                                                </div>
                                                {task.description && (
                                                    <span className="text-xs text-muted-foreground truncate w-full">
                                                        {task.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="min-w-[120px] hidden md:table-cell">
                                            {(() => {
                                                const dateInfo = getDueDateWithDays(task.dueDate, task.status as TaskStatus)
                                                const daysColor = getDaysInfoColor(task.dueDate, task.status as TaskStatus)
                                                const iconColor = getIconColor(task.dueDate, task.status as TaskStatus)
                                                const textColor = getDateTextColor(task.dueDate, task.status as TaskStatus)

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className={`h-4 w-4 shrink-0 ${iconColor}`} />
                                                        <span className={`text-sm truncate ${textColor}`}>
                                                            {dateInfo.date}
                                                            {dateInfo.daysInfo && (
                                                                <span className={daysColor}> {dateInfo.daysInfo}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                )
                                            })()}
                                        </TableCell>
                                        <TableCell className="min-w-[100px] hidden xl:table-cell">
                                            {priorityBadges[task.priority as keyof typeof priorityBadges]}
                                        </TableCell>
                                        <TableCell className="min-w-[120px]">
                                            <TooltipProvider delayDuration={0}>
                                                <div className="flex items-center -space-x-2">
                                                    {task.assignedTo.length === 0 ? (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    ) : (
                                                        <>
                                                            {task.assignedTo.slice(0, 5).map((user) => (
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
                                                            {task.assignedTo.length > 5 && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Avatar className="h-8 w-8 border-2 border-background cursor-default hover:translate-y-[-2px] transition-transform">
                                                                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                                                                +{task.assignedTo.length - 5}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="space-y-1">
                                                                            {task.assignedTo.slice(5).map((user) => (
                                                                                <p key={user.id} className="text-xs">
                                                                                    {user.firstName} {user.lastName}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="min-w-[150px] hidden lg:table-cell">
                                            <div className="flex flex-col gap-1">
                                                {task.customer && (
                                                    <div className="flex items-center gap-1.5 text-sm" title="Müşteri">
                                                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{task.customer.name}</span>
                                                    </div>
                                                )}
                                                {task.ship && (
                                                    <div className="flex items-center gap-1.5 text-sm" title="Gemi">
                                                        <Anchor className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{task.ship.name}</span>
                                                    </div>
                                                )}
                                                {task.operation && (
                                                    <div className="flex items-center gap-1.5 text-sm" title="Operasyon">
                                                        <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="truncate">{task.operation.name}</span>
                                                    </div>
                                                )}
                                                {!task.customer && !task.ship && !task.operation && (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
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
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedTask(task)
                                                        setIsDetailModalOpen(true)
                                                    }}>
                                                        <ClipboardList className="mr-2 h-4 w-4" />
                                                        Detayları Görüntüle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedTask(task)
                                                        setIsAddModalOpen(true)
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Düzenle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteClick(task)
                                                        }}
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
                )}
            </div>

            {/* Detail Modal */}
            <TaskDetailModal
                open={isDetailModalOpen}
                onOpenChange={(open) => {
                    setIsDetailModalOpen(open)
                    if (!open) {
                        setSelectedTask(null)
                    }
                }}
                task={selectedTask}
            />

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
