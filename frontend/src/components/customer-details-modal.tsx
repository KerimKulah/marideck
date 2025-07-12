import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, User, Mail, Phone, MapPin, Calendar, Globe, CalendarClock, StickyNote } from "lucide-react";

type CustomerDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    customer: any | null;
};

export const CustomerDetailsModal = ({ isOpen, onClose, customer }: CustomerDetailsModalProps) => {
    if (!customer) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Henüz işlem yok';
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string; }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value || '-'}</p>
            </div>
        </div>
    );

    return (

        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">Müşteri Detayları</DialogTitle>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    <InfoRow icon={Building2} label="Firma" value={customer.company} />
                    <InfoRow icon={User} label="Yetkili Kişi" value={customer.name} />
                    <InfoRow icon={Globe} label="Ülke" value={customer.country} />
                    <InfoRow icon={MapPin} label="Adres" value={customer.address} />
                    <InfoRow icon={Phone} label="Telefon" value={customer.phone} />
                    <InfoRow icon={Mail} label="E-posta" value={customer.email} />
                    <InfoRow icon={CalendarClock} label="Son İşlem Tarihi" value={formatDate(customer.lastTransactionDate)} />
                    <InfoRow icon={StickyNote} label="Notlar" value={customer.notes} />
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={onClose}>Kapat</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
