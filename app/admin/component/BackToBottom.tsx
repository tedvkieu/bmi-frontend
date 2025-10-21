"use client"; // Đánh dấu đây là một Client Component

import { useEffect, useState } from "react";

const BackToBottomButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY;

    const bottomThreshold = 100; // 100px

    // Nếu vị trí cuộn + chiều cao màn hình < tổng chiều cao - ngưỡng
    // (tức là chưa cuộn đến gần cuối trang), thì hiển thị nút
    if (scrollTop + clientHeight < scrollHeight - bottomThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Hàm này sẽ cuộn trang xuống dưới cùng
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth", // Tạo hiệu ứng cuộn mượt
    });
  };

  useEffect(() => {
    // Thêm một event listener khi component được mount
    window.addEventListener("scroll", handleScroll);

    // Kiểm tra trạng thái ban đầu khi tải trang
    handleScroll(); 

    // Dọn dẹp event listener khi component bị unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isVisible && (
        <button
          onClick={scrollToBottom}
          aria-label="Go to bottom"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-transform duration-200 ease-in-out hover:bg-gray-900 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          {/* Icon mũi tên đi xuống */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default BackToBottomButton;