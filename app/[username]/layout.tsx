import { NoScrollbar } from "./no-scrollbar";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NoScrollbar />
      {children}
    </>
  );
}
