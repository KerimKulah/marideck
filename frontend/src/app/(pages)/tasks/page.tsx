"use client"

import { Search, Plus, AlertCircle, CheckCircle2, Clock, Calendar as CalendarIcon, MoreHorizontal, Filter, Grid3x3, Pencil, Trash2, CheckCircle, AlertTriangle } from "lucide-react"
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
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
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
    const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all')
    const searchInputRef = useRef(searchInput)

    // Keep ref in sync with state
    useEffect(() => {
        searchInputRef.current = searchInput
    }, [searchInput])

    // Selectors
    const { tasks, loading, totalTasks, page, limit, statistics } = useSelector(
        (state: RootState) => state.task
    )

    // Tab counts from statistics
    const tabCounts = useMemo(() => {
        if (!statistics) return {
            active: 0,
            completed: 0,
            all: 0
        };

        return {
            active: statistics.activeTasks || 0,
            completed: statistics.completedTasks || 0,
            all: (statistics.activeTasks || 0) + (statistics.completedTasks || 0)
        };
    }, [statistics]);

    // Debounced search function
    const debouncedSearch = useMemo(
        () => debounce((value: string, currentTab: 'all' | 'active' | 'completed') => {
            setSearchTerm(value)
            dispatch(getTasks({
                page: 1,
                limit: 10,
                search: value || '',
                tab: currentTab
            }))
        }, 500),
        [dispatch]
    )

    // Fetch tasks when tab changes
    useEffect(() => {
        const tabParam = searchParams.get('tab') as 'all' | 'active' | 'completed' || 'all'
        setTab(tabParam)

        const currentSearch = searchInputRef.current || ''

        dispatch(getTasks({
            page: 1,
            limit: 10,
            search: currentSearch,
            tab: tabParam
        }))
    }, [searchParams, dispatch])

    // Handle search input with debounce
    useEffect(() => {
        if (searchInput === undefined) return

        if (searchInput === '') {
            setSearchTerm('')
            dispatch(getTasks({
                page: 1,
                limit: 10,
                search: '',
                tab: tab
            }))
        } else {
            debouncedSearch(searchInput, tab)
        }

        return () => {
            debouncedSearch.cancel()
        }
    }, [searchInput, debouncedSearch, tab, dispatch])

    // Fetch statistics
    useEffect(() => {
        dispatch(getTaskStatistics())
    }, [dispatch])

    // Handle tab change
    const handleTabChange = (newTab: 'all' | 'active' | 'completed') => {
        setTab(newTab)
        router.push(`/tasks?tab=${newTab}`)
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
            }

            await dispatch(updateTask({
                id: task.id.toString(),
                data: updateData
            })).unwrap()

            toast.success("Görev tamamlandı olarak işaretlendi")
            dispatch(getTasks({ page, limit, search: searchTerm, tab }))
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
            dispatch(getTasks({ page, limit, search: searchTerm, tab }))
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

    return (
        <div className="grid space-y-4">
            {/* Header and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Görev ara..."
                        className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
                        value={searchInput}
                        onChange={handleSearch}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9">
                                <Filter className="h-4 w-4 mr-2" />
                                Filtrele
                                {tab !== 'all' && (
                                    <span className="ml-2 h-4 min-w-[18px] px-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center">
                                        1
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                                onClick={() => handleTabChange('all')}
                                className={`${tab === 'all' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Grid3x3 className="h-4 w-4 text-muted-foreground" />
                                        <span>Tümü</span>
                                    </div>
                                    {tabCounts.all > 0 && (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {tabCounts.all}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleTabChange('active')}
                                className={`${tab === 'active' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Aktif Olanlar</span>
                                    </div>
                                    {tabCounts.active > 0 && (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {tabCounts.active}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleTabChange('completed')}
                                className={`${tab === 'completed' ? 'bg-accent font-medium' : ''} cursor-pointer`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        <span>Tamamlananlar</span>
                                    </div>
                                    {tabCounts.completed > 0 && (
                                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                                            {tabCounts.completed}
                                        </span>
                                    )}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Yeni Görev Ekle</span>
                    </Button>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="rounded-lg border overflow-x-auto">
                <Table className="min-w-[700px] sm:min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Görev</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead>Öncelik</TableHead>
                            <TableHead>Son Tarih</TableHead>
                            <TableHead>Oluşturulma Tarihi</TableHead>
                            <TableHead>İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    <MiniLoading />
                                </TableCell>
                            </TableRow>
                        ) : tasks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'Aramanızla eşleşen görev bulunamadı' : 'Henüz görev bulunmuyor'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id} className="hover:bg-muted/50">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{task.title}</span>
                                            {task.description && (
                                                <span className="text-sm text-muted-foreground line-clamp-1">{task.description}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {statusIcons[task.status as keyof typeof statusIcons]}
                                            <span className="capitalize">
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {priorityBadges[task.priority as keyof typeof priorityBadges]}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDate(task.dueDate)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-muted-foreground">
                                            {formatDate(task.createdAt)}
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
                    dispatch(getTasks({ page, limit, search: searchTerm, tab }))
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
