import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FieldValue,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { database } from "../app";
import { deleteObject, getStorage, ref } from "firebase/storage";

export interface Author {
  id?: string;
  name: string;
  email: string;
  photo?: string | null;
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

/**
 * Get All author Data From FireStore Database
 * Realtime Data Get
 */

export const getAllAuthorsRealTime = (
  colName: string,
  updateState: (categories: Author[]) => void
) => {
  const unsubscribe = onSnapshot(
    query(collection(database, colName), orderBy("createdAt", "desc")),
    (snapShot) => {
      const authorsDataList: Author[] = [];
      snapShot.docs.forEach((doc) => {
        authorsDataList.push({ ...doc.data(), id: doc.id } as Author);
      });
      updateState(authorsDataList);
    },
    (error) => {
      console.error("Error fetching authors:", error);
    }
  );

  return unsubscribe;
};

/**
 * Create A New author Data For FireStore Database
 * docId  create with id
 * otherwise create with autoId
 */

export const createAAuthor = async (
  colName: string,
  data: Author,
  docId: string | null = null
) => {
  // Create a new author
  if (docId) {
    await setDoc(doc(database, colName, docId), data);
  } else {
    await addDoc(collection(database, colName), data);
  }
};

// export const createACategory = async (
//   collectionName: string,
//   data: Category
// ) => {
//   try {
//     const docRef = await addDoc(collection(database, collectionName), data);
//     console.log("Document written with ID: ", docRef.id);
//     return docRef;
//   } catch (error) {
//     console.error("Error adding document: ", error);
//     throw error;
//   }
// };

/**
 * Delete A Single author Data From FireStore Database
 * include image deletion
 */

export const getDeleteAAuthor = async (
  colName: string,
  id: string,
  imagePath?: string | null
) => {
  const docRef = doc(database, colName, id);

  // If imagePath exists, delete the image from Firebase Storage
  if (imagePath) {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef)
      .then(() => {
        console.log("Image deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting image:", error);
      });
  }

  // Delete the category document
  await deleteDoc(docRef);
};

/**
 * Update A Author Data For FireStore Database
 */

export const updateAAuthor = async (
  collection: string,
  id: string,
  data: Partial<Author & { photo: string | null }>
): Promise<void> => {
  try {
    await updateDoc(doc(database, collection, id), data);
  } catch (error) {
    console.error("Error updating Author:", error);
    throw new Error("Failed to update Author");
  }
};

/**
 * Get A Single Author Data From FireStore Database
 */

// export const getASingleCategory = async (
//   colName: string,
//   id: string
// ): Promise<Category | undefined> => {
//   // Get a single category data
//   const category = await getDoc(doc(database, colName, id));

//   // Return category data
//   return category.data() as Category; // Cast to category type
// };

export const getASingleAuthor = async (id: string): Promise<Author | null> => {
  if (!id) {
    throw new Error("Author ID is required and cannot be undefined.");
  }

  try {
    const docRef = doc(database, "authors", id); // Reference the category document
    const docSnap = await getDoc(docRef); // Fetch the document

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || "",
        email: data.slug || "",
        photo: data.photo || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        status: data.status || false,
        trash: data.trash || false,
      } as Author;
    } else {
      console.error("No such Author exists in Firestore.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Author:", error);
    throw new Error("Failed to fetch the Author data.");
  }
};
