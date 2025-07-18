import { AppDispatch } from '@/redux/store';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from "sonner";
import { getShipByMMSI } from '@/redux/slices/shipSlice';

export const useAisShipData = (onDataLoaded: (data: any) => void) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchShipData = async (mmsi: string) => {
        if (!mmsi.trim()) {
            setError('Lütfen geçerli bir MMSI numarası giriniz');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const shipData = await dispatch(getShipByMMSI(mmsi)).unwrap();

            if (shipData) {
                onDataLoaded(shipData);
            } else {
                setError('Gemi bilgileri bulunamadı');
            }
        } catch (err) {
            console.error('Error fetching ship data:', err as any);
            const errorMessage = (err as any).message || 'Bilinmeyen bir hata oluştu';
            setError(`Gemi bilgileri alınamadı: ${errorMessage}`);
            toast(`Gemi bilgileri alınamadı: ${errorMessage}`);
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
