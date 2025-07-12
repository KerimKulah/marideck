import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, User, Mail, Phone, MapPin, Calendar, Globe, CalendarClock, StickyNote, Ship } from "lucide-react";
import 'react-phone-input-2/lib/style.css';
import tr from 'react-phone-input-2/lang/tr.json';
import ReactCountryFlag from "react-country-flag";

type CustomerDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    customer: any | null;
};

const getCountryName = (countryCode: string): string => {
    const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;
    return countryName;
};

export const CustomerDetailsModal = ({ isOpen, onClose, customer }: CustomerDetailsModalProps) => {
    if (!customer) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Henüz işlem yok';
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string; }) => (
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
                        Müşteri Detayları
                    </DialogTitle>
                </DialogHeader>


                {/* Profil Bölümü */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                            {customer.name || 'İsimsiz Müşteri'}
                        </h3>
                        <p className="text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1 text-muted-foreground mt-1">
                            <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="break-words">{customer.company || 'Firma bilgisi yok'}</span>
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
                            <div className="flex items-start gap-3 py-2">
                                <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ülke</p>
                                    <div className="flex items-center gap-2">
                                        {customer.country ? (
                                            <div className="flex items-center gap-2">
                                                <ReactCountryFlag
                                                    countryCode={customer.country.toUpperCase()}
                                                    svg
                                                    style={{
                                                        width: '16px',
                                                        height: '12px',
                                                        boxShadow: '0 0 0 1px var(--border)',
                                                        borderRadius: '2px'
                                                    }}
                                                />
                                                <span className="font-medium text-foreground text-sm sm:text-base break-words">
                                                    {getCountryName(customer.country)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-medium text-foreground text-sm sm:text-base">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <InfoRow icon={CalendarClock} label="Son İşlem Tarihi" value={formatDate(customer.lastTransactionDate)} />
                        </div>
                    </div>

                    {/* İletişim Bilgileri */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            İletişim Bilgileri
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-4">
                            <InfoRow icon={Phone} label="Telefon" value={customer.phone} />
                            <div className="flex items-start gap-3 py-2">
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">E-posta</p>
                                    <p className="font-medium text-foreground text-sm sm:text-base break-all">{customer.email || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Bilgiler */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3 sm:mb-4 uppercase tracking-wide">
                            Detaylı Bilgiler
                        </h3>
                        <hr className="my-2" />
                        <div className="space-y-4">
                            <InfoRowLarge icon={MapPin} label="Adres" value={customer.address} />
                            <InfoRowLarge icon={StickyNote} label="Notlar" value={customer.notes} />
                            <InfoRowLarge icon={Ship} label="İlişkili Gemiler" value="-" />
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