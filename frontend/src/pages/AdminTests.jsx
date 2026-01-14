import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminTests() {
  const [tests, setTests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [testForm, setTestForm] = useState({
    name: "",
    description: "",
    batch: "",
    subject: "",
    totalMarks: "",
    testDate: "",
    testType: "unit-test",
  });

  const [scoreForm, setScoreForm] = useState({
    student: "",
    marksObtained: "",
    totalMarks: "",
    feedback: "",
    status: "passed",
  });

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tests");
      setTests(res.data);
    } catch (err) {
      setError("Failed to load tests");
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

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students");
    }
  };

  useEffect(() => {
    fetchTests();
    fetchBatches();
    fetchStudents();
  }, []);

  const resetTestForm = () => {
    setTestForm({
      name: "",
      description: "",
      batch: "",
      subject: "",
      totalMarks: "",
      testDate: "",
      testType: "unit-test",
    });
    setShowTestForm(false);
    setError("");
  };

  const resetScoreForm = () => {
    setScoreForm({
      student: "",
      marksObtained: "",
      totalMarks: "",
      feedback: "",
      status: "passed",
    });
    setShowScoreForm(false);
    setError("");
  };

  const submitTestForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const data = {
        name: testForm.name,
        description: testForm.description,
        batch: testForm.batch,
        subject: testForm.subject,
        totalMarks: parseInt(testForm.totalMarks),
        testDate: testForm.testDate,
        testType: testForm.testType,
      };

      await API.post("/tests", data);
      setMessage("Test created successfully!");
      resetTestForm();
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test");
    }
  };

  const submitScoreForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validation
    if (!selectedTest || !scoreForm.student) {
      setError("Please select test and student");
      return;
    }
    
    if (!scoreForm.marksObtained && scoreForm.marksObtained !== 0) {
      setError("Marks obtained is required");
      return;
    }
    
    const totalMarks = parseInt(scoreForm.totalMarks) || parseInt(selectedTest.totalMarks);
    if (!totalMarks) {
      setError("Total marks is required");
      return;
    }

    try {
      const marksObtained = parseInt(scoreForm.marksObtained);
      
      if (marksObtained > totalMarks) {
        setError("Marks obtained cannot be more than total marks");
        return;
      }
      
      await API.post("/tests/score/add", {
        testId: selectedTest._id,
        studentId: scoreForm.student,
        marksObtained: marksObtained,
        totalMarks: totalMarks,
        feedback: scoreForm.feedback,
        status: scoreForm.status,
      });

      setMessage("Score added successfully!");
      resetScoreForm();
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add score");
    }
  };

  const deleteTest = async (id) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      try {
        await API.delete(`/tests/${id}`);
        setMessage("Test deleted successfully!");
        fetchTests();
      } catch (err) {
        setError("Failed to delete test");
      }
    }
  };

  const getTestBatchStudents = (batchId) => {
    return students.filter((s) => s.batch?._id === batchId);
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Manage Tests
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Create tests and manage student scores
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start">
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

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
        <button
          onClick={() => {
            if (showTestForm) {
              resetTestForm();
            } else {
              setShowTestForm(true);
              setShowScoreForm(false);
            }
          }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base"
        >
          <i className="fas fa-file-alt"></i>
          <span>Create Test</span>
        </button>

        {selectedTest && (
          <button
            onClick={() => {
              if (showScoreForm) {
                resetScoreForm();
              } else {
                setShowScoreForm(true);
                setShowTestForm(false);
              }
            }}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition font-medium text-sm md:text-base"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Add Score</span>
          </button>
        )}
      </div>

      {/* Create Test Form */}
      {showTestForm && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            Create New Test
          </h2>
          <form onSubmit={submitTestForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics Final Exam"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics"
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={testForm.batch}
                  onChange={(e) => setTestForm({ ...testForm, batch: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                  type="number"
                  value={testForm.totalMarks}
                  onChange={(e) =>
                    setTestForm({ ...testForm, totalMarks: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={testForm.testType}
                  onChange={(e) => setTestForm({ ...testForm, testType: e.target.value })}
                >
                  <option value="unit-test">Unit Test</option>
                  <option value="half-yearly">Half Yearly</option>
                  <option value="final">Final</option>
                  <option value="mock">Mock Test</option>
                  <option value="practice">Practice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Date *
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  type="date"
                  value={testForm.testDate}
                  onChange={(e) =>
                    setTestForm({ ...testForm, testDate: e.target.value })
                  }
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Test description and instructions"
                  rows="3"
                  value={testForm.description}
                  onChange={(e) =>
                    setTestForm({ ...testForm, description: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                Create Test
              </button>
              <button
                type="button"
                onClick={resetTestForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Score Form */}
      {showScoreForm && selectedTest && (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            Add Score - {selectedTest.name}
          </h2>
          <form onSubmit={submitScoreForm}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={scoreForm.student}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, student: e.target.value })
                  }
                  required
                >
                  <option value="">Select student...</option>
                  {getTestBatchStudents(selectedTest.batch?._id).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.user?.name} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks Obtained * 
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 85"
                  type="number"
                  step="0.5"
                  min="0"
                  value={scoreForm.marksObtained}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, marksObtained: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Marks * 
                  {selectedTest.totalMarks && (
                    <span className="text-xs text-gray-500 font-normal ml-2">(Test total: {selectedTest.totalMarks})</span>
                  )}
                </label>
                <input
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={selectedTest.totalMarks || "e.g., 100"}
                  type="number"
                  min="1"
                  value={scoreForm.totalMarks || selectedTest.totalMarks || ""}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, totalMarks: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={scoreForm.status}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, status: e.target.value })
                  }
                >
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add feedback for student..."
                  rows="3"
                  value={scoreForm.feedback}
                  onChange={(e) =>
                    setScoreForm({ ...scoreForm, feedback: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-save mr-2"></i>
                Add Score
              </button>
              <button
                type="button"
                onClick={resetScoreForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition font-medium"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests List */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading tests...</p>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No tests yet</p>
          <p className="text-gray-400 text-sm">Create your first test to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tests.map((test) => (
            <div
              key={test._id}
              className={`rounded-lg shadow hover:shadow-lg transition p-4 md:p-6 cursor-pointer ${
                selectedTest?._id === test._id
                  ? "bg-blue-50 border-2 border-blue-600"
                  : "bg-white border border-gray-200"
              }`}
              onClick={() =>
                setSelectedTest(selectedTest?._id === test._id ? null : test)
              }
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">{test.name}</h3>
                  <p className="text-sm text-gray-500">{test.subject}</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2">
                  {test.testType}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 border-t pt-3">
                <p>
                  <strong>Batch:</strong> {test.batch?.name}
                </p>
                <p>
                  <strong>Total Marks:</strong> {test.totalMarks}
                </p>
                <p>
                  <strong>Test Date:</strong>{" "}
                  {new Date(test.testDate).toLocaleDateString()}
                </p>
                {test.description && (
                  <p>
                    <strong>Description:</strong>{" "}
                    <span className="text-gray-500">{test.description}</span>
                  </p>
                )}
              </div>

              {test.analytics && (
                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded mb-4 text-xs">
                  <div>
                    <p className="text-gray-500">Total Students</p>
                    <p className="font-bold text-lg text-gray-800">
                      {test.analytics.totalStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Passed</p>
                    <p className="font-bold text-lg text-green-600">
                      {test.analytics.passedStudents}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Average</p>
                    <p className="font-bold text-lg text-blue-600">
                      {test.analytics.averageScore?.toFixed(1) || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pass Rate</p>
                    <p className="font-bold text-lg text-purple-600">
                      {test.analytics.passPercentage?.toFixed(1) || "N/A"}%
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTest(test._id);
                  }}
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
