import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createOperationLog, deleteOperationLog } from "@/redux/slices/operationSlice"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog"

interface OperationDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation: any
    onOperationUpdate: (updatedOperation: any) => void
}

export function OperationDetailsModal({ open, onOpenChange, operation, onOperationUpdate }: OperationDetailsModalProps) {
    const [newLog, setNewLog] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deleteLogId, setDeleteLogId] = useState<number | null>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)

    const handleAddLog = async () => {
        if (!newLog.trim()) return

        try {
            setIsSubmitting(true)
            const resultAction = await dispatch(
                createOperationLog({
                    operationId: operation.id,
                    description: newLog,
                })
            ).unwrap()

            if (resultAction) {
                const updatedOperation = {
                    ...operation,
                    operationLogs: [
                        ...(operation.operationLogs || []),
                        {
                            ...resultAction,
                            createdBy: user
                        }
                    ]
                }
                onOperationUpdate(updatedOperation)
                setNewLog("")
                toast.success("Log başarıyla eklendi")
            }
        } catch (error) {
            console.error("Log eklenirken hata oluştu:", error)
            toast.error("Log eklenirken bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteLog = async () => {
        if (!deleteLogId) return

        try {
            await dispatch(deleteOperationLog(deleteLogId)).unwrap()

            const updatedOperation = {
                ...operation,
                operationLogs: operation.operationLogs.filter((log: any) => log.id !== deleteLogId)
            }
            onOperationUpdate(updatedOperation)
            setDeleteLogId(null)
            toast.success("Log başarıyla silindi")
        } catch (error) {
            console.error("Log silinirken hata oluştu:", error)
            toast.error("Log silinirken bir hata oluştu")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'planlanıyor':
                return <Badge variant="outline">Planlanıyor</Badge>
            case 'devam':
                return <Badge className="bg-blue-500">Devam Ediyor</Badge>
            case 'tamamlandı':
                return <Badge className="bg-green-500">Tamamlandı</Badge>
            case 'iptal':
                return <Badge variant="destructive">İptal Edildi</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{operation?.name}</DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>#{operation?.id}</span>
                        <span>•</span>
                        {getStatusBadge(operation?.status)}
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Operasyon Detayları</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Müşteri</p>
                                    <p className="font-medium">{operation?.customer?.name || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Gemi</p>
                                    <p className="font-medium">{operation?.ship?.name || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                                    <p className="font-medium">
                                        {operation?.startDate ? format(new Date(operation.startDate), 'PPP', { locale: tr }) : 'Belirtilmemiş'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                                    <p className="font-medium">
                                        {operation?.endDate ? format(new Date(operation.endDate), 'PPP', { locale: tr }) : 'Belirtilmemiş'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Açıklama</p>
                                    <p className="font-medium">{operation?.details || 'Açıklama bulunmuyor'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Yük Bilgileri</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Yük Tipi</p>
                                    <p className="font-medium">{operation?.cargoType || 'Belirtilmemiş'}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-muted-foreground">Yük Detayları</p>
                                    <p className="font-medium">{operation?.cargoDetails || 'Detay bulunmuyor'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-l pl-6">
                        <h3 className="font-medium mb-4">Operasyon Logları</h3>

                        <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2">
                            {operation?.operationLogs?.length > 0 ? (
                                operation.operationLogs.map((log: any) => (
                                    <div key={log.id} className="flex gap-3 group">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {log.createdBy?.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">
                                                    {log.createdBy?.name || 'Bilinmeyen Kullanıcı'}
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), 'PPp', { locale: tr })}
                                                    </span>
                                                </div>
                                                {user?.id === log.createdBy?.id && (
                                                    <button
                                                        onClick={() => setDeleteLogId(log.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                                    >
                                                        Sil
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm mt-1">{log.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Henüz log kaydı bulunmuyor</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Textarea
                                placeholder="Yeni log ekle..."
                                value={newLog}
                                onChange={(e) => setNewLog(e.target.value)}
                                disabled={isSubmitting}
                                className="min-h-[80px]"
                            />
                            <Button
                                onClick={handleAddLog}
                                disabled={!newLog.trim() || isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Ekleniyor...
                                    </>
                                ) : (
                                    'Log Ekle'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>

            <AlertDialog
                open={deleteLogId !== null}
                onOpenChange={(open) => !open && setDeleteLogId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Log kaydını silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu işlem geri alınamaz. Log kaydı kalıcı olarak silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteLog}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Dialog>
    )
}