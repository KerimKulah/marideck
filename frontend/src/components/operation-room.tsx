import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createOperationLog } from "@/redux/slices/operationSlice"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog"

interface OperationRoomProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation: any
}

export function OperationRoom({ open, onOpenChange, operation }: OperationRoomProps) {
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)

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
            await dispatch(
                createOperationLog({
                    operationId: operation.id,
                    description: message,
                    createdById: user?.id,
                })
            ).unwrap()

            setMessage("")
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
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
                        {operation?.operationLogs?.length > 0 ? (
                            operation.operationLogs.map((log: any) => (
                                <div key={log.id} className="flex gap-3 group">
                                    <Avatar className="h-10 w-10">
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
    )
}
