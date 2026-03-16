import BusinessSidebar from "./BusinessSidebar";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#faf8f4]">
      <BusinessSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
