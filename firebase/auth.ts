import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { fireBaseApp } from "./app.ts";

// export initialize authorization

export const auth = getAuth(fireBaseApp);

// social media login providers

export const googleProvider = new GoogleAuthProvider();
