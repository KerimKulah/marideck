"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ship as ShipIcon, Flag, Calendar, Circle, CalendarClock, StickyNote, Ruler, Anchor, MapPin, Clock, AlertTriangle, FlagIcon, Hash, Radio, Phone, Navigation, Waves, Weight, Calendar as CalendarIcon, MapPin as PortIcon, Compass } from "lucide-react";
import tr from 'react-phone-input-2/lang/tr.json';
import ReactCountryFlag from "react-country-flag";
import { Badge } from "@/components/ui/badge";

enum Status {
    Beklemede = "Beklemede", // 1, 7
    Limanda = "Limanda", // 5
    Yolda = "Yolda", // 0, 8, 11, 12	
    Demirde = "Demirde", // 1
    Gecikmeli = "Gecikmeli", // 2, 3, 4, 6
    Acil = "Acil", // 14
    Bilinmiyor = "Bilinmiyor" // 15, 9, 10, 13
}

const statusColors = {
    [Status.Beklemede]: "bg-gray-100 text-yellow-800",
    [Status.Limanda]: "bg-green-100 text-green-800",
    [Status.Yolda]: "bg-green-100 text-green-800",
    [Status.Demirde]: "bg-yellow-100 text-yellow-800",
    [Status.Gecikmeli]: "bg-orange-100 text-orange-800",
    [Status.Acil]: "bg-red-100 text-red-800",
    [Status.Bilinmiyor]: "bg-gray-200 text-gray-800"
};

const statusIcons = {
    [Status.Beklemede]: <Circle fill="yellow" color="yellow" className="h-3 w-3 animate-pulse" />,
    [Status.Limanda]: <Circle fill="green" color="green" className="h-3 w-3" />,
    [Status.Yolda]: <Circle fill="green" color="green" className="h-3 w-3 animate-pulse" />,
    [Status.Demirde]: <Circle fill="orange" color="orange" className="h-3 w-3" />,
    [Status.Gecikmeli]: <Circle fill="orange" color="orange" className="h-3 w-3 animate-pulse" />,
    [Status.Acil]: <Circle fill="red" color="red" className="h-3 w-3 animate-pulse" />,
    [Status.Bilinmiyor]: <Circle fill="black" color="black" className="h-3 w-3" />
};

interface ShipDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ship: {
        id?: number;
        imoNumber?: string;
        mmsiNumber?: string;
        callsign?: string;
        name?: string;
        type?: string;
        flag?: string;
        image?: string;
        eta?: Date | string;
        etd?: Date | string;
        departurePort?: string;
        destinationPort?: string;
        status?: string;
        builtYear?: number;
        grossTonnage?: number;
        deadweight?: number;
        draft?: number;
        notes?: string;
        length?: number;
        beam?: number;
    } | null;
}

const getCountryName = (countryCode: string): string => {
    const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;
    return countryName;
};


export const ShipDetailsModal = ({ isOpen, onClose, ship }: ShipDetailsModalProps) => {
    if (!ship) return null;

    const formatDate = (date?: Date | string) => {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '-';
        return dateObj.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Image URL helper - local images için backend URL, external için olduğu gibi kullan
    const getImageUrl = (imageUrl?: string | null) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        return `http://localhost:4000${imageUrl}`;
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
                <p className="font-medium text-foreground text-sm sm:text-base break-words">
                    {value !== undefined && value !== null && value !== '' ? value : '-'}
                </p>
            </div>
        </div>
    );

    const InfoRowLarge = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
                <div className="bg-muted/30 rounded-md p-2 sm:p-3 min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] overflow-y-auto">
                    <p className="text-foreground text-sm sm:text-base whitespace-pre-wrap break-words">
                        {value || '-'}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-3 border-b">
                    <DialogTitle className="text-xl font-semibold">
                        Gemi Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Profil Header - Kompakt */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b">
                    <div className="w-48 h-32 sm:w-56 sm:h-40 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800 overflow-hidden">
                        {getImageUrl(ship.image) ? (
                            <img src={getImageUrl(ship.image)!} alt={ship.name || 'Gemi'} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <ShipIcon className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-foreground break-words">
                            {ship.name || 'İsimsiz Gemi'}
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs">
                                {ship.type || 'Tip belirtilmemiş'}
                            </span>
                            <Badge className={`flex items-center gap-1 text-xs ${statusColors[ship.status as keyof typeof statusColors] || 'bg-gray-200 text-gray-800'}`}>
                                {statusIcons[ship.status as keyof typeof statusIcons] || <Circle className="h-3 w-3" />}
                                {ship.status || 'Durum belirtilmemiş'}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {/* Temel Bilgiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            Temel Bilgiler
                        </h4>
                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">IMO Numarası</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.imoNumber || '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">MMSI Numarası</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.mmsiNumber || '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Çağrı İşareti</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {ship.callsign || '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Bayrak</p>
                                <div className="flex items-center gap-2">
                                    {ship.flag ? (
                                        <>
                                            <ReactCountryFlag
                                                countryCode={ship.flag.toUpperCase()}
                                                svg
                                                style={{
                                                    width: '18px',
                                                    height: '14px',
                                                    borderRadius: '2px'
                                                }}
                                            />
                                            <span className="text-sm font-medium text-foreground">
                                                {getCountryName(ship.flag)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">İnşa Yılı</p>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {ship.builtYear || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boyutlar ve Ölçüler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            Boyutlar ve Ölçüler
                        </h4>
                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Uzunluk</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.length ? `${ship.length} m` : '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Genişlik (Beam)</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.beam ? `${ship.beam} m` : '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Su Çekimi (Draft)</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.draft ? `${ship.draft} m` : '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Brüt Tonaj</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.grossTonnage ? `${ship.grossTonnage} GT` : '-'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Deadweight</p>
                                <span className="text-sm font-medium text-foreground">
                                    {ship.deadweight ? `${ship.deadweight} DWT` : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Seyir Bilgileri Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Compass className="h-4 w-4 text-muted-foreground" />
                            Seyir Bilgileri
                        </h4>
                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Kalkış Limanı</p>
                                <div className="flex items-center gap-2">
                                    <PortIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {ship.departurePort || '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Varış Limanı</p>
                                <div className="flex items-center gap-2">
                                    <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {ship.destinationPort || '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Tahmini Varış (ETA)</p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatDate(ship.eta)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notlar Kartı - Tam Genişlik */}
                    {ship.notes && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                Notlar
                            </h4>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                {ship.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6"
                    >
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};