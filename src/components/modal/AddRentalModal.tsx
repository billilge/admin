'use client';

import { X, Search, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Student {
  id: number;
  name: string;
  studentId: string;
}

interface RentalAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rentalData: {
    studentName: string;
    studentId: string;
    itemName: string;
    rentalDate: string;
    staff: string;
  }) => void;
  items: { id: number; name: string; itemType: string; quantity: number; rentedCount: number }[];
  staffs: { name: string; studentId: string }[];
}

export default function AddRentalModal({
  isOpen,
  onClose,
  onApply,
  items,
  staffs,
}: RentalAddModalProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [rentalDate, setRentalDate] = useState('');
  const [rentalTime, setRentalTime] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    setRentalDate(`${yyyy}-${mm}-${dd}`);
    setRentalTime(`${hh}:${min}`);
  }, [isOpen]);

  const students: Student[] = [
    { id: 1, name: '김민수', studentId: '20223456' },
    { id: 2, name: '이지은', studentId: '20223457' },
    { id: 3, name: '박준호', studentId: '20223458' },
    { id: 4, name: '최유진', studentId: '20223459' },
    { id: 5, name: '정승우', studentId: '20223460' },
    { id: 6, name: '한소희', studentId: '20223461' },
  ];

  const filteredStudents = students.filter(
    (s) => s.name.includes(studentSearchTerm) || s.studentId.includes(studentSearchTerm),
  );
  const filteredItems = items.filter(
    (item) =>
      item.name.includes(itemSearchTerm) &&
      item.itemType === '대여품' &&
      item.rentedCount < item.quantity,
  );
  const filteredStaffs = staffs.filter(
    (staff) => staff.name.includes(staffSearchTerm) || staff.studentId.includes(staffSearchTerm),
  );

  const handleApply = () => {
    if (selectedStudent && selectedItem && rentalDate && rentalTime && selectedStaff) {
      onApply({
        studentName: selectedStudent.name,
        studentId: selectedStudent.studentId,
        itemName: selectedItem,
        rentalDate: `${rentalDate} ${rentalTime}`,
        staff: selectedStaff,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-md">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold">대여 기록 추가하기</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedStudent(student);
                    setStudentSearchTerm(`${student.name} (${student.studentId})`);
                  }}
                >
                  <div className="text-sm font-medium">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.studentId}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">대여 물품</label>
            <input
              type="text"
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="물품명"
            />
            <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedItem(item.name);
                    setItemSearchTerm(item.name);
                  }}
                >
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    남은 수량: {item.quantity - item.rentedCount}/{item.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium">근무자</label>
            <input
              type="text"
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              placeholder="이름 또는 학번"
            />
            <div className="mt-1 border rounded-md max-h-32 overflow-y-auto">
              {filteredStaffs.map((staff, i) => (
                <div
                  key={i}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSelectedStaff(staff.name);
                    setStaffSearchTerm(staff.name);
                  }}
                >
                  <div className="text-sm font-medium">{staff.name}</div>
                  <div className="text-xs text-gray-500">{staff.studentId}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t">
          <button
            onClick={handleApply}
            disabled={
              !selectedStudent || !selectedItem || !rentalDate || !rentalTime || !selectedStaff
            }
            className="w-full rounded-md bg-[#004A98] py-3 text-white font-medium disabled:opacity-50"
          >
            대여 기록 추가
          </button>
        </div>
      </div>
    </div>
  );
}
