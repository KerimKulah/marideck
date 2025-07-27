"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createShip, updateShip } from "@/redux/slices/shipSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import React from 'react'
import { Building2, Calendar, FlagIcon, Globe, IdCard, Mail, MapPin, Phone, Sailboat, Ship, StickyNote, User } from 'lucide-react';
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
    Beklemede = "Beklemede", // 7,
    Limanda = "Limanda", // 5
    Yolda = "Yolda", // 0, 8, 11, 12	
    Demirde = "Demirde", // 1
    Gecikmeli = "Gecikmeli", // 2, 3, 4, 6
    Acil = "Acil", // 14
    Bilinimiyor = "Bilinimiyor" // 15, 9, 10, 13
}

interface Ship {
    id?: number;
    imoNumber?: string;
    mmsiNumber?: string;
    callsign?: string;
    name?: string;
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

export function ShipAddOrEditModal({ isOpen, onClose, ship, onSuccess }: ShipAddOrEditModalProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const dispatch = useDispatch<AppDispatch>()
    const { loading, error } = useSelector((state: RootState) => state.ship)
    const [showAdvanced, setShowAdvanced] = useState(false)


    const form = useForm<ShipFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            imoNumber: "",
            mmsiNumber: "",
            callsign: "",
            name: "",
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
            } else {
                form.reset({
                    imoNumber: "",
                    mmsiNumber: "",
                    callsign: "",
                    name: "",
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
            }
        }
    }, [ship, form, isOpen])

    const handleClose = () => {
        form.reset()
        onClose()
    }

    const onSubmit = async (values: ShipFormValues) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Format dates to ISO strings in UTC
            const formattedValues = {
                ...values,
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

            if (ship) {
                await dispatch(updateShip({
                    id: ship.id?.toString() || "",
                    data: cleanedValues
                })).unwrap()
                toast.success("Gemi bilgileri başarıyla güncellendi")
            } else {
                await dispatch(createShip(cleanedValues)).unwrap()
                toast.success("Gemi başarıyla oluşturuldu")
            }

            form.reset()
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
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="mb-4">{ship ? "Gemi Bilgilerini Düzenle" : "Yeni Gemi Ekle"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Temel Bilgiler */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Ship className="h-4 w-4 text-muted-foreground" />
                                            Gemi Adı
                                            <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Gemi adı giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="imoNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <IdCard className="h-4 w-4 text-muted-foreground" />
                                            IMO Numarası
                                            <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="IMO numarasını giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Sailboat className="h-4 w-4" />
                                            Gemi Tipi
                                            <span className="text-xs text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                <SelectTrigger className="w-full lg:w-max-[200px]">
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
                                name="callsign"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            Çağrı İşareti (Callsign)
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="Çağrı işareti" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

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

                            <FormField
                                control={form.control}
                                name="etd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
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
                                name="flag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="mb-3">
                                            <FlagIcon className="h-4 w-4 text-muted-foreground" />
                                            Bayrak
                                        </FormLabel>
                                        <FormControl>
                                            <ReactFlagsSelect
                                                className="my-custom-flags-select"
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
                                )} />


                            <FormField
                                control={form.control}
                                name="mmsiNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            MMSI Numarası
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder="MMSI numarasını giriniz" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />


                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            Durum
                                            <span className="text-xs text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Güncel Durum Seçiniz" />
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
                                )} />
                        </div>


                        {/* Notlar */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <StickyNote className="h-4 w-4 text-muted-foreground" />
                                        Notlar
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Notunuz varsa giriniz" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <Button type="button" variant="ghost" className="w-full text-sm text-blue-600 hover:underline" onClick={() => setShowAdvanced(!showAdvanced)}>
                            {showAdvanced ? "Gelişmiş Bilgileri Gizle" : "Gelişmiş Bilgileri Göster"}
                        </Button>

                        {showAdvanced && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {/* Ports */}
                                <div className="space-y-4 border p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground">Liman Bilgileri</h4>

                                    <FormField
                                        control={form.control}
                                        name="departurePort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kalkış Limanı</FormLabel>
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
                                                <FormLabel>Varış Limanı</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Varış limanını giriniz" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                {/* Dimensions */}
                                <div className="space-y-4 border p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground">Boyutlar</h4>

                                    <FormField
                                        control={form.control}
                                        name="length"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Uzunluk (m)</FormLabel>
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
                                                <FormLabel>Genişlik (m)</FormLabel>
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
                                                <FormLabel>Su Çekimi (m)</FormLabel>
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
                                </div>

                                {/* Weights */}
                                <div className="space-y-4 border p-4 rounded-lg">
                                    <h4 className="font-medium text-sm text-muted-foreground">Ağırlık Bilgileri</h4>

                                    <FormField
                                        control={form.control}
                                        name="grossTonnage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Brüt Tonaj (GT)</FormLabel>
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
                                                <FormLabel>Deadweight (DWT)</FormLabel>
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
                                                <FormLabel>Net Tonaj (NT)</FormLabel>
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
                        )}

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "İşleniyor..." : ship ? "Güncelle" : "Kaydet"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}