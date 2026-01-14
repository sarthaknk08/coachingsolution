import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    className: "",
    subjects: "",
    timing: "",
    feeAmount: "",
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/batches");
      setBatches(res.data);
    } catch (err) {
      setError("Failed to load batches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      className: "",
      subjects: "",
      timing: "",
      feeAmount: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const batchData = {
        name: form.name,
        className: form.className,
        subjects: form.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        timing: form.timing,
        feeAmount: Number(form.feeAmount),
      };

      if (editingId) {
        await API.put(`/batches/${editingId}`, batchData);
      } else {
        await API.post("/batches", batchData);
      }

      resetForm();
      fetchBatches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save batch");
    }
  };

  const deleteBatch = async (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await API.delete(`/batches/${id}`);
        fetchBatches();
      } catch (err) {
        setError("Failed to delete batch");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Manage Batches
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Create and manage coaching batches
        </p>
      </div>

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
          <i className="fas fa-plus"></i>
          <span>Add Batch</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            {editingId ? "Edit Batch" : "Create New Batch"}
          </h2>
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., NEET Batch A"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 12th Science"
                  value={form.className}
                  onChange={(e) =>
                    setForm({ ...form, className: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subjects (comma separated)
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Physics, Chemistry, Biology"
                  value={form.subjects}
                  onChange={(e) =>
                    setForm({ ...form, subjects: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timing
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6:00 AM - 9:00 AM"
                  value={form.timing}
                  onChange={(e) =>
                    setForm({ ...form, timing: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Fee (₹)
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="5000"
                  value={form.feeAmount}
                  onChange={(e) =>
                    setForm({ ...form, feeAmount: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                Save Batch
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

      {/* Batches List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No batches yet</p>
          <p className="text-gray-400 text-sm">Create your first batch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {batches.map((batch) => (
            <div
              key={batch._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {batch.name}
                  </h3>
                  <p className="text-sm text-gray-500">{batch.className}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                  {batch.students?.length || 0} students
                </span>
              </div>

              {batch.timing && (
                <p className="text-sm text-gray-600 mb-2">
                  <i className="fas fa-clock mr-2 text-blue-600"></i>
                  {batch.timing}
                </p>
              )}

              {batch.subjects && batch.subjects.length > 0 && (
                <p className="text-sm text-gray-600 mb-3">
                  <i className="fas fa-book mr-2 text-blue-600"></i>
                  {batch.subjects.join(", ")}
                </p>
              )}

              <div className="border-t pt-3">
                <p className="font-semibold text-lg text-gray-800">
                  ₹{batch.feeAmount}
                  <span className="text-sm text-gray-500 font-normal">/month</span>
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setForm(batch);
                    setEditingId(batch._id);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded transition text-sm font-medium"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => deleteBatch(batch._id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded transition text-sm font-medium"
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
