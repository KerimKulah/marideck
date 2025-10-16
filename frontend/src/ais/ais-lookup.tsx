"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Ship, Hash } from 'lucide-react';
import { useAisShipData } from '@/ais/useAisShipData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AisLookupProps {
    onShipFound: (data: any) => void;
    onClose?: () => void;
    isOpen?: boolean;
}

export function AisLookup({ onShipFound, onClose, isOpen = true }: AisLookupProps) {
    const [searchValue, setSearchValue] = useState('');
    const [searchType, setSearchType] = useState<'mmsi' | 'imo'>('mmsi');
    const [isSuccess, setIsSuccess] = useState(false);
    const [notification, setNotification] = useState<'success' | 'error' | null>(null);
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
        if (!searchValue.trim()) {
            setNotification('error');
            setTimeout(() => {
                setNotification(null);
            }, 1500);
            return;
        }
        fetchShipData(searchValue);
    };

    const handleSearchTypeChange = (value: string) => {
        const type = value as 'mmsi' | 'imo';
        setSearchType(type);
        setSearchValue('');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (searchType === 'mmsi') {
            // MMSI: 9 haneli sayı
            setSearchValue(value.replace(/\D/g, '').slice(0, 9));
        } else {
            // IMO: 7 haneli sayı
            setSearchValue(value.replace(/\D/g, '').slice(0, 7));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="space-y-4 bg-card">
            <Tabs value={searchType} onValueChange={handleSearchTypeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mmsi" className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        MMSI
                    </TabsTrigger>
                    <TabsTrigger value="imo" className="flex items-center gap-2">
                        <Ship className="h-4 w-4" />
                        IMO
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="mmsi" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="MMSI numarası giriniz..."
                                    className="pl-9"
                                    value={searchValue}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    pattern="\d*"
                                    inputMode="numeric"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Örnek: 244670123 (9 haneli sayı)
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
                                disabled={isLoading || !searchValue.trim() || searchValue.length !== 9}
                                className="min-w-[100px]"
                            >
                                {isLoading ? 'Aranıyor...' : 'Ara'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="imo" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="IMO numarası giriniz..."
                                    className="pl-9"
                                    value={searchValue}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    pattern="\d*"
                                    inputMode="numeric"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Örnek: 9286475 (7 haneli sayı)
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
                                disabled={isLoading || !searchValue.trim() || searchValue.length !== 7}
                                className="min-w-[100px]"
                            >
                                {isLoading ? 'Aranıyor...' : 'Ara'}
                            </Button>
                        </div>
                    </form>
                </TabsContent>
            </Tabs>

            {notification === 'success' && (
                <p className="text-sm text-green-500 mt-2">Gemi başarıyla bulundu!</p>
            )}
            {notification === 'error' && (
                <p className="text-sm text-destructive mt-2">
                    Lütfen geçerli bir {searchType === 'mmsi' ? 'MMSI' : 'IMO'} numarası giriniz
                </p>
            )}
            {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
            )}
        </div>
    );
}
