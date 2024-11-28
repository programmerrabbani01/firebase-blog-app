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

export interface Category {
  id?: string;
  name: string;
  slug: string;
  photo?: string | null;
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

/**
 * Get All Category Data From FireStore Database
 * Realtime Data Get
 */

export const getAllCategoriesRealTime = (
  colName: string,
  updateState: (categories: Category[]) => void
) => {
  const unsubscribe = onSnapshot(
    query(collection(database, colName), orderBy("createdAt", "desc")),
    (snapShot) => {
      const categoriesDataList: Category[] = [];
      snapShot.docs.forEach((doc) => {
        categoriesDataList.push({ ...doc.data(), id: doc.id } as Category);
      });
      updateState(categoriesDataList);
    },
    (error) => {
      console.error("Error fetching categories:", error);
    }
  );

  return unsubscribe;
};

/**
 * Create A New Category Data For FireStore Database
 * docId  create with id
 * otherwise create with autoId
 */

export const createACategory = async (
  colName: string,
  data: Category,
  docId: string | null = null
) => {
  // Create a new Post
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
 * Delete A Single category Data From FireStore Database
 * include image deletion
 */

export const getDeleteACategory = async (
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
 * Update A Category Data For FireStore Database
 */

export const updateACategory = async (
  collection: string,
  id: string,
  data: Partial<Category & { photo: string | null }>
): Promise<void> => {
  try {
    await updateDoc(doc(database, collection, id), data);
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
};

/**
 * Get A Single Category Data From FireStore Database
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

// export const getASingleCategory = async (
//   id: string
// ): Promise<Category | null> => {
//   if (!id) {
//     throw new Error("Category ID is required and cannot be undefined.");
//   }

//   try {
//     const docRef = doc(database, "categories", id); // Reference the category document
//     const docSnap = await getDoc(docRef); // Fetch the document

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return {
//         id: docSnap.id,
//         name: data.name || "",
//         slug: data.slug || "",
//         photo: data.photo || null,
//         createdAt: data.createdAt || null,
//         updatedAt: data.updatedAt || null,
//         status: data.status || false,
//         trash: data.trash || false,
//       } as Category;
//     } else {
//       console.error("No such category exists in Firestore.");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching category:", error);
//     throw new Error("Failed to fetch the category data.");
//   }
// };

export const getASingleCategory = async (
  categoryId: string
): Promise<Category | null> => {
  try {
    const docRef = doc(database, "categories", categoryId); // Ensure this matches your Firestore collection name
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...(docSnap.data() as Category), // Ensure this matches your Category type/interface
      };
    } else {
      console.warn(`No category found with the ID: "${categoryId}"`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};
