"use client"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { registerLocale } from "react-datepicker";
import { tr as trLocale } from "date-fns/locale";
registerLocale("tr", trLocale);
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

// Düzeltilmiş form şeması - backend ile uyumlu
const formSchema = z.object({
    imoNumber: z.string().nonempty({ message: "IMO numarası gerekli" }),
    mmsiNumber: z.string().optional(),
    callsign: z.string().optional(),
    name: z.string().nonempty({ message: "Gemi adı gerekli" }),
    type: z.string().optional(),
    flag: z.string().optional(),
    eta: z.date().nullable().optional(),
    etd: z.date().nullable().optional(),
    departurePort: z.string().optional(),
    destinationPort: z.string().optional(),
    status: z.string().optional(),
    builtYear: z.coerce.number().optional(),
    grossTonnage: z.coerce.number().optional(),
    deadweight: z.coerce.number().optional(),
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
    Beklemede, // 1, 7
    Limanda, // 5
    Yolda, // 0, 8, 11, 12	
    Demirde, // 1
    Gecikmeli, // 2, 3, 4, 6
    Acil, // 14
    Bilinimiyor // 15, 9, 10, 13
}

enum ShipTypes {
    Cargo,
    Container,
    Oil,
    Gas,
    Liquid,
    DryBulk,
    Other
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
    Unknown = "Unknown", // 0

    // Yolcu Gemileri (AIS codes 60-69)
    Passenger = "Passenger Ship",         // 60
    HighSpeedPassenger = "High-Speed Passenger", // 69 (örnek özel durum)
    Cruise = "Cruise Ship",               // 61
    Ferry = "Ferry",                      // 63

    // Yük Gemileri (AIS codes 70-79)
    GeneralCargo = "General Cargo Ship",  // 70
    ContainerShip = "Container Ship",     // 71
    BulkCarrier = "Bulk Carrier",         // 72
    RefrigeratedCargo = "Refrigerated Cargo", // 73
    VehicleCarrier = "Vehicle Carrier",   // 74
    RoRoCargo = "Ro-Ro Cargo Ship",       // 75

    // Tankerler (AIS codes 80-89)
    OilTanker = "Oil Tanker",             // 80
    ChemicalTanker = "Chemical Tanker",   // 81
    LPGTanker = "LPG Tanker",             // 82
    LNGTanker = "LNG Tanker",             // 83
    OtherTanker = "Other Tanker",         // 84–89

    // Balıkçılık ve Destek Gemileri (AIS codes 30-39, 90-99)
    Fishing = "Fishing Vessel",           // 30
    Towing = "Towing Vessel",             // 31
    Tug = "Tug",                          // 32
    Pilot = "Pilot Vessel",              // 33
    SearchAndRescue = "SAR Vessel",       // 36
    LawEnforcement = "Law Enforcement",   // 37
    PortTender = "Port Tender",           // 38
    AntiPollution = "Anti-pollution Equipment", // 39
    DivingVessel = "Diving Vessel",       // 91
    Military = "Military/Naval Ship",     // 35, 93

    // Özel Amaçlı Gemiler
    Dredging = "Dredging or Underwater Ops", // 34
    Sailing = "Sailing Vessel",           // 36
    PleasureCraft = "Pleasure Craft (Yacht)", // 37
    ResearchSurvey = "Research/Survey Vessel", // 40+
    Medical = "Medical Transport",        // 95
    Noncombatant = "Non-Combatant Military", // 94

    // Römorkör / Yedekleme
    TugBoat = "Tug Boat",                 // 32
    TowingLarge = "Towing (Large)",       // 31

    // Diğer
    Other = "Other",                      // 99
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
                form.reset({
                    imoNumber: ship.imoNumber || "",
                    mmsiNumber: ship.mmsiNumber || "",
                    callsign: ship.callsign || "",
                    name: ship.name || "",
                    type: ship.type || "",
                    flag: ship.flag || "",
                    eta: ship.eta || undefined,
                    etd: ship.etd || undefined,
                    departurePort: ship.departurePort || "",
                    destinationPort: ship.destinationPort || "",
                    status: ship.status || "",
                    builtYear: ship.builtYear || undefined,
                    grossTonnage: ship.grossTonnage || undefined,
                    deadweight: ship.deadweight || undefined,
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
                    eta: undefined,
                    etd: undefined,
                    departurePort: "",
                    destinationPort: "",
                    status: "",
                    builtYear: undefined,
                    grossTonnage: undefined,
                    deadweight: undefined,
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
            // Clean empty strings and convert to undefined
            const cleanedValues = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [
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
            if (onSuccess) {
                onSuccess()
            }
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
                        <div className="grid grid-cols-3 gap-4">
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
                                            <Input placeholder="IMO numarası" {...field} />
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
                                            <Input placeholder="MMSI numarası" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

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
                                name="etd"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            ETD (Tahmini Kalkış)
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                selected={field.value}
                                                onChange={(date: Date | null) => field.onChange(date)}
                                                locale="tr"
                                                timeInputLabel="Saat"
                                                showTimeInput
                                                dateFormat="yyyy-MM-dd HH:mm"
                                                timeFormat="HH:mm"
                                                placeholderText="Tarih seçin"
                                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                            <DatePicker
                                                selected={field.value}
                                                onChange={(date) => field.onChange(date)}
                                                locale="tr"
                                                timeInputLabel="Saat"
                                                showTimeInput
                                                dateFormat="yyyy-MM-dd HH:mm"
                                                timeFormat="HH:mm"
                                                placeholderText="Tarih seçin"
                                                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
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
                                            <Ship className="h-4 w-4" />
                                            Gemi Tipi
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
                                name="flag"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <FlagIcon className="h-4 w-4 text-muted-foreground" />
                                            Bayrak
                                        </FormLabel>
                                        <FormControl>
                                            <ReactFlagsSelect
                                                className="my-custom-flags-select"
                                                placeholder="-"
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            Durum
                                        </FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Durum Seçin" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(Status)
                                                        .filter((value): value is string => typeof value === 'string')
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
                                        <Textarea placeholder="Notlar" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                        <Button type="button" variant="ghost" className="w-full text-sm text-blue-600 hover:underline" onClick={() => setShowAdvanced(!showAdvanced)}>
                            {showAdvanced ? "Gelişmiş Bilgileri Gizle" : "Gelişmiş Bilgileri Göster"}
                        </Button>

                        {showAdvanced && (
                            <div className="mt-4 space-y-4">
                                {/* Liman Bilgileri */}
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="departurePort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Kalkış Liman (Departure)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Kalkış liman" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                    <FormField
                                        control={form.control}
                                        name="destinationPort"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Hedef Liman (Destination)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Hedef liman" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="builtYear"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>İnşa Yılı</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Yıl" {...field} />
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
                                                <FormLabel>Brüt Tonaj (Gross Tonnage)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="GT" {...field} />
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
                                                <FormLabel>Yük Kapasitesi (Deadweight)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Yük Kapasitesi" {...field} />
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
                                                <FormLabel>Draft</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Draft" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="length"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Uzunluk (m)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Length" {...field} />
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
                                                    <Input type="number" placeholder="Beam" {...field} />
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