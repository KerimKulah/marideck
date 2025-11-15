"use client"

import React, { useEffect } from 'react';
import Script from 'next/script';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Custom LordIcon component
declare global {
    interface Window {
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
        if (typeof window !== 'undefined' && window.loadAnimation) {
            window.loadAnimation();
        }
    }, [src]);

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

const StatCard = ({ title, value, icon, iconType, bgColor, iconColor, trigger, colors, delay = '1000' }: any) => (
    <div className={`rounded-lg border p-3 ${bgColor} transition-shadow`}>
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-2 rounded-full ${iconColor} flex items-center justify-center`} style={{ width: '48px', height: '48px' }}>
                {iconType === 'lordicon' ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <LordIcon
                            src={icon}
                            trigger={trigger}
                            delay={delay}
                            colors={colors}
                            style={{ width: '60px', height: '60px' }}
                        />
                    </div>
                ) : (
                    <div className="h-6 w-6 text-white" />
                )}
            </div>
        </div>
    </div>
);

export default function CustomerStatsCards() {
    const { statistics, statisticsLoading } = useSelector((state: RootState) => state.customer);

    // Loading state için fallback değerler
    const statsData = {
        totalCustomers: statistics?.totalCustomers || 0,
        totalCountries: statistics?.uniqueCountries || 0,
        activeCustomers: statistics?.customersWithActiveOperations || 0,
        lastWeekAdded: statistics?.customersAddedThisWeek || 0
    };

    return (
        <>
            <Script
                src="https://cdn.lordicon.com/lordicon.js"
                strategy="afterInteractive"
                onLoad={() => {
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
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />

                {/* Ülke Sayısı */}
                <StatCard
                    title="Ülke Sayısı"
                    value={statsData.totalCountries}
                    icon="https://cdn.lordicon.com/aabwqxsm.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#2b87b1"
                />

                {/* Aktif Müşteri */}
                <StatCard
                    title="Aktif Operasyonlar"
                    value={statsData.activeCustomers}
                    icon="https://cdn.lordicon.com/pfvaixkr.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />

                {/* Bu Hafta Eklenen */}
                <StatCard
                    title="Bu Hafta Eklenen"
                    value={statsData.lastWeekAdded}
                    icon="https://cdn.lordicon.com/sylzqxek.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#2b87b1"
                />
            </div>
        </>
    );
}