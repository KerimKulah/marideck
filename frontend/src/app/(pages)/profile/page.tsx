"use client"

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Save, User, Lock, Bell, Mail, Phone } from 'lucide-react'

export default function ProfilePage() {
    const { user, loading } = useSelector((state: RootState) => state.auth)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        notifications: true,
    })

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                notifications: true,
            })
        }
    }, [user])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            // TODO: Implement update profile logic
            // await dispatch(updateProfile(formData)).unwrap()
            toast.success('Profil bilgileriniz başarıyla güncellendi.')
            setIsEditing(false)
        } catch (error) {
            toast.error('Profil güncellenirken bir hata oluştu.')
            console.error('Update profile error:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        // TODO: Implement password change logic
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage crossOrigin="anonymous" src={user?.photo ? `http://localhost:4000/${user.photo}` : ''} alt="Profile" />
                                <AvatarFallback className="text-2xl">
                                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                                <span className="text- text-gray-500 truncate">{user?.roles[0].name === "admin" ? "Yönetici" : "Personel"}</span>

                            </div>
                            <Button variant="outline" className="w-full">
                                Resmi Değiştir
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="">
                    <CardHeader>
                        <CardTitle>İletişim Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{user?.phone}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Content */}
            <div className="flex-1">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
                        <TabsTrigger value="profile">
                            <User className="h-4 w-4 mr-2" />
                            Profil Bilgileri
                        </TabsTrigger>
                        <TabsTrigger value="password">
                            <Lock className="h-4 w-4 mr-2" />
                            Şifre Değiştir
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="hidden lg:flex">
                            <Bell className="h-4 w-4 mr-2" />
                            Bildirimler
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-6">
                        <Card className="">
                            <CardHeader>
                                <CardTitle>Profil Bilgileri</CardTitle>
                                <CardDescription>
                                    Kişisel bilgilerinizi buradan düzenleyebilirsiniz.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSaveChanges}>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Ad</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Soyad</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-posta</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end space-x-2 px-6 py-4">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false)
                                                    // Reset form to original values
                                                    if (user) {
                                                        setFormData({
                                                            firstName: user.firstName || '',
                                                            lastName: user.lastName || '',
                                                            email: user.email || '',
                                                            notifications: true,
                                                        })
                                                    }
                                                }}
                                            >
                                                İptal
                                            </Button>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Kaydediliyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Kaydet
                                                    </>
                                                )}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button type="button" onClick={() => setIsEditing(true)}>
                                            Düzenle
                                        </Button>
                                    )}
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password" className="mt-6">
                        <Card className="">
                            <CardHeader>
                                <CardTitle>Şifre Değiştir</CardTitle>
                                <CardDescription>
                                    Güvenliğiniz için düzenli olarak şifrenizi güncelleyin.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handlePasswordChange}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                                        <Input
                                            id="currentPassword"
                                            name="currentPassword"
                                            type="password"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">Yeni Şifre</Label>
                                        <Input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end px-6 py-4">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Güncelleniyor...
                                            </>
                                        ) : (
                                            'Şifreyi Güncelle'
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="mt-6 ">
                        <Card className="">
                            <CardHeader>
                                <CardTitle>Bildirim Ayarları</CardTitle>
                                <CardDescription>
                                    Hangi bildirimleri almak istediğinizi seçin.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between space-x-2">
                                    <div>
                                        <h4 className="font-medium">E-posta Bildirimleri</h4>
                                        <p className="text-sm text-muted-foreground">Önemli güncellemeler ve duyurular</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">
                                            {formData.notifications ? 'Açık' : 'Kapalı'}
                                        </span>
                                        <Button
                                            type="button"
                                            variant={formData.notifications ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    notifications: !prev.notifications,
                                                }))
                                            }
                                        >
                                            {formData.notifications ? 'Kapat' : 'Aç'}
                                        </Button>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <h4 className="font-medium">Bildirim Tercihleri</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="emailUpdates"
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                checked={formData.notifications}
                                                onChange={() =>
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        notifications: !prev.notifications,
                                                    }))
                                                }
                                            />
                                            <label htmlFor="emailUpdates" className="text-sm font-medium">
                                                E-posta ile bildirim al
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="pushNotifications"
                                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                defaultChecked
                                            />
                                            <label htmlFor="pushNotifications" className="text-sm font-medium">
                                                Uygulama içi bildirimler
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end px-6 py-4">
                                <Button type="button" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Kaydediliyor...
                                        </>
                                    ) : (
                                        'Ayarları Kaydet'
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}