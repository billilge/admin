'use client';

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

  const renderTable = () => {
    if (isLoading) {
      return <p className="mt-4 text-center text-sm text-[var(--foreground-subtle)]">불러오는 중...</p>;
    }
    if (isError || !memberData) {
      return <p className="mt-4 text-center text-sm text-[var(--foreground-subtle)]">검색어를 입력해주세요.</p>;
    }
    if (memberData.members.length === 0) {
      return <p className="mt-4 text-center text-sm text-[var(--foreground-subtle)]">검색 결과가 없습니다.</p>;
    }

    return (
      <table className="mt-4 w-full">
        <thead>
          <tr>
            <th className="w-12 pb-3"></th>
            <th className="pb-3 pl-2 text-left text-sm font-medium text-[var(--foreground-muted)]">이름</th>
            <th className="pb-3 text-left text-sm font-medium text-[var(--foreground-muted)]">학번</th>
          </tr>
        </thead>
        <tbody>
          {memberData.members.map((student) => {
            const isSelected = selectedIds.has(student.memberId);
            return (
              <tr key={student.memberId} className="border-b border-[var(--secondary)] last:border-b-0">
                <td className="py-3 pr-2">
                  <div className="flex justify-center items-center">
                    <button
                      type="button"
                      onClick={() => toggleStudent(student.memberId)}
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)]'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                    </button>
                  </div>
                </td>
                <td className="py-3 pl-2 text-sm text-[var(--foreground)]">{student.name}</td>
                <td className="py-3 text-left text-sm text-[var(--foreground-muted)]">{student.studentId}</td>
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
        className="w-full max-w-md overflow-hidden rounded-lg bg-[var(--popover)] shadow-xl"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex justify-between items-center border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">관리자 추가하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)]"
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
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none"
              placeholder="이름 또는 학번"
            />
            <button
              onClick={handleSearch}
              className="rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] whitespace-nowrap"
            >
              검색
            </button>
          </div>
          {renderTable()}
        </div>

        <div className="border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-lg bg-[var(--primary)] text-base font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
