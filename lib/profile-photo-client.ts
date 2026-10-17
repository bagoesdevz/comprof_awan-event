export async function profilePhotoUpload(file: File, signal: AbortSignal): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url;
    try { await image.decode(); }
    catch { throw new Error("Foto tidak dapat dibaca. Pilih gambar PNG, JPG, atau WebP lain."); }
    if (image.naturalWidth * image.naturalHeight > 25_000_000) throw new Error("Gunakan foto dengan ukuran maksimal 25 megapiksel.");
    if (signal.aborted) throw new DOMException("Upload dibatalkan", "AbortError");
    const canvas = document.createElement("canvas"); canvas.width = 512; canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Foto belum dapat diproses. Coba lagi melalui peramban lain.");
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 512, 512);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", .85));
    if (!blob) throw new Error("Foto belum dapat diproses. Pilih gambar lain lalu coba lagi.");
    if (signal.aborted) throw new DOMException("Upload dibatalkan", "AbortError");
    return blob;
  } finally { URL.revokeObjectURL(url); }
}
