"use client"

import React, { useEffect } from 'react';
import Script from 'next/script';

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

// Örnek data - gerçek uygulamada Redux store'dan gelecek
const statsData = {
    totalShips: 247,
    beklemede: 23,
    gecikmeli: 12,
    yolda: 198,
    demirde: 5,
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

export default function ShipStatsCards() {
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Toplam Gemi */}
                <StatCard
                    title="Toplam Gemi"
                    value={statsData.totalShips}
                    icon="https://cdn.lordicon.com/prjriwwv.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />

                {/* Beklemede */}
                <StatCard
                    title="Beklemede"
                    value={statsData.beklemede}
                    icon="https://cdn.lordicon.com/ybkyryaa.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#2b87b1"
                />

                {/* Gecikmeli */}
                <StatCard
                    title="Gecikmeli"
                    value={statsData.gecikmeli}
                    icon="https://cdn.lordicon.com/psyssele.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#2b87b1"
                />

                {/* Yolda */}
                <StatCard
                    title="Yolda"
                    value={statsData.yolda}
                    icon="https://cdn.lordicon.com/umnbegnd.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />

                {/* Demirde */}
                <StatCard
                    title="Demirde"
                    value={statsData.demirde}
                    icon="https://cdn.lordicon.com/chdqxbbu.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />
            </div>
        </>
    );
}