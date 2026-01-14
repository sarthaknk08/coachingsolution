import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminParents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    occupation: "",
    address: "",
    city: "",
    state: "",
  });

  const fetchParents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/parents");
      setParents(res.data);
    } catch (err) {
      setError("Failed to load parents");
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
    fetchParents();
    fetchStudents();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      alternatePhone: "",
      occupation: "",
      address: "",
      city: "",
      state: "",
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await API.put(`/parents/${editingId}`, form);
      } else {
        const parentData = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          alternatePhone: form.alternatePhone,
          occupation: form.occupation,
          address: form.address,
          city: form.city,
          state: form.state,
        };
        await API.post("/parents", parentData);
      }
      resetForm();
      fetchParents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save parent");
    }
  };

  const deleteParent = async (id) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      try {
        await API.delete(`/parents/${id}`);
        fetchParents();
      } catch (err) {
        setError("Failed to delete parent");
      }
    }
  };

  const linkChildToParent = async (parentId, studentId) => {
    try {
      await API.post("/parents/child/add", {
        parentId,
        studentId,
      });
      fetchParents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link child");
    }
  };

  const removeChildFromParent = async (parentId, studentId) => {
    if (window.confirm("Remove this child from parent?")) {
      try {
        await API.post("/parents/child/remove", {
          parentId,
          studentId,
        });
        fetchParents();
      } catch (err) {
        setError("Failed to remove child");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Manage Parents
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Create and link parents to students
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
          <i className="fas fa-user-tie"></i>
          <span>Add New Parent</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            {editingId ? "Edit Parent" : "Create New Parent"}
          </h2>
          <form onSubmit={submitHandler}>
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Name *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required={!editingId}
                    disabled={editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="parent@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required={!editingId}
                    disabled={editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 9876543211"
                    value={form.alternatePhone}
                    onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineer, Doctor"
                    value={form.occupation}
                    onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full address"
                    rows="3"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                {editingId ? "Update Parent" : "Create Parent"}
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

      {/* Parents List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading parents...</p>
        </div>
      ) : parents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No parents yet</p>
          <p className="text-gray-400 text-sm">Create your first parent to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {parents.map((parent) => (
            <div
              key={parent._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6"
            >
              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  {parent.user?.name}
                </h3>
                <p className="text-sm text-gray-500">{parent.user?.email}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 border-t pt-3">
                <p>
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${parent.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {parent.phone}
                  </a>
                </p>
                {parent.alternatePhone && (
                  <p>
                    <strong>Alt Phone:</strong>{" "}
                    <a
                      href={`tel:${parent.alternatePhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {parent.alternatePhone}
                    </a>
                  </p>
                )}
                {parent.occupation && (
                  <p>
                    <strong>Occupation:</strong> {parent.occupation}
                  </p>
                )}
                {parent.city && (
                  <p>
                    <strong>City:</strong> {parent.city}
                  </p>
                )}
              </div>

              {/* Children Section */}
              <div className="mb-4 border-t pt-3">
                <h4 className="font-semibold text-gray-700 mb-2">
                  <i className="fas fa-children mr-2"></i>Children
                </h4>
                {parent.children && parent.children.length > 0 ? (
                  <div className="space-y-2">
                    {parent.children.map((child) => (
                      <div
                        key={child._id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded text-xs"
                      >
                        <span className="text-gray-700">
                          {child.user?.name} ({child.rollNumber})
                        </span>
                        <button
                          onClick={() => removeChildFromParent(parent._id, child._id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Remove child"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs italic">No children linked</p>
                )}

                {/* Add Child Dropdown */}
                <div className="mt-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        linkChildToParent(parent._id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">+ Add child...</option>
                    {students.map((student) => {
                      const isAlreadyLinked = parent.children?.some(
                        (c) => c._id === student._id
                      );
                      return !isAlreadyLinked ? (
                        <option key={student._id} value={student._id}>
                          {student.user?.name} ({student.rollNumber})
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm({
                      name: parent.user?.name,
                      email: parent.user?.email,
                      phone: parent.phone,
                      alternatePhone: parent.alternatePhone,
                      occupation: parent.occupation,
                      address: parent.address,
                      city: parent.city,
                      state: parent.state,
                    });
                    setEditingId(parent._id);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded transition text-sm font-medium"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => deleteParent(parent._id)}
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
