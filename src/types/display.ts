export interface DisplayCalendarSchedule {
  id: number;
  date: string; // YYYY-MM-DD
  schedules: string[]; // 최대 4개
}

export interface DisplayPoster {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  isActive: boolean;
}
