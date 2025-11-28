"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, User, Mail, Phone, MapPin, Calendar, Globe, CalendarClock, StickyNote, Ship, IdCard, Anchor, Activity, ArrowRight } from "lucide-react";
import 'react-phone-input-2/lib/style.css';
import tr from 'react-phone-input-2/lang/tr.json';
import ReactCountryFlag from "react-country-flag";
import { isActiveOperation } from "@/lib/operation-status";


type CustomerDetailsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    customer: any | null;
};

const getCountryName = (countryCode: string): string => {
    const countryName = tr[countryCode.toLowerCase() as keyof typeof tr] || countryCode;
    return countryName;
};

const formatPhone = (phoneNumber?: string | null) => {
    if (!phoneNumber) return '-';
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+')) {
        return `+${cleaned.replace(/\D/g, '')}`;
    }
    return cleaned;
};


export const CustomerDetailsModal = ({ isOpen, onClose, customer }: CustomerDetailsModalProps) => {
    if (!customer) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Henüz işlem yok';
        const date = new Date(dateString);
        return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const hasActiveOperations = customer.operations?.some((operation: any) =>
        isActiveOperation(operation.status)
    ) || false;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] lg:min-w-[700px] max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold">
                        Müşteri Detayları
                    </DialogTitle>
                </DialogHeader>

                {/* Profil Header - Kompakt */}
                <div className="flex items-center gap-4 py-4 border-b">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                        <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground break-words">
                            {customer.name || 'İsimsiz Müşteri'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground break-words">
                                {customer.company || 'Firma bilgisi yok'}
                            </span>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${hasActiveOperations
                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-800'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${hasActiveOperations ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                        {hasActiveOperations ? 'Aktif Operasyon' : 'Operasyon Yok'}
                    </div>
                </div>

                {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    {/* Temel Bilgiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            Temel Bilgiler
                        </h4>

                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ülke</p>
                                <div className="flex items-center gap-2">
                                    {customer.country ? (
                                        <>
                                            <ReactCountryFlag
                                                countryCode={customer.country.toUpperCase()}
                                                svg
                                                style={{
                                                    width: '18px',
                                                    height: '14px',
                                                    borderRadius: '2px'
                                                }}
                                            />
                                            <span className="text-sm font-medium text-foreground">
                                                {getCountryName(customer.country)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">-</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Son İşlem Tarihi</p>
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatDate(customer.lastTransactionDate)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Müşteri Türü</p>
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {customer.customerType || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* İletişim Bilgileri Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            İletişim
                        </h4>

                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground">
                                        {formatPhone(customer.phone)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">E-posta</p>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm font-medium text-foreground break-all">
                                        {customer.email || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detaylı Bilgiler Kartı */}
                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                            <IdCard className="h-4 w-4 text-muted-foreground" />
                            Detaylı Bilgiler
                        </h4>

                        <div className="space-y-2.5">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Vergi Numarası</p>
                                <span className="text-sm font-medium text-foreground">
                                    {customer.taxNumber || '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Adres Kartı - Tam Genişlik */}
                    {customer.address && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Adres
                            </h4>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                {customer.address}
                            </p>
                        </div>
                    )}

                    {/* Notlar Kartı - Tam Genişlik */}
                    {customer.notes && (
                        <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                <StickyNote className="h-4 w-4 text-muted-foreground" />
                                Notlar
                            </h4>
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
                                {customer.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    {hasActiveOperations && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                                console.log('Navigate to operations for customer:', customer.id);
                            }}
                        >
                            Operasyonları Görüntüle
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
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