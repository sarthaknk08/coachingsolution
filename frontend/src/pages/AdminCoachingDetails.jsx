import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import API from "../services/api";
import { useCoaching } from "../context/CoachingContext";

export default function AdminCoachingDetails() {
  const { coaching, updateCoachingConfig } = useCoaching();
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Details Form State
  const [detailsForm, setDetailsForm] = useState({
    coachingName: coaching.coachingName || "",
    coachingDescription: coaching.coachingDescription || "",
    primaryColor: coaching.primaryColor || "#2563eb",
    secondaryColor: coaching.secondaryColor || "#1e40af",
    contactEmail: coaching.contactEmail || "",
    contactPhone: coaching.contactPhone || "",
    address: coaching.address || "",
    city: coaching.city || "",
    state: coaching.state || "",
  });

  // Logo Form State - Now using URL instead of file upload
  const [logoUrl, setLogoUrl] = useState(coaching.coachingLogo || "");
  const [logoPreview, setLogoPreview] = useState(coaching.coachingLogo || null);

  // Update form when coaching context changes
  useEffect(() => {
    setDetailsForm({
      coachingName: coaching.coachingName || "",
      coachingDescription: coaching.coachingDescription || "",
      primaryColor: coaching.primaryColor || "#2563eb",
      secondaryColor: coaching.secondaryColor || "#1e40af",
      contactEmail: coaching.contactEmail || "",
      contactPhone: coaching.contactPhone || "",
      address: coaching.address || "",
      city: coaching.city || "",
      state: coaching.state || "",
    });
    setLogoPreview(coaching.coachingLogo || null);
    setLogoUrl(coaching.coachingLogo || "");
  }, [coaching]);

  // Handle logo URL change
  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setLogoUrl(url);
    if (url.trim()) {
      setLogoPreview(url);
      setError("");
    }
  };

  // Submit coaching details
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!detailsForm.coachingName.trim()) {
      setError("Coaching name is required");
      return;
    }

    try {
      setLoading(true);
      const res = await API.put("/coaching/details", detailsForm);
      if (res.data.success) {
        setMessage("Coaching details updated successfully!");
        updateCoachingConfig(res.data.data);
      }
    } catch (err) {
      console.error("COACHING DETAILS UPDATE ERROR:", err);
      const msg = err.response?.data?.message || err.message || "Failed to update coaching details";
      const extra = err.response?.data?.error;
      setError(msg + (extra ? ` - ${extra}` : ""));
    } finally {
      setLoading(false);
    }
  };

  // Submit logo update
  const handleLogoSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!logoUrl.trim()) {
      setError("Please enter a logo URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(logoUrl);
    } catch (err) {
      setError("Please enter a valid URL (e.g., https://example.com/logo.png)");
      return;
    }

    try {
      setLoading(true);
      console.log("Uploading logo URL:", logoUrl);
      const res = await API.put("/coaching/logo", {
        logoData: logoUrl,
      });
      if (res.data.success) {
        setMessage("Coaching logo updated successfully!");
        updateCoachingConfig(res.data.data);
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setError(err.response?.data?.message || "Failed to update logo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
          <i className="fas fa-cog mr-3"></i>
          Coaching Details
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Customize your coaching branding, logo, and contact information
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

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("details");
              setMessage("");
              setError("");
            }}
            className={`py-4 px-4 md:px-6 font-medium transition whitespace-nowrap ${
              activeTab === "details"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-info-circle mr-2"></i>
            <span className="hidden md:inline">Coaching Details</span>
            <span className="md:hidden">Details</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("logo");
              setMessage("");
              setError("");
            }}
            className={`py-4 px-4 md:px-6 font-medium transition whitespace-nowrap ${
              activeTab === "logo"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-image mr-2"></i>
            <span className="hidden md:inline">Logo</span>
            <span className="md:hidden">Logo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          {/* Coaching Details Tab */}
          {activeTab === "details" && (
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Coaching Information
              </h2>
              <form onSubmit={handleDetailsSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coaching Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your coaching name"
                      value={detailsForm.coachingName}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, coachingName: e.target.value })
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your coaching"
                      rows="3"
                      value={detailsForm.coachingDescription}
                      onChange={(e) =>
                        setDetailsForm({
                          ...detailsForm,
                          coachingDescription: e.target.value,
                        })
                      }
                      disabled={loading}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        value={detailsForm.primaryColor}
                        onChange={(e) =>
                          setDetailsForm({
                            ...detailsForm,
                            primaryColor: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#2563eb"
                        value={detailsForm.primaryColor}
                        onChange={(e) =>
                          setDetailsForm({
                            ...detailsForm,
                            primaryColor: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                        value={detailsForm.secondaryColor}
                        onChange={(e) =>
                          setDetailsForm({
                            ...detailsForm,
                            secondaryColor: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#1e40af"
                        value={detailsForm.secondaryColor}
                        onChange={(e) =>
                          setDetailsForm({
                            ...detailsForm,
                            secondaryColor: e.target.value,
                          })
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@coaching.com"
                      value={detailsForm.contactEmail}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, contactEmail: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+91 9876543210"
                      value={detailsForm.contactPhone}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, contactPhone: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street address"
                      value={detailsForm.address}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, address: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                      value={detailsForm.city}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, city: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                      value={detailsForm.state}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, state: e.target.value })
                      }
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg transition font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Details
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === "logo" && (
            <div className="max-w-md">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
                Update Coaching Logo
              </h2>
              <form onSubmit={handleLogoSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/logo.png"
                    value={logoUrl}
                    onChange={handleLogoUrlChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the full URL to your logo image (PNG, JPG, GIF, SVG)
                  </p>
                </div>

                {logoPreview && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Logo Preview
                    </label>
                    <div className="flex justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-32 object-contain"
                        onError={() => setError("Failed to load image from URL")}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !logoUrl.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Logo URL
                    </>
                  )}
                </button>

                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoUrl("");
                    }}
                    className="w-full mt-2 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg transition font-medium"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Clear Logo
                  </button>
                )}
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <i className="fas fa-info-circle mr-2"></i>
                <span>
                  <strong>Tips:</strong> Use direct image URLs. Your logo will be displayed on the login page and all dashboards.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
