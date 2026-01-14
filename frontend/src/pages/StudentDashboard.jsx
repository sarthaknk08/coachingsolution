import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCoaching } from "../context/CoachingContext";
import API from "../services/api";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { coaching } = useCoaching();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Data states
  const [studentData, setStudentData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [tests, setTests] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "student") {
      navigate("/student/login");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        API.get("/students/profile"),
        API.get("/announcements/my"),
        API.get("/tests/my-batch"),
        API.get("/tests/my-marks"),
        API.get("/fees/my-fees"),
      ]);

      // Handle results individually
      if (results[0].status === "fulfilled") {
        setStudentData(results[0].value.data.data);
      }
      if (results[1].status === "fulfilled") {
        setAnnouncements(results[1].value.data.data || []);
      }
      if (results[2].status === "fulfilled") {
        setTests(results[2].value.data.data || []);
      }
      if (results[3].status === "fulfilled") {
        setMarks(results[3].value.data.data || []);
      }
      if (results[4].status === "fulfilled") {
        setFees(results[4].value.data.data);
      } else {
        // Fee is optional - if it fails, just set empty object
        setFees(null);
      }

      // Show error if critical data failed to load
      if (results[0].status === "rejected") {
        setError("Failed to load student profile. Please try refreshing.");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/student/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <i
            className="fas fa-spinner fa-spin text-4xl mb-4 block"
            style={{ color: coaching?.primaryColor || "#2563eb" }}
          ></i>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header
        className="text-white shadow-lg"
        style={{ backgroundColor: coaching?.primaryColor || "#2563eb" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {coaching?.coachingLogo && (
              <img
                src={coaching.coachingLogo}
                alt="Logo"
                className="h-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{coaching?.coachingName || "Coaching App"}</h1>
              <p className="text-sm opacity-90">Student Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition font-medium"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
            <i className="fas fa-exclamation-circle mr-3 mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden border-b">
          <div className="flex overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: "fa-home" },
              { id: "announcements", label: "Announcements", icon: "fa-bell" },
              { id: "tests", label: "Tests", icon: "fa-file-pdf" },
              { id: "marks", label: "Marks", icon: "fa-chart-bar" },
              { id: "fees", label: "Fees", icon: "fa-money-bill" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className={`fas ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Student Info Card */}
            {studentData && (
              <div
                className="rounded-lg shadow-lg p-6 text-white"
                style={{ backgroundColor: coaching?.primaryColor || "#2563eb" }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <i className="fas fa-user-circle mr-3"></i>
                  Student Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm opacity-80">Name</p>
                    <p className="text-xl font-bold mt-1">{studentData.user?.name || user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Email</p>
                    <p className="text-lg font-semibold mt-1 break-all">{studentData.user?.email || user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Batch</p>
                    <p className="text-xl font-bold mt-1">{studentData.batch?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80">Phone</p>
                    <p className="text-lg font-semibold mt-1">{studentData.user?.mobileNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Tests</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{tests.length}</p>
                  </div>
                  <i className="fas fa-file-pdf text-4xl text-blue-200"></i>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Marks Recorded</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{marks.length}</p>
                  </div>
                  <i className="fas fa-chart-bar text-4xl text-green-200"></i>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Fee Status</p>
                    <p className="text-lg font-bold text-orange-600 mt-2">
                      {fees?.paidAmount === fees?.totalAmount ? "✓ Paid" : "Pending"}
                    </p>
                  </div>
                  <i className="fas fa-money-bill text-4xl text-orange-200"></i>
                </div>
              </div>
            </div>

            {/* Recent Announcements Preview */}
            {announcements.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="fas fa-bell mr-2 text-blue-600"></i>
                  Latest Announcements
                </h3>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement._id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition"
                    >
                      <h4 className="font-semibold text-gray-800">{announcement.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {announcement.message.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === "announcements" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <i className="fas fa-bell mr-2 text-blue-600"></i>
              All Announcements
            </h2>
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No announcements yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{announcement.title}</h3>
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{announcement.message}</p>
                        <p className="text-sm text-gray-500 mt-3">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TESTS TAB */}
        {activeTab === "tests" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <i className="fas fa-file-pdf mr-2 text-blue-600"></i>
              Available Tests
            </h2>
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-file-pdf text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No tests available for your batch</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition"
                  >
                    <h3 className="text-lg font-bold text-gray-800">{test.title}</h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>
                        <strong>Subject:</strong> {test.subject}
                      </p>
                      <p>
                        <strong>Syllabus:</strong> {test.syllabus}
                      </p>
                      <p>
                        <strong>Max Marks:</strong> {test.maxMarks}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(test.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-4 space-y-2">
                      {test.testPdfUrl && (
                        <a
                          href={test.testPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                        >
                          <i className="fas fa-download mr-2"></i>
                          Download Test
                        </a>
                      )}
                      {test.answerKeyUrl && (
                        <a
                          href={test.answerKeyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                        >
                          <i className="fas fa-key mr-2"></i>
                          Answer Key
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKS TAB */}
        {activeTab === "marks" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <i className="fas fa-chart-bar mr-2 text-blue-600"></i>
              Your Marks
            </h2>
            {marks.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-chart-bar text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No marks recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 font-semibold text-gray-700">Test Name</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Subject</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Max Marks</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Obtained</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Percentage</th>
                      <th className="px-6 py-3 font-semibold text-gray-700">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark) => {
                      const percentage =
                        mark.test?.maxMarks > 0
                          ? ((mark.marksObtained / mark.test.maxMarks) * 100).toFixed(2)
                          : 0;
                      return (
                        <tr key={mark._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{mark.test?.title}</td>
                          <td className="px-6 py-4 text-gray-700">{mark.test?.subject}</td>
                          <td className="px-6 py-4 text-gray-700">{mark.test?.maxMarks}</td>
                          <td className="px-6 py-4 font-semibold text-blue-600">{mark.marksObtained}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {mark.rank ? `#${mark.rank}` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* FEES TAB */}
        {activeTab === "fees" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              <i className="fas fa-money-bill mr-2 text-blue-600"></i>
              Fee Status
            </h2>
            {fees ? (
              <div className="space-y-6">
                {/* Fee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-gray-700 text-sm font-medium">Total Fees</p>
                    <p className="text-3xl font-bold text-blue-700 mt-2">
                      ₹{fees.totalAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-gray-700 text-sm font-medium">Paid Amount</p>
                    <p className="text-3xl font-bold text-green-700 mt-2">
                      ₹{fees.paidAmount?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <p className="text-gray-700 text-sm font-medium">Pending Amount</p>
                    <p className="text-3xl font-bold text-orange-700 mt-2">
                      ₹{(fees.totalAmount - fees.paidAmount)?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-gray-700">Overall Status</p>
                      </div>
                      <div>
                        {fees.paidAmount === fees.totalAmount ? (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold flex items-center">
                            <i className="fas fa-check-circle mr-2"></i>
                            Paid
                          </span>
                        ) : fees.paidAmount > 0 ? (
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-semibold flex items-center">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            Partially Paid
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold flex items-center">
                            <i className="fas fa-times-circle mr-2"></i>
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>

                    {fees.dueDate && (
                      <div className="flex items-center">
                        <div className="flex-1">
                          <p className="text-gray-700">Due Date</p>
                        </div>
                        <p className="text-gray-900 font-semibold">
                          {new Date(fees.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${fees.totalAmount > 0 ? (fees.paidAmount / fees.totalAmount) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {fees.totalAmount > 0
                          ? ((fees.paidAmount / fees.totalAmount) * 100).toFixed(1)
                          : 0}
                        % Paid
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-money-bill text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No fee information available</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

