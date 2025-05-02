"use client"; // Next.js directive to ensure this component is rendered on the client side

import { Search } from "lucide-react"; // Importing the search icon from lucide-react
import { useState, useEffect, useRef } from "react"; // React hooks for state and lifecycle
import { useRouter, useSearchParams } from "next/navigation"; // Next.js hooks for navigation and reading query parameters

export default function SearchBar() {
  const router = useRouter(); // Used to programmatically navigate in the app
  const isUserInput = useRef(false); // Tracks if the change to input is triggered by user interaction
  const searchParams = useSearchParams(); // Hook to access URL search parameters
  const searchInputRef = useRef<HTMLInputElement>(null); // Reference to the input field for focusing

  const searchQuery = searchParams.get("search") || ""; // Get current 'search' query parameter from URL

  const [query, setQuery] = useState(searchQuery); // Local state for the input query

  // Effect: sync local state with URL search query if not triggered by user
  useEffect(() => {
    if (query !== searchQuery && !isUserInput.current) {
      setQuery(searchQuery); // Update query state from URL
    }
    isUserInput.current = false; // Reset flag after syncing
  }, [searchQuery]);

  // Effect: debounce updating the URL based on query input
  useEffect(() => {
    if (!isUserInput.current) return; // Skip if not triggered by user input

    const timer = setTimeout(() => {
      if (query === searchParams.get("search")) return; // Skip if value hasn't changed

      const params = new URLSearchParams(searchParams.toString()); // Copy current params

      if (query) {
        params.set("search", query); // Update the 'search' param
      } else {
        params.delete("search"); // Remove it if query is empty
      }

      router.push(`/?${params.toString()}`); // Push new URL to router
    }, 500); // Wait 500ms before updating (debounce)

    return () => clearTimeout(timer); // Clear timeout if input changes again
  }, [query, router, searchParams]);

  // Effect: automatically focus on input field if a search query exists
  useEffect(() => {
    if (searchQuery && searchInputRef.current) {
      searchInputRef.current.focus(); // Focus the input field
    }
  }, [searchQuery]);

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true; // Mark this as user input
    setQuery(e.target.value); // Update local query state
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (query === searchParams.get("search")) return; // Skip if no actual change

    const params = new URLSearchParams(searchParams.toString()); // Clone current URL params

    if (query) {
      params.set("search", query); // Set new search query
    } else {
      params.delete("search"); // Or remove it if empty
    }

    router.push(`/?${params.toString()}`); // Navigate with updated query
  };

  // Clear the current search input and remove query param
  const clearSearch = () => {
    isUserInput.current = true; // Mark as user-triggered
    setQuery(""); // Clear local query

    if (searchParams.has("search")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("search"); // Remove from URL
      router.push(`/?${params.toString()}`); // Navigate
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full h-full">
      {/* Input field bound to the query state */}
      <input
        ref={searchInputRef} // Assign ref to enable focusing
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search ads..."
        className="px-4 py-2 pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      />

      {/* Left-side search icon inside input */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Right-side clear (X) button shown only if query is not empty */}
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <span className="sr-only">Clear search</span>
          {/* SVG icon for "X" button */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </form>
  );
}
