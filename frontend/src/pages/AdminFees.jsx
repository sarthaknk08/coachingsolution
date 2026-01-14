import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    studentId: "",
    totalAmount: "",
    paidAmount: "",
  });

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await API.get("/fees");
      setFees(res.data);
    } catch (err) {
      setError("Failed to load fees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students");
    }
  };

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const resetForm = () => {
    setForm({
      studentId: "",
      totalAmount: "",
      paidAmount: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const feeData = {
        studentId: form.studentId,
        totalAmount: Number(form.totalAmount),
        paidAmount: Number(form.paidAmount || 0),
      };

      if (editingId) {
        await API.put(`/fees/${editingId}`, feeData);
      } else {
        await API.post("/fees", feeData);
      }

      resetForm();
      fetchFees();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save fees");
    }
  };

  const deleteFee = async (id) => {
    if (window.confirm("Are you sure you want to delete this fee record?")) {
      try {
        await API.delete(`/fees/${id}`);
        fetchFees();
      } catch (err) {
        setError("Failed to delete fee");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-300";
      case "partial":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "pending":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const filteredFees =
    filterStatus === "all"
      ? fees
      : fees.filter((f) => f.status === filterStatus);

  const stats = {
    total: fees.reduce((sum, f) => sum + f.totalAmount, 0),
    collected: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    pending: fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0),
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Manage Fees
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Track and manage student fee payments
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
          <i className="fas fa-exclamation-circle mr-3 mt-0.5"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Fee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Fee Amount</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            ₹{stats.total.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-green-600">
          <p className="text-gray-600 text-sm font-medium mb-1">Collected</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">
            ₹{stats.collected.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-red-600">
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <p className="text-2xl md:text-3xl font-bold text-red-600">
            ₹{stats.pending.toLocaleString()}
          </p>
        </div>
      </div>

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
          <span>Add/Update Fee</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            {editingId ? "Update Fee Record" : "Add New Fee"}
          </h2>
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.studentId}
                  onChange={(e) =>
                    setForm({ ...form, studentId: e.target.value })
                  }
                  required
                >
                  <option value="">Select a student...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.user?.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Fee Amount (₹)
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="50000"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm({ ...form, totalAmount: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  placeholder="0"
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm({ ...form, paidAmount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                Save Fee
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

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All ({fees.length})
        </button>
        <button
          onClick={() => setFilterStatus("paid")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "paid"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Paid ({fees.filter((f) => f.status === "paid").length})
        </button>
        <button
          onClick={() => setFilterStatus("partial")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "partial"
              ? "bg-yellow-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Partial ({fees.filter((f) => f.status === "partial").length})
        </button>
        <button
          onClick={() => setFilterStatus("pending")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filterStatus === "pending"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pending ({fees.filter((f) => f.status === "pending").length})
        </button>
      </div>

      {/* Fees List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading fees...</p>
        </div>
      ) : filteredFees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No fees to display</p>
          <p className="text-gray-400 text-sm">Add fee records to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredFees.map((fee) => {
            const pending = fee.totalAmount - fee.paidAmount;
            const percentage = (fee.paidAmount / fee.totalAmount) * 100;
            return (
              <div
                key={fee._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {fee.student?.user?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {fee.student?.rollNumber}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      fee.status
                    )}`}
                  >
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4 border-t pt-3">
                  <p>
                    <strong>Total:</strong> ₹{fee.totalAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Paid:</strong>{" "}
                    <span className="text-green-600 font-semibold">
                      ₹{fee.paidAmount.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <strong>Pending:</strong>{" "}
                    <span className="text-red-600 font-semibold">
                      ₹{pending.toLocaleString()}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setForm({
                        studentId: fee.student?._id,
                        totalAmount: fee.totalAmount.toString(),
                        paidAmount: fee.paidAmount.toString(),
                      });
                      setEditingId(fee._id);
                      setShowForm(true);
                    }}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded transition text-sm font-medium"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteFee(fee._id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded transition text-sm font-medium"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
