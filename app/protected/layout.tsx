export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use global SiteNav and footer from root layout; render only page content
  return <div className="w-full max-w-5xl mx-auto">{children}</div>;
}
