export type Item = {
  itemId: number;
  itemName: string;
  itemType: 'RENTAL' | 'CONSUMPTION';
  count: number;
  renterCount: number;
  imageUrl?: string;
};
