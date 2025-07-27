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
import { createOperation, updateOperation } from "@/redux/slices/operationSlice"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon, Loader2, Plus, X, ChevronDown, ChevronRight } from "lucide-react"
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
    users: Array<{ id: number; name: string; role?: string }>
    onSuccess?: () => void
}

export function OperationAddOrEditModal({
    open,
    onOpenChange,
    operation,
    users,
    onSuccess
}: OperationAddOrEditModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [filteredUsers, setFilteredUsers] = useState(users)
    const [openCustomerModal, setOpenCustomerModal] = useState(false)
    const [openShipModal, setOpenShipModal] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(operation?.customer || null)
    const [selectedShip, setSelectedShip] = useState<any>(operation?.ship || null)

    const form = useForm<OperationFormValues>({
        resolver: zodResolver(operationFormSchema),
        defaultValues: {
            name: operation?.name || "",
            type: operation?.type || "",
            details: operation?.details || "",
            port: operation?.port || "",
            customerId: operation?.customer?.id || undefined,
            shipId: operation?.ship?.id || undefined,
            userId: operation?.users?.map((u: any) => u.id) || [],
            startDate: operation?.startDate ? new Date(operation.startDate) : new Date(),
            endDate: operation?.endDate ? new Date(operation.endDate) : new Date(),
            status: operation?.status || "planlanıyor",
            cargoType: operation?.cargoType || "",
            cargoDetails: operation?.cargoDetails || "",
        },
    })

    useEffect(() => {
        if (userSearch) {
            setFilteredUsers(
                users.filter(user =>
                    user.name.toLowerCase().includes(userSearch.toLowerCase())
                )
            )
        } else {
            setFilteredUsers(users)
        }
    }, [userSearch, users])

    const toggleUserSelection = (userId: number) => {
        const currentUsers = form.getValues("userId") || []
        const newUsers = currentUsers.includes(userId)
            ? currentUsers.filter(id => id !== userId)
            : [...currentUsers, userId]
        form.setValue("userId", newUsers)
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {operation ? "Operasyonu Düzenle" : "Yeni Operasyon Oluştur"}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Operasyon Adı</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Operasyon Tipi</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="customerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Müşteri</FormLabel>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 justify-between"
                                                    onClick={() => setOpenCustomerModal(true)}
                                                >
                                                    {selectedCustomer 
                                                        ? selectedCustomer.name 
                                                        : "Müşteri seçin..."}
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                                {selectedCustomer && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
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
                                            <FormLabel>Gemi</FormLabel>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="flex-1 justify-between"
                                                    onClick={() => setOpenShipModal(true)}
                                                >
                                                    {selectedShip 
                                                        ? `${selectedShip.name}${selectedShip.imoNumber ? ` (${selectedShip.imoNumber})` : ''}`
                                                        : "Gemi seçin..."}
                                                    <ChevronRight className="ml-2 h-4 w-4" />
                                                </Button>
                                                {selectedShip && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
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

                                <FormField
                                    control={form.control}
                                    name="port"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Liman</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Durum</FormLabel>
                                            <FormControl>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    {...field}
                                                >
                                                    <option value="planlanıyor">Planlanıyor</option>
                                                    <option value="devam">Devam Ediyor</option>
                                                    <option value="tamamlandı">Tamamlandı</option>
                                                    <option value="iptal">İptal Edildi</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Başlangıç Tarihi</FormLabel>
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
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: tr })
                                                            ) : (
                                                                <span>Tarih seçin</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                                            <FormLabel>Bitiş Tarihi</FormLabel>
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
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: tr })
                                                            ) : (
                                                                <span>Tarih seçin</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                                            <FormLabel>Yük Tipi</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Yük Detayları</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <FormLabel>Atanan Kullanıcılar</FormLabel>
                                <div className="relative">
                                    <Input
                                        placeholder="Kullanıcı ara..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => {
                                                const isSelected = form.getValues("userId")?.includes(user.id) || false
                                                return (
                                                    <div
                                                        key={user.id}
                                                        className={`flex items-center p-2 rounded cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                                        onClick={() => toggleUserSelection(user.id)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="h-4 w-4 text-blue-600 rounded"
                                                        />
                                                        <span className="ml-2">{user.name}</span>
                                                        {user.role && (
                                                            <span className="ml-auto text-sm text-gray-500">
                                                                {user.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-2 text-gray-500">
                                                Kullanıcı bulunamadı
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {form.formState.errors.userId && (
                                    <p className="text-sm font-medium text-destructive">
                                        {form.formState.errors.userId.message}
                                    </p>
                                )}
                            </div>

                            <FormField
                                control={form.control}
                                name="details"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detaylar</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                className="min-h-[100px]"
                                                placeholder="Operasyon detaylarını giriniz..."
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        'Kaydet'
                                    )}
                                </Button>
                            </DialogFooter>
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