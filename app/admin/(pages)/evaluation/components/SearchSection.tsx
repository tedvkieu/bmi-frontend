// components/SearchSection.tsx
interface SearchSectionProps {
  registerNo: string;
  setRegisterNo: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  error: string;
}

export default function SearchSection({
  registerNo,
  setRegisterNo,
  onSearch,
  loading,
  error,
}: SearchSectionProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl text-gray-700 font-semibold mb-4">
        Tìm kiếm hồ sơ
      </h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Nhập số đăng ký (VD: BMI/2024/GD-001/KT)"
          value={registerNo}
          onChange={(e) => setRegisterNo(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 text-gray-600 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang tìm..." : "Tìm kiếm"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
