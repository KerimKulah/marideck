import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Form kullanımı için örnek:
/*
<FormField
  control={form.control}
  name="eta"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        ETA (Tahmini Varış)
      </FormLabel>
      <FormControl>
        <DateTimePicker
          value={field.value}
          onChange={field.onChange}
          placeholder="Tarih ve saat seçin"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
*/

interface DateTimePickerProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    placeholder = "Tarih ve saat seçin",
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState(value?.getHours() || 0);
    const [selectedMinute, setSelectedMinute] = useState(value?.getMinutes() || 0);

    useEffect(() => {
        if (value) {
            setSelectedDate(value);
            setSelectedHour(value.getHours());
            setSelectedMinute(value.getMinutes());
            setCurrentMonth(value);
        }
    }, [value]);

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ' ' + date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return firstDay === 0 ? 6 : firstDay - 1; // Pazartesi = 0
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDate = (date1: Date, date2: Date | null) => {
        if (!date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, selectedHour, selectedMinute);
        setSelectedDate(newDate);
        onChange(newDate);
    };

    const handleTimeChange = (hour: number, minute: number) => {
        setSelectedHour(hour);
        setSelectedMinute(minute);

        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(hour, minute);
            setSelectedDate(newDate);
            onChange(newDate);
        }
    };

    const handleClear = () => {
        setSelectedDate(null);
        onChange(null);
        setIsOpen(false);
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Boş günler
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Günler
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = date < today;

            days.push(
                <button
                    key={day}
                    onClick={() => !isPast && handleDateSelect(day)}
                    disabled={isPast}
                    className={cn(
                        "h-8 w-8 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isToday(date) && "bg-accent text-accent-foreground font-medium",
                        isSameDate(date, selectedDate) && "bg-primary text-primary-foreground font-medium"
                    )}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    {selectedDate ? formatDate(selectedDate) : placeholder}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="start">
                <div className="p-4">
                    {/* Ay/Yıl Seçici */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={previousMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="font-medium">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={nextMonth}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Hafta Günleri */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="h-8 w-8 text-xs font-medium text-muted-foreground flex items-center justify-center">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Takvim */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {renderCalendar()}
                    </div>

                    {/* Saat Seçimi */}
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Saat</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedHour}
                                onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute)}
                                className="flex h-8 w-16 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </select>

                            <span className="text-sm">:</span>

                            <select
                                value={selectedMinute}
                                onChange={(e) => handleTimeChange(selectedHour, parseInt(e.target.value))}
                                className="flex h-8 w-16 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <option key={i} value={i}>
                                        {i.toString().padStart(2, '0')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex justify-between pt-4 ">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="text-muted-foreground"
                        >
                            Temizle
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            disabled={!selectedDate}
                        >
                            Tamam
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};