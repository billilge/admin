'use client';

import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Student {
  id: number;
  name: string;
  studentId: string;
  selected: boolean;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (selectedStudents: Student[]) => void;
}

export default function AddAdminModal({ isOpen, onClose, onApply }: AddAdminModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: '최희진', studentId: '20181574', selected: false },
    { id: 2, name: '김소호', studentId: '20191553', selected: false },
    { id: 3, name: '이승화', studentId: '20191642', selected: false },
    { id: 4, name: '김민수', studentId: '20203037', selected: false },
    { id: 5, name: '김성호', studentId: '20203040', selected: false },
    { id: 6, name: '박재훈', studentId: '20203073', selected: false },
    { id: 7, name: '신현승', studentId: '20203080', selected: false },
    { id: 8, name: '김민재', studentId: '20212970', selected: false },
    { id: 9, name: '박지민', studentId: '20212992', selected: false },
    { id: 10, name: '박수연', studentId: '20212996', selected: false },
  ]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleStudent = (id: number) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, selected: !student.selected } : student,
      ),
    );
  };

  const handleApply = () => {
    const selectedStudents = students.filter((student) => student.selected);
    onApply(selectedStudents);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
          <h2 className="text-xl font-bold text-[#191f28]">관리자 추가하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student List */}
        <div className="max-h-[350px] overflow-y-auto px-6 py-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-12 pb-3"></th>
                <th className="pb-3 pl-2 text-left text-sm font-medium text-[#4e5968]">이름</th>
                <th className="pb-3 text-left text-sm font-medium text-[#4e5968]">학번</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-[#f2f4f6] last:border-b-0">
                  <td className="py-3 pr-2">
                    <div className="flex items-center justify-center">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          id={`student-${student.id}`}
                          checked={student.selected}
                          onChange={() => toggleStudent(student.id)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#d1d6db] bg-white checked:border-[#004A98] checked:bg-[#004A98] hover:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
                        />
                        {student.selected && (
                          <Check className="pointer-events-none absolute h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pl-2">
                    <label
                      htmlFor={`student-${student.id}`}
                      className="cursor-pointer text-sm text-[#191f28]"
                    >
                      {student.name}
                    </label>
                  </td>
                  <td className="py-3 text-left text-sm text-[#6b7684]">{student.studentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination and Button */}
        <div className="border-t border-[#e5e8eb] px-6 py-4">
          <div className="mb-5 flex items-center justify-center">
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
          </div>

          {/* Apply Button */}
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-md bg-[#004A98] text-base font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
