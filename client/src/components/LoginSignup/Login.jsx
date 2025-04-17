import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import LoginView from "../../assets/loginview.jpg"

const Login = () => {
  const [password, setPasswordValue] = useState("");
  const [userId, setUserIdValue] = useState("");

  const cookies = new Cookies();
  const navigate = useNavigate();

  const setPassword = (e) => setPasswordValue(e.target.value);
  const setUserId = (e) => setUserIdValue(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: userId,
      password: password,
    };

    try {
      const response = await axios.post("http://localhost:8080/auth/login", data);
      if (!response.data) {
        alert("Invalid User Id or Password");
      } else {
        const token = response.data.token;
        cookies.set("token", token);
        alert("Login Successful");
        navigate("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const redirectToRegister = () => navigate("/signup");

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-100 to-indigo-200 ">
      
      <div className="w-3/4 hidden md:block">
        <img src={LoginView} alt="Login visual" className="object-cover w-full h-full rounded-r-4xl"/>
      </div>

      <div className="w-full md:w-2/4 flex justify-center items-center rounded-l-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Email:</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={userId}
                onChange={setUserId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Password:</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <button
              onClick={redirectToRegister}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
