'use client';

// TODO : 이미 관리자로 등록되어 있는 사람을 중복 추가했을 때 예외 처리 필요

import { X, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetAllMembers } from '@/api-client';
import { AddAdminModalProps } from '@/types/modal';

export default function AddAdminModal({ isOpen, onClose, onApply }: AddAdminModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [inputKeyword, setInputKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchKeyword(inputKeyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const toggleStudent = (id: number) => {
    setSelectedIds((prev) =>
      prev.has(id) ? new Set([...prev].filter((v) => v !== id)) : new Set(prev).add(id),
    );
  };

  const handleApply = () => {
    if (!memberData?.members) return;

    const selectedStudents = memberData.members
      .filter((member) => selectedIds.has(member.memberId))
      .map(({ memberId, name, studentId }) => ({
        id: memberId,
        name,
        studentId,
        selected: true,
      }));

    onApply(selectedStudents);
  };

  const {
    data: memberData,
    isLoading,
    isError,
  } = useGetAllMembers(
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

  if (!isOpen) return null;

  // 조건부 렌더링 분리
  const renderTable = () => {
    if (isLoading) {
      return <p className="mt-4 text-center text-sm text-gray-500">불러오는 중...</p>;
    }
    if (isError || !memberData) {
      return <p className="mt-4 text-center text-sm text-gray-500">검색어를 입력해주세요.</p>;
    }
    if (memberData.members.length === 0) {
      return <p className="mt-4 text-center text-sm text-gray-500">검색 결과가 없습니다.</p>;
    }

    return (
      <table className="mt-4 w-full">
        <thead>
          <tr>
            <th className="w-12 pb-3"></th>
            <th className="pb-3 pl-2 text-left text-sm font-medium text-[#4e5968]">이름</th>
            <th className="pb-3 text-left text-sm font-medium text-[#4e5968]">학번</th>
          </tr>
        </thead>
        <tbody>
          {memberData.members.map((student) => {
            const isSelected = selectedIds.has(student.memberId);
            return (
              <tr key={student.memberId} className="border-b border-[#f2f4f6] last:border-b-0">
                <td className="py-3 pr-2">
                  <div className="flex justify-center items-center">
                    <label
                      htmlFor={`student-${student.memberId}`}
                      className="relative cursor-pointer"
                    >
                      <input
                        id={`student-${student.memberId}`}
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleStudent(student.memberId)}
                        className="peer h-5 w-5 appearance-none rounded-md border border-[#d1d6db] bg-white checked:border-[#004A98] checked:bg-[#004A98] hover:border-[#004A98] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
                      />
                      {isSelected && (
                        <Check className="absolute inset-0 m-auto h-3 w-3 text-white pointer-events-none" />
                      )}
                    </label>
                  </div>
                </td>
                <td className="py-3 pl-2 text-sm text-[#191f28]">{student.name}</td>
                <td className="py-3 text-left text-sm text-[#6b7684]">{student.studentId}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-md"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex justify-between items-center border-b border-[#e5e8eb] px-6 py-4">
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
          {renderTable()}
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
