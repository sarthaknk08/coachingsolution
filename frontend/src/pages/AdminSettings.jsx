import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("password");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Email Form
  const [emailForm, setEmailForm] = useState({
    email: "",
    confirmEmail: "",
  });

  // Phone Form
  const [phoneForm, setPhoneForm] = useState({
    newPhone: "",
    confirmPhone: "",
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/change-password", {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (emailForm.email !== emailForm.confirmEmail) {
      setError("Emails do not match");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/update-email", {
        email: emailForm.email,
      });
      setMessage("Email updated successfully!");
      setEmailForm({
        email: "",
        confirmEmail: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (phoneForm.newPhone !== phoneForm.confirmPhone) {
      setError("Phone numbers do not match");
      return;
    }

    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(phoneForm.newPhone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number (minimum 10 digits)");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/update-phone", {
        newPhone: phoneForm.newPhone,
      });
      setMessage("Phone number updated successfully!");
      setPhoneForm({
        newPhone: "",
        confirmPhone: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update phone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Manage your account security and profile information
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start animate-fade-in">
          <i className="fas fa-check-circle mr-3 mt-0.5"></i>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
          <i className="fas fa-exclamation-circle mr-3 mt-0.5"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => {
              setActiveTab("password");
              setMessage("");
              setError("");
            }}
            className={`flex-1 py-4 px-4 md:px-6 font-medium transition text-center md:text-left ${
              activeTab === "password"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-lock mr-2"></i>
            <span className="hidden md:inline">Change Password</span>
            <span className="md:hidden">Password</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("email");
              setMessage("");
              setError("");
            }}
            className={`flex-1 py-4 px-4 md:px-6 font-medium transition text-center md:text-left ${
              activeTab === "email"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-envelope mr-2"></i>
            <span className="hidden md:inline">Update Email</span>
            <span className="md:hidden">Email</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("phone");
              setMessage("");
              setError("");
            }}
            className={`flex-1 py-4 px-4 md:px-6 font-medium transition text-center md:text-left ${
              activeTab === "phone"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-phone mr-2"></i>
            <span className="hidden md:inline">Update Phone</span>
            <span className="md:hidden">Phone</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Change Password Tab */}
          {activeTab === "password" && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Change Your Password
              </h2>
              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        oldPassword: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your new password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Update Password
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Your password will be changed immediately. Make sure to remember
                  your new password.
                </div>
              </form>
            </div>
          )}

          {/* Update Email Tab */}
          {activeTab === "email" && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Update Your Email
              </h2>
              <form onSubmit={handleEmailChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your new email"
                    value={emailForm.email}
                    onChange={(e) =>
                      setEmailForm({
                        ...emailForm,
                        email: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your new email"
                    value={emailForm.confirmEmail}
                    onChange={(e) =>
                      setEmailForm({
                        ...emailForm,
                        confirmEmail: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Update Email
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Your email address will be updated immediately. You may need to
                  log in again with your new email.
                </div>
              </form>
            </div>
          )}

          {/* Update Phone Tab */}
          {activeTab === "phone" && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Update Your Phone Number
              </h2>
              <form onSubmit={handlePhoneChange}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your new phone number"
                    value={phoneForm.newPhone}
                    onChange={(e) =>
                      setPhoneForm({
                        ...phoneForm,
                        newPhone: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 digits
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your new phone number"
                    value={phoneForm.confirmPhone}
                    onChange={(e) =>
                      setPhoneForm({
                        ...phoneForm,
                        confirmPhone: e.target.value,
                      })
                    }
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Update Phone
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <i className="fas fa-info-circle mr-2"></i>
                  Your phone number will be updated immediately. You can use your new
                  phone number for login.
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
