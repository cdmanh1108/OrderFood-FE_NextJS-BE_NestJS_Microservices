import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwtPayload, isExpired } from "@/utils/jwt";
import { UserAppLayout } from "@/app/components/layout/UserAppLayout";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const payload = decodeJwtPayload(accessToken);

  if (!payload || isExpired(payload)) {
    redirect("/login");
  }

  if (payload.role !== "USER") {
    if (payload.role === "ADMIN" || payload.role === "STAFF") {
      redirect("/admin/dashboard");
    }

    redirect("/login");
  }

  return <UserAppLayout>{children}</UserAppLayout>;
}
