import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  pageName: string;
  pageNameSecond?: string;
  pageHref?: string; // Thêm optional href cho pageName khi có pageSecond
}

const Breadcrumb = ({ pageName, pageNameSecond, pageHref }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-base font-medium text-[#111928]">
          {/* Dashboard luôn có link */}
          <li>
            <Link
              href="/admin"
              className="text-gray-500 transition hover:text-blue-600 hover:underline"
            >
              Dashboard
            </Link>
          </li>

          <ChevronRight className="h-4 w-4 text-gray-400" />

          {/* Nếu có pageSecond thì pageName là link */}
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
