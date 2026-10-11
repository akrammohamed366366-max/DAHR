import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Storage API Module
 * Uses standard path conventions:
 * - /products/{productId}/{fileName}
 * - /journal/{articleId}/{fileName}
 */
export const storageApi = {
  /**
   * Upload a product image
   */
  async uploadProductImage(
    productId: string,
    file: File | Blob,
    fileName: string
  ): Promise<string> {
    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `products/${productId}/${sanitizedName}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error uploading product image for ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Upload a journal article hero or body image
   */
  async uploadJournalImage(
    articleId: string,
    file: File | Blob,
    fileName: string
  ): Promise<string> {
    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageRef = ref(storage, `journal/${articleId}/${sanitizedName}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error uploading journal image for ${articleId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an image from storage by full storage URL / path
   */
  async deleteFileByPath(fullPath: string): Promise<void> {
    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error(`Error deleting storage file at ${fullPath}:`, error);
      throw error;
    }
  },
};
