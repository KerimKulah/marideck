"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createOperation, updateOperation } from "@/redux/slices/operationSlice"
import { getUsers } from "@/redux/slices/userSlice"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Loader2, Plus, X, ChevronRight, Ship, User, Package, MapPin, Clock, FileText, Users, Anchor } from "lucide-react"
import { DateTimePicker } from "./date-time-picker"
import { SelectModal } from "./select-modal"
import { OperationStatus, getOperationStatusTranslation } from "@/lib/operation-status"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const operationFormSchema = z.object({
    name: z.string().min(1, "Operasyon adı zorunludur"),
    type: z.string().min(1, "Operasyon tipi zorunludur"),
    details: z.string().min(1, "Detaylar zorunludur"),
    port: z.string().min(1, "Liman zorunludur"),
    customerId: z.number().min(1, "Müşteri seçimi zorunludur"),
    shipId: z.number().min(1, "Gemi seçimi zorunludur"),
    userId: z.array(z.number()).min(1, "En az bir kullanıcı atanmalıdır"),
    startDate: z.date({
        required_error: "Başlangıç tarihi zorunludur",
    }),
    endDate: z.date({
        required_error: "Bitiş tarihi zorunludur",
    }),
    status: z.nativeEnum(OperationStatus),
    cargoType: z.string().optional(),
    cargoDetails: z.string().optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
    }
    return true;
}, {
    message: "Başlangıç tarihi bitiş tarihinden sonra olamaz",
    path: ["startDate"],
})

type OperationFormValues = z.infer<typeof operationFormSchema>

interface OperationAddOrEditModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation?: any
    onSuccess?: () => void
}

const statusOptions = [
    { value: OperationStatus.PLANNED, label: getOperationStatusTranslation(OperationStatus.PLANNED), color: "bg-yellow-100 text-yellow-800" },
    { value: OperationStatus.IN_PROGRESS, label: getOperationStatusTranslation(OperationStatus.IN_PROGRESS), color: "bg-blue-100 text-blue-800" },
    { value: OperationStatus.COMPLETED, label: getOperationStatusTranslation(OperationStatus.COMPLETED), color: "bg-green-100 text-green-800" },
    { value: OperationStatus.CANCELLED, label: getOperationStatusTranslation(OperationStatus.CANCELLED), color: "bg-red-100 text-red-800" },
]

export function OperationAddOrEditModal({
    open,
    onOpenChange,
    operation,
    onSuccess
}: OperationAddOrEditModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { users } = useSelector((state: RootState) => state.user)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [filteredUsers, setFilteredUsers] = useState(users)
    const [openCustomerModal, setOpenCustomerModal] = useState(false)
    const [openShipModal, setOpenShipModal] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [selectedShip, setSelectedShip] = useState<any>(null)
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])

    useEffect(() => {
        if (open) {
            if (operation && operation.id) {
                setSelectedCustomer(operation.customer || null)
                setSelectedShip(operation.ship || null)
                const userIds = operation.users?.map((u: any) => u.id) || []
                setSelectedUserIds(userIds)

                form.reset({
                    name: operation.name || "",
                    type: operation.type || "",
                    details: operation.details || "",
                    port: operation.port || "",
                    customerId: operation.customer?.id || undefined,
                    shipId: operation.ship?.id || undefined,
                    userId: userIds,
                    startDate: operation.startDate ? new Date(operation.startDate) : undefined,
                    endDate: operation.endDate ? new Date(operation.endDate) : undefined,
                    status: operation.status || OperationStatus.PLANNED,
                    cargoType: operation.cargoType || "",
                    cargoDetails: operation.cargoDetails || "",
                })
            } else {
                // Reset form for new operation
                resetForm()
            }
        }
    }, [operation, open])

    const form = useForm<OperationFormValues>({
        resolver: zodResolver(operationFormSchema),
        defaultValues: {
            name: "",
            type: "",
            details: "",
            port: "",
            customerId: undefined,
            shipId: undefined,
            userId: [],
            startDate: undefined,
            endDate: undefined,
            status: OperationStatus.PLANNED,
            cargoType: "",
            cargoDetails: "",
        },
    })

    useEffect(() => {
        if (operation?.users) {
            const userIds = operation.users.map((u: any) => u.id)
            setSelectedUserIds(userIds)
            form.setValue('userId', userIds)
        }
    }, [operation?.users])

    useEffect(() => {
        dispatch(getUsers({ limit: 100 }))
    }, [dispatch])

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

    const toggleUserSelection = (userId: number) => {
        const newSelectedUserIds = selectedUserIds.includes(userId)
            ? selectedUserIds.filter(id => id !== userId)
            : [...selectedUserIds, userId];

        setSelectedUserIds(newSelectedUserIds);
        form.setValue('userId', newSelectedUserIds, { shouldValidate: true });
    }

    const handleCustomerSelect = (customer: any) => {
        setSelectedCustomer(customer)
        form.setValue("customerId", customer.id)
    }

    const handleShipSelect = (ship: any) => {
        setSelectedShip(ship)
        form.setValue("shipId", ship.id)
    }

    const onSubmit = async (data: OperationFormValues) => {
        try {
            setIsSubmitting(true)
            const operationData = {
                ...data,
                userId: form.getValues("userId"),
                // Tarihleri ISO string formatına çevir ve timezone offset'ini düzelt
                startDate: data.startDate ? new Date(data.startDate.getTime() - (data.startDate.getTimezoneOffset() * 60000)).toISOString() : undefined,
                endDate: data.endDate ? new Date(data.endDate.getTime() - (data.endDate.getTimezoneOffset() * 60000)).toISOString() : undefined,
            }

            if (operation) {
                await dispatch(updateOperation({ id: operation.id, data: operationData })).unwrap()
                toast.success("Operasyon başarıyla güncellendi")
            } else {
                await dispatch(createOperation(operationData)).unwrap()
                toast.success("Operasyon başarıyla oluşturuldu")
            }

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Operasyon kaydedilirken hata oluştu:", error)
            toast.error("Operasyon kaydedilirken bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setSelectedCustomer(null)
        setSelectedShip(null)
        setSelectedUserIds([])
        setUserSearch("")
        form.reset({
            name: "",
            type: "",
            details: "",
            port: "",
            customerId: undefined,
            shipId: undefined,
            userId: [],
            startDate: undefined,
            endDate: undefined,
            status: OperationStatus.PLANNED,
            cargoType: "",
            cargoDetails: "",
        })
        form.clearErrors()
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm()
        } else {
            // Modal açıldığında, eğer operation yoksa veya id yoksa form'u temizle
            if (!operation || !operation.id) {
                resetForm()
            }
        }
        onOpenChange(open)
    }


    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            {operation && operation.id ? (
                                'Operasyon Bilgilerini Düzenle'
                            ) : (
                                <>
                                    Yeni Operasyon Ekle
                                </>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Profil Header - Kompakt */}
                            {operation && operation.id && (
                                <div className="flex items-center gap-4 py-4 border-b">
                                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
                                        <Anchor className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-foreground break-words">
                                            {operation.name || 'Operasyon'}
                                        </h3>
                                        {operation.type && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                <span className="text-sm text-muted-foreground break-words">
                                                    {operation.type}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 min-w-0">
                                {/* Temel Bilgiler Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3 h-full">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Temel Bilgiler
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Operasyon Adı <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Operasyon adını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Operasyon Tipi <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Operasyon tipini giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="port"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground flex items-center gap-1">
                                                        Liman <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Liman adını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

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
                                    </div>
                                </div>

                                {/* Müşteri ve Gemi Bilgileri Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3 h-full">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Müşteri ve Gemi
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="customerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Müşteri <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <div className="flex gap-2 min-w-0">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="flex-1 justify-between h-10 text-sm min-w-0"
                                                            onClick={() => setOpenCustomerModal(true)}
                                                        >
                                                            <span className="flex items-center gap-2 min-w-0 flex-1">
                                                                {selectedCustomer
                                                                    ? <span className="truncate min-w-0">{selectedCustomer.name}</span>
                                                                    : <span className="text-muted-foreground truncate">Müşteri seçin...</span>}
                                                            </span>
                                                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                                                        </Button>
                                                        {selectedCustomer && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 flex-shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCustomer(null)
                                                                    field.onChange(null)
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="shipId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Gemi <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <div className="flex gap-2 min-w-0">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="flex-1 justify-between h-10 text-sm min-w-0"
                                                            onClick={() => setOpenShipModal(true)}
                                                        >
                                                            <span className="flex items-center gap-2 min-w-0 flex-1">
                                                                {selectedShip
                                                                    ? <span className="truncate min-w-0">{`${selectedShip.name}${selectedShip.imoNumber ? ` (${selectedShip.imoNumber})` : ''}`}</span>
                                                                    : <span className="text-muted-foreground truncate">Gemi seçin...</span>}
                                                            </span>
                                                            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 ml-2" />
                                                        </Button>
                                                        {selectedShip && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 flex-shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedShip(null)
                                                                    field.onChange(null)
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Tarih ve Yük Bilgileri - Flex Col */}
                                <div className="flex flex-col gap-4 h-full">
                                    {/* Tarih Bilgileri Kartı */}
                                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            Tarih
                                        </h4>
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">
                                                            Başlangıç Tarihi <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <DateTimePicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Tarih ve saat seçin"
                                                                maxDate={form.watch("endDate") || undefined}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">
                                                            Bitiş Tarihi <span className="text-red-500">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <DateTimePicker
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                placeholder="Tarih ve saat seçin"
                                                                minDate={form.watch("startDate") || undefined}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Yük Bilgileri Kartı */}
                                    <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            Yük
                                        </h4>
                                        <div className="space-y-3">
                                            <FormField
                                                control={form.control}
                                                name="cargoType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">
                                                            Yük Tipi
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Yük tipini giriniz" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="cargoDetails"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs text-muted-foreground">Yük Detayları</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Yük detaylarını giriniz" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Atanan Çalışanlar Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3 md:col-span-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Atanan Çalışanlar
                                        <span className="text-xs font-normal text-muted-foreground">
                                            ({selectedUserIds.length} seçili)
                                        </span>
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden bg-background">
                                        <div className="p-3 bg-muted/50 border-b">
                                            <Input
                                                placeholder="Kullanıcı ara (ad, soyad veya email)..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => {
                                                    const isSelected = selectedUserIds.includes(user.id);
                                                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

                                                    return (
                                                        <div
                                                            key={user.id}
                                                            className={`flex items-center p-3 hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500' : ''
                                                                } border-b last:border-b-0`}
                                                            onClick={() => toggleUserSelection(user.id)}
                                                        >
                                                            <div className={`flex items-center justify-center h-4 w-4 rounded border-2 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-muted-foreground/30'
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="ml-3 flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                                    <span className="text-sm font-medium truncate">
                                                                        {fullName || user.email}
                                                                    </span>
                                                                </div>
                                                                {user.email && fullName && (
                                                                    <div className="text-xs text-muted-foreground ml-5 truncate">{user.email}</div>
                                                                )}
                                                            </div>
                                                            {user.roles?.[0]?.name && (
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.roles[0].name === 'admin'
                                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                                    : 'bg-muted text-muted-foreground'
                                                                    }`}>
                                                                    {user.roles[0].name === 'admin' ? 'Yönetici' : 'Personel'}
                                                                </span>
                                                            )}
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
                                    {form.formState.errors.userId && (
                                        <p className="text-sm font-medium text-destructive mt-2">
                                            {form.formState.errors.userId.message}
                                        </p>
                                    )}
                                </div>

                                {/* Detaylar Kartı - Tam Genişlik */}
                                <FormField
                                    control={form.control}
                                    name="details"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-3 min-w-0 w-full">
                                            <div className="bg-muted/30 rounded-lg border p-4 space-y-3 w-full min-w-0 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    Detaylar
                                                </h4>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="min-h-[120px] resize-none break-words overflow-wrap-anywhere"
                                                        placeholder="Operasyon ile ilgili detaylı açıklamaları buraya yazın..."
                                                        style={{ maxWidth: '100%' }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="px-6"
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="px-6">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            İşleniyor...
                                        </>
                                    ) : (
                                        operation && operation.id ? 'Güncelle' : 'Kaydet'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Müşteri Seçim Modalı */}
            <SelectModal
                open={openCustomerModal}
                onOpenChange={setOpenCustomerModal}
                type="customer"
                onSelect={handleCustomerSelect}
            />

            {/* Gemi Seçim Modalı */}
            <SelectModal
                open={openShipModal}
                onOpenChange={setOpenShipModal}
                type="ship"
                onSelect={handleShipSelect}
            />
        </>
    )
}