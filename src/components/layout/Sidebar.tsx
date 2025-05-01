import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaListAlt,
  FaFileMedical,
  FaSearch,
  FaFileInvoiceDollar,
  FaChartBar,
  FaHome,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Xóa cookie xác thực
    document.cookie =
      "authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Chuyển hướng về trang đăng nhập
    router.push("/");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      name: "Lập danh sách khám bệnh",
      path: "/medical/examination-list",
      icon: <FaListAlt className="w-5 h-5" />,
    },
    {
      name: "Lập phiếu khám bệnh",
      path: "/medical/examination-form",
      icon: <FaFileMedical className="w-5 h-5" />,
    },
    {
      name: "Tra cứu bệnh nhân",
      path: "/medical/patient-search",
      icon: <FaSearch className="w-5 h-5" />,
    },
    {
      name: "Lập hóa đơn thanh toán",
      path: "/medical/invoice",
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
    },
    {
      name: "Lập báo cáo tháng",
      path: "/medical/reports",
      icon: <FaChartBar className="w-5 h-5" />,
    },
    {
      name: "Quy định",
      path: "/medical/regulations",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  return (
    <div className="h-screen bg-blue-600 text-white w-64 flex flex-col">
      <div className="p-5 border-b border-blue-500">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-full"></div>
          <div className="font-bold text-white">Admin</div>
        </div>
      </div>

      <nav className="flex-1 p-5">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center space-x-3 p-3 rounded-md transition-colors text-white
                  ${
                    pathname === item.path
                      ? "bg-blue-700 text-white"
                      : "hover:bg-blue-700"
                  }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-5 border-t border-blue-500">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-md hover:bg-blue-700 transition-colors text-white"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
