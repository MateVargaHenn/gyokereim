export interface AdminFileItemDto {
  id: number;
  key: string;
  fileName: string;
  contentType: string;
  size: number;
  title: string | null;
  altText: string | null;
  isPublic: boolean;
  lastModified: string;
}