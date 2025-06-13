import { RentalStatusUpdateRequestRentalStatus } from '@/api-client/model';

export type Rental = {
  rentalHistoryId: number;
  member: {
    name: string;
    studentId: string;
  };
  itemName: string;
  rentAt: string;
  returnedAt?: string | null | undefined; // TODO : 이래도 되나
  rentalStatus: RentalStatusUpdateRequestRentalStatus;
};
