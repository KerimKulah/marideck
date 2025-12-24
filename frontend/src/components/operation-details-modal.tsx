import { useState } from "react"
import { LucideIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
    Loader2, 
    ChevronDown, 
    ChevronRight, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Clock, 
    AlertTriangle, 
    Info, 
    User, 
    Ship, 
    Building2, 
    Ruler, 
    Anchor, 
    FileText,
    Edit,
    FileSpreadsheet,
    XCircle,
    Package
} from "lucide-react"

// Types
interface InfoRowProps {
    icon: LucideIcon;
    label: string;
    value?: React.ReactNode;
    className?: string;
}

interface SectionCardProps {
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    badge?: string | number;
}

interface OperationDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    operation?: any;
    onOperationUpdate?: (updatedOperation: any) => void;
}

type SectionKeys = 'customer' | 'ship' | 'team' | 'cargo';

// Mock data for demonstration
const mockOperation = {
    id: "OP-2024-001",
    name: "Mediterranean Cargo Transport",
    status: "devam",
    createdAt: "2024-01-15T08:30:00Z",
    startDate: "2024-01-20T00:00:00Z",
    endDate: "2024-01-25T00:00:00Z",
    details: "Bu operasyon, Akdeniz rotasında konteyner taşımacılığı için planlanmıştır. Müşteri özel kargo gereksinimleri belirtmiştir ve operasyon süreci boyunca özel dikkat gerektirecek hassas malzemeler bulunmaktadır.",
    cargoType: "Konteyner",
    cargoDetails: "40'lık konteynerler içerisinde elektronik malzemeler ve hassas ekipmanlar. Özel soğutma sistemi gerektirir.",
    customer: {
        name: "Ahmet Yılmaz",
        company: "Mediterranean Shipping Co.",
        email: "ahmet.yilmaz@medship.com",
        phone: "+905551234567",
        country: "tr",
        taxNumber: "1234567890",
        address: "Atatürk Mah. Liman Cad. No:45 Mersin/Türkiye"
    },
    ship: {
        name: "MS MEDITERRANEAN",
        type: "Konteyner Gemisi",
        imoNumber: "9123456",
        mmsiNumber: "271012345",
        flag: "tr",
        builtYear: "2018",
        length: 180,
        grossTonnage: 15000,
        departurePort: "Mersin",
        destinationPort: "Barcelona"
    },
    users: [
        { id: 1, name: "Mehmet Kaya", role: { name: "Kaptan" } },
        { id: 2, name: "Ali Demir", role: { name: "Mühendis" } },
        { id: 3, name: "Fatma Şahin", role: { name: "Lojistik Uzmanı" } }
    ]
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <div className="font-medium text-sm break-words">{value || '-'}</div>
        </div>
    </div>
)

const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children, isOpen, onToggle, badge }) => (
    <div className="border rounded-lg overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                <div className="bg-muted/50 px-4 py-3 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <h3 className="font-medium">{title}</h3>
                        {badge !== undefined && (
                            <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                                {badge}
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="sr-only">Toggle</span>
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
                {children}
            </CollapsibleContent>
        </Collapsible>
    </div>
)

export function OperationDetailsModal({ open = true, onOpenChange = () => {}, operation }: OperationDetailsModalProps) {
    const [expandedSections, setExpandedSections] = useState<Record<SectionKeys, boolean>>({
        customer: true,
        ship: true,
        team: true,
        cargo: true
    })

    const toggleSection = (section: SectionKeys) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const getStatusBadge = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'planlanıyor':
                return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Planlanıyor</Badge>
            case 'devam':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Devam Ediyor</Badge>
            case 'tamamlandı':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Tamamlandı</Badge>
            case 'iptal':
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">İptal Edildi</Badge>
            default:
                return <Badge variant="outline">{status || 'Bilinmiyor'}</Badge>
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Belirtilmemiş'
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return 'Belirtilmemiş'
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatPhone = (phoneNumber?: string | null) => {
        if (!phoneNumber) return '-';
        const cleaned = phoneNumber.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+')) {
            return `+${cleaned.replace(/\D/g, '')}`;
        }
        return cleaned;
    }

    const currentOperation = operation || mockOperation

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3 border-b">
                    <DialogTitle className="text-xl font-semibold">
                        Operasyon Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Profil Header - Kompakt */}
                <div className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                        <Anchor className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground break-words">
                            {currentOperation?.name || 'İsimsiz Operasyon'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">#{currentOperation?.id}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{formatDateTime(currentOperation?.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(currentOperation?.status)}
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
                                <p className="text-xs text-muted-foreground mb-1">Operasyon Tipi</p>
                                <span className="text-sm font-medium text-foreground">
                                    {currentOperation?.type || '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Başlangıç Tarihi</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatDate(currentOperation?.startDate)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Bitiş Tarihi</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatDate(currentOperation?.endDate)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Süre</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {currentOperation?.startDate && currentOperation?.endDate
                                            ? `${Math.ceil((new Date(currentOperation.endDate).getTime() - new Date(currentOperation.startDate).getTime()) / (1000 * 60 * 60 * 24))} gün`
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Liman</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {currentOperation?.port || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Müşteri Bilgileri Kartı */}
                    {currentOperation?.customer && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Müşteri Bilgileri
                            </h4>
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Müşteri</p>
                                    <span className="text-sm font-medium text-foreground">
                                        {currentOperation.customer.name || '-'}
                                    </span>
                                </div>
                                {currentOperation.customer.company && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Firma</p>
                                        <span className="text-sm font-medium text-foreground">
                                            {currentOperation.customer.company}
                                        </span>
                                    </div>
                                )}
                                {currentOperation.customer.email && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">E-posta</p>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                {currentOperation.customer.email}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {currentOperation.customer.phone && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">
                                                {formatPhone(currentOperation.customer.phone)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Gemi Bilgileri Kartı */}
                    {currentOperation?.ship && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <Ship className="h-4 w-4 text-muted-foreground" />
                                Gemi Bilgileri
                            </h4>
                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Gemi Adı</p>
                                    <span className="text-sm font-medium text-foreground">
                                        {currentOperation.ship.name || '-'}
                                    </span>
                                </div>
                                {currentOperation.ship.imoNumber && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">IMO Numarası</p>
                                        <span className="text-sm font-medium text-foreground">
                                            {currentOperation.ship.imoNumber}
                                        </span>
                                    </div>
                                )}
                                {currentOperation.ship.type && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Gemi Tipi</p>
                                        <span className="text-sm font-medium text-foreground">
                                            {currentOperation.ship.type}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Yük Bilgileri Kartı */}
                    {(currentOperation?.cargoType || currentOperation?.cargoDetails) && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Yük Bilgileri
                            </h4>
                            <div className="space-y-2.5">
                                {currentOperation?.cargoType && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Yük Tipi</p>
                                        <span className="text-sm font-medium text-foreground">
                                            {currentOperation.cargoType}
                                        </span>
                                    </div>
                                )}
                                {currentOperation?.cargoDetails && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Yük Detayları</p>
                                        <div className="bg-muted/50 p-3 rounded-md">
                                            <p className="text-sm whitespace-pre-line break-words">{currentOperation.cargoDetails}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Detaylar Kartı */}
                    {currentOperation?.details && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Detaylar
                            </h4>
                            <div className="bg-muted/50 p-3 rounded-md">
                                <p className="text-sm whitespace-pre-line break-words">{currentOperation.details}</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Also export as default for backward compatibility
export default OperationDetailsModal