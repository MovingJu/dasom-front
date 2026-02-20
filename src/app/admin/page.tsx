import AdminPanel from "@/components/Admin/AdminPanel";
import type { Metadata } from "next";
import { decodeSessionToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | DASOM",
  description: "다솜 관리자 페이지",
};

const AdminPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("dasom_session")?.value;
  const user = decodeSessionToken(token);

  if (!user) {
    redirect("/signin?next=/admin");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <section className="pb-[120px] pt-[150px]">
      <div className="container">
        <div className="rounded-xs bg-white p-8 shadow-three dark:bg-[#3a3338]">
          <h1 className="mb-6 text-3xl font-bold text-black dark:text-white">Admin Page</h1>
          <AdminPanel />
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
