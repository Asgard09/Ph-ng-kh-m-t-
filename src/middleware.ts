import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Đường dẫn hiện tại
  const path = request.nextUrl.pathname;

  // Kiểm tra cookie xác thực
  const isAuthenticated = request.cookies.has("authenticated");

  // Nếu người dùng truy cập trang đăng nhập nhưng đã xác thực, chuyển hướng đến dashboard
  if (path === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Nếu người dùng truy cập bất kỳ trang nào khác ngoài trang đăng nhập mà chưa xác thực, chuyển hướng đến trang đăng nhập
  if (path !== "/" && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Mặc định, tiếp tục xử lý request
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn sau
export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/students/:path*",
    "/courses/:path*",
    "/instructors/:path*",
    "/exams/:path*",
    "/licenses/:path*",
  ],
};
