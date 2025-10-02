'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaPhoneAlt } from 'react-icons/fa';
import Image from 'next/image';
import LoadingSpinner from '@/app/admin/component/document/LoadingSpinner';
import { toast } from 'react-hot-toast';

const WaitingApprove: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name: string | null = searchParams.get('name');
  const email: string = searchParams.get('email') || 'Chưa có';

  const [isActivated, setIsActivated] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const isValid = (value: string | null) =>
    value !== null && value.trim() !== '' && value !== 'Chưa có';

  useEffect(() => {
    if (!email || email === 'Chưa có') {
      setLoading(false);
      return;
    }

    let hasRedirected = false;
    const intervalId = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/customers/email?email=${encodeURIComponent(email)}`);
        const result = await res.json();
        const status = result?.data?.isActivated;

        setIsActivated(status);
        setLoading(false);

        if (!hasRedirected && status === 1) {
          hasRedirected = true;
          toast.success('Tài khoản của bạn đã được duyệt!');
          const audio = new Audio('/mp3/notification.mp3');
          audio.play().catch(err => console.log("Audio không thể phát:", err));
          clearInterval(intervalId); // dừng interval sau khi đã redirect
        }

        if (status === 2) {
          clearInterval(intervalId); // dừng interval nếu status = 2
        }
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        setLoading(false);
      }
    }, 5000);

    return () => clearInterval(intervalId); // cleanup khi unmount
  }, [email]);


  if (loading) {
    return <LoadingSpinner />;
  }

  const renderContactSection = (title: string = 'Cần hỗ trợ?') => (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <p className="text-sm text-gray-600 text-center mb-4">
        Vui lòng liên hệ qua Zalo hoặc số điện thoại để được hỗ trợ nhanh nhất.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="tel:0911768008"
          className="flex-1 min-w-[150px] flex items-center justify-center bg-green-500 text-white text-sm px-4 py-2 rounded-full shadow-md hover:bg-green-600 transition-colors duration-200"
          aria-label="Hotline Hỗ trợ"
        >
          <FaPhoneAlt className="text-sm mr-2" />
          <span className="font-medium">0911.76.80.08</span>
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          href="https://zalo.me/0911768008"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[150px] flex items-center justify-center bg-blue-600 text-white text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200"
          aria-label="Zalo Hỗ trợ"
        >
          <Image
            src="/images/zalo-icon.jpg"
            alt="Zalo"
            width={18}
            height={18}
            className="mr-2 rounded-full"
          />
          <span className="font-medium">Nhắn tin Zalo</span>
        </motion.a>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isActivated === 1) {
      return (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold text-green-600 mb-3">
            Tài khoản của bạn đã được kích hoạt!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Bạn có thể đăng nhập để sử dụng dịch vụ.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push(`/auth/login?email=${encodeURIComponent(email)}`)}
            className="w-full py-3 px-4 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Đăng nhập ngay
          </motion.button>
          {renderContactSection('Cần hỗ trợ thêm?')}
        </motion.section>
      );
    }



    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="text-4xl text-indigo-500"
          >
            ⏳
          </motion.div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Đang chờ phê duyệt</h1>
        <p className="text-sm text-gray-600 mb-6">Vui lòng chờ quản trị viên xác nhận thông tin của bạn.</p>

        <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100 text-left">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Thông tin đăng ký của bạn:</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {isValid(name) && (
              <p>
                <strong>Họ và tên:</strong> {name}
              </p>
            )}
            <p>
              <strong>Email:</strong> {email}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="w-full py-3 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Về trang chủ
        </motion.button>

        {renderContactSection('Cần hỗ trợ mở tài khoản?')}
      </motion.section>
    );
  };

  return <main className="min-h-screen flex items-center justify-center p-4">{renderMainContent()}</main>;
};

export default WaitingApprove;
