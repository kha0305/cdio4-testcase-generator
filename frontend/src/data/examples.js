/**
 * Danh sach cac vi du mau de kiem thu he thong.
 * Phuc vu test nhanh 1-click cho nguoi dung kem theo thong tin Project.
 */

export const SAMPLE_REQUIREMENTS = [
  {
    id: "register",
    title: "Đăng ký tài khoản",
    projectName: "Dự Án Đăng Ký Tài Khoản & Phân Quyền Người Dùng",
    tag: "Xác thực / Auth",
    summary: "Tuổi (18-60), Mật khẩu (8-20 ký tự), Tên đăng nhập, Vai trò (Admin/User/Guest), Email",
    text: `Khi người dùng đăng ký tài khoản, tuổi phải từ 18 đến 60 và mật khẩu phải từ 8 đến 20 ký tự.
Tên đăng nhập phải từ 6 đến 32 ký tự.
Vai trò là một trong: Admin, User, Guest.
Email phải đúng định dạng email hợp lệ.`,
  },
  {
    id: "banking",
    title: "Chuyển tiền ngân hàng",
    projectName: "Dự Án Hệ Thống Chuyển Tiền & Giao Dịch Trực Tuyến 24/7",
    tag: "Fintech / Giao dịch",
    summary: "Số tiền (10.000 - 500.000.000), OTP (6 ký tự), Hình thức chuyển, Lời nhắn",
    text: `Số tiền chuyển phải từ 10000 đến 500000000 VNĐ.
Mã OTP gồm đúng 6 ký tự.
Hình thức chuyển là một trong: Chuyen nhanh 247, Chuyen thuong, Chuyen qua the.
Lời nhắn chuyển tiền có độ dài từ 1 đến 100 ký tự.`,
  },
  {
    id: "booking",
    title: "Đặt phòng khách sạn",
    projectName: "Dự Án Đặt Phòng Khách Sạn & Quản Lý Lưu Trú Nghỉ Dưỡng",
    tag: "Booking / Dịch vụ",
    summary: "Số khách (1-8), Số đêm (1-30), Loại phòng (Standard/Deluxe/Suite), Đại diện (18-80 tuổi)",
    text: `Số lượng khách phải từ 1 đến 8 người.
Số đêm lưu trú từ 1 đến 30 ngày.
Loại phòng là một trong: Standard, Deluxe, Suite, President.
Độ tuổi của người đại diện đặt phòng từ 18 đến 80 tuổi.
Số điện thoại phải đúng định dạng hợp lệ.`,
  },
  {
    id: "shipping",
    title: "Vận chuyển TMĐT",
    projectName: "Dự Án Tính Cước & Vận Chuyển Hàng Hóa Thương Mại Điện Tử",
    tag: "E-Commerce",
    summary: "Khối lượng gói hàng (0.1 - 30.0 kg), Khoảng cách (1 - 2000 km), Phương thức giao",
    text: `Khối lượng gói hàng phải từ 0.1 đến 30.0 kg.
Khoảng cách giao hàng từ 1 đến 2000 km.
Phương thức vận chuyển là một trong: Nhanh, Hoa toc, Tiet kiem.
Ghi chú giao hàng từ 0 đến 200 ký tự.`,
  },
  {
    id: "english",
    title: "English Requirement",
    projectName: "Enterprise Employee Onboarding & Verification System",
    tag: "International",
    summary: "Age (18-65), Salary (500-10000), Password (8-20 chars), Department, Email",
    text: `When a user submits an application, age must be from 18 to 65 and salary must be from 500 to 10000.
Password must be from 8 to 20 characters.
Department is one of: Engineering, Marketing, Sales, HR.
Email must be a valid email format.`,
  },
];
