"use client";

import React, { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";

interface GuideOverProps {
    run: boolean;
    onTourEnd: () => void;
}

const GUIDE_STEPS: Step[] = [
    // ... your existing steps
    {
        target: ".navbar-menu-contact-info",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Xem thông tin liên hệ</h3>
                <p className="text-gray-700">
                    Tại đây bạn sẽ tìm thấy <span className="font-semibold">địa chỉ trụ sở, số điện thoại và email hỗ trợ</span> của công ty.
                    Nếu cần liên hệ nhanh, hãy ưu tiên gọi trực tiếp vào hotline.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: ".navbar-menu-contact-form",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Gửi yêu cầu qua form</h3>
                <p className="text-gray-700">
                    <span className="font-semibold">Điền biểu mẫu liên hệ</span> để gửi câu hỏi, yêu cầu tư vấn hoặc hỗ trợ.
                    Thông tin bạn nhập sẽ được chuyển trực tiếp đến bộ phận chăm sóc khách hàng.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: ".navbar-menu-dossier-search",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Tra cứu hồ sơ trực tuyến</h3>
                <p className="text-gray-700">
                    Chọn mục này để <span className="font-semibold">kiểm tra tình trạng hồ sơ giám định</span>.
                    Bạn chỉ cần nhập số chứng nhận và ngày cấp để hệ thống tìm kiếm chính xác.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: ".btn-tao-ho-so",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Tải hồ sơ giám định</h3>
                <p className="text-gray-700">
                    Nhấn vào đây để <span className="font-semibold">tạo và tải lên hồ sơ giám định của bạn</span>.
                    <br />
                    Bạn cần đăng nhập để thực hiện tải hồ sơ giám định
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: ".floating-contact-support",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Hỗ trợ</h3>
                <p className="text-gray-700">
                    Khi cần hỗ trợ, hãy <span className="font-semibold">nhấp vào nút nổi này</span> để liên hệ ngay qua hotline hoặc Zalo.
                    Đội ngũ chăm sóc khách hàng luôn sẵn sàng giúp đỡ bạn.
                </p>
            </div>
        ),
        placement: "left",
    },
    {
        target: ".contact-info-section",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Chi tiết thông tin công ty</h3>
                <p className="text-gray-700">
                    Khu vực này hiển thị <span className="font-semibold">trụ sở chính, văn phòng đại diện, hotline và email hỗ trợ</span>.
                    Bạn có thể đối chiếu thông tin chính thức của công ty trước khi liên hệ.
                </p>
            </div>
        ),
        placement: "top",
    },
    {
        target: ".contact-form-section",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Gửi yêu cầu giám định</h3>
                <p className="text-gray-700">
                    Điền đầy đủ thông tin vào biểu mẫu này, chọn dịch vụ giám định và ghi rõ nội dung giám định để chúng tôi sớm lên hồ sơ và
                    liên hệ với bạn.
                </p>
                <br />
                <p className="text-gray-700 font-bold">
                    Đăng ký tài khoản để theo dõi tiến độ xử lý hồ sơ và lên hồ sơ giám định.
                </p>
            </div>
        ),
        placement: "top",
    },
    {
        target: ".dossier-search-section",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Tra cứu hồ sơ giám định</h3>
                <p className="text-gray-700">
                    Tại đây, bạn có thể <span className="font-semibold">kiểm tra tiến độ xử lý và kết quả giám định</span>.
                    Hãy chuẩn bị số chứng nhận và ngày cấp để hệ thống tìm kiếm chính xác.
                </p>
            </div>
        ),
        placement: "top",
    },
    {
        target: "#registerNo",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Nhập số chứng nhận</h3>
                <p className="text-gray-700">
                    Điền đúng <span className="font-semibold">mã số chứng nhận</span> được in trên giấy tờ của bạn.
                    Thông tin này là duy nhất và giúp xác định chính xác hồ sơ cần tra cứu.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: "#certificateDate",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Chọn ngày cấp</h3>
                <p className="text-gray-700">
                    Lựa chọn <span className="font-semibold">ngày cấp chứng nhận</span> từ lịch để hệ thống lọc đúng hồ sơ.
                </p>
            </div>
        ),
        placement: "bottom",
    },
    {
        target: ".dossier-search-button",
        content: (
            <div>
                <h3 className="font-bold text-lg text-blue-700 mb-1">Thực hiện tra cứu</h3>
                <p className="text-gray-700">
                    Khi đã nhập đầy đủ thông tin, nhấn nút này để <span className="font-semibold">bắt đầu tìm kiếm</span>.
                    Kết quả sẽ hiển thị ngay phía dưới trong vài giây.
                </p>
            </div>
        ),
        placement: "right",
    },
];

const GuideOver: React.FC<GuideOverProps> = ({ run, onTourEnd }) => {
    const [joyrideRun, setJoyrideRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [isClient, setIsClient] = useState(false); // New state

    useEffect(() => {
        setIsClient(true); // Set to true once the component mounts on the client
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (run) {
            timer = setTimeout(() => {
                setJoyrideRun(true);
                setStepIndex(0); // reset ngay từ đầu
            }, 100); // Thêm độ trễ 100ms
        } else {
            setJoyrideRun(false);
        }
        return () => clearTimeout(timer); // Clear timer khi component unmount hoặc run thay đổi
    }, [run]);


    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
            setJoyrideRun(false);
            onTourEnd();
        } else if (type === "step:after") {
            // Đảm bảo không đặt stepIndex vượt quá số bước
            if (data.index < GUIDE_STEPS.length) {
                setStepIndex(data.index + (data.action === "prev" ? -1 : 1));
            }
        } else if (type === "error") {
            console.error("Joyride error:", data);
            // Xử lý lỗi, ví dụ: dừng tour và báo cho người dùng
            setJoyrideRun(false);
            onTourEnd();
        }
    };

    // Only render Joyride if we are on the client
    if (!isClient) {
        return null;
    }

    return (
        <Joyride
            steps={GUIDE_STEPS}
            run={joyrideRun}
            stepIndex={stepIndex}
            continuous
            showSkipButton
            spotlightPadding={8}
            spotlightClicks={false}
            disableOverlayClose={true}
            locale={{
                back: "Quay lại",
                close: "Đóng",
                last: "Hoàn thành",
                next: "Tiếp theo",
                skip: "Bỏ qua",
            }}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: "#2563eb",
                    backgroundColor: "#ffffff",
                    textColor: "#1f2937",
                    arrowColor: "#ffffff",
                    overlayColor: "rgba(0,0,0,0.6)",
                },
                tooltip: {
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    fontSize: "15px",
                    lineHeight: "1.6",
                },
                tooltipContainer: {
                    textAlign: "left",
                },
                buttonNext: {
                    backgroundColor: "#2563eb",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontWeight: "600",
                },
                buttonBack: {
                    color: "#2563eb",
                    fontWeight: "600",
                },
                buttonSkip: {
                    color: "#ef4444",
                    fontWeight: "600",
                },
            }}
            callback={handleJoyrideCallback}
        />
    );
};

export default GuideOver;