import React from "react";

interface StatCardProps {
  title: string;
  count: number;
  onClick: () => void;
  isActive: boolean;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  onClick,
  isActive,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="h-6 w-28 bg-gray-200 animate-pulse rounded"></div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-all duration-200
        ${
          isActive
            ? "text-blue-700 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-blue-700"
            : "text-gray-600 hover:text-blue-700"
        }
      `}
    >
      <span>{title}</span>
      <span
        className={`ml-1 text-sm ${
          isActive ? "text-blue-700" : "text-gray-500"
        }`}
      >
        ({count})
      </span>
    </button>
  );
};

export default StatCard;
