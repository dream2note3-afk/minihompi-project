/**
 * Google Drive Photo Link Parser and Direct Image Converter
 * Converts Google Drive sharing links into direct viewable image URLs
 */

export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]+)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: id=([a-zA-Z0-9_-]+)
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // Pattern 3: /d/([a-zA-Z0-9_-]+)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  // Pattern 4: /open?id=([a-zA-Z0-9_-]+)
  const openMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch && openMatch[1]) {
    return openMatch[1];
  }

  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('drive.google.com') ||
    lower.includes('docs.google.com') ||
    lower.includes('googleusercontent.com/d/')
  );
}

/**
 * Returns high-speed CDN direct image URL for Google Drive file
 * Note: The Google Drive file permission must be set to "Anyone with the link can view".
 */
export function getGoogleDriveDirectImageUrl(urlOrId: string): string {
  const fileId = extractGoogleDriveFileId(urlOrId) || urlOrId.trim();
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}

/**
 * Returns alternative high-resolution thumbnail URL
 */
export function getGoogleDriveThumbnailUrl(urlOrId: string, width = 1600): string {
  const fileId = extractGoogleDriveFileId(urlOrId) || urlOrId.trim();
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

/**
 * Automatically transforms any Google Drive URL into a direct image URL.
 * If not Google Drive, returns original URL as-is.
 */
export function transformIfGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (isGoogleDriveUrl(trimmed)) {
    const fileId = extractGoogleDriveFileId(trimmed);
    if (fileId) {
      return getGoogleDriveDirectImageUrl(fileId);
    }
  }
  return trimmed;
}

/**
 * Fallback image handler for Google Drive images
 */
export function handleGoogleDriveImageError(
  imgElement: HTMLImageElement,
  originalUrlOrId: string
) {
  const fileId = extractGoogleDriveFileId(originalUrlOrId);
  if (!fileId) return;

  const currentSrc = imgElement.src;
  const thumbUrl = getGoogleDriveThumbnailUrl(fileId, 1200);
  const ucUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

  if (!currentSrc.includes('thumbnail')) {
    imgElement.src = thumbUrl;
  } else if (!currentSrc.includes('export=view')) {
    imgElement.src = ucUrl;
  }
}
