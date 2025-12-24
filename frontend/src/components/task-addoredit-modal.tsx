"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { toast } from "sonner"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { createTask, updateTask, Task, TaskStatus, TaskPriority } from "@/redux/slices/taskSlice"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Loader2, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"

const taskFormSchema = z.object({
    title: z.string().min(1, "Görev başlığı zorunludur"),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
    dueDate: z.date().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskAddOrEditModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    task?: Task | null
    onSuccess?: () => void
}

const statusOptions = [
    { value: 'pending' as TaskStatus, label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress' as TaskStatus, label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed' as TaskStatus, label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
]

const priorityOptions = [
    { value: 'low' as TaskPriority, label: 'Düşük', color: 'bg-green-100 text-green-800' },
    { value: 'medium' as TaskPriority, label: 'Orta', color: 'bg-amber-100 text-amber-800' },
    { value: 'high' as TaskPriority, label: 'Yüksek', color: 'bg-red-100 text-red-800' },
]

export function TaskAddOrEditModal({
    open,
    onOpenChange,
    task,
    onSuccess
}: TaskAddOrEditModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: "",
            description: "",
            status: 'pending',
            priority: 'medium',
            dueDate: undefined,
        },
    })

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title || "",
                description: task.description || "",
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            })
        } else {
            resetForm()
        }
    }, [task, open])

    const onSubmit = async (data: TaskFormValues) => {
        try {
            setIsSubmitting(true)

            if (task) {
                await dispatch(updateTask({ id: task.id.toString(), data })).unwrap()
                toast.success("Görev başarıyla güncellendi")
            } else {
                await dispatch(createTask(data)).unwrap()
                toast.success("Görev başarıyla oluşturuldu")
            }

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Görev kaydedilirken hata oluştu:", error)
            toast.error("Görev kaydedilirken bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        form.reset({
            title: "",
            description: "",
            status: 'pending',
            priority: 'medium',
            dueDate: undefined,
        })
        form.clearErrors()
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm()
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-6 border-b border-gray-100">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CheckSquare className="h-6 w-6 text-black" />
                        </div>
                        {task ? "Görevi Düzenle" : "Yeni Görev Oluştur"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        {task ? "Mevcut görevin bilgilerini güncelleyin" : "Yeni bir görev oluşturmak için aşağıdaki bilgileri doldurun"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">Görev Başlığı</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                placeholder="Görev başlığını giriniz"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Durum</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Öncelik</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-11 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    {priorityOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-sm font-medium text-gray-700">Son Tarih (Opsiyonel)</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-11 pl-3 text-left font-normal border-gray-300 hover:border-blue-400 hover:bg-blue-50",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: tr })
                                                        ) : (
                                                            <span className="text-gray-500">Tarih seçin</span>
                                                        )}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">Açıklama (Opsiyonel)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-200 resize-none"
                                                placeholder="Görev ile ilgili detaylı açıklamaları buraya yazın..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="pt-6 border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            onClick={form.handleSubmit(onSubmit)}
                            className="flex-1 sm:flex-none bg-black hover:bg-black/80 text-white font-medium px-8"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    {task ? 'Güncelle' : 'Oluştur'}
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

