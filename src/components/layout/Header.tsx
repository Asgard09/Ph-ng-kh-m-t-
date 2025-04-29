const Header = ({ title }: { title: string }) => {
  return (
    <div className="bg-white shadow-md p-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="mt-2 text-sm text-gray-500">
        Hệ thống quản lý phòng mạch tư 
      </div>
    </div>
  );
};

export default Header;
