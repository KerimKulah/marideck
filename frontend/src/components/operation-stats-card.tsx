"use client"

import React, { useMemo, useEffect } from 'react';
import Script from 'next/script';
import { OperationStatus } from '@/lib/operation-status';

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

interface OperationStatsCardsProps {
    statistics: {
        myOperations?: number; // Geriye dönük uyumluluk
        myOperationsActive?: number;
        myOperationsCompleted?: number;
        activeOperations: number;
        completedOperations: number;
    } | null;
}

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

export default function OperationStatsCards({ statistics }: OperationStatsCardsProps) {
    const stats = useMemo(() => {
        if (!statistics) {
            return {
                myOperations: 0,
                activeOperations: 0,
                completedOperations: 0,
            };
        }

        return {
            myOperations: statistics.myOperations,
            activeOperations: statistics.activeOperations,
            completedOperations: statistics.completedOperations,
        };
    }, [statistics]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Benim Operasyonlarım */}
                <StatCard
                    title="Benim Operasyonlarım"
                    value={stats.myOperations}
                    icon="https://cdn.lordicon.com/srupsmbe.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#348db5"
                />

                {/* Toplam Aktif Operasyon */}
                <StatCard
                    title="Toplam Aktif Operasyon"
                    value={stats.activeOperations}
                    icon="https://cdn.lordicon.com/pmivedvy.json"
                    iconType="lordicon"
                    bgColor="bg-white"
                    iconColor="bg-white"
                    trigger="hover"
                    colors="primary:#121331,secondary:#2b87b1"
                />

                {/* Tamamlanan Operasyonlar */}
                <StatCard
                    title="Tamamlanan Operasyonlar"
                    value={stats.completedOperations}
                    icon="https://cdn.lordicon.com/rhmbrqqg.json"
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