import { supabase } from '../utils/supabase';

const BUCKET = 'product-images';

export async function uploadProductImage(file: File, productId: number): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${productId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
  });
  if (error) throw error;

  return path;
}

export async function deleteProductImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export function getProductImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function ensureBucketExists(): Promise<boolean> {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return true;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });

  if (error) {
    console.warn(
      'No se pudo crear el bucket. Crealo manualmente en el dashboard de Supabase:',
      `Storage → Create bucket → "${BUCKET}" (público)`,
    );
    return false;
  }

  return true;
}
