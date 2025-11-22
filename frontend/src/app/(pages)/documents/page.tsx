import { Search, Plus, FileText, Download, Upload, Filter, MoreHorizontal, AlertTriangle, CheckCircle, Clock, File, FileType, FileCheck, FileArchive, FileSignature } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Document type definitions
type DocumentStatus = 'valid' | 'expired' | 'expiring-soon' | 'draft'
type DocumentType = 'contract' | 'certificate' | 'invoice' | 'permit' | 'other'
type RelatedEntity = 'vessel' | 'customer' | 'port' | 'other'

interface Document {
    id: string
    title: string
    type: DocumentType
    documentNumber: string
    relatedTo: RelatedEntity
    relatedEntityName: string
    issueDate: string
    expiryDate?: string
    status: DocumentStatus
    fileType: string
    fileSize: string
    uploadedBy: string
    uploadedAt: string
    notes?: string
    tags?: string[]
}

// Sample data
const documents: Document[] = [
    {
        id: 'DOC-2023-001',
        title: 'Gemi Sigorta Poliçesi',
        type: 'certificate',
        documentNumber: 'SIG-2023-4567',
        relatedTo: 'vessel',
        relatedEntityName: 'MV Blue Star',
        issueDate: '2023-01-15',
        expiryDate: '2024-01-14',
        status: 'valid',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        uploadedBy: 'Ahmet Yılmaz',
        uploadedAt: '2023-01-10T14:30:00',
        tags: ['sigorta', 'yıllık']
    },
    {
        id: 'DOC-2023-002',
        title: 'Kira Sözleşmesi',
        type: 'contract',
        documentNumber: 'SOZ-2023-789',
        relatedTo: 'customer',
        relatedEntityName: 'ABC Denizcilik',
        issueDate: '2023-03-20',
        expiryDate: '2024-03-19',
        status: 'expiring-soon',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        uploadedBy: 'Ayşe Kaya',
        uploadedAt: '2023-03-15T10:15:00',
        tags: ['sözleşme', 'kira']
    },
    {
        id: 'DOC-2023-003',
        title: 'Liman Giriş İzni',
        type: 'permit',
        documentNumber: 'LGN-2023-123',
        relatedTo: 'port',
        relatedEntityName: 'İstanbul Limanı',
        issueDate: '2023-05-10',
        status: 'valid',
        fileType: 'JPG',
        fileSize: '3.2 MB',
        uploadedBy: 'Mehmet Demir',
        uploadedAt: '2023-05-05T16:45:00',
        tags: ['izin', 'liman']
    },
    {
        id: 'DOC-2023-004',
        title: 'Temiz Çevre Sertifikası',
        type: 'certificate',
        documentNumber: 'CER-2023-456',
        relatedTo: 'vessel',
        relatedEntityName: 'MV Green Ocean',
        issueDate: '2022-11-15',
        expiryDate: '2023-11-14',
        status: 'expired',
        fileType: 'PDF',
        fileSize: '1.5 MB',
        uploadedBy: 'Fatma Şahin',
        uploadedAt: '2022-11-10T09:30:00',
        tags: ['çevre', 'sertifika']
    },
    {
        id: 'DOC-2023-005',
        title: 'Taslak Sözleşme',
        type: 'contract',
        documentNumber: 'TAS-2023-001',
        relatedTo: 'customer',
        relatedEntityName: 'XYZ Nakliyat',
        issueDate: '2023-06-01',
        status: 'draft',
        fileType: 'DOCX',
        fileSize: '0.8 MB',
        uploadedBy: 'Ali Veli',
        uploadedAt: '2023-06-01T11:20:00',
        tags: ['taslak', 'sözleşme']
    }
]

// Helper functions
const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
        case 'valid':
            return <Badge variant="outline" className="border-green-500 text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" /> Geçerli
            </Badge>
        case 'expired':
            return <Badge variant="destructive" className="flex items-center">
                <AlertTriangle className="mr-1 h-3 w-3" /> Süresi Dolmuş
            </Badge>
        case 'expiring-soon':
            return <Badge variant="outline" className="border-amber-500 text-amber-600">
                <Clock className="mr-1 h-3 w-3" /> Yakında Sona Erecek
            </Badge>
        case 'draft':
            return <Badge variant="outline" className="bg-muted text-muted-foreground">
                Taslak
            </Badge>
    }
}

const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
        case 'contract':
            return <FileSignature className="h-4 w-4 text-blue-500" />
        case 'certificate':
            return <FileCheck className="h-4 w-4 text-green-500" />
        case 'invoice':
            return <FileType className="h-4 w-4 text-purple-500" />
        case 'permit':
            return <FileText className="h-4 w-4 text-amber-500" />
        default:
            return <File className="h-4 w-4 text-gray-500" />
    }
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

export default function DocumentsPage() {
    return (
        <div className="grid space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Belge Yönetimi</h1>
                    <p className="text-muted-foreground">Tüm belgelerinizi yönetin ve takip edin</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Belge Yükle</span>
                    </Button>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Yeni Belge</span>
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Belge adı, numarası veya etikete göre ara..."
                        className="pl-9 w-full"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all">Tümü</TabsTrigger>
                    <TabsTrigger value="valid">Geçerli</TabsTrigger>
                    <TabsTrigger value="expiring">Yakında Sonecek</TabsTrigger>
                    <TabsTrigger value="expired">Süresi Dolmuş</TabsTrigger>
                    <TabsTrigger value="drafts">Taslaklar</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Belge</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead>İlişkili Varlık</TableHead>
                                    <TableHead>Düzenlenme Tarihi</TableHead>
                                    <TableHead>Bitiş Tarihi</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getDocumentIcon(doc.type)}
                                                <div>
                                                    <div className="font-medium">{doc.title}</div>
                                                    <div className="text-sm text-muted-foreground">{doc.documentNumber}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {doc.type === 'certificate' ? 'Sertifika' :
                                                    doc.type === 'contract' ? 'Sözleşme' :
                                                        doc.type === 'invoice' ? 'Fatura' :
                                                            doc.type === 'permit' ? 'İzin' : 'Diğer'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{doc.relatedEntityName}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {doc.relatedTo === 'vessel' ? 'Gemi' :
                                                        doc.relatedTo === 'customer' ? 'Müşteri' :
                                                            doc.relatedTo === 'port' ? 'Liman' : 'Diğer'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(doc.issueDate)}</TableCell>
                                        <TableCell>
                                            {doc.expiryDate ? formatDate(doc.expiryDate) : '-'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">İşlemler</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        <span>İndir</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        <span>Önizleme</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Düzenle</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600">Sil</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}