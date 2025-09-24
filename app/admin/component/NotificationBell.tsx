"use client";

import { useEffect, useState, useRef } from "react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { authApi, User } from "../../services/authApi";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = authApi.getUser();
    setUser(userData);
  }, []);

  // Lấy tất cả notification chưa đọc
  async function fetchNotifications(userId: number) {
    const res = await fetch(`/api/notifications/unread/${userId}`);
    if (res.ok) {
      const data: Notification[] = await res.json();
      // Sort theo thời gian giảm dần
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    }
  }

  // Đánh dấu notification đã đọc
  async function markAsRead(id: number) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  // Poll notification mỗi 5s
  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.userId);
    const interval = setInterval(() => fetchNotifications(user.userId), 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <BellIcon className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
          <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Thông báo</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Đóng thông báo"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <ul className="max-h-64 overflow-y-auto space-y-2">
            {notifications.length === 0 && (
              <li className="p-4 text-gray-500 text-center">Không có thông báo mới</li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className="flex flex-col p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <Link
                    href="/admin/khach-hang"
                    className="flex-1"
                    onClick={() => markAsRead(n.id)}
                  >
                    <p className="text-sm font-medium text-gray-800">{n.message}</p>
                
                  </Link>
                  <button
                    className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 font-semibold ml-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                  >
                    Đã đọc
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
