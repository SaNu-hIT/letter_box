import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mail,
  Users,
  Settings,
  LogOut,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  active = false,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-purple-100",
        active
          ? "bg-purple-100 text-purple-900"
          : "text-gray-600 hover:text-purple-900",
      )}
    >
      <div
        className={cn("h-5 w-5", active ? "text-purple-700" : "text-gray-500")}
      >
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/admin/login";
  };

  return (
    <div className="h-full w-64 border-r border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          A
        </div>
        <h2 className="text-xl font-serif text-purple-800">Admin Panel</h2>
      </div>

      <nav className="space-y-1">
        <SidebarItem
          icon={<LayoutDashboard />}
          label="Dashboard"
          href="/admin"
          active={location.pathname === "/admin"}
        />
        <SidebarItem
          icon={<Mail />}
          label="Letters"
          href="/admin/letters"
          active={location.pathname === "/admin/letters"}
        />
        <SidebarItem
          icon={<Users />}
          label="Users"
          href="/admin/users"
          active={location.pathname === "/admin/users"}
        />
        <SidebarItem
          icon={<CreditCard />}
          label="Payments"
          href="/admin/payments"
          active={location.pathname === "/admin/payments"}
        />
        <SidebarItem
          icon={<Settings />}
          label="Settings"
          href="/admin/settings"
          active={location.pathname === "/admin/settings"}
        />
      </nav>

      <div className="absolute bottom-4 w-52">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
