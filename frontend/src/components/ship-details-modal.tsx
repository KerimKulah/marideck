import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ship as ShipIcon, Flag, Calendar, Circle, CalendarClock, StickyNote, Ruler, Anchor, MapPin, Clock, AlertTriangle, FlagIcon } from "lucide-react";
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
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto lg:min-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                        Gemi Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Gemi Profil Bölümü */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShipIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground break-words">
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

                <div className="space-y-6">
                    {/* Kimlik Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Temel Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={ShipIcon} label="IMO Numarası" value={ship.imoNumber} />
                            <InfoRow icon={ShipIcon} label="MMSI Numarası" value={ship.mmsiNumber} />
                            <InfoRow icon={ShipIcon} label="Çağrı İşareti" value={ship.callsign} />

                            <div className="flex items-start gap-3 py-2">
                                <FlagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Bayrak</p>
                                    <div className="font-medium text-foreground text-sm sm:text-base break-words flex items-center gap-2">
                                        <ReactCountryFlag
                                            countryCode={ship.flag?.toUpperCase() || ''}
                                            svg
                                            style={{
                                                width: '16px',
                                                height: '12px',
                                                boxShadow: '0 0 0 1px var(--border)',
                                                borderRadius: '2px'
                                            }}
                                        />
                                        {getCountryName(ship.flag || 'Bilinmiyor')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Boyutlar ve Ölçüler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Boyutlar ve Ölçüler
                        </h3>
                        <hr className="my-2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={Ruler} label="Uzunluk" value={ship.length ? `${ship.length} m` : undefined} />
                            <InfoRow icon={Ruler} label="Genişlik (Beam)" value={ship.beam ? `${ship.beam} m` : undefined} />
                            <InfoRow icon={Ruler} label="Su Çekimi (Draft)" value={ship.draft ? `${ship.draft} m` : undefined} />
                            <InfoRow icon={Anchor} label="Brüt Tonaj" value={ship.grossTonnage ? `${ship.grossTonnage} GT` : undefined} />
                            <InfoRow icon={Anchor} label="Deadweight" value={ship.deadweight ? `${ship.deadweight} DWT` : undefined} />
                            <InfoRow icon={Calendar} label="İnşa Yılı" value={ship.builtYear} />
                        </div>
                    </div>

                    {/* Seyir Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Seyir Bilgileri
                        </h3>
                        <hr className="my-2" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow icon={MapPin} label="Kalkış Limanı" value={ship.departurePort} />
                            <InfoRow icon={MapPin} label="Varış Limanı" value={ship.destinationPort} />
                            <InfoRow icon={CalendarClock} label="Tahmini Kalkış (ETD)" value={formatDate(ship.etd)} />
                            <InfoRow icon={CalendarClock} label="Tahmini Varış (ETA)" value={formatDate(ship.eta)} />
                        </div>
                    </div>

                    {/* Notlar */}
                    {ship.notes && (
                        <div>
                            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                                Notlar
                            </h3>
                            <hr className="my-2" />
                            <InfoRowLarge icon={StickyNote} label="Notlar" value={ship.notes} />
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 mt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 py-2"
                    >
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};