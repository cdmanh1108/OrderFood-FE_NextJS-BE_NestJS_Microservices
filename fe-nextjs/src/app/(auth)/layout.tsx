import { AuthRoute } from "../components/auth/AuthRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthRoute>{children}</AuthRoute>;
}
