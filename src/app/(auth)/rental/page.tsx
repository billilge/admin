'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  Check,
  ClipboardList,
  Pencil,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createRental, useUpdateRentalStatus, useUpdateItemCode } from '@/api-client';
import { getGetAllRentalHistoriesQueryOptions } from '@/api-client';
import { useDeleteRentalHistory } from '@/api-client';
import { RentalHistoryRequest, RentalStatusUpdateRequestRentalStatus } from '@/api-client/model';
import RentalAddModal from '@/components/modal/AddRentalModal';
import RentalDeleteModal from '@/components/modal/DeleteRentalModal';
import WorkerLogModal from '@/components/modal/WorkerLogModal';
import TableSkeleton from '@/components/ui/table-skeleton';
import { Rental } from '@/types/rental';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

type FilterType = 'none' | 'item' | 'rentalDate' | 'returnDate' | 'status';

interface DropdownPosition {
  top: number;
  left: number;
}

export default function RentalPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('none');
  const [searchTerm, setSearchTerm] = useState('');
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [workerLogRentalId, setWorkerLogRentalId] = useState<number | null>(null);
  const [editingItemCodeId, setEditingItemCodeId] = useState<number | null>(null);
  const [editingItemCodeValue, setEditingItemCodeValue] = useState('');
  const [optimisticItemCodes, setOptimisticItemCodes] = useState<Record<number, string>>({});
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const statusButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [selectedStatus, setSelectedStatus] =
    useState<RentalStatusUpdateRequestRentalStatus | null>(null);
  const cachedTotalPages = useRef(1);

  const { data, isLoading } = useQuery({
    ...getGetAllRentalHistoriesQueryOptions({
      pageNo: currentPage - 1,
      size: 10,
    }),
    staleTime: 1000 * 60 * 3,
  });
  const { mutateAsync: updateRentalStatus } = useUpdateRentalStatus();
  const { mutateAsync: updateItemCode } = useUpdateItemCode();

  const totalPages = data?.totalPage ?? cachedTotalPages.current;

  useEffect(() => {
    if (data?.totalPage) {
      cachedTotalPages.current = data.totalPage;
    }
  }, [data?.totalPage]);

  const rentals = data?.rentalHistories ?? [];

  const queryClient = useQueryClient();
  const { mutateAsync: deleteRental } = useDeleteRentalHistory();

  const rentalStatusLabelMap: Record<RentalStatusUpdateRequestRentalStatus, string> = {
    PENDING: '승인 대기 중',
    CANCEL: '취소됨',
    CONFIRMED: '승인 완료',
    REJECTED: '승인 거절',
    RENTAL: '대여 중',
    RETURN_PENDING: '반납 대기 중',
    RETURN_CONFIRMED: '반납 승인 완료',
    RETURNED: '반납 완료',
  };

  const rentalStatusColorMap: Record<RentalStatusUpdateRequestRentalStatus, string> = {
    PENDING: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    CANCEL: 'bg-[var(--secondary)] text-[var(--foreground-subtle)]',
    CONFIRMED: 'bg-[var(--success-bg)] text-[var(--success)]',
    REJECTED: 'bg-[var(--error-bg)] text-[var(--error)]',
    RENTAL: 'bg-[var(--info-bg)] text-[var(--info)]',
    RETURN_PENDING: 'bg-[var(--warning-bg)] text-[var(--warning)]',
    RETURN_CONFIRMED: 'bg-[var(--success-bg)] text-[var(--success)]',
    RETURNED: 'bg-[var(--success-bg)] text-[var(--success)]',
  };

  const getStatusLabel = (status: RentalStatusUpdateRequestRentalStatus) =>
    rentalStatusLabelMap[status];

  const getStatusColor = (status: RentalStatusUpdateRequestRentalStatus) =>
    rentalStatusColorMap[status];

  const statusOptions = Object.entries(RentalStatusUpdateRequestRentalStatus).map(
    ([key, value]) => ({
      label: rentalStatusLabelMap[value],
      value: value,
    }),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }

      if (openStatusDropdown !== null) {
        const statusDropdownRef = statusDropdownRefs.current[openStatusDropdown];
        if (statusDropdownRef && !statusDropdownRef.contains(event.target as Node)) {
          setOpenStatusDropdown(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openStatusDropdown]);

  const handleAddRental = async (rentalData: RentalHistoryRequest) => {
    try {
      await createRental(rentalData);
      await queryClient.invalidateQueries({ queryKey: ['/admin/rentals'] });
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = (rental: Rental) => {
    setRentalToDelete(rental);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRental = async () => {
    if (!rentalToDelete) return;

    try {
      await deleteRental({ rentalHistoryId: rentalToDelete.rentalHistoryId });
      await queryClient.invalidateQueries(getGetAllRentalHistoriesQueryOptions());
      toast.success('삭제되었습니다.');
    } catch (e) {
      console.error(e);
      toast.error('삭제에 실패했습니다.');
    } finally {
      setIsDeleteModalOpen(false);
      setRentalToDelete(null);
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
    setShowFilterDropdown(false);
  };

  const handleStatusChange = async (
    rentalId: number,
    newStatus: RentalStatusUpdateRequestRentalStatus,
  ) => {
    await updateRentalStatus({
      rentalHistoryId: rentalId,
      data: { rentalStatus: newStatus },
    });
    await queryClient.invalidateQueries({ queryKey: ['/admin/rentals'] });
    setOpenStatusDropdown(null);
  };

  const handleStatusClick = (rentalId: number) => {
    if (openStatusDropdown === rentalId) {
      setOpenStatusDropdown(null);
      return;
    }

    const buttonElement = statusButtonRefs.current[rentalId];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
      setOpenStatusDropdown(rentalId);
    }
  };

  const handleItemCodeEdit = (rentalHistoryId: number, currentValue?: string | null) => {
    setEditingItemCodeId(rentalHistoryId);
    setEditingItemCodeValue(currentValue ?? '');
  };

  const handleItemCodeSave = (rentalHistoryId: number) => {
    const trimmed = editingItemCodeValue.trim();
    setEditingItemCodeId(null);
    const value = trimmed || null;

    setOptimisticItemCodes((prev) => ({ ...prev, [rentalHistoryId]: value }));

    updateItemCode({
      rentalHistoryId,
      data: { itemCode: value },
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['/admin/rentals'] });
        toast.success('품목번호가 수정되었습니다.');
      })
      .catch((e: any) => {
        const message = e?.response?.data?.message || '품목번호 수정에 실패했습니다.';
        toast.error(message);
      })
      .finally(() => {
        setOptimisticItemCodes((prev) => {
          const next = { ...prev };
          delete next[rentalHistoryId];
          return next;
        });
      });
  };

  const handleItemCodeKeyDown = (e: React.KeyboardEvent, rentalHistoryId: number) => {
    if (e.key === 'Enter') {
      handleItemCodeSave(rentalHistoryId);
    } else if (e.key === 'Escape') {
      setEditingItemCodeId(null);
    }
  };

  const filteredAndSortedRentals = () => {
    let filtered = rentals.filter(
      (rental) =>
        searchTerm === '' ||
        rental.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.member.studentId.includes(searchTerm) ||
        rental.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (currentFilter === 'status' && selectedStatus) {
      filtered = filtered.filter((rental) => rental.rentalStatus === selectedStatus);
    }

    switch (currentFilter) {
      case 'item':
        return [...filtered].sort((a, b) => a.itemName.localeCompare(b.itemName));
      case 'rentalDate':
        return [...filtered].sort(
          (a, b) => new Date(b.rentAt).getTime() - new Date(a.rentAt).getTime(),
        );
      case 'returnDate':
        return [...filtered].sort((a, b) => {
          const aTime = a.returnedAt ? new Date(a.returnedAt).getTime() : 0;
          const bTime = b.returnedAt ? new Date(b.returnedAt).getTime() : 0;
          return bTime - aTime;
        });
      default:
        return filtered;
    }
  };

  const getFilterLabel = () => {
    switch (currentFilter) {
      case 'rentalDate':
        return '대여일 순';
      case 'returnDate':
        return '반납일 순';
      case 'status':
        return '상태별';
      default:
        return '필터';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">대여/반납 조회</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <input
              type="text"
              placeholder="학번 또는 이름을 입력해 주세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="relative" ref={filterDropdownRef}>
            {showFilterDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg">
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'none'
                      ? 'bg-[var(--background-hover)] text-[var(--primary)]'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                  }`}
                  onClick={() => handleFilterChange('none')}
                >
                  기본
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'item'
                      ? 'bg-[var(--background-hover)] text-[var(--primary)]'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                  }`}
                  onClick={() => handleFilterChange('item')}
                >
                  물품별
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'rentalDate'
                      ? 'bg-[var(--background-hover)] text-[var(--primary)]'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                  }`}
                  onClick={() => handleFilterChange('rentalDate')}
                >
                  대여일 순
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'returnDate'
                      ? 'bg-[var(--background-hover)] text-[var(--primary)]'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                  }`}
                  onClick={() => handleFilterChange('returnDate')}
                >
                  반납일 순
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">대여 추가하기</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--secondary)]">
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] w-16">
                  No
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  학생명
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  학번
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  물품명
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  품목번호
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  대여일
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  반납일
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  상태
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] w-16">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {isLoading ? (
                <TableSkeleton columns={9} rows={10} />
              ) : (
                filteredAndSortedRentals().map((rental, index) => (
                  <tr
                    key={rental.rentalHistoryId}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-[var(--foreground-muted)]">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                      {rental.member.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      {rental.member.studentId}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground)]">
                      {rental.itemName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      {editingItemCodeId === rental.rentalHistoryId ? (
                        <input
                          type="text"
                          value={editingItemCodeValue}
                          onChange={(e) => setEditingItemCodeValue(e.target.value)}
                          onBlur={() => handleItemCodeSave(rental.rentalHistoryId)}
                          onKeyDown={(e) => handleItemCodeKeyDown(e, rental.rentalHistoryId)}
                          autoFocus
                          className="h-7 w-24 rounded border border-[var(--primary)] bg-[var(--card)] px-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                      ) : (
                        <button
                          onClick={() => handleItemCodeEdit(rental.rentalHistoryId, optimisticItemCodes[rental.rentalHistoryId] ?? rental.itemCode)}
                          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] cursor-pointer transition-colors"
                        >
                          {(optimisticItemCodes[rental.rentalHistoryId] ?? rental.itemCode) ? (
                            <span>{optimisticItemCodes[rental.rentalHistoryId] ?? rental.itemCode}</span>
                          ) : (
                            <>
                              <Pencil className="h-3 w-3 text-[var(--foreground-subtle)]" />
                              <span className="text-xs text-[var(--foreground-subtle)]">입력</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(rental.rentAt)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground-muted)]">
                      {rental.returnedAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(rental.returnedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--foreground-subtle)]">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <div
                        className="relative"
                        ref={(el) => {
                          statusDropdownRefs.current[rental.rentalHistoryId] = el;
                        }}
                      >
                        <button
                          ref={(el) => {
                            statusButtonRefs.current[rental.rentalHistoryId] = el;
                          }}
                          onClick={() => handleStatusClick(rental.rentalHistoryId)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium cursor-pointer ${getStatusColor(
                            rental.rentalStatus,
                          )}`}
                        >
                          <span>{getStatusLabel(rental.rentalStatus)}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setWorkerLogRentalId(rental.rentalHistoryId)}
                          className="rounded-lg p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--info-bg)] hover:text-[var(--info)] cursor-pointer transition-colors"
                        >
                          <ClipboardList className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(rental)}
                          className="rounded-lg p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {openStatusDropdown !== null && (
        <div
          className="fixed z-50 w-32 rounded-lg border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          ref={(el) => {
            statusDropdownRefs.current[openStatusDropdown] = el;
          }}
        >
          {statusOptions.map((status) => (
            <button
              key={status.value}
              className={`flex w-full items-center px-3 py-2 text-left text-xs cursor-pointer ${
                rentals.find((r) => r.rentalHistoryId === openStatusDropdown)?.rentalStatus ===
                status.value
                  ? 'bg-[var(--background-hover)] text-[var(--primary)] font-medium'
                  : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
              }`}
              onClick={() => handleStatusChange(openStatusDropdown, status.value)}
            >
              {rentals.find((r) => r.rentalHistoryId === openStatusDropdown)?.rentalStatus ===
                status.value && <Check className="mr-1 h-3 w-3" />}
              {status.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {(() => {
            const pageGroup = Math.floor((currentPage - 1) / 10);
            const startPage = pageGroup * 10 + 1;
            const endPage = Math.min(startPage + 9, totalPages);
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                }`}
              >
                {page}
              </button>
            ));
          })()}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <RentalAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {rentalToDelete && (
        <RentalDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteRental}
          rentalInfo={`${rentalToDelete.member.name}님의 ${rentalToDelete.itemName} 대여 기록`}
          isActive={rentalToDelete.rentalStatus !== 'RETURNED'}
        />
      )}
      {workerLogRentalId !== null && (
        <WorkerLogModal
          isOpen={workerLogRentalId !== null}
          onClose={() => setWorkerLogRentalId(null)}
          rentalHistoryId={workerLogRentalId}
        />
      )}
    </div>
  );
}
