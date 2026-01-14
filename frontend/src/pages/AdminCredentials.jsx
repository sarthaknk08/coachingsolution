import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminCredentials() {
  const [activeTab, setActiveTab] = useState("parents");
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedType, setSelectedType] = useState("parent");

  // Form states
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [emailForm, setEmailForm] = useState({ newEmail: "" });
  const [phoneForm, setPhoneForm] = useState({ newPhone: "" });

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/credentials/parents");
      setParents(res.data.data);
    } catch (err) {
      setError("Failed to load parents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/credentials/students");
      setStudents(res.data.data);
    } catch (err) {
      setError("Failed to load students");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "parents") {
      fetchParents();
    } else {
      fetchStudents();
    }
  }, [activeTab]);

  // Password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const endpoint =
        selectedType === "parent"
          ? "/credentials/parent/reset-password"
          : "/credentials/student/reset-password";

      const payload =
        selectedType === "parent"
          ? { parentId: selectedUser._id, newPassword: passwordForm.newPassword }
          : { studentId: selectedUser._id, newPassword: passwordForm.newPassword };

      const res = await API.put(endpoint, payload);
      setMessage(res.data.message);
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      setSelectedUser(null);

      // Refresh data
      if (selectedType === "parent") fetchParents();
      else fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    }
  };

  // Email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailForm.newEmail)) {
      setError("Invalid email format");
      return;
    }

    try {
      const endpoint =
        selectedType === "parent"
          ? "/credentials/parent/update-email"
          : "/credentials/student/update-email";

      const payload =
        selectedType === "parent"
          ? { parentId: selectedUser._id, newEmail: emailForm.newEmail }
          : { studentId: selectedUser._id, newEmail: emailForm.newEmail };

      const res = await API.put(endpoint, payload);
      setMessage(res.data.message);
      setShowEmailModal(false);
      setEmailForm({ newEmail: "" });
      setSelectedUser(null);

      // Refresh data
      if (selectedType === "parent") fetchParents();
      else fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update email");
    }
  };

  // Phone update (parent only)
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const phoneRegex = /^[0-9]{10,}$/;
    if (!phoneRegex.test(phoneForm.newPhone.replace(/\D/g, ""))) {
      setError("Invalid phone number");
      return;
    }

    try {
      const res = await API.put("/credentials/parent/update-phone", {
        parentId: selectedUser._id,
        newPhone: phoneForm.newPhone,
      });
      setMessage(res.data.message);
      setShowPhoneModal(false);
      setPhoneForm({ newPhone: "" });
      setSelectedUser(null);
      fetchParents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update phone");
    }
  };

  const closeAllModals = () => {
    setShowPasswordModal(false);
    setShowEmailModal(false);
    setShowPhoneModal(false);
    setSelectedUser(null);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setEmailForm({ newEmail: "" });
    setPhoneForm({ newPhone: "" });
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          <i className="fas fa-key mr-3"></i>
          Credential Management
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Manage parent and student account credentials securely
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

      {/* Tabs */}
      <div className="bg-white rounded-t-lg shadow flex border-b">
        <button
          onClick={() => {
            setActiveTab("parents");
            setError("");
            setMessage("");
          }}
          className={`flex-1 py-4 px-4 md:px-6 font-medium transition ${
            activeTab === "parents"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fas fa-user-tie mr-2"></i>
          Parent Credentials
        </button>
        <button
          onClick={() => {
            setActiveTab("students");
            setError("");
            setMessage("");
          }}
          className={`flex-1 py-4 px-4 md:px-6 font-medium transition ${
            activeTab === "students"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <i className="fas fa-user-graduate mr-2"></i>
          Student Credentials
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-b-lg shadow p-4 md:p-6">
        {loading ? (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : activeTab === "parents" && parents.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No parents registered yet</p>
          </div>
        ) : activeTab === "students" && students.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No students registered yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    {activeTab === "parents" ? "Parent Name" : "Student Name"}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Email
                  </th>
                  {activeTab === "parents" && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Children
                      </th>
                    </>
                  )}
                  {activeTab === "students" && (
                    <>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Roll No.
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Batch
                      </th>
                    </>
                  )}
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === "parents" ? parents : students).map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {user.email}
                    </td>
                    {activeTab === "parents" && (
                      <>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {user.phone}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {user.children?.length || 0} child
                          {user.children?.length !== 1 ? "ren" : ""}
                        </td>
                      </>
                    )}
                    {activeTab === "students" && (
                      <>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {user.rollNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {user.batch?.name || "-"}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedType(activeTab === "parents" ? "parent" : "student");
                          setShowPasswordModal(true);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded text-xs font-medium mr-1"
                        title="Reset password"
                      >
                        <i className="fas fa-lock mr-1"></i>
                        Reset PWD
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setSelectedType(activeTab === "parents" ? "parent" : "student");
                          setShowEmailModal(true);
                        }}
                        className="bg-green-100 hover:bg-green-200 text-green-600 px-2 py-1 rounded text-xs font-medium mr-1"
                        title="Change email"
                      >
                        <i className="fas fa-envelope mr-1"></i>
                        Email
                      </button>
                      {activeTab === "parents" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setSelectedType("parent");
                            setShowPhoneModal(true);
                          }}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-2 py-1 rounded text-xs font-medium"
                          title="Change phone"
                        >
                          <i className="fas fa-phone mr-1"></i>
                          Phone
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Reset Password
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Setting new password for: <strong>{selectedUser.name}</strong>
            </p>
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium text-sm"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Update Modal */}
      {showEmailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Update Email
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Updating email for: <strong>{selectedUser.name}</strong>
            </p>
            <form onSubmit={handleEmailUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  value={selectedUser.email}
                  disabled
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter new email"
                  value={emailForm.newEmail}
                  onChange={(e) =>
                    setEmailForm({ newEmail: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium text-sm"
                >
                  Update Email
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Update Modal (Parents Only) */}
      {showPhoneModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Update Phone Number
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Updating phone for: <strong>{selectedUser.name}</strong>
            </p>
            <form onSubmit={handlePhoneUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  value={selectedUser.phone}
                  disabled
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="10 digit phone number"
                  value={phoneForm.newPhone}
                  onChange={(e) =>
                    setPhoneForm({ newPhone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition font-medium text-sm"
                >
                  Update Phone
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
