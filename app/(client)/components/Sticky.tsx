// components/Header.tsx
import React from 'react';

const Sticky: React.FC = () => {
  return (
    <header className="bg-blue-800 text-white py-2 text-sm">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <span className="mr-4">Văn phòng giao dịch: Số 13 đường số 3, Phường An Khánh, TP. Hồ Chí Minh</span>
        </div>
        <div>
          <span>Hotline: 0911.76.80.08</span>
        </div>
      </div>
    </header>
  );
};

export default Sticky;