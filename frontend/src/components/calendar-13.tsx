"use client"

import * as React from 'react'
import dynamic from 'next/dynamic'
import { enUS } from 'date-fns/locale'

const Calendar = dynamic<React.ComponentProps<typeof import('@/components/ui/calendar').Calendar>>(
  () => import('@/components/ui/calendar').then((mod) => mod.Calendar),
  { ssr: false }
)
import { DateRange } from 'react-day-picker'

export default function Calendar13() {
  const [dropdown] =
    React.useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown"
    )
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    {
      from: new Date(),
      to: new Date(),
    }
  )

  return (
    <>
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from}
        numberOfMonths={1}
        selected={dateRange}
        onSelect={setDateRange}
        captionLayout={dropdown}
        className="rounded-lg border shadow-sm"
        locale={enUS}
      />
    </>
  )
}
