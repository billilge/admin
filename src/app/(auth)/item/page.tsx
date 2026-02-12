'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Search, Plus, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDeleteItem, useGetAllAdminItems } from '@/api-client';
import ItemAddModal from '@/components/modal/AddItemModal';
import DeleteItemModal from '@/components/modal/DeleteItemModal';
import TableSkeleton from '@/components/ui/table-skeleton';
import { Item } from '@/types/item';

export default function ItemPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<Item | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const cachedTotalPages = useRef(1);

  const queryClient = useQueryClient();

  const { data, isLoading } = useGetAllAdminItems(
    { pageNo: currentPage - 1 },
    {
      query: {
        staleTime: 1000 * 60 * 3,
      },
    },
  );
  const items = data?.items ?? [];
  const totalPages = data?.totalPage ?? cachedTotalPages.current;

  useEffect(() => {
    if (data?.totalPage) {
      cachedTotalPages.current = data.totalPage;
    }
  }, [data?.totalPage]);

  const filteredItems = items.filter((item) =>
    item.itemName.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const handleEditItem = (item: Item) => {
    setCurrentEditItem(item);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentEditItem(null);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const { mutateAsync: deleteItem } = useDeleteItem();

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteItem({ itemId: itemToDelete.itemId });
        await queryClient.invalidateQueries({ queryKey: ['/admin/items'] });
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success('물품이 성공적으로 삭제되었습니다.');
      } catch (error) {
        toast.error('물품 처리 중 오류가 발생했습니다.');
      }
    }
  };

  const handleItemSubmit = async () => {
    await queryClient.invalidateQueries({ queryKey: ['/admin/items'] });
    handleCloseModal();
  };

  const getItemTypeColor = (itemType: Item['itemType']) => {
    return itemType === 'RENTAL'
      ? 'bg-[var(--info-bg)] text-[var(--info)]'
      : 'bg-[var(--success-bg)] text-[var(--success)]';
  };

  const getRentedCountColor = (rentedCount: number) => {
    if (rentedCount === 0) return 'text-[var(--foreground-subtle)]';
    return 'text-[var(--primary)] font-medium';
  };

  const getItemTypeLabel = (itemType: Item['itemType']) => {
    return itemType === 'RENTAL' ? '대여품' : '소모품';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">물품 관리</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-subtle)]" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="물품명을 입력해 주세요"
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setCurrentEditItem(null);
              setIsModalOpen(true);
            }}
            className="flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">새로운 물품 추가하기</span>
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
                  아이콘
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  물품명
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  대여품/소모품
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  수량
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  누적 대여 수
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)] w-24">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-muted)]">
              {isLoading ? (
                <TableSkeleton columns={7} rows={10} />
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.itemId}
                    className="transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-medium text-[var(--foreground-muted)]">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <div className="flex h-10 w-10 items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.itemName} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-xs text-[var(--foreground-subtle)] bg-[var(--secondary)] rounded-lg">
                            없음
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--foreground)]">
                      {item.itemName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getItemTypeColor(
                          item.itemType,
                        )}`}
                      >
                        {getItemTypeLabel(item.itemType)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--foreground)] text-center">
                      {item.count}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
                      {item.itemType === 'RENTAL' ? (
                        <span className={getRentedCountColor(item.renterCount)}>
                          {item.renterCount}
                        </span>
                      ) : (
                        <span className="text-[var(--foreground-subtle)]">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="rounded-lg p-1.5 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)] cursor-pointer transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
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

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
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
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
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
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ItemAddModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApply={handleItemSubmit}
        isEditMode={isEditMode}
        editItem={
          currentEditItem
            ? {
                id: currentEditItem.itemId,
                name: currentEditItem.itemName,
                itemType: currentEditItem.itemType,
                quantity: currentEditItem.count,
                imageUrl: currentEditItem.imageUrl,
              }
            : undefined
        }
      />

      {itemToDelete && (
        <DeleteItemModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={confirmDeleteItem}
          itemName={itemToDelete.itemName}
          hasRentedItems={itemToDelete.renterCount > 0}
        />
      )}
    </div>
  );
}
