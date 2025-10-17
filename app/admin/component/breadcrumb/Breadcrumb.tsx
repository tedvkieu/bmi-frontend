"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, House, ArrowLeft } from "lucide-react";

interface BreadcrumbProps {
  pageName: string;
  pageNameSecond?: string;
  pageHref?: string;
}

const Breadcrumb = ({ pageName, pageNameSecond, pageHref }: BreadcrumbProps) => {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 transition">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline font-medium text-sm">Trang trước</span>
      </button>


      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-base font-medium text-[#111928]">
          <li>
            <Link
              href="/admin"
              className="flex items-center text-gray-500 transition hover:text-blue-600"
            >
              <House className="h-5 w-5 text-gray-400 transition hover:text-blue-600" />
            </Link>
          </li>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          <li>
            {pageNameSecond ? (
              <Link
                href={pageHref || "#"}
                className="text-gray-500 transition hover:text-blue-600 hover:underline"
              >
                {pageName}
              </Link>
            ) : (
              <span className="text-blue-600 font-semibold">{pageName}</span>
            )}
          </li>

          {pageNameSecond && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-blue-600 font-semibold">{pageNameSecond}</li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
