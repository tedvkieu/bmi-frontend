"use client";

import { useEffect, useState, useRef } from "react";
import { BellIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { authApi, User } from "../../services/authApi";
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

  async function fetchNotifications(userId: number) {
    const res = await fetch(`/api/notifications/unread/${userId}`);
    if (res.ok) {
      const data: Notification[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotifications(sorted);
    }
  }

  async function markAsRead(id: number) {
    const res = await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.userId);
    const interval = setInterval(() => fetchNotifications(user.userId), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

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
      <div className="flex items-center space-x-2 text-sm">
        <div className="text-gray-700 font-medium px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-default hidden md:block">
          Thông báo
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Mở thông báo"
        >
          <BellIcon className="h-6 w-6 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-slow transform scale-90">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
      {open && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-gray-200 rounded-xl shadow-lg transform translate-y-2 opacity-100 transition-all duration-300 ease-out z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-blue-600">Thông báo</h3> {/* Đã thay đổi màu chữ tại đây */}
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Đóng thông báo"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <li className="p-6 text-gray-500 text-center flex flex-col items-center justify-center">
                <BellIcon className="h-8 w-8 text-gray-300 mb-2" />
                <p>Không có thông báo mới nào</p>
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className="relative group flex items-start p-4 hover:bg-blue-50 transition-colors duration-150"
                >
                  <Link
                    href="/admin/khach-hang" // Or a more dynamic link based on notification type
                    className="flex-1 min-w-0 pr-10" // Add pr to make space for the "Mark as read" button
                    onClick={() => markAsRead(n.id)}
                  >
                    <p className="text-sm text-gray-800 leading-snug">
                      {n.message}
                    </p>
                    {/* Thêm thẻ "Mới!" nếu thông báo chưa đọc */}
                    {!n.isRead && (
                      <span className="ml-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        Mới!
                      </span>
                    )}
                  </Link>
                  <button
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    aria-label="Đánh dấu đã đọc"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}