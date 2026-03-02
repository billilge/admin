'use client';

import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useAddRentalHistory,
  useGetAllAdminItems,
  useGetAdminList,
  useGetAllMembers,
  getGetAllRentalHistoriesQueryOptions,
} from '@/api-client';
import { RentalAddModalProps } from '@/types/modal';

export default function AddRentalModal({ isOpen, onClose, onApply }: RentalAddModalProps) {
  const queryClient = useQueryClient();
  const { queryKey } = getGetAllRentalHistoriesQueryOptions();

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [rentalDate, setRentalDate] = useState('');
  const [rentalTime, setRentalTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setRentalDate(now.toISOString().split('T')[0]);
      setRentalTime(now.toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  const { data: studentsData } = useGetAllMembers({ search: studentSearchTerm });
  const { data: itemData } = useGetAllAdminItems({ search: itemSearchTerm });
  const { data: staffsData } = useGetAdminList({ search: staffSearchTerm });

  const students = studentsData?.members ?? [];
  const items = itemData?.items ?? [];
  const staffs = staffsData?.admins ?? [];

  const filteredStaffs = staffs.filter(
    (staff) => staff.name.includes(staffSearchTerm) || staff.studentId.includes(staffSearchTerm),
  );

  const { mutate: addRentalHistory } = useAddRentalHistory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        onClose();
        toast.success('대여 기록이 추가되었습니다.');
      },
      onError: (error: any) => {
        onClose();
        const message =
          error?.response?.data?.message || error?.message || '대여 기록 추가에 실패했습니다.';

        setTimeout(() => {
          toast.error(message);
        }, 200);
      },
    },
  });

  const handleApply = () => {
    if (!selectedStudent || !selectedItem || !selectedStaff || !rentalDate || !rentalTime) return;

    const [hour, minute] = rentalTime.split(':').map(Number);
    addRentalHistory({
      data: {
        memberId: selectedStudent.memberId,
        itemId: selectedItem.itemId,
        count: 1,
        rentalTime: { hour, minute },
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-[var(--popover)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">대여 기록 추가하기</h2>
          <button onClick={onClose} className="p-1 text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)]">학생 검색</label>
            <input
              type="text"
              value={studentSearchTerm}
              onChange={(e) => {
                setStudentSearchTerm(e.target.value);
                setSelectedStudent(null);
              }}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="이름 또는 학번"
            />
            {!selectedStudent && students.length > 0 && (
              <div className="mt-1 border border-[var(--border)] rounded-lg max-h-32 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.memberId}
                    className="px-3 py-2 cursor-pointer hover:bg-[var(--background-hover)]"
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentSearchTerm(`${student.name} (${student.studentId})`);
                    }}
                  >
                    <div className="text-sm font-medium text-[var(--foreground)]">{student.name}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{student.studentId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)]">대여 물품</label>
            <input
              type="text"
              value={itemSearchTerm}
              onChange={(e) => {
                setItemSearchTerm(e.target.value);
                setSelectedItem(null);
              }}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="물품명"
            />
            {!selectedItem && items.length > 0 && (
              <div className="mt-1 border border-[var(--border)] rounded-lg max-h-32 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.itemId}
                    className="px-3 py-2 cursor-pointer hover:bg-[var(--background-hover)]"
                    onClick={() => {
                      setSelectedItem(item);
                      setItemSearchTerm(item.itemName);
                    }}
                  >
                    <div className="text-sm font-medium text-[var(--foreground)]">{item.itemName}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      수량: {item.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)]">대여 날짜</label>
              <input
                type="date"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)]">대여 시간</label>
              <input
                type="time"
                value={rentalTime}
                onChange={(e) => setRentalTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)]">근무자</label>
            <input
              type="text"
              value={staffSearchTerm}
              onChange={(e) => {
                setStaffSearchTerm(e.target.value);
                setSelectedStaff(null);
              }}
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="이름 또는 학번"
            />
            {!selectedStaff && filteredStaffs.length > 0 && (
              <div className="mt-1 border border-[var(--border)] rounded-lg max-h-32 overflow-y-auto">
                {filteredStaffs.map((staff) => (
                  <div
                    key={staff.memberId}
                    className="px-3 py-2 cursor-pointer hover:bg-[var(--background-hover)]"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setStaffSearchTerm(`${staff.name} (${staff.studentId})`);
                    }}
                  >
                    <div className="text-sm font-medium text-[var(--foreground)]">{staff.name}</div>
                    <div className="text-xs text-[var(--foreground-muted)]">{staff.studentId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={handleApply}
            disabled={
              !selectedStudent || !selectedItem || !selectedStaff || !rentalDate || !rentalTime
            }
            className="w-full rounded-lg bg-[var(--primary)] py-3 text-[var(--primary-foreground)] font-medium disabled:opacity-50 cursor-pointer hover:bg-[var(--primary-hover)]"
          >
            대여 기록 추가
          </button>
        </div>
      </div>
    </div>
  );
}
