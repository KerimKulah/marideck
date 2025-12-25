"use client"

import { Search, Plus, MoreHorizontal, Filter, Pencil, Trash2, Download, User, Ship, Anchor, Briefcase, Calendar as CalendarIcon, X, Eye, FileCode, File, Image as ImageIcon } from "lucide-react"
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
import { useState, useEffect, useMemo } from "react"
import { debounce } from "lodash"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getDocuments, deleteDocument, Document, DocumentType, DocumentStatus } from "@/redux/slices/documentSlice"
import { toast } from "sonner"
import { DocumentAddOrEditModal } from "@/components/document-addoredit-modal"
import { DocumentViewModal } from "@/components/document-view-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/api/axios"

const getTypeLabel = (type: DocumentType) => {
  switch (type) {
    case 'contract':
      return 'Sözleşme'
    case 'certificate':
      return 'Sertifika'
    case 'permit':
      return 'İzin'
    case 'ncts':
      return 'NCTS'
    case 'summary_declaration':
      return 'Özet Beyan'
    case 'customs_correspondence':
      return 'Gümrük Yazışması'
    case 'e_document':
      return 'E-Belge'
    case 'other':
      return 'Diğer'
    default:
      return type
  }
}

const getStatusLabel = (status: DocumentStatus) => {
  switch (status) {
    case 'valid':
      return 'Geçerli'
    case 'expired':
      return 'Süresi Dolmuş'
    case 'expiring-soon':
      return 'Yakında Dolacak'
    case 'draft':
      return 'Taslak'
    default:
      return status
  }
}

const getStatusVariant = (status: DocumentStatus) => {
  switch (status) {
    case 'valid':
      return 'default'
    case 'expired':
      return 'destructive'
    case 'expiring-soon':
      return 'outline'
    case 'draft':
      return 'secondary'
    default:
      return 'outline'
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return format(new Date(dateString), 'dd.MM.yyyy')
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

const getFileIcon = (mimeType: string, fileName: string) => {
  // PDF
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return <img src="/mine-types/pdf.svg" alt="PDF" className="h-6 w-6" />
  }

  // Images
  if (mimeType.startsWith('image/') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
    return <ImageIcon className="h-6 w-6 text-blue-600" />
  }

  // Word Documents
  if (mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().match(/\.(doc|docx)$/i)) {
    return <img src="/mine-types/word.svg" alt="Word" className="h-6 w-6" />
  }

  // Excel
  if (mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileName.toLowerCase().match(/\.(xls|xlsx)$/i)) {
    return <img src="/mine-types/excel.svg" alt="Excel" className="h-6 w-6" />
  }

  // Text files
  if (mimeType.startsWith('text/') || fileName.toLowerCase().endsWith('.txt')) {
    return <FileCode className="h-6 w-6 text-gray-600" />
  }

  // Default
  return <File className="h-6 w-6 text-muted-foreground" />
}

const getFileIconColor = (mimeType: string, fileName: string) => {
  // PDF
  if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
    return 'bg-red-50 border-red-200'
  }

  // Images
  if (mimeType.startsWith('image/') || fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i)) {
    return 'bg-blue-50 border-blue-200'
  }

  // Word Documents
  if (mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().match(/\.(doc|docx)$/i)) {
    return 'bg-blue-50 border-blue-200'
  }

  // Excel
  if (mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileName.toLowerCase().match(/\.(xls|xlsx)$/i)) {
    return 'bg-green-50 border-green-200'
  }

  // Text files
  if (mimeType.startsWith('text/') || fileName.toLowerCase().endsWith('.txt')) {
    return 'bg-gray-50 border-gray-200'
  }

  // Default
  return 'bg-muted border-muted-foreground/20'
}

export default function DocumentsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const isMobile = useIsMobile()

  // Redux state
  const { documents, loading, error, page, limit, totalDocuments, totalPages, searchQuery } = useSelector(
    (state: RootState) => state.document
  )

  // Local state
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchQuery)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        dispatch({ type: 'document/setSearchQuery', payload: value })
        dispatch({ type: 'document/setPage', payload: 1 })
      }, 300),
    [dispatch]
  )

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    debouncedSearch(value)
  }

  // Fetch documents
  useEffect(() => {
    dispatch(
      getDocuments({
        page,
        limit,
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
    )
  }, [dispatch, page, limit, searchQuery, typeFilter, statusFilter])

  const handleDelete = async () => {
    if (!selectedDocument) return

    try {
      await dispatch(deleteDocument(selectedDocument.id.toString())).unwrap()
      toast.success("Belge başarıyla silindi")
      setIsDeleteDialogOpen(false)
      setSelectedDocument(null)
    } catch (error: any) {
      toast.error(error?.message || "Belge silinirken bir hata oluştu")
    }
  }

  const handleView = (doc: Document) => {
    setSelectedDocument(doc)
    setIsViewModalOpen(true)
  }

  const handleDownload = async (doc: Document) => {
    try {
      // Axios ile blob download - JWT otomatik eklenir
      const response = await api.get(`/document/${doc.id}/download`, {
        responseType: 'blob', // Blob olarak al
      });

      // Client-side kontrolü
      if (typeof window === 'undefined') return;

      // Blob'u dosya olarak indir
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Dosya indirilirken hata:", error);
      toast.error(error?.response?.data?.message || "Dosya indirilirken bir hata oluştu");
    }
  }

  const filteredDocuments = documents

  return (
    <div className="grid space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Belge ara..."
            className="w-full pl-9 pr-4 py-2 text-sm sm:text-base"
            value={searchInput}
            onChange={handleSearch}
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="sm:inline">Yeni Belge</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Tipler</SelectItem>
              <SelectItem value="contract">Sözleşme</SelectItem>
              <SelectItem value="certificate">Sertifika</SelectItem>
              <SelectItem value="permit">İzin</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="valid">Geçerli</SelectItem>
              <SelectItem value="expired">Süresi Dolmuş</SelectItem>
              <SelectItem value="expiring-soon">Yakında Dolacak</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents List/Table */}
      {isMobile ? (
        // Mobile view - Compact list
        <div className="divide-y">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="p-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredDocuments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchInput || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Aramanızla eşleşen belge bulunamadı'
                : 'Henüz belge bulunmuyor'}
            </div>
          ) : (
            filteredDocuments.map((document: Document) => (
              <div
                key={document.id}
                className="p-4 border-b last:border-b-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-12 w-12 rounded-lg border flex items-center justify-center flex-shrink-0 ${getFileIconColor(document.mimeType, document.fileName)}`}>
                    {getFileIcon(document.mimeType, document.fileName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{document.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusVariant(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getTypeLabel(document.type)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarIcon className="h-3 w-3" />
                    {formatDate(document.createdAt)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        İşlemler
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleView(document)
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Görüntüle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(document)
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        İndir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDocument(document)
                        setIsAddModalOpen(true)
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDocument(document)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Desktop view - Table
        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-64">Belge</TableHead>
              <TableHead className="w-32 hidden md:table-cell">Tip</TableHead>
              <TableHead className="w-32 hidden lg:table-cell">Durum</TableHead>
              <TableHead className="w-48 hidden xl:table-cell">İlişkilendirme</TableHead>
              <TableHead className="w-32 hidden md:table-cell">Dosya</TableHead>
              <TableHead className="w-32 hidden md:table-cell">Yüklenme</TableHead>
              <TableHead className="w-16">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchInput || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Aramanızla eşleşen belge bulunamadı'
                    : 'Henüz belge bulunmuyor'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((document: Document) => (
                <TableRow key={document.id} className="hover:bg-muted/50">
                  <TableCell className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${getFileIconColor(document.mimeType, document.fileName)}`}>
                        {getFileIcon(document.mimeType, document.fileName)}
                      </div>
                      <div className="flex flex-col items-start min-w-0 flex-1">
                        <div className="font-medium truncate w-full">{document.title}</div>
                        {document.documentNumber && (
                          <div className="text-xs text-muted-foreground truncate w-full">
                            No: {document.documentNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px] hidden md:table-cell">
                    <span className="text-sm">{getTypeLabel(document.type)}</span>
                  </TableCell>
                  <TableCell className="min-w-[100px] hidden lg:table-cell">
                    <Badge variant={getStatusVariant(document.status)}>
                      {getStatusLabel(document.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[150px] hidden xl:table-cell">
                    <div className="flex flex-col gap-1">
                      {document.customer && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{document.customer.name}</span>
                        </div>
                      )}
                      {document.ship && (
                        <div className="flex items-center gap-1">
                          <Anchor className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{document.ship.name}</span>
                        </div>
                      )}
                      {document.operation && (
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">{document.operation.name}</span>
                        </div>
                      )}
                      {!document.customer && !document.ship && !document.operation && (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px] hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="text-sm truncate">{document.fileName}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(document.fileSize)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[100px] hidden md:table-cell">
                    <span className="text-sm">{formatDate(document.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">İşlemler</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleView(document)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(document)
                        }}>
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          setSelectedDocument(document)
                          setIsAddModalOpen(true)
                        }}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDocument(document)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-destructive" />
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Toplam {totalDocuments} belge
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'document/setPage', payload: page - 1 })}
              disabled={page === 1 || loading}
            >
              Önceki
            </Button>
            <span className="text-sm font-medium">
              Sayfa {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: 'document/setPage', payload: page + 1 })}
              disabled={page === totalPages || loading}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DocumentViewModal
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open)
          if (!open) setSelectedDocument(null)
        }}
        document={selectedDocument}
      />

      <DocumentAddOrEditModal
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open)
          if (!open) setSelectedDocument(null)
        }}
        document={selectedDocument}
        onSuccess={() => {
          dispatch(
            getDocuments({
              page,
              limit,
              search: searchQuery || undefined,
              type: typeFilter !== 'all' ? typeFilter : undefined,
              status: statusFilter !== 'all' ? statusFilter : undefined,
            })
          )
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Belgeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu belgeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
