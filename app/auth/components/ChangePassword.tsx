"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/app/auth/components/AuthCard";
import FormInput from "@/app/auth/components/FormInput";
import { authApi } from "../../services/authApi";

const ChangePasswordPage: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword)
      newErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
    if (!formData.newPassword)
      newErrors.newPassword = "Mật khẩu mới là bắt buộc";
    else if (formData.newPassword.length < 6)
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    if (formData.confirmPassword !== formData.newPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = authApi.getToken();
      if (!token) throw new Error("Bạn chưa đăng nhập");

      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

      setSuccessMessage(
        "Đổi mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới."
      );

      // Lấy email từ token
      const user = authApi.getUser();
      //const email = user?.email ?? "";

      setTimeout(() => {
        authApi.clearAuthData();
        router.push(`/auth/login`);
      }, 3000);
    } catch (err: any) {
      setErrors({ general: err.message || "Đổi mật khẩu thất bại" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AuthCard
        title="Yêu cầu đổi mật khẩu"
        subtitle="Vui lòng nhập mật khẩu mới"
      >
        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{successMessage}</p>
            </div>
          )}

          <FormInput
            id="currentPassword"
            name="currentPassword"
            label="Mật khẩu hiện tại"
            type={showPassword ? "text" : "password"}
            value={formData.currentPassword}
            onChange={handleInputChange}
            placeholder="Nhập mật khẩu hiện tại"
            required
            error={errors.currentPassword}
          />

          <FormInput
            id="newPassword"
            name="newPassword"
            label="Mật khẩu mới"
            type={showPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleInputChange}
            placeholder="Nhập mật khẩu mới"
            required
            error={errors.newPassword}
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Nhập lại mật khẩu mới"
            required
            error={errors.confirmPassword}
          />

          <button
            type="button"
            onClick={toggleShowPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
};

export default ChangePasswordPage;
