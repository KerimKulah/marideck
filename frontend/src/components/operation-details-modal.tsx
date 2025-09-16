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
    XCircle
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
            <DialogContent className="max-w-[95vw] max-h-[90vh] lg:min-w-[50vw] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                {currentOperation?.name}
                                {getStatusBadge(currentOperation?.status)}
                            </DialogTitle>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span>#{currentOperation?.id}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatDateTime(currentOperation?.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Operation Details */}
                        <div className="bg-muted/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Operasyon Detayları
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow
                                    icon={Calendar}
                                    label="Başlangıç Tarihi"
                                    value={formatDate(currentOperation?.startDate)}
                                />
                                <InfoRow
                                    icon={Calendar}
                                    label="Bitiş Tarihi"
                                    value={formatDate(currentOperation?.endDate)}
                                />
                                <InfoRow
                                    icon={Clock}
                                    label="Süre"
                                    value={currentOperation?.startDate && currentOperation?.endDate
                                        ? `${Math.ceil((new Date(currentOperation.endDate).getTime() - new Date(currentOperation.startDate).getTime()) / (1000 * 60 * 60 * 24))} gün`
                                        : 'Belirtilmemiş'}
                                    className="md:col-span-2"
                                />
                                <div className="md:col-span-2">
                                    <div className="flex items-start gap-3 py-2">
                                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground mb-1">Açıklama</p>
                                            <div className="bg-muted/50 p-3 rounded-md">
                                                <p className="text-sm whitespace-pre-line">{currentOperation?.details || 'Açıklama bulunmuyor'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Information */}
                        <SectionCard
                            title="Müşteri Bilgileri"
                            icon={User}
                            isOpen={expandedSections.customer}
                            onToggle={() => toggleSection('customer')}
                        >
                            {currentOperation?.customer ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{currentOperation.customer.name || 'İsimsiz Müşteri'}</h4>
                                            <p className="text-sm text-muted-foreground">{currentOperation.customer.company || 'Firma bilgisi yok'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow
                                            icon={Mail}
                                            label="E-posta"
                                            value={currentOperation.customer.email || 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={Phone}
                                            label="Telefon"
                                            value={formatPhone(currentOperation.customer.phone)}
                                        />
                                        {currentOperation.customer.country && (
                                            <InfoRow
                                                icon={MapPin}
                                                label="Ülke"
                                                value={
                                                    <div className="flex items-center gap-2">
                                                        <span>🇹🇷</span>
                                                        <span>Türkiye</span>
                                                    </div>
                                                }
                                            />
                                        )}
                                        <InfoRow
                                            icon={Building2}
                                            label="Vergi Numarası"
                                            value={currentOperation.customer.taxNumber || 'Belirtilmemiş'}
                                        />
                                    </div>

                                    {currentOperation.customer.address && (
                                        <div className="mt-2">
                                            <InfoRow
                                                icon={MapPin}
                                                label="Adres"
                                                value={
                                                    <div className="bg-muted/30 p-2 rounded text-sm">
                                                        {currentOperation.customer.address}
                                                    </div>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Müşteri bilgisi bulunamadı</p>
                            )}
                        </SectionCard>

                        {/* Ship Information */}
                        <SectionCard
                            title="Gemi Bilgileri"
                            icon={Ship}
                            isOpen={expandedSections.ship}
                            onToggle={() => toggleSection('ship')}
                        >
                            {currentOperation?.ship ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <Ship className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{currentOperation.ship.name || 'İsimsiz Gemi'}</h4>
                                            <p className="text-sm text-muted-foreground">{currentOperation.ship.type || 'Gemi tipi belirtilmemiş'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoRow
                                            icon={Ship}
                                            label="IMO Numarası"
                                            value={currentOperation.ship.imoNumber || 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={Ship}
                                            label="MMSI Numarası"
                                            value={currentOperation.ship.mmsiNumber || 'Belirtilmemiş'}
                                        />
                                        {currentOperation.ship.flag && (
                                            <InfoRow
                                                icon={MapPin}
                                                label="Bayrak"
                                                value={
                                                    <div className="flex items-center gap-2">
                                                        <span>🇹🇷</span>
                                                        <span>Türkiye</span>
                                                    </div>
                                                }
                                            />
                                        )}
                                        <InfoRow
                                            icon={Calendar}
                                            label="İnşa Yılı"
                                            value={currentOperation.ship.builtYear || 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={Ruler}
                                            label="Uzunluk"
                                            value={currentOperation.ship.length ? `${currentOperation.ship.length} m` : 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={Anchor}
                                            label="Brüt Tonaj"
                                            value={currentOperation.ship.grossTonnage ? `${currentOperation.ship.grossTonnage} GT` : 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={MapPin}
                                            label="Kalkış Limanı"
                                            value={currentOperation.ship.departurePort || 'Belirtilmemiş'}
                                        />
                                        <InfoRow
                                            icon={MapPin}
                                            label="Varış Limanı"
                                            value={currentOperation.ship.destinationPort || 'Belirtilmemiş'}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Gemi bilgisi bulunamadı</p>
                            )}
                        </SectionCard>

                        {/* Cargo Information */}
                        <SectionCard
                            title="Yük Bilgileri"
                            icon={FileText}
                            isOpen={expandedSections.cargo}
                            onToggle={() => toggleSection('cargo')}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow
                                    icon={FileText}
                                    label="Yük Tipi"
                                    value={currentOperation?.cargoType || 'Belirtilmemiş'}
                                />
                                <div className="md:col-span-2">
                                    <InfoRow
                                        icon={FileText}
                                        label="Yük Detayları"
                                        value={
                                            <div className="bg-muted/30 p-3 rounded-md">
                                                <p className="text-sm whitespace-pre-line">{currentOperation?.cargoDetails || 'Yük detayı bulunmuyor'}</p>
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Team Members */}
                        <SectionCard
                            title="Ekip Üyeleri"
                            icon={User}
                            badge={currentOperation?.users?.length || 0}
                            isOpen={expandedSections.team}
                            onToggle={() => toggleSection('team')}
                        >
                            {currentOperation?.users?.length > 0 ? (
                                <div className="space-y-3">
                                    {currentOperation.users.map((user: any) => (
                                        <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>
                                                    {user.firstName?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{user.firstName + ' ' + user.lastName}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Henüz ekip üyesi bulunmuyor</p>
                            )}
                        </SectionCard>

                        {/* Timeline / Notes */}
                        <div className="border rounded-lg p-4">
                            <h3 className="font-medium flex items-center gap-2 mb-4">
                                <FileText className="h-4 w-4" />
                                Notlar
                            </h3>
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Bu operasyonla ilgili not ekleyin..."
                                    className="min-h-[100px]"
                                />
                                <Button className="w-full">Not Ekle</Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full">
                                Düzenle
                            </Button>
                            <Button variant="outline" className="w-full">
                                Rapor Oluştur
                            </Button>
                            <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                                Operasyonu İptal Et
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Also export as default for backward compatibility
export default OperationDetailsModal