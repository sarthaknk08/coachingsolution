import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCoaching } from "../context/CoachingContext";

export default function StudentLogin() {
  const { login } = useAuth();
  const { coaching } = useCoaching();
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // Prepare login payload
      const payload = {
        password: formData.password,
      };

      if (isPhoneLogin) {
        if (!formData.phone.trim()) {
          setError("Phone number is required");
          setLoading(false);
          return;
        }
        payload.phone = formData.phone;
      } else {
        if (!formData.email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        payload.email = formData.email;
      }

      // Call login API
      const response = await API.post("/auth/login", payload);

      if (response.data.token && response.data.user) {
        // Verify student role
        if (response.data.user.role !== "student") {
          setError("This login is for students only. Please use admin login.");
          setLoading(false);
          return;
        }

        // Update context and redirect
        // login function expects object with { token, user }
        login({
          token: response.data.token,
          user: response.data.user,
        });
      } else {
        setError("Login failed. Invalid response from server.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${coaching.primaryColor || "#2563eb"}20 0%, ${coaching.secondaryColor || "#1e40af"}20 100%), linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          {coaching.coachingLogo && (
            <img
              src={coaching.coachingLogo}
              alt="Logo"
              className="h-16 mx-auto mb-4"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: coaching.primaryColor || "#2563eb" }}
          >
            {coaching.coachingName || "Student Portal"}
          </h1>
          <p className="text-gray-600">Student Login</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
              <i className="fas fa-exclamation-circle mr-3 mt-0.5 flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Phone Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setIsPhoneLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  !isPhoneLogin
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-envelope mr-2"></i>
                Email
              </button>
              <button
                type="button"
                onClick={() => setIsPhoneLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                  isPhoneLogin
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className="fas fa-phone mr-2"></i>
                Phone
              </button>
            </div>

            {/* Email/Phone Input */}
            {!isPhoneLogin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: coaching.primaryColor || "#2563eb",
              }}
              className="w-full text-white font-medium py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-6"
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
          </form>

          {/* Divider */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Admin Login Link */}
          <p className="text-center text-gray-600 text-sm">
            Admin / Teacher / Parent?{" "}
            <Link
              to="/login"
              style={{ color: coaching.primaryColor || "#2563eb" }}
              className="font-medium hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Footer Help */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            <i className="fas fa-shield-alt mr-2"></i>
            Secure Student Portal
          </p>
          <p className="text-xs mt-2 text-gray-500">
            If you don't have credentials, please contact your admin
          </p>
        </div>
      </div>
    </div>
  );
}
