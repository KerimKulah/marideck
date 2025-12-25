"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { FileText, Download, X, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { Document } from "@/redux/slices/documentSlice"
import api from "@/api/axios"
import { toast } from "sonner"
import { renderAsync } from "docx-preview"

interface DocumentViewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    document: Document | null
}

export function DocumentViewModal({ open, onOpenChange, document }: DocumentViewModalProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null)
    const [fileBlob, setFileBlob] = useState<Blob | null>(null)
    const [loading, setLoading] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const docxContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open && document) {
            loadDocument()
        } else {
            // Modal kapandığında blob URL'i temizle ve tam ekran durumunu sıfırla
            if (fileUrl) {
                window.URL.revokeObjectURL(fileUrl)
                setFileUrl(null)
            }
            setIsFullscreen(false)
        }

        return () => {
            // Cleanup: component unmount olduğunda blob URL'i temizle
            if (fileUrl) {
                window.URL.revokeObjectURL(fileUrl)
            }
        }
    }, [open, document])

    // File type checks
    const isPdf = document?.mimeType === 'application/pdf' || document?.fileName?.toLowerCase().endsWith('.pdf')
    const isImage = document?.mimeType?.startsWith('image/') ||
        document?.fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    const isDocx = document?.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        document?.mimeType === 'application/msword' ||
        document?.fileName?.toLowerCase().match(/\.(docx|doc)$/i)

    const loadDocument = async () => {
        if (!document) return

        try {
            setLoading(true)
            const response = await api.get(`/document/${document.id}/download`, {
                responseType: 'blob',
            })

            const blob = new Blob([response.data], { type: document.mimeType })

            // Blob URL oluştur
            const url = window.URL.createObjectURL(blob)
            setFileUrl(url)
            setFileBlob(blob)
        } catch (error: any) {
            console.error("Dosya yüklenirken hata:", error)
            toast.error(error?.response?.data?.message || "Dosya yüklenirken bir hata oluştu")
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    // DOCX render için useEffect
    useEffect(() => {
        if (fileBlob && docxContainerRef.current && isDocx) {
            const container = docxContainerRef.current
            container.innerHTML = '' // Önceki içeriği temizle

            renderAsync(fileBlob, container, undefined, {
                className: 'docx-wrapper',
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                ignoreLastRenderedPageBreak: true,
                experimental: false,
                trimXmlDeclaration: true,
                useBase64URL: false,
            }).catch((error: any) => {
                console.error("DOCX render hatası:", error)
                toast.error("Dosya görüntülenirken bir hata oluştu")
            })
        }
    }, [fileBlob, isDocx])

    const handleDownload = () => {
        if (!fileUrl || !document) return

        const link = window.document.createElement('a')
        link.href = fileUrl
        link.setAttribute('download', document.fileName)
        window.document.body.appendChild(link)
        link.click()
        link.remove()
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    if (!document) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={`${isFullscreen
                    ? '!fixed !inset-0 !w-screen !h-screen !max-w-none !rounded-none !m-0 !translate-x-0 !translate-y-0 !top-0 !left-0'
                    : '!max-w-[1000px] !w-[95vw] !h-[90vh]'} p-0 flex flex-col transition-all duration-200`}
                showCloseButton={false}
            >
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {document.title}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownload}
                                disabled={!fileUrl || loading}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                İndir
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Küçült" : "Tam Ekran"}
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-4 w-4" />
                                ) : (
                                    <Maximize2 className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative bg-muted/30">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Dosya yükleniyor...</p>
                            </div>
                        </div>
                    ) : fileUrl ? (
                        <div className="w-full h-full overflow-auto p-2">
                            {isPdf ? (
                                <iframe
                                    src={fileUrl}
                                    className="w-full h-full min-h-[600px] border-0 rounded-lg"
                                    title={document.title}
                                />
                            ) : isImage ? (
                                <div className="flex items-center justify-center h-full">
                                    <img
                                        src={fileUrl}
                                        alt={document.title}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            ) : isDocx ? (
                                <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-auto p-2">
                                    <div
                                        ref={docxContainerRef}
                                        className="docx-container w-full"
                                        style={{
                                            maxWidth: '100%',
                                            width: '100%',
                                            margin: '0 auto',
                                            padding: isFullscreen ? '60px 80px' : '20px 30px',
                                            background: 'white',
                                            minHeight: '100%',
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium mb-2">{document.fileName}</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Bu dosya tipi tarayıcıda görüntülenemiyor.
                                    </p>
                                    <Button onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        İndir ve Aç
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">Dosya yüklenemedi</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

