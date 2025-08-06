import React from 'react';
import { Ship, Clock, MoveRight, AlarmClockOff } from 'lucide-react';

// Örnek data - gerçek uygulamada Redux store'dan gelecek
const statsData = {
    totalCustomers: 247,
    totalCountries: 23,
    newThisMonth: 12,
    activeCustomers: 198,
    lastWeekAdded: 5,
};

const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, iconClass }: any) => (
    <div className={`rounded-lg border p-3 ${bgColor} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-2 rounded-full ${iconColor}`}>
                <Icon className={`h-6 w-6 text-white ${iconClass}`} />
            </div>
        </div>
    </div>
);

export default function ShipStatsCards() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Toplam Gemi */}
            <StatCard
                title="Toplam Gemi"
                value={statsData.totalCustomers}
                icon={Ship}
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Beklemede */}
            <StatCard
                title="Beklemede"
                value={statsData.totalCountries}
                icon={Clock}
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Gecikmeli */}
            <StatCard
                title="Gecikmeli"
                value={statsData.activeCustomers}
                icon={AlarmClockOff}
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Devam Eden */}
            <StatCard
                title="Yolda"
                value={statsData.lastWeekAdded}
                icon={Clock}
                iconClass="animate-spin [animation-duration:3s]"
                bgColor="bg-white"
                iconColor="bg-black"
            />
        </div>
    );
}