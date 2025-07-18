"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Ship } from 'lucide-react';
import { useAisShipData } from '@/ais/useAisShipData';

interface AisLookupProps {
    onShipFound: (data: any) => void;
    onClose?: () => void;
    isOpen?: boolean;
}

export function AisLookup({ onShipFound, onClose, isOpen = true }: AisLookupProps) {
    const [mmsi, setMmsi] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [notification, setNotification] = useState(null);
    const { fetchShipData, isLoading, error } = useAisShipData(
        (data) => {
            onShipFound(data);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setNotification(null);
            }, 1500);
        },
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mmsi.trim()) {
            setTimeout(() => {
                setNotification(null);
            }, 1500);
            return;
        }
        fetchShipData(mmsi);
    };

    if (!isOpen) return null;

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-4">
                <Ship className="h-5 w-5 text-primary" />
                <h3 className="font-medium">AIS ile Gemi Arama</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="MMSI numarası giriniz..."
                            className="pl-9"
                            value={mmsi}
                            onChange={(e) => setMmsi(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            disabled={isLoading}
                            pattern="\d*"
                            inputMode="numeric"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Örnek: 244670123
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    {onClose && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            İptal
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading || !mmsi.trim()}
                        className="min-w-[100px]"
                    >
                        {isLoading ? 'Aranıyor...' : 'Ara'}
                    </Button>
                </div>
            </form>

            {notification === 'success' && (
                <p className="text-sm text-green-500 mt-2">Gemi başarıyla bulundu!</p>
            )}
            {notification === 'error' && (
                <p className="text-sm text-destructive mt-2">Lütfen geçerli bir MMSI numarası giriniz</p>
            )}
            {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
            )}
        </div>
    );
}
