/**
 * Format a raw byte size into a human-readable string.
 * @example
 * formatFileSize(1024) // "1.0 KB"
 * formatFileSize(1048576) // "1.0 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Generic display categories for mime group categorization */
export type MimeGroup = 'image' | 'video' | 'audio' | 'spreadsheet' | 'document' | 'other';

/**
 * Categorize a file mime-type and/or filename into user-friendly display groups.
 */
export function detectMimeGroup(mimeType?: string, fileName?: string): MimeGroup {
  if (!mimeType && !fileName) return 'other';

  const type = mimeType?.toLowerCase() || '';
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';

  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) {
    return 'image';
  }
  if (type.startsWith('video/') || ['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (
    [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ].includes(type) ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  ) {
    return 'spreadsheet';
  }
  if (
    [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ].includes(type) ||
    ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)
  ) {
    return 'document';
  }

  return 'other';
}
