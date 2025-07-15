import React from 'react';
import {
    Ship,
    TrendingUp,
    UserCheck,
    LoaderCircle,
    Clock,
    MoveRight,
    AlertTriangle,
    AlarmClockOff,
} from 'lucide-react';

// Örnek data - gerçek uygulamada Redux store'dan gelecek
const statsData = {
    totalCustomers: 247,
    totalCountries: 23,
    newThisMonth: 12,
    activeCustomers: 198,
    lastWeekAdded: 5,
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor, iconColor }: any) => (
    <div className={`rounded-lg border p-5 ${bgColor} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
                {trend && (
                    <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {trendValue}
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full ${iconColor}`}>
                <Icon className="h-6 w-6 text-white " />
            </div>
        </div>
    </div>
);

export default function ShipStatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Toplam Gemi */}
            <StatCard
                title="Toplam Gemi"
                value={statsData.totalCustomers}
                icon={Ship}
                trend="up"
                trendValue="+12 bu ay"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Beklemede */}
            <StatCard
                title="Beklemede"
                value={statsData.totalCountries}
                icon={ Clock}
                trend="up"
                trendValue="+2 bu ay"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Gecikmeli */}
            <StatCard
                title="Gecikmeli"
                value={statsData.activeCustomers}
                icon={AlarmClockOff}
                trend="up"
                trendValue="+5 bu hafta"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Devam Eden */}
            <StatCard
                title="Devam Eden"
                value={statsData.lastWeekAdded}
                icon={MoveRight}
                bgColor="bg-white"
                iconColor="bg-black"
            />
        </div>
    );
}