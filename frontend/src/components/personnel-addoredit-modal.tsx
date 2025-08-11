"use client"

import { useState, useEffect } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FieldValues } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { createUser, updateUser } from "@/redux/slices/userSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

// Custom Switch component
const Switch = ({
  checked,
  onCheckedChange,
  label,
  className
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}) => (
  <div className={cn("flex items-center space-x-2", className)}>
    {label && <span className="text-sm font-medium">{label}</span>}
    <div
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200'
        }`}
    >
      <span
        className={`${checked ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </div>
  </div>
)

const formSchema = z.object({
  firstName: z.string().min(1, { message: "Ad alanı zorunludur" }),
  lastName: z.string().min(1, { message: "Soyad alanı zorunludur" }),
  email: z.string().email({ message: "Lütfen geçerli bir e-posta adresi giriniz" }),
  phone: z.string().min(1, { message: "Telefon numarası zorunludur" }),
  password: z.string()
    .min(6, { message: "Şifre en az 6 karakter olmalıdır" })
    .max(20, { message: "Şifre en fazla 20 karakter olabilir" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]*$/, {
      message: "Şifre en az bir harf ve bir rakam içermelidir"
    }),
  confirmPassword: z.string().min(1, { message: "Şifre tekrarı zorunludur" }),
  photo: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"]
})

type PersonnelFormValues = z.infer<typeof formSchema>

interface Personnel {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  roles: { id: number; name: string }[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface PersonnelAddOrEditModalProps {
  isOpen: boolean
  onClose: () => void
  personnel?: Personnel | null
  onSuccess?: () => void
}

export function PersonnelAddOrEditModal({ isOpen, onClose, personnel, onSuccess }: PersonnelAddOrEditModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { loading } = useSelector((state: RootState) => state.user)

  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (personnel) {
        form.reset({
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          email: personnel.email,
          phone: personnel.phone,
          password: '',
          confirmPassword: ''
        })
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        })
      }
    }
  }, [personnel, form, isOpen])

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const onSubmit = async (values: FormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      // Prepare the data to be sent
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
        photo: values.photo
      }

      if (personnel) {
        // For updates, we'll need to handle this differently since the DTO is for create
        // You might need to create an update DTO in your backend
        await dispatch(updateUser({
          id: personnel.id,
          data: {
            ...userData,
            // Include only the fields that can be updated
            password: values.password || undefined
          }
        })).unwrap()
        toast.success("Personel başarıyla güncellendi")
      } else {
        // Create new user
        await dispatch(createUser(userData)).unwrap()
        toast.success("Personel başarıyla eklendi")
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error: any) {
      console.error("Error saving user:", error)
      toast.error(error?.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isMounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="mb-4">
            {personnel ? "Personel Bilgilerini Düzenle" : "Yeni Personel Ekle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form as any}>
          <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Soyad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ornek@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="5__ ___ __ __" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!personnel && (
              <>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre Tekrar</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}



            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {personnel ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                  </>
                ) : personnel ? (
                  'Güncelle'
                ) : (
                  'Oluştur'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
