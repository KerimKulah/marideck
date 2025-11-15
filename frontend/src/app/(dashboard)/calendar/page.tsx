"use client"

import { useState, useMemo } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, setYear } from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Ship, FileText, CheckSquare, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// Event tipi - ileride farklı veri kaynaklarından gelecek
export interface CalendarEvent {
    id: string
    type: 'eta' | 'task' | 'note' | 'document' | 'operation' | 'other'
    title: string
    date: Date
    description?: string
    color?: string
    priority?: 'low' | 'medium' | 'high'
    metadata?: Record<string, any>
}

// Dummy data - ileride Redux veya API'den gelecek
// Şu an: 31 Ekim 2025 - Bundan sonraki 3-4 ay için veriler
const dummyEvents: CalendarEvent[] = [
    // Kasım 2025
    {
        id: '1',
        type: 'eta',
        title: 'MSC Cargo Varış',
        date: new Date(2025, 10, 2),
        description: 'İstanbul Limanı - Konteyner gemisi',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '2',
        type: 'operation',
        title: 'Boşaltma Operasyonu',
        date: new Date(2025, 10, 3),
        description: 'Mersin Limanı - 500 konteyner',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '3',
        type: 'task',
        title: 'Kasım Ayı Raporu',
        date: new Date(2025, 10, 5),
        description: 'Kasım ayı operasyon raporu hazırlama',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '4',
        type: 'document',
        title: 'Belge Yenileme',
        date: new Date(2025, 10, 8),
        description: 'Gemi belgeleri kontrol ve yenileme',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '5',
        type: 'eta',
        title: 'CMA CGM Varış',
        date: new Date(2025, 10, 10),
        description: 'İzmir Limanı',
        color: 'bg-blue-500',
        priority: 'medium'
    },
    {
        id: '6',
        type: 'note',
        title: 'Müşteri Toplantısı',
        date: new Date(2025, 10, 12),
        description: 'ABC Shipping ile görüşme',
        color: 'bg-yellow-500',
        priority: 'low'
    },
    {
        id: '7',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2025, 10, 15),
        description: 'İstanbul Limanı - Tekstil ürünleri',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '8',
        type: 'task',
        title: 'Güvenlik Denetimi',
        date: new Date(2025, 10, 18),
        description: 'Tüm gemi belgeleri kontrol edilecek',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '9',
        type: 'eta',
        title: 'Maersk Line Varış',
        date: new Date(2025, 10, 20),
        description: 'Mersin Limanı - Büyük konteyner gemisi',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '10',
        type: 'operation',
        title: 'Boşaltma Operasyonu',
        date: new Date(2025, 10, 22),
        description: 'Maersk Line - İstanbul Limanı',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '11',
        type: 'document',
        title: 'Gümrük Belgeleri',
        date: new Date(2025, 10, 25),
        description: 'Mersin Limanı gümrük işlemleri',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '12',
        type: 'task',
        title: 'Mali Rapor Hazırlama',
        date: new Date(2025, 10, 28),
        description: 'Kasım ayı mali raporu',
        color: 'bg-green-500',
        priority: 'medium'
    },

    // Aralık 2025
    {
        id: '13',
        type: 'eta',
        title: 'Evergreen Varış',
        date: new Date(2025, 11, 1),
        description: 'İzmir Limanı',
        color: 'bg-blue-500',
        priority: 'medium'
    },
    {
        id: '14',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2025, 11, 3),
        description: 'Mersin Limanı - Otomotiv parçaları',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '15',
        type: 'document',
        title: 'Sigorta Belgesi Yenileme',
        date: new Date(2025, 11, 5),
        description: 'Gemi sigorta belgeleri',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '16',
        type: 'task',
        title: 'Yılsonu Planlama',
        date: new Date(2025, 11, 8),
        description: '2026 yılı operasyon planlaması',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '17',
        type: 'eta',
        title: 'COSCO Varış',
        date: new Date(2025, 11, 10),
        description: 'İstanbul Limanı',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '18',
        type: 'operation',
        title: 'Boşaltma Operasyonu',
        date: new Date(2025, 11, 12),
        description: 'COSCO - Mersin Limanı',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '19',
        type: 'note',
        title: 'Personel Değerlendirme',
        date: new Date(2025, 11, 15),
        description: 'Yıllık personel performans değerlendirmesi',
        color: 'bg-yellow-500',
        priority: 'low'
    },
    {
        id: '20',
        type: 'task',
        title: 'Yılsonu Raporu',
        date: new Date(2025, 11, 18),
        description: '2025 yılsonu genel rapor',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '21',
        type: 'eta',
        title: 'Hapag-Lloyd Varış',
        date: new Date(2025, 11, 20),
        description: 'İstanbul Limanı',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '22',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2025, 11, 22),
        description: 'Hapag-Lloyd - İzmir Limanı',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '23',
        type: 'document',
        title: 'Vergi Beyannamesi',
        date: new Date(2025, 11, 28),
        description: 'Aralık ayı vergi beyannamesi',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '24',
        type: 'note',
        title: 'Yeni Yıl Hazırlıkları',
        date: new Date(2025, 11, 30),
        description: '2026 yılı operasyon planlaması',
        color: 'bg-yellow-500',
        priority: 'low'
    },

    // Ocak 2026
    {
        id: '25',
        type: 'eta',
        title: 'ONE Varış',
        date: new Date(2026, 0, 3),
        description: 'İstanbul Limanı',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '26',
        type: 'task',
        title: 'Yeni Yıl Başlangıç Toplantısı',
        date: new Date(2026, 0, 5),
        description: 'Tüm ekip ile toplantı',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '27',
        type: 'document',
        title: 'Lisans Kontrolü',
        date: new Date(2026, 0, 8),
        description: 'Yıllık lisans kontrol tarihi',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '28',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2026, 0, 10),
        description: 'Mersin Limanı - Yeni yıl ilk operasyon',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '29',
        type: 'eta',
        title: 'MSC Cargo Varış',
        date: new Date(2026, 0, 12),
        description: 'İzmir Limanı',
        color: 'bg-blue-500',
        priority: 'medium'
    },
    {
        id: '30',
        type: 'task',
        title: 'Ocak Ayı Planı',
        date: new Date(2026, 0, 15),
        description: 'Ocak ayı operasyon planı',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '31',
        type: 'operation',
        title: 'Boşaltma Operasyonu',
        date: new Date(2026, 0, 18),
        description: 'MSC Cargo - İstanbul Limanı',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '32',
        type: 'document',
        title: 'Belge Yenileme',
        date: new Date(2026, 0, 20),
        description: 'Gemi belgeleri kontrol',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '33',
        type: 'note',
        title: 'Müşteri Ziyareti',
        date: new Date(2026, 0, 22),
        description: 'Önemli müşteri ziyareti',
        color: 'bg-yellow-500',
        priority: 'low'
    },
    {
        id: '34',
        type: 'eta',
        title: 'Maersk Line Varış',
        date: new Date(2026, 0, 25),
        description: 'Mersin Limanı',
        color: 'bg-blue-500',
        priority: 'high'
    },

    // Şubat 2026
    {
        id: '35',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2026, 1, 2),
        description: 'İstanbul Limanı - Elektronik ürünler',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '36',
        type: 'task',
        title: 'Şubat Ayı Raporu',
        date: new Date(2026, 1, 5),
        description: 'Şubat ayı operasyon raporu',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '37',
        type: 'eta',
        title: 'CMA CGM Varış',
        date: new Date(2026, 1, 8),
        description: 'İzmir Limanı',
        color: 'bg-blue-500',
        priority: 'medium'
    },
    {
        id: '38',
        type: 'document',
        title: 'Gümrük İşlemleri',
        date: new Date(2026, 1, 10),
        description: 'Mersin Limanı gümrük belgeleri',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '39',
        type: 'operation',
        title: 'Boşaltma Operasyonu',
        date: new Date(2026, 1, 12),
        description: 'CMA CGM - İstanbul Limanı',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '40',
        type: 'task',
        title: 'Güvenlik Eğitimi',
        date: new Date(2026, 1, 15),
        description: 'Personel güvenlik eğitimi',
        color: 'bg-green-500',
        priority: 'medium'
    },
    {
        id: '41',
        type: 'eta',
        title: 'Evergreen Varış',
        date: new Date(2026, 1, 18),
        description: 'Mersin Limanı',
        color: 'bg-blue-500',
        priority: 'high'
    },
    {
        id: '42',
        type: 'note',
        title: 'Toplantı',
        date: new Date(2026, 1, 20),
        description: 'Operasyon ekibi toplantısı',
        color: 'bg-yellow-500',
        priority: 'low'
    },
    {
        id: '43',
        type: 'operation',
        title: 'Yükleme Operasyonu',
        date: new Date(2026, 1, 22),
        description: 'İzmir Limanı - Gıda ürünleri',
        color: 'bg-purple-500',
        priority: 'high'
    },
    {
        id: '44',
        type: 'document',
        title: 'Lisans Yenileme',
        date: new Date(2026, 1, 25),
        description: 'Denizcilik lisansı yenileme',
        color: 'bg-orange-500',
        priority: 'high'
    },
    {
        id: '45',
        type: 'task',
        title: 'Mali Rapor',
        date: new Date(2026, 1, 28),
        description: 'Şubat ayı mali raporu',
        color: 'bg-green-500',
        priority: 'medium'
    },
]

const eventTypeIcons = {
    eta: Ship,
    task: CheckSquare,
    note: FileText,
    document: FileText,
    operation: Ship,
    other: CalendarIcon,
}

const eventTypeLabels = {
    eta: 'ETA',
    task: 'Görev',
    note: 'Not',
    document: 'Belge',
    operation: 'Operasyon',
    other: 'Diğer',
}

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Pazartesi başlangıç
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const calendarDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    })

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    // Yıl seçenekleri (mevcut yıldan önceki 5 yıl, sonraki 5 yıl)
    const currentYear = new Date().getFullYear()
    const availableYears = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

    const previousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1))
    }

    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1))
    }

    const goToToday = () => {
        const today = new Date()
        setCurrentMonth(today)
        setSelectedDate(today)
    }

    const handleYearChange = (year: string) => {
        setCurrentMonth(setYear(currentMonth, parseInt(year)))
    }

    // Seçilen güne ait etkinlikleri getir
    const selectedDayEvents = useMemo(() => {
        if (!selectedDate) return []
        return dummyEvents.filter(event =>
            isSameDay(event.date, selectedDate)
        )
    }, [selectedDate])

    // Gün için etkinlik sayısını getir
    const getDayEventCount = (day: Date) => {
        return dummyEvents.filter(event => isSameDay(event.date, day)).length
    }

    // Gün için etkinlikleri getir (max 3 gösterim için)
    const getDayEvents = (day: Date) => {
        return dummyEvents.filter(event => isSameDay(event.date, day)).slice(0, 3)
    }

    return (
        <div className="grid space-y-3">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToToday}
                                className="h-8 text-xs"
                            >
                                Bugün
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={previousMonth}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextMonth}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select
                                value={format(currentMonth, 'MMMM', { locale: tr })}
                                onValueChange={(month) => {
                                    const monthIndex = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].indexOf(month)
                                    if (monthIndex !== -1) {
                                        setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1))
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'].map((month) => (
                                        <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={currentMonth.getFullYear().toString()}
                                onValueChange={handleYearChange}
                            >
                                <SelectTrigger className="w-[90px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-3">
                    {/* Takvim Grid */}
                    <div className="grid grid-cols-7 gap-1.5" style={{ gridTemplateRows: 'auto repeat(6, 70px)' }}>
                        {/* Hafta günleri başlık */}
                        {weekDays.map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-muted-foreground py-1"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Takvim günleri */}
                        {calendarDays.map((day, dayIdx) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const isCurrentDay = isToday(day)
                            const eventCount = getDayEventCount(day)
                            const dayEvents = getDayEvents(day)

                            return (
                                <div
                                    key={dayIdx}
                                    className={cn(
                                        "relative border rounded-md p-1.5 h-[70px] cursor-pointer transition-colors flex flex-col",
                                        !isCurrentMonth && "opacity-40",
                                        isSelected && "bg-primary/10 border-primary",
                                        !isSelected && "hover:bg-accent/50",
                                        isCurrentDay && !isSelected && "border-primary/50"
                                    )}
                                    onClick={() => setSelectedDate(day)}
                                >
                                    <div className="flex items-center justify-between mb-0.5 shrink-0">
                                        <span
                                            className={cn(
                                                "text-xs font-medium",
                                                isCurrentDay && "bg-primary text-primary-foreground rounded-full size-5 flex items-center justify-center",
                                                isSelected && !isCurrentDay && "text-primary",
                                                !isSelected && !isCurrentDay && "text-foreground"
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {eventCount > 0 && (
                                            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                                {eventCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 flex-1 overflow-hidden">
                                        {dayEvents.map((event) => {
                                            const Icon = eventTypeIcons[event.type]
                                            return (
                                                <div
                                                    key={event.id}
                                                    className={cn(
                                                        "text-[10px] p-0.5 rounded truncate flex items-center gap-0.5",
                                                        event.color || "bg-muted"
                                                    )}
                                                    style={{
                                                        backgroundColor: event.color ? undefined : undefined
                                                    }}
                                                >
                                                    <Icon className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                            )
                                        })}
                                        {eventCount > 2 && (
                                            <div className="text-[10px] text-muted-foreground px-0.5">
                                                +{eventCount - 2}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Seçilen Günün Etkinlikleri */}
            {selectedDate && (
                <Card>
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-base">
                            {format(selectedDate, 'd MMMM yyyy EEEE', { locale: tr })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDayEvents.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <CalendarIcon className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                <p className="text-sm">Bu tarihte etkinlik bulunmamaktadır.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedDayEvents.map((event) => {
                                    const Icon = eventTypeIcons[event.type]
                                    return (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "border rounded-lg p-2.5 hover:bg-accent/50 transition-colors"
                                            )}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className={cn(
                                                    "rounded-lg p-1.5 shrink-0",
                                                    event.color || "bg-muted"
                                                )}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                                        <h4 className="font-semibold text-sm">{event.title}</h4>
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                                            {eventTypeLabels[event.type]}
                                                        </Badge>
                                                        {event.priority === 'high' && (
                                                            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                                                                Yüksek
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {event.description && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                                        <span className="flex items-center gap-0.5">
                                                            <Clock className="h-3 w-3" />
                                                            {format(event.date, 'HH:mm', { locale: tr })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
