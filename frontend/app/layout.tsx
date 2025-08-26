export default function BasicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        { children }
      </body>
    </html>
  );
}
