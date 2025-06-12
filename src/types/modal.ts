import { Payer } from '@/types/payer';
import { Student } from '@/types/student';

export type DeleteRentalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  rentalInfo: string;
  isActive: boolean;
};

export type DeleteItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  itemName: string;
  hasRentedItems: boolean;
};

export type RentalAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rentalData: {
    studentName: string;
    studentId: string;
    itemName: string;
    rentalDate: string;
    staff: string;
  }) => void;
  items: { id: number; name: string; itemType: string; quantity: number; rentedCount: number }[];
  staffs: { name: string; studentId: string }[];
};

export type AddPayerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (payers: Payer[]) => void;
};

export type AddAdminModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedStudents: Student[]) => void;
};
