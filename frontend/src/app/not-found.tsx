import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-4 text-primary underline">
        Return Home
      </Link>
    </div>
  );
}
