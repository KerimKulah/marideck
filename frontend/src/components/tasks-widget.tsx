"use client"

import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

type TaskStatus = 'completed' | 'in-progress' | 'pending'

interface Task {
    id: string
    title: string
    status: TaskStatus
    dueDate?: string
    priority: 'low' | 'medium' | 'high'
}

export const TasksWidget = () => {
    // Sample tasks data - replace with your actual data source
    const tasks: Task[] = [
        {
            id: '1',
            title: 'Liman giriş izinlerini kontrol et',
            status: 'in-progress',
            dueDate: '2023-12-15',
            priority: 'high'
        },
        {
            id: '2',
            title: 'Günlük raporu gönder',
            status: 'pending',
            dueDate: '2023-12-14',
            priority: 'medium'
        },
        {
            id: '3',
            title: 'Toplantı notlarını paylaş',
            status: 'completed',
            dueDate: '2023-12-13',
            priority: 'low'
        },
    ]

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'in-progress':
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

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Görevler</CardTitle>
                </div>
                <div className="h-[1px] w-full bg-border mt-3   " />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {tasks.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            Görev bulunamadı
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {tasks.map((task) => (
                                <li key={task.id} className="flex items-start justify-between p-1 rounded-lg hover:bg-gray-50">
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
                                        {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link
                        href="/tasks"
                        className="w-full mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
                    >
                        Tüm Görevleri Görüntüle →
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
