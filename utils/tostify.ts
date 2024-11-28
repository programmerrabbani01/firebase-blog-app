import { toast, ToastOptions } from "react-toastify";

// Define Toast Types
type ToastType = "success" | "error" | "warn" | "info";

/**
 * Create a toaster with a specific type
 * @param {string} msg - The message to display in the toast
 * @param {ToastType} type - The type of toast (default: "error")
 */
export const createToaster = (msg: string, type: ToastType = "error") => {
  toast[type](msg);
};

// Another Process
const toastify = (type: ToastType = "success", msg: string) => {
  const options: ToastOptions = {
    position: "top-center",
  };

  switch (type) {
    case "success":
      return toast.success(msg, options);
    case "error":
      return toast.error(msg, options);
    case "warn":
      return toast.warn(msg, options);
    case "info":
      return toast.info(msg, options);
    default:
      return toast.success(msg, options);
  }
};

export default toastify;
