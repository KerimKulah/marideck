"use client"

import { useEffect, useState } from "react"
import React from "react"
import { Ship, Users, Anchor, CheckSquare, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getShipStatistics } from "@/redux/slices/shipSlice"
import { getCustomerStatistics } from "@/redux/slices/customerSlice"
import { getOperationStatistics } from "@/redux/slices/operationSlice"
import { getTaskStatistics } from "@/redux/slices/taskSlice"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

type StatItem = {
    label: string
    value: number | string
    icon: React.ReactNode
    color: string
    link?: string
}

export const StatisticsWidget = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [currentIndex, setCurrentIndex] = useState(0)

    const { statistics: shipStats, statisticsLoading: shipLoading } = useSelector((state: RootState) => state.ship)
    const { statistics: customerStats, statisticsLoading: customerLoading } = useSelector((state: RootState) => state.customer)
    const { statistics: operationStats, statisticsLoading: operationLoading } = useSelector((state: RootState) => state.operation)
    const { statistics: taskStats, statisticsLoading: taskLoading } = useSelector((state: RootState) => state.task)

    useEffect(() => {
        dispatch(getShipStatistics())
        dispatch(getCustomerStatistics())
        dispatch(getOperationStatistics())
        dispatch(getTaskStatistics())
    }, [dispatch])

    const isLoading = shipLoading || customerLoading || operationLoading || taskLoading

    const stats: StatItem[] = [
        {
            label: "Toplam Gemi",
            value: shipStats?.totalShips ?? 0,
            icon: <Ship className="h-4 w-4" />,
            color: "text-blue-600",
            link: "/ships"
        },
        {
            label: "Müşteriler",
            value: customerStats?.totalCustomers ?? 0,
            icon: <Users className="h-4 w-4" />,
            color: "text-green-600",
            link: "/customers"
        },
        {
            label: "Aktif Operasyon",
            value: operationStats?.activeOperations ?? 0,
            icon: <Anchor className="h-4 w-4" />,
            color: "text-purple-600",
            link: "/operations"
        },
        {
            label: "Toplam Görev",
            value: taskStats?.allTasksAll ?? 0,
            icon: <CheckSquare className="h-4 w-4" />,
            color: "text-orange-600",
            link: "/tasks"
        }
    ]

    return (
        <Card className="h-full !py-3 !gap-3">
            <CardHeader className="!px-4 !pb-1 pt-2">
                <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-[16px]">Genel Bakış</CardTitle>
                </div>
                <div className="h-[1px] w-full bg-border" />
            </CardHeader>
            <CardContent className="!px-3 sm:!px-4 space-y-3 sm:space-y-4">
                {/* Navigation */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => setCurrentIndex((prev) => (prev === 0 ? stats.length - 1 : prev - 1))}
                        disabled={isLoading}
                    >
                        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>

                    {/* Dots indicator */}
                    <div className="flex gap-1.5 sm:gap-2">
                        {stats.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-primary'
                                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                                    }`}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                        onClick={() => setCurrentIndex((prev) => (prev === stats.length - 1 ? 0 : prev + 1))}
                        disabled={isLoading}
                    >
                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                </div>

                {/* Slider kısmı */}
                <div className="relative overflow-hidden rounded-xl">
                    <div
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {stats.map((stat, index) => (
                            <div key={index} className="min-w-full flex-shrink-0">
                                <Link
                                    href={stat.link || "#"}
                                    className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 p-4 sm:p-5 md:p-6 rounded-xl bg-gradient-to-br from-background to-muted/30 hover:from-muted/50 hover:to-muted/70 border border-border/50 hover:border-primary/20 text-foreground transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                                >
                                    <div className={`${stat.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        {React.cloneElement(stat.icon as React.ReactElement<{ className: string }>, { className: "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14" })}
                                    </div>
                                    {isLoading ? (
                                        <div className="space-y-2 text-center">
                                            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mx-auto" />
                                            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mx-auto" />
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                {stat.label}
                                            </p>
                                            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                                                {stat.value}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

