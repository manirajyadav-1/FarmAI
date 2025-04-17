import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoginView from "../../assets/loginview.jpg"

const Signup = () => {
  const [register, setRegister] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setRegister({
      ...register,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/signup",
        {
          name: register.name.trim(),
          email: register.email.trim(),
          password: register.password.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      alert("User registered successfully");
      setRegister({ name: "", email: "", password: "" });
      navigate("/login");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-100 to-indigo-200">

      <div className="w-3/4 hidden md:block">
        <img src={LoginView} alt="Login visual" className="object-cover w-full h-full rounded-r-4xl"/>
      </div>

      <div className="w-full md:w-2/4 flex justify-center items-center h-screen bg-gradient-to-r from-indigo-100 to-blue-200">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h2>
          {error && (
            <p className="text-red-600 mb-4 text-sm text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 mb-1">Name:</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={register.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Email:</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={register.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Password:</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={register.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;