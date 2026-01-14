import { useEffect, useState } from "react";
import API from "../services/api";

/**
 * Parent Announcements Tab Component
 * Shows announcements visible to parents
 */
export default function ParentAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await API.get("/announcements/parent");
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements based on selected filter
  const filteredAnnouncements = announcements.filter((ann) => {
    if (filter === "all") return true;
    if (filter === "exam") return ann.type === "exam";
    if (filter === "holiday") return ann.type === "holiday";
    if (filter === "urgent") return ann.priority === "high";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "All Announcements", icon: "fas fa-list" },
          { value: "exam", label: "Exams", icon: "fas fa-pencil-alt" },
          { value: "holiday", label: "Holidays", icon: "fas fa-calendar" },
          { value: "urgent", label: "Urgent", icon: "fas fa-exclamation" },
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded transition text-sm font-medium flex items-center gap-2 ${
              filter === btn.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <i className={btn.icon}></i>
            {btn.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No announcements</p>
          <p className="text-gray-400 text-sm">
            {filter === "all"
              ? "Check back soon for updates"
              : "No announcements in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div
              key={announcement._id}
              className={`border-l-4 rounded-lg shadow hover:shadow-md transition p-4 md:p-5 ${
                announcement.priority === "high"
                  ? "border-red-500 bg-red-50"
                  : announcement.priority === "medium"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-blue-500 bg-blue-50"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-800">
                      {announcement.title}
                    </h3>
                    {announcement.priority === "high" && (
                      <span className="flex items-center gap-1 bg-red-200 text-red-700 text-xs font-bold px-2 py-1 rounded animate-pulse">
                        <i className="fas fa-bolt"></i>
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    <i className={`mr-1 fas ${getTypeIcon(announcement.type)}`}></i>
                    {announcement.type}
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
                {announcement.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                <span>
                  <i className="fas fa-user mr-1"></i>
                  {announcement.createdBy?.name}
                </span>
                <span>
                  <i className="fas fa-calendar mr-1"></i>
                  {new Date(announcement.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to get icon based on announcement type
function getTypeIcon(type) {
  const icons = {
    exam: "fa-pencil-alt",
    holiday: "fa-calendar",
    event: "fa-calendar-alt",
    notice: "fa-bullhorn",
    assignment: "fa-tasks",
    general: "fa-info-circle",
  };
  return icons[type] || "fa-info-circle";
}
