import { AppDispatch } from '@/redux/store';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from "sonner";
import { getShipByMMSI } from '@/redux/slices/shipSlice';
import api from '@/api/axios';

export const useAisShipData = (onDataLoaded: (data: any) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchShipData = async (searchValue: string) => {
        if (!searchValue.trim()) {
            setError('Lütfen geçerli bir numara giriniz');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            let shipData;

            // MMSI veya IMO kontrolü
            if (searchValue.length === 9) {
                // MMSI araması
                shipData = await dispatch(getShipByMMSI(searchValue)).unwrap();
            } else if (searchValue.length === 7) {
                // IMO araması - backend'de IMO endpoint'i kullan
                const response = await api.get(`/ship/ais/imo/${searchValue}`);
                shipData = response.data;
            } else {
                setError('Geçersiz numara formatı. MMSI (9 haneli) veya IMO (7 haneli) giriniz');
                return;
            }

            if (shipData) {
                onDataLoaded(shipData);
            } else {
                setError('Gemi bilgileri bulunamadı');
            }
        } catch (err) {
            console.error('Error fetching ship data:', err as any);
            const errorMessage = (err as any).message || 'Bilinmeyen bir hata oluştu';
            toast(`Gemi bilgileri alınamadı`);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        fetchShipData,
        isLoading,
        error,
    };
};
