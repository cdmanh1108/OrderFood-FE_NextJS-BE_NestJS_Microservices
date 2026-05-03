import { TableSessionProvider } from "@/contexts/table-session-context";

export default function DineInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TableSessionProvider>{children}</TableSessionProvider>;
}
