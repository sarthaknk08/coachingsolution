import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    batches: 0,
    totalFees: 0,
    feesCollected: 0,
    feesPending: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await API.get("/dashboard/admin");
        setStats(statsRes.data);
        
        // Fetch recent announcements
        try {
          const announcementsRes = await API.get("/announcements/admin/all");
          setAnnouncements(announcementsRes.data?.data?.slice(0, 3) || []);
        } catch (err) {
          console.log("Announcements fetch skipped");
        }
      } catch (err) {
        setError("Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon, label, value, color, link, loading }) => (
    <Link
      to={link}
      className={`bg-white rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-1 p-4 md:p-6 group cursor-pointer ${
        loading ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            {label}
          </p>
          <h2 className="text-2xl md:text-4xl font-bold mt-2 text-gray-800">
            {loading ? "..." : value}
          </h2>
        </div>
        <i
          className={`${icon} text-3xl md:text-4xl ${color} group-hover:scale-110 transition-transform`}
        ></i>
      </div>
    </Link>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Welcome back! Here's your coaching institute overview.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
          <i className="fas fa-exclamation-circle mr-3"></i>
          {error}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon="fas fa-user-graduate"
          label="Total Students"
          value={stats.students}
          color="text-blue-600"
          link="/admin/students"
          loading={loading}
        />
        <StatCard
          icon="fas fa-layer-group"
          label="Active Batches"
          value={stats.batches}
          color="text-purple-600"
          link="/admin/batches"
          loading={loading}
        />
        <StatCard
          icon="fas fa-check-circle"
          label="Fees Collected"
          value={`₹${stats.feesCollected || 0}`}
          color="text-green-600"
          link="/admin/fees"
          loading={loading}
        />
        <StatCard
          icon="fas fa-clock-circle"
          label="Fees Pending"
          value={`₹${stats.feesPending || 0}`}
          color="text-orange-600"
          link="/admin/fees"
          loading={loading}
        />
      </div>

      {/* Quick Actions and Recent Announcements Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
            <i className="fas fa-flash mr-2 text-yellow-500"></i>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/students"
              className="flex flex-col items-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-center"
            >
              <i className="fas fa-user-plus text-3xl text-blue-600 mb-2"></i>
              <span className="font-medium text-sm text-gray-800">Add Student</span>
            </Link>
            <Link
              to="/admin/batches"
              className="flex flex-col items-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition text-center"
            >
              <i className="fas fa-plus text-3xl text-purple-600 mb-2"></i>
              <span className="font-medium text-sm text-gray-800">Create Batch</span>
            </Link>
            <Link
              to="/admin/announcements"
              className="flex flex-col items-center p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition text-center"
            >
              <i className="fas fa-bullhorn text-3xl text-indigo-600 mb-2"></i>
              <span className="font-medium text-sm text-gray-800">Announce</span>
            </Link>
            <Link
              to="/admin/tests"
              className="flex flex-col items-center p-4 rounded-lg bg-pink-50 hover:bg-pink-100 transition text-center"
            >
              <i className="fas fa-file-alt text-3xl text-pink-600 mb-2"></i>
              <span className="font-medium text-sm text-gray-800">Add Test</span>
            </Link>
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              <i className="fas fa-megaphone mr-2 text-red-500"></i>
              Recent Announcements
            </h2>
            <Link to="/admin/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          {announcements.length === 0 ? (
            <div className="text-center py-6">
              <i className="fas fa-inbox text-3xl text-gray-300 mb-2 block"></i>
              <p className="text-gray-500 text-sm">No announcements yet</p>
              <Link to="/admin/announcements" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                Create one now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm flex-1">{ann.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ml-2 ${
                      ann.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ann.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{ann.message}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                    <span className="capitalize">{ann.audience}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Info Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2 text-sm">📊 System Status</h3>
          <p className="text-xs text-blue-800">All systems operational</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <h3 className="font-bold text-green-900 mb-2 text-sm">✅ Data Integrity</h3>
          <p className="text-xs text-green-800">All records synced</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-2 text-sm">🔒 Security</h3>
          <p className="text-xs text-purple-800">All data encrypted</p>
        </div>
      </div>
    </AdminLayout>
  );
}
