import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Building2, User, Mail, Phone, MapPin, Calendar, X } from "lucide-react";

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
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Müşteri Detayları</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Firma</p>
                            <p className="font-medium">{customer.company}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Yetkili Kişi</p>
                            <p className="font-medium">{customer.name}</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <p className="text-sm text-muted-foreground">Adres</p>
                            <p className="font-medium">{customer.address || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Telefon</p>
                            <p className="font-medium">{customer.phone || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">E-posta</p>
                            <p className="font-medium">{customer.email || '-'}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm text-muted-foreground">Son İşlem Tarihi</p>
                            <p className="font-medium">{formatDate(customer.lastTransactionDate)}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
