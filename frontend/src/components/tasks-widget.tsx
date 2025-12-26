"use client"

import { useEffect } from "react"
import { CircleCheck, CircleFadingArrowUp, CircleDashed, Calendar as CalendarIcon, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getTasks, updateTask, Task, TaskStatus } from "@/redux/slices/taskSlice"
import { MiniLoading } from "@/components/ui/mini-loading"
import { format } from "date-fns"
import { toast } from "sonner"

// Get status icon (same as tasks page)
const getStatusIcon = (status: TaskStatus, size: 'sm' | 'md' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

    switch (status) {
        case 'completed':
            return <CircleCheck className={`${iconSize} text-green-800`} />
        case 'in_progress':
            return <CircleFadingArrowUp className={`${iconSize} text-blue-600`} />
        case 'pending':
            return <CircleDashed className={`${iconSize} text-gray-600 dark:text-gray-400`} />
        default:
            return <CircleDashed className={`${iconSize} text-muted-foreground`} />
    }
}

// Get icon color (green for completed, red if overdue, normal otherwise)
const getIconColor = (dueDate?: string, status?: TaskStatus) => {
    if (status === 'completed') {
        return 'text-emerald-600 dark:text-emerald-500'
    }

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

// Get date text color
const getDateTextColor = (dueDate?: string, status?: TaskStatus) => {
    if (status === 'completed') {
        return 'text-emerald-600 dark:text-emerald-500'
    }

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

// Get color for the days info in parentheses
const getDaysInfoColor = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate || status === 'completed') return ''

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        return 'text-red-700 dark:text-red-300'
    } else if (diffDays <= 3) {
        return 'text-orange-600 dark:text-orange-400'
    } else if (diffDays <= 7) {
        return 'text-emerald-600 dark:text-emerald-500'
    } else {
        return ''
    }
}

// Get due date with days info
const getDueDateWithDays = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate) return { date: '-', daysInfo: null }

    if (status === 'completed') {
        return { date: 'Tamamlandı', daysInfo: null }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const formattedDate = format(new Date(dueDate), 'dd.MM.yyyy')

    let daysInfo = null
    if (diffDays < 0) {
        const daysPast = Math.abs(diffDays)
        daysInfo = `(${daysPast} ${daysPast === 1 ? 'gün' : 'gün'} geçti)`
    } else if (diffDays === 0) {
        daysInfo = '(Bugün)'
    } else if (diffDays === 1) {
        daysInfo = '(Yarın)'
    } else if (diffDays <= 7) {
        daysInfo = `(${diffDays} gün kaldı)`
    } else {
        daysInfo = null
    }

    return { date: formattedDate, daysInfo }
}

export const TasksWidget = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { tasks, loading } = useSelector((state: RootState) => state.task)

    useEffect(() => {
        dispatch(getTasks({ page: 1, limit: 5, tab: 'my-tasks-all' }))
    }, [dispatch])

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
            dispatch(getTasks({ page: 1, limit: 5, tab: 'my-tasks-all' }))
        } catch (error) {
            console.error("Görev güncellenirken hata oluştu:", error)
            toast.error("Görev güncellenirken bir hata oluştu")
        }
    }

    return (
        <Card className="h-full !py-3 !gap-3">
            <CardHeader className="!px-4 !pb-1 pt-2">
                <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">Görevlerim</CardTitle>
                </div>
                <div className="h-[1px] w-full bg-border" />
            </CardHeader>
            <CardContent className="!p-0">
                <ScrollArea className="h-[190px] px-4">
                    <div className="space-y-2 pb-2">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <MiniLoading />
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                Görev bulunamadı
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.map((task) => {
                                    const dateInfo = getDueDateWithDays(task.dueDate, task.status as TaskStatus)
                                    const daysColor = getDaysInfoColor(task.dueDate, task.status as TaskStatus)
                                    const iconColor = getIconColor(task.dueDate, task.status as TaskStatus)
                                    const textColor = getDateTextColor(task.dueDate, task.status as TaskStatus)

                                    return (
                                        <li key={task.id} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 border border-border/50 hover:border-primary/20 transition-all">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-100 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-sm border border-transparent hover:border-gray-300"
                                                    >
                                                        {getStatusIcon(task.status as TaskStatus, 'sm')}
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
                                            <p className="font-medium text-sm truncate flex-1 min-w-0">
                                                {task.title.length > 30 ? `${task.title.slice(0, 30)}...` : task.title}
                                            </p>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <CalendarIcon className={`h-3 w-3 ${iconColor}`} />
                                                    <span className={`text-xs ${textColor} whitespace-nowrap`}>
                                                        {dateInfo.date}
                                                        {dateInfo.daysInfo && (
                                                            <span className={daysColor}> {dateInfo.daysInfo}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                </ScrollArea>
                <div className="px-4 pt-3 border-gray-200">
                    <Link
                        href="/tasks"
                        className="w-full text-sm text-foreground hover:text-primary font-medium flex items-center justify-center gap-1"
                    >
                        Tüm Görevleri Görüntüle →
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
