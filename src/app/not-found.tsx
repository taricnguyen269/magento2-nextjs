import { PageNotFound } from "@/components";

// Prevent static generation issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return <PageNotFound size="lg" />;
}
