"use client";

import React, { useState } from "react";
import AdminLayout from "../../component/AdminLayout";
import UsersClient from "../../component/UsersClient";
import InspectorSearch from "../../component/InspectorSearch";
import Breadcrumb from "../../component/breadcrumb/Breadcrumb";
import { Users } from "lucide-react";


const UsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'search'>('users');

  return (
    <AdminLayout>
      <Breadcrumb pageName="Quản lý nhân viên" />

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users className="w-4 h-4" />
              Danh sách nhân viên
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersClient />}
      {activeTab === 'search' && <InspectorSearch />}
    </AdminLayout>
  );
};

export default UsersPage;
