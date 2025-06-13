'use client';

import { X, Folder } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAddItem } from '@/api-client';
import { updateItem } from '@/api-client'; // 추가
import { ItemRequest, ItemRequestType } from '@/api-client/model';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void; // 성공 시 외부에 알림용 콜백
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

  const { mutate } = useAddItem({
    mutation: {
      onSuccess: () => {
        toast.success('물품이 성공적으로 등록되었습니다.');
        resetForm();
        onApply();
        onClose();
      },
      onError: () => {
        toast.error('물품 등록 중 오류가 발생했습니다.');
      },
    },
  });

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

  const handleApply = () => {
    if (!name.trim() || !quantity.trim()) {
      toast.error('모든 항목을 입력해 주세요.');
      return;
    }

    const itemRequest: ItemRequest = {
      name: name.trim(),
      type: isConsumable ? ItemRequestType.CONSUMPTION : ItemRequestType.RENTAL,
      count: parseInt(quantity, 10),
    };

    if (isEditMode && editItem) {
      const formData = new FormData();
      formData.append('itemRequest', JSON.stringify(itemRequest));
      if (imageFile) formData.append('image', imageFile);

      updateItem(editItem.id, {
        itemRequest,
        image: imageFile ?? new Blob(), // 타입 만족용, 실제 서버는 없으면 무시
      })
        .then(() => {
          toast.success('물품이 성공적으로 수정되었습니다.');
          resetForm();
          onApply();
          onClose();
        })
        .catch(() => {
          toast.error('물품 수정 중 오류가 발생했습니다.');
        });
    } else {
      if (!imageFile) {
        toast.error('이미지를 반드시 첨부해 주세요.');
        return;
      }

      mutate({
        data: {
          itemRequest,
          image: imageFile,
        },
      });
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
        className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4 ">
          <h2 className="text-xl font-bold text-[#191f28] ">
            {isEditMode ? '복지 물품 수정하기' : '복지 물품 추가하기'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4">
          <div className="space-y-5">
            {/* Item Name */}
            <div className="space-y-2">
              <label htmlFor="item-name" className="block text-sm font-medium text-[#4e5968]">
                복지물품명
              </label>
              <input
                id="item-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="등록할 복지물품의 이름을 입력해 주세요."
                className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>

            {/* Consumable Status */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4e5968]">소모품 여부</label>
              <div className="flex gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="item-type"
                    checked={!isConsumable}
                    onChange={() => setIsConsumable(false)}
                    className="peer h-0 w-0 opacity-0"
                  />
                  <span className="flex h-12 items-center justify-center rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-6 text-sm text-[#4e5968] peer-checked:border-[#004A98] peer-checked:bg-[#e6eef5] peer-checked:text-[#004A98] peer-checked:font-medium cursor-pointer">
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
                  <span className="flex h-12 items-center justify-center rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-6 text-sm text-[#4e5968] peer-checked:border-[#004A98] peer-checked:bg-[#e6eef5] peer-checked:text-[#004A98] peer-checked:font-medium cursor-pointer">
                    소모품
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="item-quantity" className="block text-sm font-medium text-[#4e5968]">
                수량
              </label>
              <input
                id="item-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="등록할 복지물품의 수량을 입력해 주세요."
                className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#4e5968]">
                이미지 업로드 (.svg 파일)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-[#e5e8eb] bg-[#f9fbfc] hover:bg-[#f2f4f6]">
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Folder className="h-5 w-5 text-[#6b7684]" />
                </label>
                <span className="text-sm text-[#6b7684]">
                  {imageFileName || '선택된 파일 없음'}
                </span>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-md border border-[#e5e8eb]">
                  <div className="relative aspect-video bg-[#f9fbfc]">
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

        {/* Footer with Apply Button */}
        <div className="border-t border-[#e5e8eb] px-6 py-4">
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-md bg-[#004A98] text-base font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
          >
            {isEditMode ? '수정하기' : '물품 추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
