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
  const [studentFocused, setStudentFocused] = useState(false);
  const [itemFocused, setItemFocused] = useState(false);
  const [staffFocused, setStaffFocused] = useState(false);

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

  const filteredItems = items.filter(
    (item) =>
      item.itemName.includes(itemSearchTerm) &&
      item.itemType === 'RENTAL' &&
      item.renterCount < item.count,
  );

  const filteredStaffs = staffs.filter(
    (staff) => staff.name.includes(staffSearchTerm) || staff.studentId.includes(staffSearchTerm),
  );

  const { mutate: addRentalHistory } = useAddRentalHistory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
        // onApply?.();
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
      <div className="w-full max-w-md rounded-lg bg-white shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">대여 기록 추가하기</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 학생 선택 */}
          <div>
            <label className="block text-sm font-medium">학생 검색</label>
            <input
              type="text"
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="이름 또는 학번"
            />
            <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
              {(studentFocused || studentSearchTerm) && (
                <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.memberId}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedStudent(student);
                        setStudentSearchTerm(`${student.name} (${student.studentId})`);
                        setStudentFocused(false);
                      }}
                    >
                      <div className="text-sm font-medium">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.studentId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 물품 선택 */}
          <div>
            <label className="block text-sm font-medium">대여 물품</label>
            <input
              type="text"
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="물품명"
            />
            {(itemFocused || itemSearchTerm) && (
              <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedItem(item);
                      setItemSearchTerm(item.itemName);
                    }}
                  >
                    <div className="text-sm font-medium">{item.itemName}</div>
                    <div className="text-xs text-gray-500">
                      남은 수량: {item.count - item.renterCount}/{item.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 날짜 및 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">대여 날짜</label>
              <input
                type="date"
                value={rentalDate}
                onChange={(e) => setRentalDate(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">대여 시간</label>
              <input
                type="time"
                value={rentalTime}
                onChange={(e) => setRentalTime(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
          </div>

          {/* 근무자 선택 */}
          <div>
            <label className="block text-sm font-medium">근무자</label>
            <input
              type="text"
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="이름 또는 학번"
            />
            {(staffFocused || staffSearchTerm) && (
              <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
                {filteredStaffs.map((staff) => (
                  <div
                    key={staff.memberId}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSelectedStaff(staff);
                      setStaffSearchTerm(`${staff.name} (${staff.studentId})`);
                    }}
                  >
                    <div className="text-sm font-medium">{staff.name}</div>
                    <div className="text-xs text-gray-500">{staff.studentId}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={handleApply}
            disabled={
              !selectedStudent || !selectedItem || !selectedStaff || !rentalDate || !rentalTime
            }
            className="w-full rounded-md bg-[#004A98] py-3 text-white font-medium disabled:opacity-50 cursor-pointer"
          >
            대여 기록 추가
          </button>
        </div>
      </div>
    </div>
  );
}
