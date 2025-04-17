import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./components/Home/Home";
import History from "./components/History/History";
import Login from "./components/LoginSignup/Login";
import Signup from "./components/LoginSignup/Signup";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Chatbot from "./components/Chatbot/Chatbot";

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen flex bg-gray-100">
      {!isAuthPage && <Sidebar />}
      <div
        className={
          isAuthPage ? "w-full h-[100vh]" : "ml-[250px] w-full h-[100vh]"
        }
      >
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>}/>
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>}/>
          <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>}/>
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return <AppLayout />;
};

export default App;
