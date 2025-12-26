"use client"

import { useEffect } from "react"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getTasks, TaskStatus } from "@/redux/slices/taskSlice"
import { MiniLoading } from "@/components/ui/mini-loading"

const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'in_progress':
            return <Clock className="h-4 w-4 text-yellow-500" />
        case 'pending':
            return <AlertCircle className="h-4 w-4 text-red-500" />
        default:
            return null
    }
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800'
        case 'medium':
            return 'bg-yellow-100 text-yellow-800'
        case 'low':
            return 'bg-green-100 text-green-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

const getPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'high':
            return 'Yüksek'
        case 'medium':
            return 'Orta'
        case 'low':
            return 'Düşük'
        default:
            return priority
    }
}

export const TasksWidget = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { tasks, loading } = useSelector((state: RootState) => state.task)

    useEffect(() => {
        dispatch(getTasks({ page: 1, limit: 5, tab: 'my-tasks-all' }))
    }, [dispatch])

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
                            <ul className="space-y-1">
                                {tasks.map((task) => (
                                    <li key={task.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getStatusIcon(task.status)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{task.title}</p>
                                                {task.dueDate && (
                                                    <p className="text-xs text-gray-500">
                                                        Son Tarih: {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                            {getPriorityLabel(task.priority)}
                                        </span>
                                    </li>
                                ))}
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
