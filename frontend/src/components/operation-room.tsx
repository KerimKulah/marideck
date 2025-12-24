import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createOperationLog, getOperation, deleteOperationLog } from "@/redux/slices/operationSlice"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"
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

interface OperationRoomProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation: any
    onOperationUpdate?: (updatedOperation: any) => void
}

export function OperationRoom({ open, onOpenChange, operation, onOperationUpdate }: OperationRoomProps) {
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [logToDelete, setLogToDelete] = useState<string | null>(null)

    console.log(user)

    // Sort logs by timestamp (newest first)
    const sortedLogs = [...(operation?.operationLogs || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Function to refresh operation data
    const refreshOperationData = async () => {
        if (!operation?.id) return;
        try {
            await dispatch(getOperation(operation.id)).unwrap();
        } catch (error) {
            console.error('Operasyon verileri güncellenirken hata oluştu:', error);
        }
    }

    // Set up auto-refresh when dialog is open
    useEffect(() => {
        if (!open) return;

        // Initial refresh
        refreshOperationData();

        // Set up interval for auto-refresh (5 minutes)
        refreshInterval.current = setInterval(refreshOperationData, 5 * 60 * 1000);

        // Set up visibility change listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refreshOperationData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            if (refreshInterval.current) {
                clearInterval(refreshInterval.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [open, operation?.id]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [operation?.operationLogs])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = async () => {
        if (!message.trim()) return

        try {
            setIsSubmitting(true)
            const resultAction = await dispatch(
                createOperationLog({
                    operationId: operation.id,
                    description: message,
                    createdById: user?.id,
                })
            )

            if (createOperationLog.fulfilled.match(resultAction)) {
                // Refresh the operation data to get the latest logs
                const updatedOperation = await dispatch(getOperation(operation.id.toString())).unwrap();

                // Update the parent component with the latest operation data
                if (onOperationUpdate) {
                    onOperationUpdate(updatedOperation);
                }

                setMessage("")
            }
        } catch (error) {
            console.error("Mesaj gönderilirken hata oluştu:", error)
            toast.error("Mesaj gönderilirken bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Delete operation log
    const handleDeleteLog = async () => {
        if (!logToDelete) return;

        try {
            await dispatch(deleteOperationLog(parseInt(logToDelete, 10))).unwrap();
            toast.success("Mesaj başarıyla silindi");

            // Manually update the operation logs in the current operation
            if (operation) {
                const updatedLogs = operation.operationLogs.filter(
                    (log: any) => log.id.toString() !== logToDelete
                );

                // Update the operation in the parent component
                if (onOperationUpdate) {
                    onOperationUpdate({
                        ...operation,
                        operationLogs: updatedLogs
                    });
                }
            }
        } catch (error) {
            console.error('Mesaj silinirken hata oluştu:', error);
            toast.error("Mesaj silinirken bir hata oluştu");
        } finally {
            setDeleteDialogOpen(false);
            setLogToDelete(null);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="min-w-[80vw] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            {operation?.name} Kayıtları
                            <Badge variant="outline" className="ml-2">
                                #{operation?.id}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-lg mb-4">
                            {sortedLogs.length > 0 ? (
                                sortedLogs.map((log: any) => (
                                    <div key={log.id} className="flex gap-3 group hover:bg-muted/50 p-2 rounded-lg relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage crossOrigin="anonymous" src={`http://localhost:4000/${log.createdBy?.photo}`} alt="" />
                                            <AvatarFallback>
                                                {log.createdBy?.firstName?.[0]}{log.createdBy?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium">
                                                    {log.createdBy?.firstName + ' ' + log.createdBy?.lastName || 'Bilinmeyen Kullanıcı'}
                                                    <span className="ml-2 text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), 'PPp', { locale: tr })}
                                                    </span>
                                                </div>

                                                {(log.createdBy?.id === user?.id || user?.roles?.[0].name === 'admin') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setLogToDelete(log.id.toString());
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm mt-1 whitespace-pre-wrap">{log.description}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Henüz işlem geçmişi bulunmuyor
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="flex gap-2">
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Yaptığınız işlemi bildirin..."
                                className="resize-none"
                                rows={3}
                                disabled={isSubmitting}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={isSubmitting || !message.trim()}
                                className="self-end h-[72px]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Gönder'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu mesajı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
        </>
    )
}
