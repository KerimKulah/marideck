"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
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
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Loader2, Plus, X, ChevronDown, ChevronRight, Ship, User, Package, MapPin, Clock, FileText, Users, Building2, Anchor } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectModal } from "./select-modal"

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
    status: z.string().default("planlanıyor").optional(),
    cargoType: z.string().optional(),
    cargoDetails: z.string().optional(),
})

type OperationFormValues = z.infer<typeof operationFormSchema>

interface OperationAddOrEditModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    operation?: any
    onSuccess?: () => void
}

const statusOptions = [
    { value: "planlanıyor", label: "Planlanıyor", color: "bg-yellow-100 text-yellow-800" },
    { value: "devam", label: "Devam Ediyor", color: "bg-blue-100 text-blue-800" },
    { value: "tamamlandı", label: "Tamamlandı", color: "bg-green-100 text-green-800" },
    { value: "iptal", label: "İptal Edildi", color: "bg-red-100 text-red-800" },
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
        if (operation) {
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
                startDate: operation.startDate ? new Date(operation.startDate) : new Date(),
                endDate: operation.endDate ? new Date(operation.endDate) : new Date(),
                status: operation.status || "planlanıyor",
                cargoType: operation.cargoType || "",
                cargoDetails: operation.cargoDetails || "",
            })
        } else {
            // Reset form for new operation
            resetForm()
        }
    }, [operation])

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
            startDate: new Date(),
            endDate: new Date(),
            status: "planlanıyor",
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
            startDate: new Date(),
            endDate: new Date(),
            status: "planlanıyor",
            cargoType: "",
            cargoDetails: "",
        })
        form.clearErrors()
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm()
        }
        onOpenChange(open)
    }

    const currentStatus = statusOptions.find(option => option.value === form.watch("status"));

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-hidden flex flex-col">
                    <DialogHeader className="pb-6 border-b border-gray-100">
                        <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Anchor className="h-6 w-6 text-black" />
                            </div>
                            {operation ? "Operasyonu Düzenle" : "Yeni Operasyon Oluştur"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 mt-2">
                            {operation ? "Mevcut operasyonun bilgilerini güncelleyin" : "Yeni bir operasyon oluşturmak için aşağıdaki bilgileri doldurun"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Temel Bilgiler */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Temel Bilgiler
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">Operasyon Adı</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="Operasyon adını giriniz"
                                                        />
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">Operasyon Tipi</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="Operasyon tipini giriniz"
                                                        />
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
                                                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        Liman
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="Liman adını giriniz"
                                                        />
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">Durum</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
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
                                                            {currentStatus && (
                                                                <div className={`absolute right-12 top-3 px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
                                                                    {currentStatus.label}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Müşteri ve Gemi Seçimi */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                        <User className="h-5 w-5 text-blue-600" />
                                        Müşteri ve Gemi Bilgileri
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="customerId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">Müşteri</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="flex-1 justify-between h-11 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                                            onClick={() => setOpenCustomerModal(true)}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <User className="h-4 w-4 text-gray-500" />
                                                                {selectedCustomer
                                                                    ? <span className="font-medium">{selectedCustomer.name}</span>
                                                                    : <span className="text-gray-500">Müşteri seçin...</span>}
                                                            </span>
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                        {selectedCustomer && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-11 w-11 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => {
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">Gemi</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="flex-1 justify-between h-11 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                                            onClick={() => setOpenShipModal(true)}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Ship className="h-4 w-4 text-gray-500" />
                                                                {selectedShip
                                                                    ? <span className="font-medium">{`${selectedShip.name}${selectedShip.imoNumber ? ` (${selectedShip.imoNumber})` : ''}`}</span>
                                                                    : <span className="text-gray-500">Gemi seçin...</span>}
                                                            </span>
                                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                                        </Button>
                                                        {selectedShip && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-11 w-11 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                                onClick={() => {
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

                                {/* Tarih ve Yük Bilgileri */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        Tarih ve Yük Bilgileri
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Başlangıç Tarihi</FormLabel>
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
                                                                disabled={(date) =>
                                                                    date < new Date() || date < new Date("1900-01-01")
                                                                }
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
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="text-sm font-medium text-gray-700">Bitiş Tarihi</FormLabel>
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
                                                                disabled={(date) =>
                                                                    date < new Date() || date < new Date("1900-01-01")
                                                                }
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
                                            name="cargoType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        Yük Tipi
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="Yük tipini giriniz"
                                                        />
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
                                                    <FormLabel className="text-sm font-medium text-gray-700">Yük Detayları</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                                                            placeholder="Yük detaylarını giriniz"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Kullanıcı Atama */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Atanan Kullanıcılar
                                        <span className="text-sm font-normal text-gray-500">
                                            ({selectedUserIds.length} seçili)
                                        </span>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                                            <Input
                                                placeholder="Kullanıcı ara (ad, soyad veya email)..."
                                                value={userSearch}
                                                onChange={(e) => setUserSearch(e.target.value)}
                                                className="h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-200"
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
                                                            className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                                                } border-b border-gray-100 last:border-b-0`}
                                                            onClick={() => toggleUserSelection(user.id)}
                                                        >
                                                            <div className={`flex items-center justify-center h-5 w-5 rounded border-2 transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 hover:border-blue-400'
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            <div className="ml-3 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {fullName || user.email}
                                                                    </span>
                                                                </div>
                                                                {user.email && fullName && (
                                                                    <div className="text-xs text-gray-500 ml-6">{user.email}</div>
                                                                )}
                                                            </div>
                                                            {user.roles?.[0]?.name && (
                                                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.roles[0].name === 'admin'
                                                                        ? 'bg-purple-100 text-purple-700'
                                                                        : 'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {user.roles[0].name === 'admin' ? 'Yönetici' : 'Personel'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                    <div className="text-sm">Kullanıcı bulunamadı</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {form.formState.errors.userId && (
                                        <p className="text-sm font-medium text-red-600 mt-2">
                                            {form.formState.errors.userId.message}
                                        </p>
                                    )}
                                </div>

                                {/* Detaylar */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 pb-2 border-b border-gray-200">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Operasyon Detayları
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="details"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Detaylar</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-200 resize-none"
                                                        placeholder="Operasyon ile ilgili detaylı açıklamaları buraya yazın..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                className="flex-1 sm:flex-none  bg-black hover:bg-black/80 text-white font-medium px-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        {operation ? 'Güncelle' : 'Oluştur'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
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