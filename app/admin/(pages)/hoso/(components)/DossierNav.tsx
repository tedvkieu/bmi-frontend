"use client";
import React from "react";
import classNames from "classnames";

interface DossierNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DossierNav({ activeTab, onTabChange }: DossierNavProps) {
  const tabs = [
    { id: "generalInfo", label: "Thông tin chung" },
    { id: "goodsInfo", label: "Thông tin hàng hóa" },
    { id: "historyInfo", label: "Chi tiết hồ sơ" },
  ];

  return (
    <div className="w-full mx-auto text-gray-800">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={classNames(
              "px-4 py-1.5 text-sm transition-all duration-150",
              activeTab === tab.id
                ? "bg-[#1e3a8a] text-white"
                : "text-gray-800 hover:text-white hover:bg-[#1e3a8a]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

    </div>
  );
}
