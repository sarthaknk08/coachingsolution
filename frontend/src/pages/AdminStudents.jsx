import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    className: "",
    batch: "",
    parentContact: "",
    dateOfBirth: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    emergencyContact: "",
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      setError("Failed to load students");
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
    fetchStudents();
    fetchBatches();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      rollNumber: "",
      className: "",
      batch: "",
      parentContact: "",
      dateOfBirth: "",
      bloodGroup: "",
      address: "",
      city: "",
      state: "",
      emergencyContact: "",
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
        // Update existing student
        const updateData = { ...form };
        delete updateData.email;
        delete updateData.password;
        await API.put(`/students/${editingId}`, updateData);
      } else {
        // Create new student (requires name, email, password)
        const studentData = {
          name: form.name,
          email: form.email,
          password: form.password,
          rollNumber: form.rollNumber,
          className: form.className,
          batch: form.batch,
          parentContact: form.parentContact,
          dateOfBirth: form.dateOfBirth,
          bloodGroup: form.bloodGroup,
          address: form.address,
          city: form.city,
          state: form.state,
          emergencyContact: form.emergencyContact,
        };
        await API.post("/students", studentData);
      }
      resetForm();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await API.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        setError("Failed to delete student");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Manage Students
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Create new students and manage their profiles
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
          <i className="fas fa-user-plus"></i>
          <span>Add New Student</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            {editingId ? "Edit Student" : "Create New Student"}
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
                    Student Name *
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
                    placeholder="student@example.com"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required={!editingId}
                    disabled={editingId}
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Create a strong password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="S001"
                    value={form.rollNumber}
                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12th Science"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    required
                  >
                    <option value="">Select a batch...</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.className})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4 border-b pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Contact *
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 9876543210 or parent@email.com"
                    value={form.parentContact}
                    onChange={(e) => setForm({ ...form, parentContact: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Emergency contact number"
                    value={form.emergencyContact}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                  />
                </div>

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
                {editingId ? "Update Student" : "Create Student"}
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

      {/* Students List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading students...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No students yet</p>
          <p className="text-gray-400 text-sm">Create your first student to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 md:p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {student.user?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{student.user?.email}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
                  {student.rollNumber}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 border-t pt-3">
                <p>
                  <strong>Class:</strong> {student.className}
                </p>
                <p>
                  <strong>Batch:</strong> {student.batch?.name || "N/A"}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  <a
                    href={`tel:${student.parentContact}`}
                    className="text-blue-600 hover:underline text-xs truncate"
                  >
                    {student.parentContact}
                  </a>
                </p>
                {student.city && (
                  <p>
                    <strong>City:</strong> {student.city}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setForm({
                      name: student.user?.name,
                      email: student.user?.email,
                      password: "",
                      rollNumber: student.rollNumber,
                      className: student.className,
                      batch: student.batch?._id || "",
                      parentContact: student.parentContact,
                      dateOfBirth: student.dateOfBirth,
                      bloodGroup: student.bloodGroup,
                      address: student.address,
                      city: student.city,
                      state: student.state,
                      emergencyContact: student.emergencyContact,
                    });
                    setEditingId(student._id);
                    setShowForm(true);
                  }}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded transition text-sm font-medium"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => deleteStudent(student._id)}
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
