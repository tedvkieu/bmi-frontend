"use client";

import React from "react";
// import Link from "next/link";
// import AuthCard from "../components/AuthCard";
// import FormInput from "../components/FormInput";

// const ForgotPasswordPage: React.FC = () => {
//     const [email, setEmail] = useState("");
//     const [error, setError] = useState("");
//     const [isLoading, setIsLoading] = useState(false);
//     const [isSubmitted, setIsSubmitted] = useState(false);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setEmail(e.target.value);
//         if (error) setError("");
//     };

//     const validateEmail = (email: string) => {
//         return /\S+@\S+\.\S+/.test(email);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!email) {
//             setError("Email là bắt buộc");
//             return;
//         }

//         if (!validateEmail(email)) {
//             setError("Email không hợp lệ");
//             return;
//         }

//         setIsLoading(true);

//         try {
//             // Simulate API call
//             await new Promise(resolve => setTimeout(resolve, 1000));

//             console.log("Password reset request for:", email);
//             setIsSubmitted(true);
//         } catch (error) {
//             console.error("Password reset error:", error);
//             setError("Có lỗi xảy ra. Vui lòng thử lại.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (isSubmitted) {
//         return (
//             <AuthCard
//                 title="Email đã được gửi"
//                 subtitle="Vui lòng kiểm tra hộp thư của bạn"
//             >
//                 <div className="text-center space-y-6">
//                     <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                     </div>

//                     <div className="space-y-2">
//                         <p className="text-gray-600">
//                             Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
//                         </p>
//                         <p className="font-medium text-gray-900">{email}</p>
//                     </div>

//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                         <p className="text-blue-800 text-sm">
//                             Nếu bạn không thấy email trong hộp thư chính, vui lòng kiểm tra thư mục spam.
//                         </p>
//                     </div>

//                     <div className="space-y-3">
//                         <button
//                             onClick={() => {
//                                 setIsSubmitted(false);
//                                 setEmail("");
//                             }}
//                             className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors font-medium"
//                         >
//                             Gửi lại email
//                         </button>

//                         <Link
//                             href="/auth/login"
//                             className="block text-center text-blue-600 hover:text-blue-500 font-medium transition-colors"
//                         >
//                             Quay lại đăng nhập
//                         </Link>
//                     </div>
//                 </div>
//             </AuthCard>
//         );
//     }

//     return (
//         <AuthCard
//             title="Quên mật khẩu"
//             subtitle="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
//         >
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {error && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                         <p className="text-red-600 text-sm">{error}</p>
//                     </div>
//                 )}

//                 <FormInput
//                     id="email"
//                     label="Email"
//                     type="email"
//                     value={email}
//                     onChange={handleInputChange}
//                     placeholder="Nhập email của bạn"
//                     required
//                     error={error}
//                     icon={
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                         </svg>
//                     }
//                 />

//                 <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//                 >
//                     {isLoading ? (
//                         <div className="flex items-center justify-center">
//                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                             </svg>
//                             Đang gửi...
//                         </div>
//                     ) : (
//                         "Gửi hướng dẫn"
//                     )}
//                 </button>

//                 <div className="text-center">
//                     <Link
//                         href="/auth/login"
//                         className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
//                     >
//                         Quay lại đăng nhập
//                     </Link>
//                 </div>
//             </form>
//         </AuthCard>
//     );
// };

const ForgotPasswordPage: React.FC = () => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Đang phát triển
        </h3>
        <p className="text-gray-500 text-sm lg:text-base">
          Trang quản lý danh mục sẽ được bổ sung trong phiên bản tiếp theo.
        </p>
      </div>
    );
};

export default ForgotPasswordPage;  
