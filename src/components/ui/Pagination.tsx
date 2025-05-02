import Link from "next/link";

// Define the expected props for the Pagination component
interface PaginationProps {
  currentPage: number; // The currently active page
  totalPages: number; // Total number of available pages
  baseUrl: string; // Base URL to append the page query to
}

// Functional component for rendering pagination UI
export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: PaginationProps) {
  // If there's only one page, no need to render pagination
  if (totalPages <= 1) {
    return null;
  }

  // Function to calculate and return the array of page numbers or ellipsis indicators
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Max number of page links to show at once

    // If the total number of pages is small enough, show all
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Center the current page in the pagination control if possible
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = startPage + maxPagesToShow - 1;

      // Adjust if we overflow the total number of pages
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      // Add the first page and ellipsis if we're skipping pages at the start
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push("ellipsis");
        }
      }

      // Add the range of page numbers to display
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pageNumbers.push(i);
        }
      }

      // Add ellipsis and last page if we're skipping pages at the end
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push("ellipsis");
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Compute the pages to display
  const pages = getPageNumbers();

  // Helper to generate the full URL for a specific page
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <nav className="flex items-center justify-center mt-4">
      <ul className="flex">
        <li>
          {/* Show "Previous" button unless we're on the first page */}
          {currentPage > 1 ? (
            <Link
              href={getPageUrl(currentPage - 1)}
              className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </Link>
          ) : (
            // Disabled "Previous" if we're on the first page
            <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
              Previous
            </span>
          )}
        </li>

        {/* Map through the page numbers and render them */}
        {pages.map((page, index) => {
          if (page === "ellipsis") {
            // Render ellipsis where applicable
            return (
              <li key={`ellipsis-${index}`}>
                <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white">
                  ...
                </span>
              </li>
            );
          }

          return (
            <li key={`page-${page}`}>
              {page === currentPage ? (
                // Highlight the current page number
                <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md">
                  {page}
                </span>
              ) : (
                // Other pages are links
                <Link
                  href={getPageUrl(page as number)}
                  className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}

        <li>
          {/* Show "Next" button unless we're on the last page */}
          {currentPage < totalPages ? (
            <Link
              href={getPageUrl(currentPage + 1)}
              className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </Link>
          ) : (
            // Disabled "Next" button if already on the last page
            <span className="inline-flex items-center px-4 py-2 mx-1 text-sm font-medium text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed">
              Next
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
