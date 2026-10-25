import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const PdfPresenter = lazy(() => import("@/components/PdfPresenter"));

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Gesture PDF Presenter" },
      { name: "description", content: "Present PDFs with pen, highlighter, and hand gesture controls." },
    ],
  }),
});

function Index() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
      <PdfPresenter />
    </Suspense>
  );
}
