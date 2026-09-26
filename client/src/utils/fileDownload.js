/**
 * Utility to reliably download files (images, PDFs, SVGs) across browsers
 * Fetches content as Blob and triggers anchor download, falling back to direct navigation
 */
export const downloadFromUrl = async (url, fallbackFilename = 'document') => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('File download response was not ok');
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fallbackFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
  } catch (err) {
    console.warn('Blob download fallback:', err);
    const a = document.createElement('a');
    a.href = url;
    a.download = fallbackFilename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
};
