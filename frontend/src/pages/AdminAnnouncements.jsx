import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "all",
    batchId: "",
    type: "general",
    priority: "medium",
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements/admin/all");
      setAnnouncements(res.data.data);
    } catch (err) {
      setError("Failed to load announcements");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await API.get("/batches");
      setBatches(res.data);
    } catch (err) {
      console.error("Failed to load batches");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchBatches();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      message: "",
      audience: "all",
      batchId: "",
      type: "general",
      priority: "medium",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!form.message.trim()) {
      setError("Message is required");
      return;
    }
    if (form.message.trim().length < 5) {
      setError("Message must be at least 5 characters long");
      return;
    }
    if (form.audience === "batch" && !form.batchId) {
      setError("Please select a batch for batch-specific announcement");
      return;
    }

    try {
      setLoading(true);
      const data = {
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        batchId: form.audience === "batch" ? form.batchId : null,
        type: form.type,
        priority: form.priority,
      };

      if (editingId) {
        await API.put(`/announcements/admin/${editingId}`, data);
        setMessage("Announcement updated successfully!");
      } else {
        await API.post("/announcements/admin/create", data);
        setMessage("Announcement created successfully!");
      }

      resetForm();
      fetchAnnouncements();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save announcement"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    ) {
      try {
        await API.delete(`/announcements/admin/${id}`);
        setMessage("Announcement deleted successfully!");
        fetchAnnouncements();
      } catch (err) {
        setError("Failed to delete announcement");
      }
    }
  };

  const editAnnouncement = (announcement) => {
    setForm({
      title: announcement.title,
      message: announcement.message,
      audience: announcement.audience,
      batchId: announcement.batchId || "",
      type: announcement.type,
      priority: announcement.priority,
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await API.put(`/announcements/admin/${id}`, {
        isActive: !currentStatus,
      });
      setMessage("Announcement status updated!");
      fetchAnnouncements();
    } catch (err) {
      setError("Failed to update announcement status");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          <i className="fas fa-bullhorn mr-3"></i>
          Manage Announcements
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Create and manage announcements for students and parents
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

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base"
        >
          <i className="fas fa-plus-circle"></i>
          <span>New Announcement</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            {editingId ? "Edit Announcement" : "Create New Announcement"}
          </h2>
          <form onSubmit={submitForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mid-Year Exam Schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  disabled={loading}
                >
                  <option value="general">General</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                  <option value="event">Event</option>
                  <option value="assignment">Assignment</option>
                  <option value="notice">Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audience *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.audience}
                  onChange={(e) =>
                    setForm({ ...form, audience: e.target.value, batchId: "" })
                  }
                  disabled={loading}
                >
                  <option value="all">All (Students & Parents)</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="batch">Specific Batch</option>
                </select>
              </div>

              {form.audience === "batch" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Batch *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.batchId}
                    onChange={(e) =>
                      setForm({ ...form, batchId: e.target.value })
                    }
                    disabled={loading}
                  >
                    <option value="">Choose a batch...</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.className})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message * <span className="text-xs text-gray-500">(minimum 5 characters)</span>
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter announcement message (at least 5 characters)..."
                rows="5"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                disabled={loading}
              ></textarea>
              <div className="flex justify-between items-center mt-1">
                <p className={`text-xs ${form.message.length < 5 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                  {form.message.length} characters {form.message.length < 5 ? '(need at least 5)' : ''}
                </p>
                {form.message.length >= 5 && (
                  <p className="text-xs text-green-600">✓ Valid</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                {editingId ? "Update" : "Create"} Announcement
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No announcements yet</p>
          <p className="text-gray-400 text-sm">Create your first announcement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className={`border-l-4 rounded-lg shadow hover:shadow-lg transition p-4 md:p-6 ${
                announcement.priority === "high"
                  ? "border-red-500 bg-red-50"
                  : announcement.priority === "medium"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-800">
                      {announcement.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        announcement.priority === "high"
                          ? "bg-red-200 text-red-700"
                          : announcement.priority === "medium"
                          ? "bg-yellow-200 text-yellow-700"
                          : "bg-blue-200 text-blue-700"
                      }`}
                    >
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    <i className="fas fa-tag mr-2"></i>
                    {announcement.type} • {announcement.audience}
                    {announcement.batchId && " (Batch Specific)"}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap ml-2 ${
                    announcement.isActive
                      ? "bg-green-200 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {announcement.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="text-gray-700 mb-3 text-sm whitespace-pre-wrap">
                {announcement.message}
              </p>

              <div className="text-xs text-gray-500 mb-4 border-t pt-2">
                <p>
                  <strong>Created by:</strong> {announcement.createdBy?.name} on{" "}
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() =>
                    toggleActive(announcement._id, announcement.isActive)
                  }
                  className={`px-3 py-2 rounded transition text-sm font-medium ${
                    announcement.isActive
                      ? "bg-orange-100 hover:bg-orange-200 text-orange-600"
                      : "bg-green-100 hover:bg-green-200 text-green-600"
                  }`}
                >
                  <i
                    className={`mr-1 ${
                      announcement.isActive ? "fas fa-eye-slash" : "fas fa-eye"
                    }`}
                  ></i>
                  {announcement.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => editAnnouncement(announcement)}
                  className="flex-1 md:flex-none bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-2 rounded transition text-sm font-medium"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => deleteAnnouncement(announcement._id)}
                  className="flex-1 md:flex-none bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded transition text-sm font-medium"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
