/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * 빌릴게(Billilge) API
 * 국민대학교 소프트웨어융합대학 복지물품 대여 서비스
 * OpenAPI spec version: v1
 */
import type { RentalApplicationDetailStatus } from './rentalApplicationDetailStatus';

export interface RentalApplicationDetail {
  /** 대여 기록 ID */
  rentalHistoryId: number;
  /** 물품 이름 */
  itemName: string;
  /** 물품 아이콘 URL */
  itemImageUrl: string;
  /** 물품 개수 */
  rentedCount: number;
  /** 대여자 이름 */
  renterName: string;
  /** 대여자 학번 */
  renterStudentId: string;
  /** 대여 상태 */
  status: RentalApplicationDetailStatus;
  /** 대여 시각 */
  rentAt?: string;
}
