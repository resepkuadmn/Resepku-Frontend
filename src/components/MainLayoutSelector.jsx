import { useStateContext } from "../contexts/ContextProvider";
import DefaultLayout from "./DefaultLayout";
import PublicLayout from "./PublicLayout";

export default function MainLayoutSelector() {
  const { token } = useStateContext();

  // Jika sudah login (ada token), pakai Layout User/Admin
  if (token) {
    return <DefaultLayout />;
  }

  // Jika belum login, pakai Layout Tamu
  return <PublicLayout />;
}