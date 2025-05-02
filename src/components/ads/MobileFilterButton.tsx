"use client"; // Indicates this component should be rendered on the client side (Next.js directive)

import { Filter } from "lucide-react"; // Importing the Filter icon from lucide-react for use in the button UI

// Props interface definition for the MobileFilterButton component
interface MobileFilterButtonProps {
  className?: string; // Optional additional class names for styling the button
  selectedCategory?: string; // Optional selected category ID
  selectedSubcategory?: string; // Optional selected subcategory ID
}

// Default export of the MobileFilterButton functional component
export default function MobileFilterButton({
  className = "",
  selectedCategory,
  selectedSubcategory,
}: MobileFilterButtonProps) {
  // Function to dispatch a custom event to toggle the filter drawer (used in mobile view)
  const handleFilterClick = () => {
    const filterDrawerEvent = new CustomEvent("toggle-filter-drawer"); // Create the event
    document.dispatchEvent(filterDrawerEvent); // Dispatch it on the document
  };

  // Determine if any filters are currently active (category or subcategory is selected)
  const hasActiveFilters = selectedCategory || selectedSubcategory;

  return (
    <button
      onClick={handleFilterClick} // When clicked, trigger the drawer toggle
      className={`${className} flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-sm transition
        ${
          hasActiveFilters
            ? "bg-blue-600 text-white hover:bg-blue-700" // Style when filters are active
            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700" // Style when inactive
        }`}
    >
      <Filter className="h-5 w-5 mr-1.5" />{" "}
      {/* Filter icon with right margin */}
      <span>Filter</span> {/* Button label */}
      {/* Conditionally render a badge indicating number of active filters (1 or 2) */}
      {hasActiveFilters && (
        <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-blue-600">
          {selectedSubcategory ? "2" : "1"}{" "}
          {/* 2 if both are selected, otherwise 1 */}
        </span>
      )}
    </button>
  );
}
