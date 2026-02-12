'use client';

import { X, Folder } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { updateItem } from '@/api-client';
import { ItemRequest, ItemRequestType } from '@/api-client/model';
import { customMutator } from '@/lib/axiosMutator';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  editItem?: {
    id: number;
    name: string;
    itemType: string;
    quantity: number;
    imageUrl?: string;
  };
  isEditMode?: boolean;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onApply,
  editItem,
  isEditMode = false,
}: AddItemModalProps) {
  const [name, setName] = useState('');
  const [isConsumable, setIsConsumable] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && editItem) {
      setName(editItem.name);
      setIsConsumable(editItem.itemType === '소모품');
      setQuantity(editItem.quantity.toString());

      if (editItem.imageUrl) {
        setPreviewUrl(editItem.imageUrl);
        setImageFileName('기존 이미지');
      } else {
        setPreviewUrl(null);
        setImageFileName('');
      }
    } else if (!isEditMode) {
      resetForm();
    }
  }, [isEditMode, editItem, isOpen]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
      setImageFileName(files[0].name);
      if (previewUrl && !editItem?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(files[0]));
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl && imageFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, imageFile]);

  const handleApply = async () => {
    if (!name.trim() || !quantity.trim()) {
      toast.error('모든 항목을 입력해 주세요.');
      return;
    }

    const itemRequest: ItemRequest = {
      name: name.trim(),
      type: isConsumable ? ItemRequestType.CONSUMPTION : ItemRequestType.RENTAL,
      count: parseInt(quantity, 10),
    };

    if (!imageFile && !isEditMode) {
      toast.error('이미지를 반드시 첨부해 주세요.');
      return;
    }

    try {
      if (isEditMode && editItem) {
        const formData = new FormData();

        formData.append(
          'itemRequest',
          new Blob([JSON.stringify(itemRequest)], { type: 'application/json' }),
        );
        if (imageFile) {
          formData.append('image', imageFile);
        }

        await customMutator({
          url: `/admin/items/${editItem.id}`,
          method: 'PUT',
          data: formData,
        });
        toast.success('물품이 성공적으로 수정되었습니다.');
      } else {
        const formData = new FormData();

        formData.append(
          'itemRequest',
          new Blob([JSON.stringify(itemRequest)], { type: 'application/json' }),
        );

        if (imageFile) {
          formData.append('image', imageFile);
        } else {
          toast.error('이미지를 반드시 첨부해 주세요.');
          return;
        }

        await customMutator({
          url: '/admin/items',
          method: 'POST',
          data: formData,
        });

        toast.success('물품이 성공적으로 등록되었습니다.');
      }

      resetForm();
      onApply();
      onClose();
    } catch (error) {
      toast.error('물품 처리 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  const resetForm = () => {
    setName('');
    setIsConsumable(false);
    setQuantity('');
    setImageFile(null);
    setImageFileName('');
    if (previewUrl && !editItem?.imageUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-lg bg-[var(--popover)] shadow-xl"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {isEditMode ? '복지 물품 수정하기' : '복지 물품 추가하기'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="item-name" className="block text-sm font-medium text-[var(--foreground-muted)]">
                복지물품명
              </label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="등록할 복지물품의 이름을 입력해 주세요."
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground-muted)]">소모품 여부</label>
              <div className="flex gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="item-type"
                    checked={!isConsumable}
                    onChange={() => setIsConsumable(false)}
                    className="peer h-0 w-0 opacity-0"
                  />
                  <span className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--input)] px-6 text-sm text-[var(--foreground-muted)] peer-checked:border-[var(--primary)] peer-checked:bg-[var(--info-bg)] peer-checked:text-[var(--primary)] peer-checked:font-medium cursor-pointer">
                    대여물품
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="item-type"
                    checked={isConsumable}
                    onChange={() => setIsConsumable(true)}
                    className="peer h-0 w-0 opacity-0"
                  />
                  <span className="flex h-12 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--input)] px-6 text-sm text-[var(--foreground-muted)] peer-checked:border-[var(--primary)] peer-checked:bg-[var(--info-bg)] peer-checked:text-[var(--primary)] peer-checked:font-medium cursor-pointer">
                    소모품
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="item-quantity" className="block text-sm font-medium text-[var(--foreground-muted)]">
                수량
              </label>
              <input
                id="item-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="등록할 복지물품의 수량을 입력해 주세요."
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--foreground-muted)]">
                이미지 업로드 (.svg 파일)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--background-hover)]">
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Folder className="h-5 w-5 text-[var(--foreground-muted)]" />
                </label>
                <span className="text-sm text-[var(--foreground-muted)]">
                  {imageFileName || '선택된 파일 없음'}
                </span>
              </div>

              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                  <div className="relative aspect-video bg-[var(--background)]">
                    <img
                      src={previewUrl || '/placeholder.svg'}
                      alt="Preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-lg bg-[var(--primary)] text-base font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer"
          >
            {isEditMode ? '수정하기' : '물품 추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
