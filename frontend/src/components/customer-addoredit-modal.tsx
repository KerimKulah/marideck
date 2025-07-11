import { DialogHeader, Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";


interface CustomerAddOrEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: any | null;
    onSubmit: (customer: any) => void;
    isSubmitting: boolean;
}

export default function CustomerAddOrEditModal({ isOpen, onClose, customer, onSubmit, isSubmitting }: CustomerAddOrEditModalProps) {
    return (
        <div>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{customer ? 'Müşteri Düzenle' : 'Yeni Müşteri Ekle'}</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {customer ? 'Müşteri bilgilerini düzenleyin.' : 'Yeni bir müşteri ekleyin.'}
                    </DialogDescription>
                </DialogContent>
                <DialogFooter>
                    
                    <DialogClose asChild>
                        <Button variant="outline">Kapat</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Kaydetme...' : 'Kaydet'}
                    </Button>
                </DialogFooter>
            </Dialog>   
        </div>
    )
}