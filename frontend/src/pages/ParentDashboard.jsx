import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ParentAnnouncementsTab from "../components/ParentAnnouncementsTab";
import API from "../services/api";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [parentData, setParentData] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [testScores, setTestScores] = useState({});
  const [fees, setFees] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("children");

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        setLoading(true);
        // Fetch parent profile by user ID
        const parentRes = await API.get(`/parents/user/${user?._id}`);
        setParentData(parentRes.data);

        if (parentRes.data?.children && parentRes.data.children.length > 0) {
          setChildren(parentRes.data.children);
          setSelectedChild(parentRes.data.children[0]);

          // Fetch test scores and fees for each child
          const scoresMap = {};
          const feesMap = {};

          for (const child of parentRes.data.children) {
            try {
              const scoresRes = await API.get(`/tests/student/${child._id}`);
              scoresMap[child._id] = scoresRes.data;
            } catch {
              scoresMap[child._id] = [];
            }

            try {
              const feesRes = await API.get(`/fees/student/${child._id}`);
              feesMap[child._id] = feesRes.data;
            } catch {
              feesMap[child._id] = null;
            }
          }

          setTestScores(scoresMap);
          setFees(feesMap);
        }

        // Fetch announcements for parent
        try {
          const announcRes = await API.get("/announcements/parent");
          setAnnouncements(announcRes.data?.data || []);
        } catch (err) {
          console.log("Failed to load announcements");
          setAnnouncements([]);
        }
      } catch (err) {
        setError("Failed to load children information");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [user?._id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">Loading children information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Monitor your child's academic progress and fee payments
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("children")}
                className={`flex-1 py-4 px-4 font-semibold transition text-center ${
                  activeTab === "children"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className="fas fa-user-circle mr-2"></i>
                Children & Academics
              </button>
              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex-1 py-4 px-4 font-semibold transition text-center ${
                  activeTab === "announcements"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className="fas fa-bullhorn mr-2"></i>
                Announcements
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-4 px-4 font-semibold transition text-center ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <i className="fas fa-id-card mr-2"></i>
                My Profile
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
              <i className="fas fa-exclamation-circle mr-3 mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}

          {children.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">No children registered yet</p>
              <p className="text-gray-400 text-sm">
                Please contact the coaching institute to register your child
              </p>
            </div>
          ) : activeTab === "announcements" ? (
            <ParentAnnouncementsTab />
          ) : activeTab === "profile" ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <i className="fas fa-user text-4xl text-blue-600 mb-4"></i>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">My Profile</h2>
              <div className="mt-6 text-left max-w-md mx-auto space-y-3">
                <p className="text-gray-600">
                  <strong>Name:</strong> {user?.name}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {user?.email}
                </p>
                <p className="text-gray-600">
                  <strong>Phone:</strong> {parentData?.phone || "Not provided"}
                </p>
                <p className="text-gray-600">
                  <strong>Children:</strong> {children.length}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Child Selector */}
              {children.length > 1 && (
                <div className="mb-8 bg-white rounded-lg shadow p-4 md:p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">
                    Select Child
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {children.map((child) => (
                      <button
                        key={child._id}
                        onClick={() => setSelectedChild(child)}
                        className={`p-3 rounded-lg font-medium transition text-left ${
                          selectedChild?._id === child._id
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <i className="fas fa-user-circle mr-2"></i>
                        {child.user?.name}
                        <span className="text-xs block mt-1 opacity-75">
                          {child.className}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Child Info */}
              {selectedChild && (
                <>
                  {/* Profile Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {/* Student Info */}
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <i className="fas fa-user-circle text-4xl text-blue-600"></i>
                        <div>
                          <p className="text-gray-600 text-sm">Student</p>
                          <h3 className="text-lg font-bold text-gray-800">
                            {selectedChild.user?.name}
                          </h3>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                        <p>
                          <strong>Roll Number:</strong>{" "}
                          {selectedChild.rollNumber}
                        </p>
                        <p>
                          <strong>Class:</strong> {selectedChild.className}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedChild.user?.email}
                        </p>
                      </div>
                    </div>

                    {/* Batch Info */}
                    {selectedChild.batch && (
                      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <i className="fas fa-layer-group text-4xl text-purple-600"></i>
                          <div>
                            <p className="text-gray-600 text-sm">Batch</p>
                            <h3 className="text-lg font-bold text-gray-800">
                              {selectedChild.batch?.name ||
                                "Not assigned"}
                            </h3>
                          </div>
                        </div>
                        {selectedChild.batch?.name && (
                          <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                            {selectedChild.batch?.timing && (
                              <p>
                                <strong>Timing:</strong>{" "}
                                {selectedChild.batch.timing}
                              </p>
                            )}
                            {selectedChild.batch?.subjects &&
                              selectedChild.batch.subjects.length > 0 && (
                                <p>
                                  <strong>Subjects:</strong>{" "}
                                  {selectedChild.batch.subjects.join(", ")}
                                </p>
                              )}
                            <p>
                              <strong>Fee:</strong> ₹
                              {selectedChild.batch?.feeAmount}/month
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fee Status Card */}
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <i className="fas fa-rupee-sign text-4xl text-green-600"></i>
                        <div>
                          <p className="text-gray-600 text-sm">Fee Status</p>
                          <h3 className="text-lg font-bold capitalize text-gray-800">
                            {fees[selectedChild?._id]?.status || "Pending"}
                          </h3>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
                        <p>
                          <strong>Total:</strong> ₹
                          {fees[selectedChild?._id]?.totalAmount || 0}
                        </p>
                        <p>
                          <strong>Paid:</strong>{" "}
                          <span className="text-green-600 font-semibold">
                            ₹{fees[selectedChild?._id]?.paidAmount || 0}
                          </span>
                        </p>
                        <p>
                          <strong>Pending:</strong>{" "}
                          <span className="text-red-600 font-semibold">
                            ₹
                            {fees[selectedChild?._id]
                              ? fees[selectedChild._id].totalAmount -
                                fees[selectedChild._id].paidAmount
                              : 0}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fee Progress */}
                  {fees[selectedChild?._id] && (
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
                      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                        Fee Payment Progress
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Overall Progress</span>
                            <span className="font-semibold">
                              {(
                                (fees[selectedChild._id].paidAmount /
                                  fees[selectedChild._id].totalAmount) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-green-600 h-3 rounded-full transition"
                              style={{
                                width: `${
                                  (fees[selectedChild._id].paidAmount /
                                    fees[selectedChild._id].totalAmount) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-gray-600 text-xs md:text-sm mb-1">
                              Total Amount
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-gray-800">
                              ₹{fees[selectedChild._id].totalAmount}
                            </p>
                          </div>
                          <div className="text-center border-x border-gray-300">
                            <p className="text-gray-600 text-xs md:text-sm mb-1">
                              Paid
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-green-600">
                              ₹{fees[selectedChild._id].paidAmount}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 text-xs md:text-sm mb-1">
                              Due
                            </p>
                            <p className="text-xl md:text-2xl font-bold text-red-600">
                              ₹
                              {fees[selectedChild._id].totalAmount -
                                fees[selectedChild._id].paidAmount}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    {/* Test Scores Section */}
                    {testScores[selectedChild._id] && testScores[selectedChild._id].length > 0 && (
                      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                          <i className="fas fa-chart-bar mr-2"></i>
                          Test Scores & Performance
                        </h2>
                        <div className="space-y-3">
                          {testScores[selectedChild._id].map((score) => (
                            <div
                              key={score._id}
                              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-800">
                                    {score.test?.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {score.test?.subject} • {new Date(score.test?.testDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`text-sm font-bold px-3 py-1 rounded whitespace-nowrap ml-2 ${
                                  score.grade === 'A+' ? 'bg-green-100 text-green-700' :
                                  score.grade === 'A' ? 'bg-green-100 text-green-700' :
                                  score.grade === 'B+' ? 'bg-blue-100 text-blue-700' :
                                  score.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                  score.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {score.grade}
                                </span>
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">Marks</p>
                                  <p className="font-bold text-lg text-gray-800">
                                    {score.marksObtained}/{score.totalMarks}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Percentage</p>
                                  <p className="font-bold text-lg text-blue-600">
                                    {score.percentage?.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Status</p>
                                  <p className={`font-bold capitalize ${
                                    score.status === 'passed' ? 'text-green-600' :
                                    score.status === 'absent' ? 'text-gray-600' :
                                    'text-red-600'
                                  }`}>
                                    {score.status}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Rank</p>
                                  <p className="font-bold text-lg text-purple-600">
                                    {score.rank ? `#${score.rank}` : '-'}
                                  </p>
                                </div>
                              </div>

                              {score.feedback && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-600">
                                    <strong>Feedback:</strong> {score.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* Contact Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">
                      Need Help?
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      Contact the coaching institute if you have any questions:
                    </p>
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-envelope mr-2"></i>
                      Email: info@coaching.com
                    </p>
                    <p className="text-sm text-blue-800">
                      <i className="fas fa-phone mr-2"></i>
                      Phone: +91 9876543210
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}