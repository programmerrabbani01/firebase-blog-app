import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { fireBaseApp } from "../app.ts";

// Initialize Storage
export const firebaseStorage = getStorage(fireBaseApp);

/**
 * Upload File To Firebase Storage
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The download URL of the uploaded file
 */

export const uploadAuthorFileToStorage = async (
  file: File
): Promise<string> => {
  // Reference to the authors folder
  const storageRef = ref(firebaseStorage, `authors/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get the upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        // Handle errors during the upload
        reject(error);
      },
      async () => {
        // Ensure that the upload task is complete
        try {
          const fileLink = await getDownloadURL(uploadTask.snapshot.ref);

          resolve(fileLink); // This resolves with the download URL of the uploaded file
        } catch (error) {
          reject(error); // Handle failure to get download URL
        }
      }
    );
  });
};

/**
 * Delete File From Firebase Storage
 * @param {string} filePath - The path to the file in storage
 * @returns {Promise<void>}
 */
export const deleteAuthorFileFromStorage = async (
  fileName: string
): Promise<void> => {
  // Reference to the file in the authors folder
  const fileRef = ref(firebaseStorage, `authors/${fileName}`);
  try {
    await deleteObject(fileRef);
    console.log(`File ${fileName} deleted successfully`);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
