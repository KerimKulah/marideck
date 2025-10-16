"use client"

import React, { useEffect } from 'react';
import Script from 'next/script';
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
import { RootState } from '@/redux/store';

// Custom LordIcon component
declare global {
    // This tells TypeScript that we're adding a global declaration
    // for the `lord-icon` element
    interface Window {
        // @ts-ignore - This is a global variable provided by lordicon.js
        loadAnimation?: any;
    }
}

interface LordIconProps {
    src: string;
    trigger?: string;
    delay?: string;
    colors?: string;
    style?: React.CSSProperties;
    className?: string;
}

const LordIcon: React.FC<LordIconProps> = ({
    src,
    trigger = 'hover',
    delay = '1000',
    colors = 'primary:#121331,secondary:#0672a4',
    style = {},
    className = ''
}) => {
    useEffect(() => {
        // This will help ensure the icon is properly initialized
        if (typeof window !== 'undefined' && window.loadAnimation) {
            window.loadAnimation();
        }
    }, [src]);

    // Create the HTML string for the lord-icon
    const iconHtml = {
        __html: `
            <lord-icon
                src="${src}"
                trigger="${trigger}"
                delay="${delay}"
                colors="${colors}"
                style="width: 40px; height: 40px; ${Object.entries(style)
                .map(([key, value]) => `${key}: ${value};`)
                .join(' ')}"
                class="${className}">
            </lord-icon>
        `
    };

    return <div dangerouslySetInnerHTML={iconHtml} />;
};

export default function CustomerStatsCards() {
    const { statistics, statisticsLoading } = useSelector((state: RootState) => state.customer);

    // Loading state için fallback değerler
    const statsData = {
        totalCustomers: statistics?.totalCustomers || 0,
        totalCountries: statistics?.uniqueCountries || 0,
        activeCustomers: statistics?.customersWithActiveOperations || 0,
        lastWeekAdded: statistics?.customersAddedThisWeek || 0
    };

    const StatCard = ({ title, value, icon: Icon, iconType, trend, trendValue, bgColor, iconColor, trigger, colors }: any) => (
        <div className={`rounded-lg border p-3 ${bgColor} `}>
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                <div className={`p-2 rounded-full ${iconColor} flex items-center justify-center`} style={{ width: '48px', height: '48px' }}>
                    {iconType === 'lordicon' ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <LordIcon
                                src={Icon}
                                trigger={trigger}
                                delay={title === 'Toplam Müşteri' ? '1000' : '2000'}
                                colors={colors}
                                style={{ width: '60px', height: '60px' }}
                            />
                        </div>
                    ) : (
                        <Icon className="h-6 w-6 text-white" />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Script
                src="https://cdn.lordicon.com/lordicon.js"
                strategy="afterInteractive"
                onLoad={() => {
                    // This ensures the icons are properly initialized after the script loads
                    if (window.loadAnimation) {
                        window.loadAnimation();
                    }
                }}
            />
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Toplam Müşteri */}
                <StatCard
                    title="Toplam Müşteri"
                    value={statsData.totalCustomers}
                    icon="https://cdn.lordicon.com/yisvhhtw.json"
                    iconType="lordicon"
                    trend="up"
                    trendValue="+12 bu ay"
                    bgColor="bg-white"
                    iconColor="bg-white"
                />

                {/* Ülke Sayısı */}
                <StatCard
                    title="Ülke Sayısı"
                    value={statsData.totalCountries}
                    icon="https://cdn.lordicon.com/aabwqxsm.json"
                    iconType="lordicon"
                    trend="up"
                    trendValue="+2 bu ay"
                    bgColor="bg-white"
                    iconColor="bg-white"
                />

                {/* Aktif Müşteri */}
                <StatCard
                    title="Aktif Operasyonlar"
                    value={statsData.activeCustomers}
                    icon="https://cdn.lordicon.com/pfvaixkr.json"
                    iconType="lordicon"
                    trend="up"
                    trendValue="+5 bu hafta"
                    bgColor="bg-white"
                    iconColor="bg-white"
                />

                {/* Bu Hafta Eklenen */}
                <StatCard
                    title="Bu Hafta Eklenen"
                    value={statsData.lastWeekAdded}
                    icon="https://cdn.lordicon.com/sylzqxek.json"
                    iconType="lordicon"
                    trend="up"
                    trendValue="+5 bu hafta"
                    bgColor="bg-white"
                    iconColor="bg-white"
                />
            </div>
        </>
    );
}