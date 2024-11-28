import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FieldValue,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { database } from "../app";
import { deleteObject, getStorage, ref } from "firebase/storage";

export interface Blog {
  id?: string;
  title: string;
  slug: string;
  content: string;
  photo?: string | null;
  categoryId?: string; // Optional category reference
  authorId?: string; // Optional author reference
  createdAt?: typeof serverTimestamp | FieldValue | null;
  updatedAt?: typeof serverTimestamp | FieldValue | null;
  status?: boolean;
  trash?: boolean;
}

/**
 * Get All Blog Data From FireStore Database
 * Realtime Data Get
 */

export const getAllBlogsRealTime = (
  colName: string,
  updateState: (blogs: Blog[]) => void
) => {
  const unsubscribe = onSnapshot(
    query(collection(database, colName), orderBy("createdAt", "desc")),
    (snapShot) => {
      const blogsDataList: Blog[] = [];
      snapShot.docs.forEach((doc) => {
        blogsDataList.push({ ...doc.data(), id: doc.id } as Blog);
      });
      updateState(blogsDataList);
    },
    (error) => {
      console.error("Error fetching blogs:", error);
    }
  );

  return unsubscribe;
};

/**
 * Create A New Blog Data For FireStore Database
 * docId  create with id
 * otherwise create with autoId
 */

export const createABlog = async (
  colName: string,
  data: Blog,
  docId: string | null = null
) => {
  // Create a new blog
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
 * Delete A Single Blog Data From FireStore Database
 * include image deletion
 */

export const getDeleteABlog = async (
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

export const updateABlog = async (
  collection: string,
  id: string,
  data: Partial<Blog & { photo: string | null }>
): Promise<void> => {
  try {
    await updateDoc(doc(database, collection, id), data);
  } catch (error) {
    console.error("Error updating blog:", error);
    throw new Error("Failed to update blog");
  }
};

/**
 * Get A Single Category Data From FireStore Database
 */

// export const getASingleBlog = async (id: string): Promise<Blog | null> => {
//   // Validate the provided ID
//   if (!id || typeof id !== "string") {
//     throw new Error("A valid Blog ID is required and cannot be undefined.");
//   }

//   try {
//     // Reference the specific document in the 'blogs' collection
//     const docRef = doc(database, "blogs", id);

//     // Fetch the document snapshot
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       // Retrieve the document data
//       const data = docSnap.data();

//       // Convert Firestore data to the Blog type
//       return {
//         id: docSnap.id,
//         title: data?.title || "",
//         slug: data?.slug || "",
//         content: data?.content || "",
//         photo: data?.photo || null,
//         createdAt:
//           data?.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
//         updatedAt:
//           data?.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null,
//         status: data?.status || false,
//         trash: data?.trash || false,
//       } as Blog;
//     } else {
//       console.warn(`No blog found with the ID "${id}".`);
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching Blog:", error);

//     // Re-throw a user-friendly error
//     throw new Error(
//       "Failed to fetch the Blog data. Please check your console for more details."
//     );
//   }
// };

// export const getASingleBlog = async (id: string) => {
//   const docRef = doc(database, "blogs", id); // Accessing the blog document by ID
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     return docSnap.data(); // Returns blog data if exists
//   } else {
//     return null; // Return null if the document doesn't exist
//   }
// };

// Ensure you have a `Blog` interface

export async function getASingleBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const q = query(
      collection(database, "blogs"),
      where("slug", "==", slug) // Filter blogs by slug
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]; // Take the first result
      const data = doc.data(); // Retrieve document data

      // Return the data as a Blog, including the document ID
      return {
        id: doc.id, // Add the document ID
        ...(data as Blog), // Cast the Firestore data to Blog type
      };
    }

    return null; // Return null if no matching blog is found
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null; // Handle errors gracefully
  }
}

/**
 * Get Blogs By Category
 */

export async function getBlogsByCategory(categoryId: string) {
  const q = query(
    collection(database, "blogs"),
    where("categoryId", "==", categoryId)
  );
  const querySnapshot = await getDocs(q);

  const blogs = querySnapshot.docs.map((doc) => ({
    id: doc.id, // Make sure this line is correctly adding the ID
    ...doc.data(),
  }));

  console.log("Blogs fetched with IDs:", blogs); // This should show the blogs along with their ids
  return blogs;
}
