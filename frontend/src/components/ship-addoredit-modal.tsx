"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createShip, updateShip } from "@/redux/slices/shipSlice"
import { toast } from "sonner"
import api from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import React from 'react'
import { Building2, Calendar, FlagIcon, Globe, IdCard, Mail, MapPin, Phone, Sailboat, Ship, StickyNote, User, Plus, Hash, Radio, Ruler, Waves, Weight, Calendar as CalendarIcon, MapPin as PortIcon, Compass, Clock, Camera, X, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import ReactFlagsSelect from "react-flags-select"
import tr from 'react-phone-input-2/lang/tr.json'
import { DateTimePicker } from "./date-time-picker"

// Düzeltilmiş form şeması - backend ile uyumlu
const formSchema = z.object({
    imoNumber: z.string().nonempty({ message: "IMO numarası gerekli" }),
    mmsiNumber: z.string().optional(),
    callsign: z.string().optional(),
    name: z.string().nonempty({ message: "Gemi adı gerekli" }),
    image: z.string().optional(),
    type: z.string().nonempty({ message: "Gemi tipi gerekli" }),
    flag: z.string().optional(),
    eta: z.date().nullable().optional(),
    etd: z.date().nullable().optional(),
    departurePort: z.string().optional(),
    destinationPort: z.string().optional(),
    status: z.string().nonempty({ message: "Güncel Durum Seçiniz" }),
    builtYear: z.coerce.number().optional(),
    grossTonnage: z.coerce.number().optional(),
    deadweight: z.coerce.number().optional(),
    netTonnage: z.coerce.number().optional(),
    draft: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    beam: z.coerce.number().optional(),
    notes: z.string().optional(),
})

type ShipFormValues = z.infer<typeof formSchema>

const uppercaseLabels = Object.keys(tr).reduce((acc, key) => {
    acc[key.toUpperCase()] = tr[key as keyof typeof tr];
    return acc;
}, {} as Record<string, string>);

enum Status {
    Beklemede = "Beklemede",
    Limanda = "Limanda",
    Yolda = "Yolda",
    Demirde = "Demirde",
    Gecikmeli = "Gecikmeli",
    Acil = "Acil",
    Bilinmiyor = "Bilinmiyor"
}

interface Ship {
    id?: number;
    imoNumber?: string;
    mmsiNumber?: string;
    callsign?: string;
    name?: string;
    image?: string;
    type?: string;
    flag?: string;
    eta?: Date;
    etd?: Date;
    departurePort?: string;
    destinationPort?: string;
    status?: string;
    builtYear?: number;
    grossTonnage?: number;
    deadweight?: number;
    netTonnage?: number;
    draft?: number;
    notes?: string;
    length?: number;
    beam?: number;
}

interface ShipAddOrEditModalProps {
    isOpen: boolean
    onClose: () => void
    ship?: Ship | null
    onSuccess?: () => void
}

enum ShipType {
    // Genel
    Bilinmiyor = "Bilinmiyor", // 0

    // Yolcu Gemileri (AIS 60–69)
    Passenger = "Yolcu Gemisi", // 60–69

    // Yük Gemileri (AIS codes 70-79)
    GeneralCargo = "Genel Yük(Kargo) Gemisi",  // 70 
    ContainerShip = "Konteyner Gemisi",     // 71 
    BulkCarrier = "Dökme(Bulk) Yük Gemisi",         // 72 
    RefrigeratedCargo = "Soğutmalı Yük Gemisi",  // 73 
    VehicleCarrier = "Araç Gemisi",   // 74
    RoRoCargo = "Ro-Ro Gemisi",       // 75  

    // Tankerler (AIS codes 80–89)
    OilTanker = "Petrol Tankeri",  // 80 
    GasTanker = "Gaz Tankeri", // 81
    LPGTanker = "LPG Tankeri", // 82
    LNGTanker = "LNG(Doğalgaz) Tankeri", // 83
    OtherTanker = "Diğer Tanker",

    // Balıkçılık ve Destek Gemileri (AIS codes 30-39, 90-99)
    Fishing = "Balıkçılık Gemisi",           // 30
    Yedekleme = "Yedekleme Gemisi",       // 31
    Romorkor = "Römorkör",                // 32
    Kılavuz = "Kılavuz(Pilot) Gemisi",              // 33
    SearchAndRescue = "Arama-Kurtarma Gemisi",       // 36
    LawEnforcement = "Kolluk Kuvvetleri Gemisi",   // 37
    PortTender = "Liman Servisi",           // 38
    AntiPollution = "Kirlilik Kontrol Gemisi", // 39
    DalgıçDestek = "Dalgıç Destek Gemisi", // 91
    Askeri = "Askeri Gemi", // 35, 93 

    // Özel Amaçlı Gemiler
    Dredging = "Su Altı Operasyon Gemisi", // 34
    Sailing = "Yelkenli",           // 36
    Yacht = "Yat", // 37
    ResearchSurvey = " Araştırma Gemisi", // 40+
    Medical = "Sağlık Nakil Gemisi",        // 95
    Noncombatant = "Savaş Dışı Askeri Gemi", // 94

    // Diğer
    Diger = "Diğer",                      // 99
}

// Image URL helper - local images için backend URL, external için olduğu gibi kullan
const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;

    // Eğer URL http/https ile başlıyorsa, zaten tam URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Local image ise backend URL'i ekle
    return `http://localhost:3000${imageUrl}`;
};

export function ShipAddOrEditModal({ isOpen, onClose, ship, onSuccess }: ShipAddOrEditModalProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { loading, error } = useSelector((state: RootState) => state.ship)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>("")


    const form = useForm<ShipFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            imoNumber: "",
            mmsiNumber: "",
            callsign: "",
            name: "",
            image: "",
            type: "",
            flag: "",
            eta: undefined,
            etd: undefined,
            departurePort: "",
            destinationPort: "",
            status: "",
            builtYear: undefined,
            grossTonnage: undefined,
            deadweight: undefined,
            netTonnage: undefined,
            draft: undefined,
            length: undefined,
            beam: undefined,
            notes: "",
        },
    })

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Image preview'i ship.image'den al
    useEffect(() => {
        if (ship?.image) {
            setImagePreview(ship.image)
        } else {
            setImagePreview("")
        }
        setImageFile(null)
    }, [ship?.image])

    useEffect(() => {
        if (isOpen) {
            if (ship) {
                const getShipTypeValue = (type: string | undefined): string => {
                    if (!type) return "Bilinmiyor";
                    // Check if the type is an enum key
                    if (type in ShipType) {
                        return ShipType[type as keyof typeof ShipType];
                    }
                    // Check if the type is already a display value
                    if (Object.values(ShipType).includes(type as ShipType)) {
                        return type;
                    }
                    return "Bilinmiyor";
                };
                form.reset({
                    imoNumber: ship.imoNumber || "",
                    mmsiNumber: ship.mmsiNumber || "",
                    callsign: ship.callsign || "",
                    name: ship.name || "",
                    image: ship.image || "",
                    type: getShipTypeValue(ship.type) || "Bilinmiyor",
                    flag: ship.flag || "",
                    eta: ship.eta ? new Date(ship.eta) : null,
                    etd: ship.etd ? new Date(ship.etd) : null,
                    departurePort: ship.departurePort || "",
                    destinationPort: ship.destinationPort || "",
                    status: ship.status || "",
                    builtYear: ship.builtYear || undefined,
                    grossTonnage: ship.grossTonnage || undefined,
                    deadweight: ship.deadweight || undefined,
                    netTonnage: ship.netTonnage || undefined,
                    draft: ship.draft || undefined,
                    length: ship.length || undefined,
                    beam: ship.beam || undefined,
                    notes: ship.notes || "",
                })
                // AIS'den gelen image'i preview'e set et
                if (ship.image) {
                    const imageUrl = getImageUrl(ship.image);
                    setImagePreview(imageUrl || "")
                }
            } else {
                form.reset({
                    imoNumber: "",
                    mmsiNumber: "",
                    callsign: "",
                    name: "",
                    image: "",
                    type: "",
                    flag: "",
                    eta: null,
                    etd: null,
                    departurePort: "",
                    destinationPort: "",
                    status: "",
                    builtYear: undefined,
                    grossTonnage: undefined,
                    deadweight: undefined,
                    netTonnage: undefined,
                    draft: undefined,
                    length: undefined,
                    beam: undefined,
                    notes: "",
                })
                setImagePreview("")
                setImageFile(null)
            }
        }
    }, [ship, form, isOpen])

    const handleClose = () => {
        form.reset()
        setImageFile(null)
        setImagePreview("")
        onClose()
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: ShipFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            let imageUrl = ship?.image || imagePreview || values.image || null;

            // Eğer yeni bir dosya seçildiyse, upload et
            if (imageFile) {
                try {
                    const formData = new FormData();
                    formData.append('image', imageFile);

                    const uploadResponse = await api.post('/ship/upload-image', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    });

                    if (uploadResponse.data?.imageUrl) {
                        // Backend'den relative path geliyor (/images/ships/...), bunu direkt kullan
                        imageUrl = uploadResponse.data.imageUrl;
                    }
                } catch (uploadError: any) {
                    console.error('Upload error:', uploadError);
                    // Hata olsa bile devam et, external URL kullanılabilir
                }
            }

            // Format dates to ISO strings in UTC
            const formattedValues = {
                ...values,
                image: imageUrl,
                eta: values.eta ? new Date(values.eta.getTime() - (values.eta.getTimezoneOffset() * 60000)).toISOString() : null,
                etd: values.etd ? new Date(values.etd.getTime() - (values.etd.getTimezoneOffset() * 60000)).toISOString() : null
            };


            // Clean empty strings and convert to undefined
            const cleanedValues = Object.fromEntries(
                Object.entries(formattedValues).map(([key, value]) => [
                    key,
                    value === "" ? undefined : value
                ])
            );

            if (ship && ship.id) {
                // Sadece ID'si olan gemiler için güncelleme yap
                await dispatch(updateShip({
                    id: ship.id.toString(),
                    data: cleanedValues
                })).unwrap()
                toast.success("Gemi bilgileri başarıyla güncellendi")
            } else {
                // ID'si olmayan gemiler için yeni gemi oluştur
                await dispatch(createShip(cleanedValues)).unwrap()
                toast.success("Gemi başarıyla oluşturuldu")
            }

            form.reset()
            setImageFile(null)
            setImagePreview("")
            if (onSuccess) onSuccess()
            onClose()
        } catch (error: any) {
            toast.error(error?.message || "Bir hata oluştu")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isMounted) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95vw] lg:min-w-[900px] max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                            {ship && ship.id ? ('Gemi Bilgilerini Düzenle') : ('Yeni Gemi Ekle')}
                        </DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Image Upload Area - Hem yeni ekleme hem düzenleme için */}
                            <div className="flex justify-center py-4 border-b">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        id="ship-image-upload"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="ship-image-upload"
                                        className="cursor-pointer relative flex flex-col items-center justify-center w-48 h-32 sm:w-64 sm:h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-muted/30 hover:bg-muted/50"
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="Gemi Önizleme" className="w-full h-full object-cover rounded-lg" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-2 text-white">
                                                        <Camera className="h-6 w-6" />
                                                        <span className="text-xs font-medium">Fotoğrafı Değiştir</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mb-3">
                                                    <Camera className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="text-sm font-medium">{ship && ship.id ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}</span>
                                                <span className="text-xs text-muted-foreground mt-1">Tıklayarak seçin</span>
                                            </div>
                                        )}
                                    </label>
                                    {imagePreview && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImagePreview("");
                                                setImageFile(null);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bilgiler Grid - Kompakt ve Kurumsal */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 min-w-0">
                                {/* Temel Bilgiler Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        Temel Bilgiler
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Gemi Adı <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Gemi adı giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="imoNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        IMO Numarası <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="IMO numarasını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="mmsiNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        MMSI Numarası
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="MMSI numarasını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="callsign"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Çağrı İşareti
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Çağrı işareti" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="flag"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Bayrak
                                                    </FormLabel>
                                                    <FormControl>
                                                        <ReactFlagsSelect
                                                            className="my-custom-flags-select pt-2"
                                                            placeholder="Bayrak seçiniz"
                                                            onSelect={field.onChange}
                                                            selected={field.value || ""}
                                                            searchable={true}
                                                            searchPlaceholder="Ülke adı ara.."
                                                            customLabels={uppercaseLabels}
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
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Gemi Tipi <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Gemi tipi seçiniz" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.entries(ShipType).map(([key, value]) => (
                                                                    <SelectItem key={key} value={value}>
                                                                        {value}
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
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Durum <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Durum Seçiniz" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(Status)
                                                                    .map((status) => (
                                                                        <SelectItem key={status} value={status}>
                                                                            {status}
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
                                            name="builtYear"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        İnşa Yılı
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="1900"
                                                            max={new Date().getFullYear()}
                                                            placeholder="İnşa yılı giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Boyutlar ve Ölçüler Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <Ruler className="h-4 w-4 text-muted-foreground" />
                                        Boyutlar ve Ölçüler
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="length"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Uzunluk (m)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Uzunluk giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="beam"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Genişlik (m)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Genişlik giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="draft"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Su Çekimi (m)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="Su çekimi giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="grossTonnage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Brüt Tonaj (GT)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Brüt tonaj giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="deadweight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Deadweight (DWT)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Deadweight giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="netTonnage"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Net Tonaj (NT)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            placeholder="Net tonaj giriniz"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Seyir Bilgileri Kartı */}
                                <div className="bg-muted/30 rounded-lg border p-4 space-y-3">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                        <Compass className="h-4 w-4 text-muted-foreground" />
                                        Seyir Bilgileri
                                    </h4>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="eta"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
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

                                        <FormField
                                            control={form.control}
                                            name="etd"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        ETD (Tahmini Kalkış)
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

                                        <FormField
                                            control={form.control}
                                            name="departurePort"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Kalkış Limanı
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Kalkış limanını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="destinationPort"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs text-muted-foreground">
                                                        Varış Limanı
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Varış limanını giriniz" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Notlar Kartı - Tam Genişlik */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-3 min-w-0 w-full">
                                            <div className="bg-muted/30 rounded-lg border p-4 space-y-3 w-full min-w-0 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 pb-2 border-b">
                                                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                    Notlar
                                                </h4>
                                                <FormControl className="w-full min-w-0">
                                                    <Textarea
                                                        placeholder="Notunuz varsa giriniz"
                                                        className="min-h-[80px] resize-none break-words overflow-wrap-anywhere w-full min-w-0"
                                                        style={{ maxWidth: '100%' }}
                                                        {...field}
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
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="px-6"
                                >
                                    İptal
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="px-6">
                                    {isSubmitting ? "İşleniyor..." : (ship && ship.id) ? "Güncelle" : "Kaydet"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}