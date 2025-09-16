"use client"

import { WeatherWidget } from "@/components/weather-widget"
import Calendar13 from "@/components/calendar-13"
import { UpcomingShipsCard } from "@/components/upcoming-ships-card"
import { QuickActionsCard } from "@/components/quick-actions-card"
import { EmbeddedMap } from "@/components/embedded-map"
import { TasksWidget } from "@/components/tasks-widget"

export default function Page() {
  return (
    <div className="w-full space-y-6 ">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="col-span-1 max-h-[300px]">
          <WeatherWidget />
        </div>
        <div className="col-span-2 max-h-[300px]">
          <UpcomingShipsCard />
        </div>
        <div className="col-span-1 max-h-[300px]">
          <TasksWidget />
        </div>
        <div className="md:col-span-1 max-h-[300px]">
          <QuickActionsCard />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-4">
          <EmbeddedMap />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <Calendar13 />
        </div>
      </div>
    </div>
  )
}