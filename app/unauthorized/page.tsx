"use client";

import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8f8f8',
      color: '#333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <Head>
        <title>Unauthorized</title>
      </Head>

      <h1 style={{ fontSize: '2em', marginBottom: '20px', color: '#dc3545' }}>
        <span role="img" aria-label="Stop sign" style={{ marginRight: '10px' }}>🚫</span> Access Denied
      </h1>
      <p style={{ fontSize: '1.2em', marginBottom: '30px', maxWidth: '600px', lineHeight: '1.5' }}>
        Bạn không có quyền truy cập trang này. Vui lòng đăng nhập bằng tài khoản có quyền hoặc liên hệ với quản trị viên.
      </p>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <Link href="/" style={{
          textDecoration: 'none',
          padding: '12px 25px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '5px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
         Trang chủ
        </Link>
        <button
          onClick={() => router.back()}
          style={{
            padding: '12px 25px',
            backgroundColor: '#6c757d',
            color: 'white',
            borderRadius: '5px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
        >
          Trở lại trang trước
        </button>
      </div>

      <p style={{ marginTop: '40px', fontSize: '0.9em', color: '#666' }}>
        Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi để được giúp đỡ.
      </p>
    </div>
  );
}