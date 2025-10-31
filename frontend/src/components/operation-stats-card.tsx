import React, { useMemo } from 'react';
import { User, Activity, CheckCircle } from 'lucide-react';
import { OperationStatus } from '@/lib/operation-status';

interface Operation {
    id: number;
    status: OperationStatus;
    users: Array<{ id: number; name: string; role?: string }>;
}

interface OperationStatsCardsProps {
    operations: Operation[];
    userId?: number;
}

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, iconClass }: any) => (
    <div className={`rounded-lg border p-3 ${bgColor} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-2 rounded-full ${iconColor}`}>
                <Icon className={`h-6 w-6 text-white ${iconClass || ''}`} />
            </div>
        </div>
    </div>
);

export default function OperationStatsCards({ operations = [], userId }: OperationStatsCardsProps) {
    const stats = useMemo(() => {
        // Mevcut Operasyonlarım - Kullanıcıya atanmış operasyonlar
        const myOperations = operations.filter(operation => {
            if (!userId) return false;
            return operation.users?.some((u: any) => u.id === userId);
        });

        // Toplam Aktif Operasyon - IN_PROGRESS ve PLANNED durumundaki operasyonlar
        const activeOperations = operations.filter(operation =>
            operation.status === OperationStatus.IN_PROGRESS ||
            operation.status === OperationStatus.PLANNED
        );

        // Tamamlanan Operasyonlar - COMPLETED durumundaki operasyonlar
        const completedOperations = operations.filter(operation =>
            operation.status === OperationStatus.COMPLETED
        );

        return {
            myOperations: myOperations.length,
            activeOperations: activeOperations.length,
            completedOperations: completedOperations.length,
        };
    }, [operations, userId]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Mevcut Operasyonlarım */}
            <StatCard
                title="Mevcut Operasyonlarım"
                value={stats.myOperations}
                icon={User}
                bgColor="bg-white"
                iconColor="bg-blue-500"
            />

            {/* Toplam Aktif Operasyon */}
            <StatCard
                title="Toplam Aktif Operasyon"
                value={stats.activeOperations}
                icon={Activity}
                bgColor="bg-white"
                iconColor="bg-green-500"
            />

            {/* Tamamlanan Operasyonlar */}
            <StatCard
                title="Tamamlanan Operasyonlar"
                value={stats.completedOperations}
                icon={CheckCircle}
                bgColor="bg-white"
                iconColor="bg-purple-500"
            />
        </div>
    );
}