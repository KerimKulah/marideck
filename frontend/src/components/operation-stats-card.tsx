"use client"

import React, { useMemo, useEffect, memo } from 'react';
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

const LordIcon: React.FC<LordIconProps> = memo(({
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

    const iconHtml = useMemo(() => {
        const styleString = Object.entries(style)
            .map(([key, value]) => {
                // Convert camelCase to kebab-case for CSS
                const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${kebabKey}: ${value};`;
            })
            .join(' ');

        return {
            __html: `
                <lord-icon
                    src="${src}"
                    trigger="${trigger}"
                    delay="${delay}"
                    colors="${colors}"
                    style="width: 40px; height: 40px; ${styleString}"
                    class="${className}">
                </lord-icon>
            `
        };
    }, [src, trigger, delay, colors, className, style]);

    return <div dangerouslySetInnerHTML={iconHtml} />;
});

LordIcon.displayName = 'LordIcon';

interface OperationStatsCardsProps {
    statistics: {
        myOperations?: number; // Geriye dönük uyumluluk
        myOperationsActive?: number;
        myOperationsCompleted?: number;
        activeOperations: number;
        completedOperations: number;
    } | null;
}

// Memoize the style object to prevent unnecessary re-renders
const iconStyle = { width: '60px', height: '60px' };

const StatCard = memo(({ title, value, icon, iconType, bgColor, iconColor, trigger, colors, delay = '1000' }: any) => (
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
                            style={iconStyle}
                        />
                    </div>
                ) : (
                    <div className="h-6 w-6 text-white" />
                )}
            </div>
        </div>
    </div>
));

StatCard.displayName = 'StatCard';

const OperationStatsCards = memo(({ statistics }: OperationStatsCardsProps) => {
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
}, (prevProps, nextProps) => {
    // Custom comparison: Only re-render if statistics values actually changed
    if (!prevProps.statistics && !nextProps.statistics) return true; // Both null, no change
    if (!prevProps.statistics || !nextProps.statistics) return false; // One is null, changed

    return (
        prevProps.statistics.myOperations === nextProps.statistics.myOperations &&
        prevProps.statistics.activeOperations === nextProps.statistics.activeOperations &&
        prevProps.statistics.completedOperations === nextProps.statistics.completedOperations &&
        prevProps.statistics.myOperationsActive === nextProps.statistics.myOperationsActive &&
        prevProps.statistics.myOperationsCompleted === nextProps.statistics.myOperationsCompleted
    );
});

OperationStatsCards.displayName = 'OperationStatsCards';

export default OperationStatsCards;