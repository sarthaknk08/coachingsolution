import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCoaching } from "../context/CoachingContext";

export default function Login() {
  const { login } = useAuth();
  const { coaching } = useCoaching();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usePhone, setUsePhone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", usePhone ? {
        phone,
        password,
      } : {
        email,
        password,
      });
      login(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4"
      style={{
        background: `linear-gradient(to bottom right, ${coaching.primaryColor}15, ${coaching.secondaryColor}15)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          {coaching.coachingLogo ? (
            <img
              src={coaching.coachingLogo}
              alt="Coaching Logo"
              className="h-24 mx-auto mb-4 object-contain"
            />
          ) : (
            <div
              className="inline-block text-white p-4 rounded-full mb-4"
              style={{ backgroundColor: coaching.primaryColor }}
            >
              <i className="fas fa-graduation-cap text-3xl"></i>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {coaching.coachingName}
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            {coaching.coachingDescription}
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Login
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start">
              <i className="fas fa-exclamation-circle mr-2 mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Login Method Toggle */}
          <div className="mb-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setUsePhone(false);
                setPhone("");
              }}
              className={`px-4 py-2 rounded-l-lg font-medium transition ${
                !usePhone
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={{ backgroundColor: !usePhone ? coaching.primaryColor : undefined }}
            >
              <i className="fas fa-envelope mr-2"></i>Email
            </button>
            <button
              type="button"
              onClick={() => {
                setUsePhone(true);
                setEmail("");
              }}
              className={`px-4 py-2 rounded-r-lg font-medium transition ${
                usePhone
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={{ backgroundColor: usePhone ? coaching.primaryColor : undefined }}
            >
              <i className="fas fa-phone mr-2"></i>Phone
            </button>
          </div>

          {usePhone ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full hover:opacity-90 disabled:bg-gray-400 text-white font-semibold py-2 md:py-3 rounded-lg transition duration-200 flex items-center justify-center"
            style={{
              backgroundColor: coaching.primaryColor,
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                Login
              </>
            )}
          </button>

          {/* Student Login Button */}
          <Link
            to="/student/login"
            className="w-full block mt-4 text-center py-2 md:py-3 rounded-lg font-semibold transition duration-200 border-2"
            style={{
              color: coaching.primaryColor,
              borderColor: coaching.primaryColor,
              backgroundColor: "transparent",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = `${coaching.primaryColor}10`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <i className="fas fa-student mr-2"></i>
            Student Login
          </Link>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
          
            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                      
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
