import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ship, Building2, Globe, MapPin, Calendar, CalendarClock, StickyNote, Building, User } from "lucide-react";

type ShipDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    ship: any | null;
};

export const ShipDetailsModal = ({ isOpen, onClose, ship }: ShipDetailsModalProps) => {
    if (!ship) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number; }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
                <p className="font-medium text-foreground text-sm sm:text-base break-words">{value || '-'}</p>
            </div>
        </div>
    );

    const InfoRowLarge = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string; }) => (
        <div className="flex items-start gap-3 py-2">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
                <div className="bg-muted/30 rounded-md p-2 sm:p-3 min-h-[50px] sm:min-h-[60px] max-h-[100px] sm:max-h-[120px] overflow-y-auto">
                    <p className="font-medium text-foreground text-sm sm:text-base whitespace-pre-wrap break-words">{value || '-'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto lg:min-w-2xl" >
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold text-center sm:text-left">
                        Gemi Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Gemi Profil Bölümü */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <Ship className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                            {ship.name || 'İsimsiz Gemi'}
                        </h3>
                        <p className="text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1 text-muted-foreground mt-1">
                            <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="break-words">{ship.shipType || 'Tip bilgisi yok'}</span>
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Temel Bilgiler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Temel Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={Building2} label="IMO Numarası" value={ship.imoNumber} />
                            <InfoRow icon={Building2} label="MMSI Numarası" value={ship.mmsiNumber} />
                            <InfoRow icon={Building2} label="Kısa Dalga Çağrı İşareti" value={ship.callSign} />
                        </div>
                    </div>

                    {/* Teknik Bilgiler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Teknik Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={Building2} label="Brüt Tonaj" value={ship.grossTonnage ? `${ship.grossTonnage} GT` : '-'} />
                            <InfoRow icon={Building2} label="Net Tonaj" value={ship.netTonnage ? `${ship.netTonnage} NT` : '-'} />
                            <InfoRow icon={Building2} label="Uzunluk" value={ship.length ? `${ship.length} m` : '-'} />
                            <InfoRow icon={Building2} label="Genişlik" value={ship.width ? `${ship.width} m` : '-'} />
                            <InfoRow icon={Building2} label="Yumuşaklık" value={ship.draft ? `${ship.draft} m` : '-'} />
                        </div>
                    </div>

                    {/* Genel Bilgiler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Genel Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={Calendar} label="İmalat Yılı" value={ship.yearBuilt} />
                            <InfoRow icon={Globe} label="Bayrak" value={ship.flag} />
                            <InfoRow icon={User} label="Sahibi" value={ship.owner} />
                        </div>
                    </div>

                    {/* Navigasyon Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Navigasyon Bilgileri
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={MapPin} label="Enlem" value={ship.lat ? `${ship.lat}°` : '-'} />
                            <InfoRow icon={MapPin} label="Boylam" value={ship.lon ? `${ship.lon}°` : '-'} />
                            <InfoRow icon={CalendarClock} label="Hız" value={ship.speed ? `${ship.speed} kn` : '-'} />
                            <InfoRow icon={CalendarClock} label="Kurs" value={ship.course ? `${ship.course}°` : '-'} />
                        </div>
                    </div>

                    {/* Liman Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Liman Bilgileri
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            {/* <InfoRow icon={MapPin} label="Son Liman" value={ship.lastPort} />
                            <InfoRow icon={MapPin} label="Mevcut Liman" value={ship.currentPort} />
                            <InfoRow icon={MapPin} label="Sonraki Liman" value={ship.nextPort} /> */}
                            <InfoRow icon={Calendar} label="ETA" value={formatDate(ship.eta)} />
                            <InfoRow icon={Calendar} label="ETD" value={formatDate(ship.etd)} />
                        </div>
                    </div>

                    {/* Yük Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Yük Bilgileri
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-4">
                            <InfoRowLarge icon={StickyNote} label="Yük Detayları" value={ship.cargoDetails} />
                        </div>
                    </div>

                    {/* Ek Teknik Bilgiler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Ek Teknik Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={Building2} label="Deadweight" value={ship.deadweight ? `${ship.deadweight} DWT` : '-'} />
                            <InfoRow icon={Building2} label="Genişlik" value={ship.beam ? `${ship.beam} m` : '-'} />
                            <InfoRow icon={Building2} label="Durum" value={ship.status} />
                            <InfoRow icon={User} label="Acenta" value={ship.agent} />
                        </div>
                    </div>

                    {/* Notlar */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Notlar
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-4">
                            <InfoRowLarge icon={StickyNote} label="Notlar" value={ship.notes} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center sm:justify-end pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="px-6 py-2 w-full sm:w-auto text-sm sm:text-base"
                    >
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};