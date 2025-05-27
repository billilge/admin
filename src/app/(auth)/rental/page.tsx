'use client';

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Plus,
  Trash2,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import RentalAddModal from '@/components/modal/AddRentalModal';
import RentalDeleteModal from '@/components/modal/DeleteRentalModal';

interface Rental {
  id: number;
  studentName: string;
  studentId: string;
  itemName: string;
  rentalDate: string;
  returnDate: string | null;
  status: string;
  staff: string;
}

type FilterType = 'none' | 'item' | 'rentalDate' | 'returnDate';

interface DropdownPosition {
  top: number;
  left: number;
}

export default function RentalPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;
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

  // Sample data with time included
  const [rentals, setRentals] = useState<Rental[]>([
    {
      id: 1,
      studentName: '김민수',
      studentId: '20223456',
      itemName: '노트북',
      rentalDate: '2025-04-01 09:30',
      returnDate: null,
      status: '대여 중',
      staff: '이재영',
    },
    {
      id: 2,
      studentName: '이지은',
      studentId: '20223457',
      itemName: '빔프로젝터',
      rentalDate: '2025-04-02 13:15',
      returnDate: null,
      status: '승인 대기 중',
      staff: '황수민',
    },
    {
      id: 3,
      studentName: '박준호',
      studentId: '20223458',
      itemName: '카메라',
      rentalDate: '2025-03-25 10:45',
      returnDate: null,
      status: '반납 대기 중',
      staff: '윤신지',
    },
    {
      id: 4,
      studentName: '최유진',
      studentId: '20223459',
      itemName: '스피커',
      rentalDate: '2025-03-28 14:20',
      returnDate: '2025-04-04 16:30',
      status: '반납 완료',
      staff: '조다운',
    },
    {
      id: 5,
      studentName: '정승우',
      studentId: '20223460',
      itemName: '마이크',
      rentalDate: '2025-03-30 11:05',
      returnDate: null,
      status: '승인 완료',
      staff: '황현진',
    },
    {
      id: 6,
      studentName: '한소희',
      studentId: '20223461',
      itemName: '삼각대',
      rentalDate: '2025-03-29 15:40',
      returnDate: '2025-04-05 10:15',
      status: '반납 완료',
      staff: '이상현',
    },
  ]);

  // Status options
  const statusOptions = ['승인 대기 중', '승인 완료', '대여 중', '반납 대기 중', '반납 완료'];

  // Sample items data for the modal
  const items = [
    { id: 1, name: '노트북', itemType: '대여품', quantity: 5, rentedCount: 3 },
    { id: 2, name: '빔프로젝터', itemType: '대여품', quantity: 2, rentedCount: 1 },
    { id: 3, name: '카메라', itemType: '대여품', quantity: 3, rentedCount: 2 },
    { id: 4, name: '스피커', itemType: '대여품', quantity: 3, rentedCount: 1 },
    { id: 5, name: '마이크', itemType: '대여품', quantity: 4, rentedCount: 2 },
    { id: 6, name: '삼각대', itemType: '대여품', quantity: 2, rentedCount: 0 },
    { id: 7, name: '책상', itemType: '대여품', quantity: 5, rentedCount: 2 },
    { id: 8, name: '의자', itemType: '대여품', quantity: 8, rentedCount: 3 },
    { id: 9, name: 'A4 용지', itemType: '소모품', quantity: 500, rentedCount: 0 },
  ];

  // Sample staff data for the modal
  const staffs = [
    { name: '이재영', studentId: '20213049' },
    { name: '황수민', studentId: '20213102' },
    { name: '윤신지', studentId: '20223109' },
    { name: '조다운', studentId: '20223139' },
    { name: '황현진', studentId: '20223158' },
    { name: '이상현', studentId: '20223187' },
    { name: '이승민', studentId: '20223189' },
    { name: '이승찬', studentId: '20223190' },
  ];

  // Handle clicks outside filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }

      // Close status dropdown if clicked outside
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case '승인 대기 중':
        return 'bg-[#f2f4f6] text-[#4e5968]';
      case '승인 완료':
        return 'bg-[#e7f4ec] text-[#1b8b5a]';
      case '대여 중':
        return 'bg-[#e6eef5] text-[#004A98]';
      case '반납 대기 중':
        return 'bg-[#fff0f1] text-[#e93c3c]';
      case '반납 완료':
        return 'bg-[#e7f4ec] text-[#1b8b5a]';
      default:
        return 'bg-[#f2f4f6] text-[#4e5968]';
    }
  };

  const handleAddRental = (rentalData: {
    studentName: string;
    studentId: string;
    itemName: string;
    rentalDate: string;
    staff: string;
  }) => {
    const newId = rentals.length > 0 ? Math.max(...rentals.map((rental) => rental.id)) + 1 : 1;

    const newRental: Rental = {
      id: newId,
      studentName: rentalData.studentName,
      studentId: rentalData.studentId.startsWith('20')
        ? rentalData.studentId
        : `20${rentalData.studentId}`,
      itemName: rentalData.itemName,
      rentalDate: rentalData.rentalDate,
      returnDate: null,
      status: '승인 대기 중',
      staff: rentalData.staff,
    };

    setRentals([newRental, ...rentals]);
    setIsAddModalOpen(false);
  };

  const handleDeleteClick = (rental: Rental) => {
    setRentalToDelete(rental);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRental = () => {
    if (rentalToDelete) {
      setRentals(rentals.filter((rental) => rental.id !== rentalToDelete.id));
      setIsDeleteModalOpen(false);
      setRentalToDelete(null);
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setCurrentFilter(filter);
    setShowFilterDropdown(false);
  };

  const handleStatusChange = (rentalId: number, newStatus: string) => {
    setRentals(
      rentals.map((rental) => {
        if (rental.id === rentalId) {
          // If status is changed to "반납 완료", set returnDate to current date and time
          let returnDate = rental.returnDate;
          if (newStatus === '반납 완료' && !returnDate) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            returnDate = `${year}-${month}-${day} ${hours}:${minutes}`;
          }
          return { ...rental, status: newStatus, returnDate };
        }
        return rental;
      }),
    );
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

  // Filter and sort rentals based on current filter
  const filteredAndSortedRentals = () => {
    // First filter by search term if any
    const filtered = rentals.filter(
      (rental) =>
        searchTerm === '' ||
        rental.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rental.studentId.includes(searchTerm) ||
        rental.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Then sort based on current filter
    switch (currentFilter) {
      case 'item':
        return [...filtered].sort((a, b) => a.itemName.localeCompare(b.itemName));
      case 'rentalDate':
        return [...filtered].sort(
          (a, b) => new Date(b.rentalDate).getTime() - new Date(a.rentalDate).getTime(),
        );
      case 'returnDate':
        return [...filtered].sort((a, b) => {
          // Put items with no return date at the end
          if (a.returnDate === null && b.returnDate === null) return 0;
          if (a.returnDate === null) return 1;
          if (b.returnDate === null) return -1;
          return new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime();
        });
      default:
        return filtered;
    }
  };

  const getFilterLabel = () => {
    switch (currentFilter) {
      case 'item':
        return '물품별';
      case 'rentalDate':
        return '대여일 순';
      case 'returnDate':
        return '반납일 순';
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
            <button
              className="flex h-10 shrink-0 items-center gap-1 rounded-md border border-[#e5e8eb] bg-white px-4 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6]"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">{getFilterLabel()}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

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
                  근무자
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
                  key={rental.id}
                  className="border-b border-[#e5e8eb] last:border-b-0 hover:bg-[#f9fbfc]"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.studentName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.studentId}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#191f28]">
                    {rental.itemName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{rental.rentalDate}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">
                    {rental.returnDate ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{rental.returnDate}</span>
                      </div>
                    ) : (
                      <span className="text-[#8b95a1]">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[#6b7684]">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{rental.staff}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div
                      className="relative"
                      ref={(el) => (statusDropdownRefs.current[rental.id] = el)}
                    >
                      <button
                        ref={(el) => (statusButtonRefs.current[rental.id] = el)}
                        onClick={() => handleStatusClick(rental.id)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(
                          rental.status,
                        )}`}
                      >
                        <span>{rental.status}</span>
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

      {/* Status Dropdown Portal */}
      {openStatusDropdown !== null && (
        <div
          className="fixed z-50 w-32 rounded-md border border-[#e5e8eb] bg-white py-1 shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          ref={(el) => (statusDropdownRefs.current[openStatusDropdown] = el)}
        >
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`flex w-full items-center px-3 py-2 text-left text-xs ${
                rentals.find((r) => r.id === openStatusDropdown)?.status === status
                  ? 'bg-[#f9fbfc] text-[#004A98] font-medium'
                  : 'text-[#4e5968] hover:bg-[#f9fbfc]'
              }`}
              onClick={() => handleStatusChange(openStatusDropdown, status)}
            >
              {rentals.find((r) => r.id === openStatusDropdown)?.status === status && (
                <Check className="mr-1 h-3 w-3" />
              )}
              {status}
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

      {/* Rental Add Modal */}
      <RentalAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onApply={handleAddRental}
        items={items}
        staffs={staffs}
      />

      {/* Rental Delete Modal */}
      {rentalToDelete && (
        <RentalDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDeleteRental}
          rentalInfo={`${rentalToDelete.studentName}님의 ${rentalToDelete.itemName} 대여 기록`}
          isActive={rentalToDelete.status !== '반납 완료'}
        />
      )}
    </div>
  );
}
