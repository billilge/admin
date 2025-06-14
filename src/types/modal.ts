import { RentalHistoryRequest } from '@/api-client/model';
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
  onApply?: (rentalData: RentalHistoryRequest) => void; // ✅ 인자 받도록 정의
  // items: { id: number; name: string; itemType: string; quantity: number; rentedCount: number }[];
  // staffs: { name: string; studentId: string }[];
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
