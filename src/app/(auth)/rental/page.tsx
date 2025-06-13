'use client';

import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createRental, useUpdateRentalStatus } from '@/api-client';
import { getGetAllRentalHistoriesQueryOptions } from '@/api-client';
import { RentalStatusUpdateRequestRentalStatus } from '@/api-client/model';
import RentalAddModal from '@/components/modal/AddRentalModal';
import RentalDeleteModal from '@/components/modal/DeleteRentalModal';

interface Rental {
  rentalHistoryId: number;
  member: {
    name: string;
    studentId: string;
  };
  itemName: string;
  rentAt: string;
  returnedAt?: string | null | undefined; // TODO : 이래도 되나
  rentalStatus: RentalStatusUpdateRequestRentalStatus;
}

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
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0 });

  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const statusButtonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [selectedStatus, setSelectedStatus] =
    useState<RentalStatusUpdateRequestRentalStatus | null>(null);

  const { data, isLoading, refetch } = useQuery(getGetAllRentalHistoriesQueryOptions());
  const { mutateAsync: updateRentalStatus } = useUpdateRentalStatus();

  const totalPages = data?.totalPage ?? 1;

  const rentals = data?.rentalHistories ?? [];

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
    PENDING: 'bg-[#f2f4f6] text-[#4e5968]',
    CANCEL: 'bg-[#f2f4f6] text-[#8b95a1]',
    CONFIRMED: 'bg-[#e7f4ec] text-[#1b8b5a]',
    REJECTED: 'bg-[#fff0f1] text-[#e93c3c]',
    RENTAL: 'bg-[#e6eef5] text-[#004A98]',
    RETURN_PENDING: 'bg-[#fdf6ec] text-[#f5a623]',
    RETURN_CONFIRMED: 'bg-[#e7f4ec] text-[#1b8b5a]',
    RETURNED: 'bg-[#e7f4ec] text-[#1b8b5a]',
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

  const handleAddRental = async (rentalData: {
    studentName: string;
    studentId: string;
    itemName: string;
    rentalDate: string;
    staff: string;
  }) => {
    try {
      await createRental({ ...rentalData }); // 필요한 형태로 request 변환 필요
      await refetch(); // 최신 데이터로 갱신
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = (rental: Rental) => {
    setRentalToDelete(rental);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRental = () => {
    if (rentalToDelete) {
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
    await refetch();
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
        <h1 className="text-2xl font-bold text-[#191f28]">대여/반납 조회</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95a1]" />
            <input
              type="text"
              placeholder="학번 또는 이름을 입력해 주세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] pl-10 pr-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
            />
          </div>
          <div className="relative" ref={filterDropdownRef}>
            {/*<button*/}
            {/*  className="flex h-10 shrink-0 items-center gap-1 rounded-md border border-[#e5e8eb] bg-white px-4 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6]"*/}
            {/*  onClick={() => setShowFilterDropdown(!showFilterDropdown)}*/}
            {/*>*/}
            {/*  <Filter className="h-4 w-4" />*/}
            {/*  <span className="hidden sm:inline">{getFilterLabel()}</span>*/}
            {/*  <ChevronDown className="h-4 w-4" />*/}
            {/*</button>*/}

            {showFilterDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-[#e5e8eb] bg-white py-1 shadow-lg">
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'none'
                      ? 'bg-[#f9fbfc] text-[#004A98]'
                      : 'text-[#4e5968] hover:bg-[#f9fbfc]'
                  }`}
                  onClick={() => handleFilterChange('none')}
                >
                  기본
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'item'
                      ? 'bg-[#f9fbfc] text-[#004A98]'
                      : 'text-[#4e5968] hover:bg-[#f9fbfc]'
                  }`}
                  onClick={() => handleFilterChange('item')}
                >
                  물품별
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'rentalDate'
                      ? 'bg-[#f9fbfc] text-[#004A98]'
                      : 'text-[#4e5968] hover:bg-[#f9fbfc]'
                  }`}
                  onClick={() => handleFilterChange('rentalDate')}
                >
                  대여일 순
                </button>
                <button
                  className={`flex w-full items-center px-4 py-2 text-left text-sm ${
                    currentFilter === 'returnDate'
                      ? 'bg-[#f9fbfc] text-[#004A98]'
                      : 'text-[#4e5968] hover:bg-[#f9fbfc]'
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
            className="flex h-10 shrink-0 items-center gap-1 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">대여 추가하기</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#e5e8eb] bg-[#f9fbfc]">
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  학생명
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  학번
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  물품명
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  대여일
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  반납일
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  상태
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-medium text-[#4e5968]">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRentals().map((rental) => (
                <tr
                  key={rental.rentalHistoryId}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.member.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.member.studentId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.itemName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{rental.rentAt}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">
                    {rental.returnedAt ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{rental.returnedAt}</span>
                      </div>
                    ) : (
                      <span className="text-[#8b95a1]">-</span>
                    )}
                  </td>
                  {/*<td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">*/}
                  {/*  <div className="flex items-center gap-1">*/}
                  {/*    <User className="h-3 w-3" />*/}
                  {/*    <span>{rental.staff}</span>*/}
                  {/*  </div>*/}
                  {/*</td>*/}
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
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
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                          rental.rentalStatus,
                        )}`}
                      >
                        <span>{getStatusLabel(rental.rentalStatus)}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <button
                      onClick={() => handleDeleteClick(rental)}
                      className="rounded-md p-1 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/*TODO: 드롭다운 길이에 따라 표 넓이 바뀌는 것 수정 필요*/}
      {openStatusDropdown !== null && (
        <div
          className="fixed z-50 w-32 rounded-md border border-[#e5e8eb] bg-white py-1 shadow-lg"
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
              className={`flex w-full items-center px-3 py-2 text-left text-xs ${
                rentals.find((r) => r.rentalHistoryId === openStatusDropdown)?.rentalStatus ===
                status.value
                  ? 'bg-[#f9fbfc] text-[#004A98] font-medium'
                  : 'text-[#4e5968] hover:bg-[#f9fbfc]'
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
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="text-sm text-[#8b95a1]">
            {currentPage} / {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e8eb] bg-white text-[#4e5968] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div></div>
      </div>
      {/*<RentalAddModal*/}
      {/*  isOpen={isAddModalOpen}*/}
      {/*  onClose={() => setIsAddModalOpen(false)}*/}
      {/*  onApply={handleAddRental}*/}
      {/*  items={items}*/}
      {/*  staffs={staffs}*/}
      {/*/>*/}
      {rentalToDelete && (
        <RentalDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteRental}
          rentalInfo={`${rentalToDelete.member.name}님의 ${rentalToDelete.itemName} 대여 기록`}
          isActive={rentalToDelete.rentalStatus !== 'RETURNED'}
        />
      )}
    </div>
  );
}
