export enum OperationStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed'
}

export const getOperationStatusTranslation = (status: OperationStatus): string => {
    const translations: Record<OperationStatus, string> = {
        [OperationStatus.PLANNED]: 'Planlanıyor',
        [OperationStatus.IN_PROGRESS]: 'Devam Ediyor',
        [OperationStatus.CANCELLED]: 'İptal Edildi',
        [OperationStatus.COMPLETED]: 'Tamamlandı'
    };

    return translations[status] || status;
};

export const isActiveOperation = (status: OperationStatus): boolean => {
    return status === OperationStatus.PLANNED || status === OperationStatus.IN_PROGRESS;
};


