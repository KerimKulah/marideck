"use client"

import React from 'react';
import {
    Users,
    Building2,
    Globe,
    TrendingUp,
    UserCheck,
    Calendar,
    Mail,
    Phone
} from 'lucide-react';
import { useSelector } from 'react-redux';

// Örnek data - gerçek uygulamada Redux store'dan gelecek
const statsData = {
    totalCustomers: 247,
    totalCompanies: 189,
    totalCountries: 23,
    newThisMonth: 12,
    activeCustomers: 198,
    lastWeekAdded: 5,
    emailContacts: 234,
    phoneContacts: 241
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgColor, iconColor }: any) => (
    <div className={`rounded-lg border p-3 ${bgColor} hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-2 rounded-full ${iconColor}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

export default function CustomerStatsCards() {
    const { totalCustomers } = useSelector((state: any) => state.customer);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Toplam Müşteri */}
            <StatCard
                title="Toplam Müşteri"
                value={totalCustomers}
                icon={Users}
                trend="up"
                trendValue="+12 bu ay"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Ülke Sayısı */}
            <StatCard
                title="Ülke Sayısı"
                value={statsData.totalCountries}
                icon={Globe}
                trend="up"
                trendValue="+2 bu ay"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Aktif Müşteri */}
            <StatCard
                title="Aktif Müşteri"
                value={statsData.activeCustomers}
                icon={UserCheck}
                trend="up"
                trendValue="+5 bu hafta"
                bgColor="bg-white"
                iconColor="bg-black"
            />

            {/* Bu Hafta Eklenen */}
            <StatCard
                title="Bu Hafta Eklenen"
                value={statsData.lastWeekAdded}
                icon={Calendar}
                bgColor="bg-white"
                iconColor="bg-black"
            />
        </div>
    );
}