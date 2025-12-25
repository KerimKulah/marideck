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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Loader2, CheckSquare, X, FileText, User, Ship, Anchor, Users, Clock, Briefcase, List, CheckCircle2, ChevronDown, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "@/api/axios"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"

const taskFormSchema = z.object({
    title: z.string().min(1, "Görev başlığı zorunludur"),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
    dueDate: z.date()
        .optional()
        .refine((date) => {
            if (!date) return true; // Optional field, can be undefined
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            return selectedDate >= today;
        }, {
            message: "Bitiş tarihi bugünden önce olamaz"
        }),
    assignedToId: z.array(z.number()).min(1, "En az bir kişi atanmalıdır"),
    customerId: z.number().optional().nullable(),
    shipId: z.number().optional().nullable(),
    operationId: z.number().optional().nullable(),
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
    const [users, setUsers] = useState<Array<{ id: number; firstName: string; lastName: string; email?: string }>>([])
    const [customers, setCustomers] = useState<Array<{ id: number; name: string }>>([])
    const [ships, setShips] = useState<Array<{ id: number; name: string; imoNumber?: string }>>([])
    const [operations, setOperations] = useState<Array<{ id: number; name: string }>>([])
    const [loadingData, setLoadingData] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [filteredUsers, setFilteredUsers] = useState<Array<{ id: number; firstName: string; lastName: string; email?: string }>>([])
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [relationType, setRelationType] = useState<'customer' | 'ship' | 'operation' | null>(null)

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues: {
            title: "",
            description: "",
            status: 'pending',
            priority: 'medium',
            dueDate: undefined,
            assignedToId: [],
            customerId: null,
            shipId: null,
            operationId: null,
        },
    })

    // Fetch users, customers, ships, operations
    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    const fetchData = async () => {
        setLoadingData(true)
        try {
            const params = new URLSearchParams();
            params.append('limit', '1000');

            const [usersRes, customersRes, shipsRes, operationsRes] = await Promise.all([
                api.get(`/users?${params.toString()}`),
                api.get(`/customer?${params.toString()}`),
                api.get(`/ship?${params.toString()}`),
                api.get(`/operation?${params.toString()}`)
            ])

            setUsers(usersRes.data.users || usersRes.data || [])
            setCustomers(customersRes.data.customers || customersRes.data || [])
            setShips(shipsRes.data.ships || shipsRes.data || [])
            setOperations(operationsRes.data.operations || operationsRes.data || [])
        } catch (error: any) {
            console.error("Veri yüklenirken hata:", error)
            toast.error("Veriler yüklenirken bir hata oluştu")
        } finally {
            setLoadingData(false)
        }
    }

    // Filter users based on search
    useEffect(() => {
        if (userSearch) {
            setFilteredUsers(
                users.filter(user => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
                    return (
                        fullName.includes(userSearch.toLowerCase()) ||
                        user.email?.toLowerCase().includes(userSearch.toLowerCase())
                    );
                })
            );
        } else {
            setFilteredUsers(users);
        }
    }, [userSearch, users]);

    // Sync selectedUserIds with form
    useEffect(() => {
        setSelectedUserIds(form.watch('assignedToId') || [])
    }, [form.watch('assignedToId')])

    useEffect(() => {
        if (task) {
            const userIds = task.assignedTo?.map(u => u.id) || []
            setSelectedUserIds(userIds)

            // İlişki tipini belirle
            if (task.customer?.id) {
                setRelationType('customer')
            } else if (task.ship?.id) {
                setRelationType('ship')
            } else if (task.operation?.id) {
                setRelationType('operation')
            } else {
                setRelationType(null)
            }

            form.reset({
                title: task.title || "",
                description: task.description || "",
                status: task.status || 'pending',
                priority: task.priority || 'medium',
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                assignedToId: userIds,
                customerId: task.customer?.id || null,
                shipId: task.ship?.id || null,
                operationId: task.operation?.id || null,
            })
        } else {
            resetForm()
        }
    }, [task, open])

    // İlişki tipi değiştiğinde diğerlerini temizle
    useEffect(() => {
        if (relationType === 'customer') {
            form.setValue('shipId', null)
            form.setValue('operationId', null)
        } else if (relationType === 'ship') {
            form.setValue('customerId', null)
            form.setValue('operationId', null)
        } else if (relationType === 'operation') {
            form.setValue('customerId', null)
            form.setValue('shipId', null)
        } else {
            form.setValue('customerId', null)
            form.setValue('shipId', null)
            form.setValue('operationId', null)
        }
    }, [relationType])

    // Form değerlerinden ilişki tipini belirle
    useEffect(() => {
        const customerId = form.watch('customerId')
        const shipId = form.watch('shipId')
        const operationId = form.watch('operationId')

        if (customerId) {
            setRelationType('customer')
        } else if (shipId) {
            setRelationType('ship')
        } else if (operationId) {
            setRelationType('operation')
        } else {
            setRelationType(null)
        }
    }, [form.watch('customerId'), form.watch('shipId'), form.watch('operationId')])

    const toggleUserSelection = (userId: number) => {
        const newSelectedUserIds = selectedUserIds.includes(userId)
            ? selectedUserIds.filter(id => id !== userId)
            : [...selectedUserIds, userId];

        setSelectedUserIds(newSelectedUserIds);
        form.setValue('assignedToId', newSelectedUserIds, { shouldValidate: true });
    }

    const onSubmit = async (data: TaskFormValues) => {
        try {
            setIsSubmitting(true)

            const submitData = {
                ...data,
                dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
                customerId: data.customerId || undefined,
                shipId: data.shipId || undefined,
                operationId: data.operationId || undefined,
            }

            if (task) {
                await dispatch(updateTask({ id: task.id.toString(), data: submitData })).unwrap()
                toast.success("Görev başarıyla güncellendi")
            } else {
                await dispatch(createTask(submitData)).unwrap()
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
        setSelectedUserIds([])
        setUserSearch("")
        setRelationType(null)
        form.reset({
            title: "",
            description: "",
            status: 'pending',
            priority: 'medium',
            dueDate: undefined,
            assignedToId: [],
            customerId: null,
            shipId: null,
            operationId: null,
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
            <DialogContent className="w-[95vw] lg:min-w-[1000px] max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        {task ? "Görev Bilgilerini Düzenle" : "Yeni Görev Oluştur"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Profil Header - Kompakt */}
                        {task && task.id && (
                            <div className="flex items-center gap-4 py-4 border-b">
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                                    <CheckSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-foreground break-words">
                                        {task.title || 'Görev'}
                                    </h3>
                                    {task.description && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                            <span className="text-sm text-muted-foreground break-words line-clamp-1">
                                                {task.description}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bilgiler Grid - 2x2 Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 min-w-0">
                            {/* Sol Üst: Temel Bilgiler */}
                            <div className="bg-muted/30 rounded-lg border p-3 space-y-2.5">
                                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 pb-1.5 border-b">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    Temel Bilgiler
                                </h4>
                                <div className="space-y-2.5">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-muted-foreground">
                                                    Görev Başlığı <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Görev başlığını giriniz" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Durum <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Durum seçiniz" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {statusOptions.map(option => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Öncelik <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Öncelik seçiniz" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {priorityOptions.map(option => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                <FormLabel className="text-xs text-muted-foreground">
                                                    Son Tarih
                                                </FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                {field.value ? (
                                                                    format(field.value, "PPP", { locale: tr })
                                                                ) : (
                                                                    <span>Tarih seçin</span>
                                                                )}
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            autoFocus={true}
                                                            locale={tr}
                                                            disabled={(date) => {
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                return date < today;
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Sağ Üst: Açıklama */}
                            <div className="bg-muted/30 rounded-lg border p-3 space-y-2">
                                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 pb-1.5 border-b">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                    Açıklama
                                </h4>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    {...field}
                                                    className="min-h-[120px] resize-none text-sm"
                                                    placeholder="Görev ile ilgili detaylı açıklamaları buraya yazın..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Sol Alt: İlişkilendirme */}
                            <div className="bg-muted/30 rounded-lg border p-3 space-y-2.5">
                                <div className="flex items-center gap-1.5 pb-1.5 border-b">
                                    <Link2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                    <span className="text-xs font-semibold text-foreground">İlişkilendirme</span>
                                    {(form.watch('customerId') || form.watch('shipId') || form.watch('operationId')) && (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Bu görevi bir müşteri, gemi veya operasyon ile ilişkilendirebilirsiniz. Sadece bir ilişki seçebilirsiniz.
                                </p>
                                <div className="space-y-2.5">
                                    {/* İlişki Tipi Seçimi */}
                                    <div className="space-y-2">
                                        <FormLabel className="text-xs text-muted-foreground">
                                            Görevin İlişkili Olduğu
                                        </FormLabel>
                                        <Select
                                            value={relationType || 'none'}
                                            onValueChange={(value) => {
                                                if (value === 'none') {
                                                    setRelationType(null)
                                                    form.setValue('customerId', null)
                                                    form.setValue('shipId', null)
                                                    form.setValue('operationId', null)
                                                } else {
                                                    setRelationType(value as 'customer' | 'ship' | 'operation')
                                                }
                                            }}
                                            disabled={loadingData}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">İlişki yok</SelectItem>
                                                <SelectItem value="customer">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3.5 w-3.5" />
                                                        <span>Müşteri</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="ship">
                                                    <div className="flex items-center gap-2">
                                                        <Ship className="h-3.5 w-3.5" />
                                                        <span>Gemi</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="operation">
                                                    <div className="flex items-center gap-2">
                                                        <Anchor className="h-3.5 w-3.5" />
                                                        <span>Operasyon</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Seçilen Tipe Göre Öğe Seçimi */}
                                    {relationType && (
                                        <div className="space-y-2.5">
                                            {relationType === 'customer' && (
                                                <FormField
                                                    control={form.control}
                                                    name="customerId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <User className="h-3.5 w-3.5" />
                                                                Müşteri Seçiniz
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value ? parseInt(value) : null)
                                                                    }}
                                                                    value={field.value?.toString() || undefined}
                                                                    disabled={loadingData}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Müşteri seçiniz" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {customers.map(customer => (
                                                                            <SelectItem key={customer.id} value={customer.id.toString()}>
                                                                                {customer.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {relationType === 'ship' && (
                                                <FormField
                                                    control={form.control}
                                                    name="shipId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <Ship className="h-3.5 w-3.5" />
                                                                Gemi Seçiniz
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value ? parseInt(value) : null)
                                                                    }}
                                                                    value={field.value?.toString() || undefined}
                                                                    disabled={loadingData}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Gemi seçiniz" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {ships.map(ship => (
                                                                            <SelectItem key={ship.id} value={ship.id.toString()}>
                                                                                {ship.name}{ship.imoNumber ? ` (${ship.imoNumber})` : ''}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            {relationType === 'operation' && (
                                                <FormField
                                                    control={form.control}
                                                    name="operationId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs text-muted-foreground flex items-center gap-2">
                                                                <Anchor className="h-3.5 w-3.5" />
                                                                Operasyon Seçiniz
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value ? parseInt(value) : null)
                                                                    }}
                                                                    value={field.value?.toString() || undefined}
                                                                    disabled={loadingData}
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Operasyon seçiniz" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {operations.map(operation => (
                                                                            <SelectItem key={operation.id} value={operation.id.toString()}>
                                                                                {operation.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sağ Alt: Atanan Çalışanlar */}
                            <div className="bg-muted/30 rounded-lg border p-3 space-y-2.5">
                                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 pb-1.5 border-b">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    Atanan Çalışanlar
                                    <span className="text-xs font-normal text-muted-foreground">
                                        ({selectedUserIds.length} seçili)
                                    </span>
                                </h4>
                                <div className="border rounded-lg overflow-hidden bg-background">
                                    <div className="p-2 bg-muted/50 border-b">
                                        <Input
                                            placeholder="Kullanıcı ara..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="max-h-40 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => {
                                                const isSelected = selectedUserIds.includes(user.id);
                                                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                                                const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

                                                return (
                                                    <div
                                                        key={user.id}
                                                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? 'bg-muted/60' : ''
                                                            } border-b last:border-b-0`}
                                                        onClick={() => toggleUserSelection(user.id)}
                                                    >
                                                        {/* Avatar */}
                                                        <div className="relative flex-shrink-0">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                                                                    {initials || user.email?.[0]?.toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {isSelected && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-foreground border-2 border-background flex items-center justify-center">
                                                                    <CheckCircle2 className="h-2.5 w-2.5 text-background" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* İsim ve Email */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-semibold text-foreground truncate">
                                                                {fullName || user.email}
                                                            </div>
                                                            {user.email && fullName && (
                                                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                                            )}
                                                        </div>

                                                        {/* Role/Department - Şimdilik boş, backend'den gelirse eklenebilir */}
                                                        <div className="text-xs text-muted-foreground uppercase flex-shrink-0">
                                                            {/* {user.role || user.department || ''} */}
                                                        </div>

                                                        {/* Checkbox - Sağda */}
                                                        <div
                                                            className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors flex-shrink-0 ${isSelected ? 'bg-foreground border-foreground' : 'border-muted-foreground/30'
                                                                }`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleUserSelection(user.id)
                                                            }}
                                                        >
                                                            {isSelected && (
                                                                <svg className="h-3 w-3 text-background" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <div className="text-sm">Kullanıcı bulunamadı</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {form.formState.errors.assignedToId && (
                                    <p className="text-sm font-medium text-destructive mt-2">
                                        {form.formState.errors.assignedToId.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || loadingData}
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
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
