"use client"

import { WeatherWidget } from "@/components/weather-widget"
import Calendar13 from "@/components/calendar-13"

export default function Page() {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Hava durumu */}
      <WeatherWidget />

      {/* Takvim */}
      <Calendar13 />

      {/* Diğer içerikler buraya gelecek */}
      {/* Personeller kendileirne atanan operasyon/görevleri ayrıca görebilmeli */}
      {/* Finans için rol eklenmeli */}
    </div>
  )
}