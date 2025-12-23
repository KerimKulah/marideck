"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, Key, UserCog } from 'lucide-react'

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
  photo: string
  }

interface PersonnelViewModalProps {
  isOpen: boolean
  onClose: () => void
  personnel: Personnel | null
}

export function PersonnelViewModal({ isOpen, onClose, personnel }: PersonnelViewModalProps) {
  if (!personnel) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="mb-4">Personel Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {personnel.photo ? (
                <img crossOrigin="anonymous" src={`http://localhost:4000/${personnel.photo}`} alt={personnel.firstName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium">{personnel.firstName} {personnel.lastName}</h3>
              <p className="text-sm text-muted-foreground"> 
                {personnel.roles?.[0]?.name === 'admin' ? 'Yönetici' : 'Personel'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                E-posta
              </div>
              <div className="w-2/3">
                <p className="text-sm">{personnel.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Telefon
              </div>
              <div className="w-2/3">
                <p className="text-sm">{personnel.phone || '-'}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Rol
              </div>
              <div className="w-2/3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  personnel.roles?.[0]?.name === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {personnel.roles?.[0]?.name === 'admin' ? 'Yönetici' : 'Personel'}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <UserCog className="h-4 w-4 mr-2" />
                Durum
              </div>
              <div className="w-2/3">
                <div className="flex items-center">
                  {personnel.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                      <span className="text-green-600">Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                      <span className="text-red-600">Pasif</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Oluşturulma Tarihi
              </div>
              <div className="w-2/3">
                <p className="text-sm">{formatDate(personnel.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 text-sm font-medium text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Son Güncelleme
              </div>
              <div className="w-2/3">
                <p className="text-sm">{formatDate(personnel.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
