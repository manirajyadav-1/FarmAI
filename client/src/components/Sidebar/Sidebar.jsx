import { ChevronFirst, ChevronLast, Home, History, LogOut, Bot } from "lucide-react";
import logo from "../../assets/logo.jpg";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";


const SidebarContext = createContext();

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const cookies = new Cookies();


  useEffect(() => {
    const fetchUser = async () => {
      const token = cookies.get("token");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8080/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    cookies.remove("token");
    navigate("/login");
  };

  return (
    <aside className="h-screen fixed">
      <nav className="h-full flex flex-col bg-white shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={logo}
            className={`mix-blend-multiply overflow-hidden transition-all ${
              expanded ? "w-28" : "w-0"
            }`}
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            {expanded ? <ChevronFirst size={20} /> : <ChevronLast size={20} />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 my-10">
            <SidebarItem icon={<Home size={20} />} text="Home" path="/" />
            <SidebarItem icon={<History size={20} />} text="History" path="/history" />
            <SidebarItem icon={<Bot size={20} />} text="Chatbot" path="/chatbot" />
          </ul>
        </SidebarContext.Provider>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center">
            <img src={logo} className="w-10 h-10 rounded-md" />
            <div
              className={`overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              }`}
            >
              <div className="leading-4">
                <h4 className="font-semibold">{user?.name || "User"}</h4>
                <span className="text-xs text-gray-600">
                  {user?.email || ""}
                </span>
              </div>
            </div>
          </div>


          <div
            className={`mt-4 flex items-center text-sm text-red-600 cursor-pointer hover:underline ${
              expanded ? "justify-start" : "justify-center"
            }`}
            onClick={handleLogout}
          >
            <LogOut size={18} className="mr-2" />
            {expanded && "Logout"}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, path }) {
  const { expanded } = useContext(SidebarContext);
  const navigate = useNavigate();
  const isActive = location.pathname === path;

  return (
    <li
      className={`relative flex items-center py-2 px-3 my-5 font-medium rounded-md cursor-pointer transition-colors group ${
        isActive
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
          : "hover:bg-indigo-50 text-gray-600"
      }`}
      onClick={() => navigate(path)}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>

      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {text}
        </div>
      )}
    </li>
  );
}