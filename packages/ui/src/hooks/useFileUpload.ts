/**
 * useFileUpload — File upload hook for web (images, PDFs, contracts)
 * Usage:
 *   const { pickAndUpload, uploading, progress } = useFileUpload();
 *   const result = await pickAndUpload('/api/uploads', { accept: 'image/*,.pdf' });
 */
import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { apiClient } from '../../core/api/apiClient';

type UploadOptions = {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
};

type UploadResult = {
  success: boolean;
  files: { name: string; url: string; size: number }[];
  error?: string;
};

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickAndUpload = useCallback(async (
    endpoint: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> => {
    if (Platform.OS !== 'web') {
      console.warn('[useFileUpload] File picker only supported on web');
      return { success: false, files: [], error: 'Chỉ hỗ trợ trên web' };
    }

    const { accept = '*', maxSizeMB = 10, multiple = false } = options;

    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;

      input.onchange = async (e: any) => {
        const fileList: File[] = Array.from(e.target.files || []);
        if (!fileList.length) {
          resolve({ success: false, files: [], error: 'Không chọn file' });
          return;
        }

        // Validate size
        const oversized = fileList.find(f => f.size > maxSizeMB * 1024 * 1024);
        if (oversized) {
          resolve({ success: false, files: [], error: `File "${oversized.name}" vượt quá ${maxSizeMB}MB` });
          return;
        }

        setUploading(true);
        setProgress(0);

        try {
          const formData = new FormData();
          fileList.forEach(f => formData.append('files', f));

          const res = await apiClient.post(endpoint, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e: any) => {
              if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            },
          });

          setUploading(false);
          setProgress(100);
          resolve({
            success: true,
            files: Array.isArray(res.data) ? res.data : [res.data],
          });
        } catch (err: any) {
          setUploading(false);
          setProgress(0);
          resolve({
            success: false,
            files: [],
            error: err.response?.data?.message || err.message || 'Upload thất bại',
          });
        }
      };

      input.oncancel = () => {
        resolve({ success: false, files: [], error: 'Đã hủy' });
      };

      input.click();
    });
  }, []);

  return { pickAndUpload, uploading, progress };
}
