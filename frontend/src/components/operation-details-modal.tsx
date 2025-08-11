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
import { Mail, Phone } from "lucide-react"

interface OperationDetailsModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation: any
    onOperationUpdate: (updatedOperation: any) => void
}

export function OperationDetailsModal({ open, onOpenChange, operation, onOperationUpdate }: OperationDetailsModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Operasyon Detayları</h3>
                            <div className="grid grid-cols-1 gap-4">
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
                                <div>
                                    <p className="text-sm text-muted-foreground">Açıklama</p>
                                    <p className="font-medium">{operation?.details || 'Açıklama bulunmuyor'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">Yük Bilgileri</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Yük Tipi</p>
                                    <p className="font-medium">{operation?.cargoType || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Yük Detayları</p>
                                    <p className="font-medium">{operation?.cargoDetails || 'Detay bulunmuyor'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Ekip Üyeleri</h3>
                            <div className="space-y-2">
                                {operation?.users?.length > 0 ? (
                                    operation.users.map((user: any) => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>
                                                    {user.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.role || 'Ekip Üyesi'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Henüz ekip üyesi bulunmuyor</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium">İletişim Bilgileri</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{operation?.customer?.email || 'E-posta bulunmuyor'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{operation?.customer?.phone || 'Telefon bulunmuyor'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}