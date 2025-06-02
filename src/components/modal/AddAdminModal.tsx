'use client';

import { X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetAllPayers } from '@/api-client';

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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

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

  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  // const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 페이지 초기화
    setSearchKeyword(inputKeyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const {
    data: payerData,
    isLoading,
    isError,
  } = useGetAllPayers(
    searchKeyword
      ? {
          pageNo: currentPage - 1,
          size: 999,
          criteria: 'name',
          search: searchKeyword,
        }
      : undefined,
    {
      query: {
        staleTime: 1000 * 60 * 3,
        enabled: isOpen && !!searchKeyword,
      },
    },
  );

  const toggleStudent = (id: number) => {
    setSelectedIds((prev) =>
      prev.has(id) ? new Set([...prev].filter((v) => v !== id)) : new Set(prev).add(id),
    );
  };

  const handleApply = () => {
    console.log('[DEBUG] 적용 버튼 클릭됨'); // 가장 먼저 실행되어야 함
    if (!payerData?.payers) {
      console.warn('[DEBUG] payerData가 없음', payerData);
      return;
    }
    const selectedStudents = payerData.payers
      .filter((payer) => selectedIds.has(payer.payerId))
      .map((payer) => ({
        id: payer.payerId,
        name: payer.name,
        studentId: payer.studentId,
        selected: true,
      }));

    console.log('[DEBUG] onApply 호출됨');
    onApply(selectedStudents);
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
          <h2 className="text-xl font-bold text-[#191f28]">관리자 추가하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[350px] overflow-y-auto px-6 py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border px-3 py-2"
              placeholder="이름 또는 학번"
            />
            <button
              onClick={handleSearch}
              className="rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] whitespace-nowrap"
            >
              검색
            </button>
          </div>

          {isLoading ? (
            <div className="mt-4 text-center text-sm text-gray-500">불러오는 중...</div>
          ) : isError || !payerData ? (
            <div className="mt-4 text-center text-sm text-gray-500">검색어를 입력해주세요.</div>
          ) : payerData.payers.length === 0 ? (
            <div className="mt-4 text-center text-sm text-gray-500">검색 결과가 없습니다.</div>
          ) : (
            <table className="mt-4 w-full">
              <thead>
                <tr>
                  <th className="w-12 pb-3"></th>
                  <th className="pb-3 pl-2 text-left text-sm font-medium text-[#4e5968]">이름</th>
                  <th className="pb-3 text-left text-sm font-medium text-[#4e5968]">학번</th>
                </tr>
              </thead>
              <tbody>
                {payerData.payers.map((student) => (
                  <tr key={student.payerId} className="border-b border-[#f2f4f6] last:border-b-0">
                    <td className="py-3 pr-2">
                      <div className="flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            id={`student-${student.payerId}`}
                            checked={selectedIds.has(student.payerId)}
                            onChange={() => toggleStudent(student.payerId)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#d1d6db] bg-white checked:border-[#004A98] checked:bg-[#004A98] hover:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
                          />
                          {selectedIds.has(student.payerId) && (
                            <Check className="pointer-events-none absolute h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pl-2">
                      <label
                        htmlFor={`student-${student.payerId}`}
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
          )}
        </div>
        <div className="border-t border-[#e5e8eb] px-6 py-4">
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
