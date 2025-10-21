"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MdHome } from "react-icons/md";
import FormInput from "../../components/FormInput";
import AuthCard from "../../components/AuthCard";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    dob: "",
    taxCode: "",
    customerType: "IMPORTER",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Họ tên là bắt buộc";
    if (!formData.email) newErrors.email = "Email là bắt buộc";
    if (!formData.phone) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.password) newErrors.password = "Mật khẩu là bắt buộc";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!formData.address) newErrors.address = "Địa chỉ là bắt buộc";
    if (!formData.dob) newErrors.dob = "Ngày sinh là bắt buộc";
    if (!formData.taxCode) newErrors.taxCode = "Mã số thuế là bắt buộc";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/customers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          address: formData.address,
          dob: formData.dob,
          taxCode: formData.taxCode,
          customerType: formData.customerType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Đăng ký thất bại");
      }

      router.push(
        `/auth/waiting-approve?email=${encodeURIComponent(
          formData.email
        )}&name=${encodeURIComponent(formData.name)}`
      );
    } catch (error) {
      console.error("Register error:", error);
      setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 flex items-center gap-1 px-4 py-2 text-gray-800 text-xs font-semibold z-10"
      >
        <MdHome
          className="text-2xl text-gray-600 hover:text-blue-500"
          size={26}
        />
      </button>

      <AuthCard
        title="Đăng ký khách hàng"
        subtitle="Tạo tài khoản khách hàng mới"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6 text-sm text-gray-800"
        >
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Các input cơ bản */}
          <FormInput
            name="name"
            label="Họ và tên"
            value={formData.name}
            onChange={handleInputChange}
            required
            error={errors.name}
            id={""}
            type={""}
            placeholder="Nguyễn Văn A"
          />
          <FormInput
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            error={errors.email}
            id={""}
            type={"email"}
            placeholder="example@gmail.com"
          />
          <FormInput
            name="phone"
            label="Số điện thoại"
            value={formData.phone}
            onChange={handleInputChange}
            required
            error={errors.phone}
            id={""}
            type={"tel"}
            placeholder="0912345678"
          />
          <FormInput
            name="password"
            type="password"
            label="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            required
            error={errors.password}
            id={""}
            placeholder="********"
          />
          <FormInput
            name="confirmPassword"
            type="password"
            label="Xác nhận mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            error={errors.confirmPassword}
            id={""}
            placeholder="********"
          />

          {/* Các field mới */}
          <FormInput
            name="address"
            label="Địa chỉ"
            value={formData.address}
            onChange={handleInputChange}
            required
            error={errors.address}
            id={""}
            type={""}
            placeholder="123 Đường ABC, Quận XYZ"
          />
          <FormInput
            name="dob"
            type="date"
            label="Ngày sinh"
            value={formData.dob}
            onChange={handleInputChange}
            required
            error={errors.dob}
            id={""}
          />
          <FormInput
            name="taxCode"
            label="Mã số thuế"
            value={formData.taxCode}
            onChange={handleInputChange}
            required
            error={errors.taxCode}
            id={""}
            type={""}
            placeholder="MST-123456789"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại khách hàng
            </label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleInputChange}
              className="mt-1 block w-full border text-gray rounded-md p-2"
            >
              <option value="IMPORTER">Người nhập khẩu</option>
              <option value="SERVICE_MANAGER">Quản lý dịch vụ</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
          >
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
};

export default RegisterPage;
