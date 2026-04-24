import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwtPayload, isExpired } from "@/utils/jwt";

export default async function AdminStaffLayout({
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

  if (payload.role !== "ADMIN" && payload.role !== "STAFF") {
    redirect("/");
  }

  return <>{children}</>;
}

