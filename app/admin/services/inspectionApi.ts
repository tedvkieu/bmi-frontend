import {
  InspectionFormData,
  MachineryFormData,
  ReceiptFormData,
  SubmitMachineryResponse,
} from "../types/inspection";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const NEXT_PUBLIC_BACKEND_URL  = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api`;

class InspectionApi {
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/dossiers`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          message: data.message || "Có lỗi xảy ra",
        };
      }

      return {
        success: true,
        data,
        message: data.message || "Thành công",
      };
    } catch (error) {
      console.error("API Request Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        message: "Lỗi kết nối. Vui lòng thử lại sau.",
      };
    }
  }

  async submitCustomerProfile(
    formData: InspectionFormData
  ): Promise<ApiResponse> {
    return this.makeRequest("/inspection-files", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  async submitReceipt(formData: ReceiptFormData): Promise<ApiResponse> {
    return this.makeRequest("/dossiers", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  }

  async getCustomer(id: number): Promise<ApiResponse> {
    return this.makeRequest(`/customers/${id}`, {
      method: "GET",
    });
  }

  async getInspectionTypes(): Promise<ApiResponse> {
    return this.makeRequest("/inspection-types", {
      method: "GET",
    });
  }

  async uploadFile(file: File, type: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
          message: data.message || "Lỗi tải file",
        };
      }

      return {
        success: true,
        data,
        message: "Tải file thành công",
      };
    } catch (error) {
      console.error("File Upload Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload error",
        message: "Lỗi tải file. Vui lòng thử lại.",
      };
    }
  }
  async submitMachinery(
    machineryData: MachineryFormData
  ): Promise<SubmitMachineryResponse> {
    try {
      console.log("Submitting Machinery Data:", machineryData);
      const response = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(machineryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        machineryId: data.machineryId || data.id,
        data: data,
      };
    } catch (error) {
      console.error("Error submitting machinery:", error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi gửi thông tin máy móc",
      };
    }
  }
}

export const inspectionApi = new InspectionApi();
