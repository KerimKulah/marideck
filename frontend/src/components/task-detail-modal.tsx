"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Task, TaskStatus, TaskPriority } from "@/redux/slices/taskSlice"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { 
    Calendar, 
    Clock, 
    User, 
    Users, 
    Ship, 
    Anchor, 
    Briefcase, 
    FileText,
    CheckSquare,
    Info,
    Hash
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface TaskDetailModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task: Task | null
}

const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Bekliyor</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Devam Ediyor</Badge>
        case 'completed':
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tamamlandı</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
        case 'high':
            return <Badge variant="destructive">Yüksek</Badge>
        case 'medium':
            return <Badge variant="outline" className="border-amber-500 text-amber-600">Orta</Badge>
        case 'low':
            return <Badge variant="outline">Düşük</Badge>
        default:
            return <Badge variant="outline">{priority}</Badge>
    }
}

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr })
}

const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr })
}

export function TaskDetailModal({ open, onOpenChange, task }: TaskDetailModalProps) {
    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3 border-b">
                    <DialogTitle className="text-xl font-semibold">
                        Görev Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Profil Header - Kompakt */}
                <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                        <CheckSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground break-words">
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">#{task.id}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{formatDateTime(task.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                    </div>
                </div>

                {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {/* Temel Bilgiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            Temel Bilgiler
                        </h4>
                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Durum</p>
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(task.status)}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Öncelik</p>
                                <div className="flex items-center gap-2">
                                    {getPriorityBadge(task.priority)}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Bitiş Tarihi</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {task.dueDate ? formatDate(task.dueDate) : '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Oluşturulma Tarihi</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatDateTime(task.createdAt)}
                                    </span>
                                </div>
                            </div>
                            {task.updatedAt && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Son Güncelleme</p>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {formatDateTime(task.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Atanan Kişiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Atanan Kişiler
                        </h4>
                        {task.assignedTo.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Atanan kişi bulunmuyor</p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {task.assignedTo.map((user) => (
                                    <div key={user.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                {getInitials(user.firstName, user.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* İlişkiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            İlişkiler
                        </h4>
                        <div className="space-y-2.5">
                            {task.customer ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Müşteri</p>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {task.customer.name}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Müşteri</p>
                                    <span className="text-sm text-muted-foreground">-</span>
                                </div>
                            )}
                            {task.ship ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Gemi</p>
                                    <div className="flex items-center gap-2">
                                        <Anchor className="h-3.5 w-3.5 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">
                                                {task.ship.name}
                                            </span>
                                            {task.ship.imoNumber && (
                                                <span className="text-xs text-muted-foreground">
                                                    IMO: {task.ship.imoNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Gemi</p>
                                    <span className="text-sm text-muted-foreground">-</span>
                                </div>
                            )}
                            {task.operation ? (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Operasyon</p>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-foreground">
                                            {task.operation.name}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Operasyon</p>
                                    <span className="text-sm text-muted-foreground">-</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Açıklama Kartı */}
                    {task.description && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Açıklama
                            </h4>
                            <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-sm whitespace-pre-line break-words">{task.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Oluşturan Kişi Kartı */}
                    {task.createdBy && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Oluşturan
                            </h4>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                        {getInitials(task.createdBy.firstName, task.createdBy.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {task.createdBy.firstName} {task.createdBy.lastName}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
