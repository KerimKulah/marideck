"use client"

import { WeatherWidget } from "@/components/weather-widget"
import { QuickActionsCard } from "@/components/quick-actions-card"
import { EmbeddedMap } from "@/components/embedded-map"
import { TasksWidget } from "@/components/tasks-widget"
import { StatisticsWidget } from "@/components/statistics-widget"

export default function Page() {
  return (
    <div className="w-full space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Üst satır - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="w-full">
          <StatisticsWidget />
        </div>
        <div className="w-full">
          <WeatherWidget />
        </div>
        <div className="w-full">
          <TasksWidget />
        </div>
        <div className="w-full">
          <QuickActionsCard />
        </div>
      </div>

      {/* Alt satır - Full width */}
      <div className="w-full">
        <EmbeddedMap />
      </div>
    </div>
  )
}