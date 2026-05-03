import React, { useState, useEffect } from "react";
import { api, useApp } from "../App";

export default function Profile() {
  const { logout, profileSidebarOpen, setProfileSidebarOpen } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    medicalHistory: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (profileSidebarOpen) {
      fetchProfile();
    }
  }, [profileSidebarOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProfile();
      setProfile(data);
      setFormData({
        name: data.name || "",
        age: data.age || "",
        gender: data.gender || "",
        phone: data.phone || "",
        address: data.address || "",
        bloodGroup: data.bloodGroup || "",
        allergies: data.allergies || "",
        medicalHistory: data.medicalHistory || "",
      });
      if (data.profileImage) {
        setImagePreview(`http://localhost:5000${data.profileImage}`);
      }
    } catch (err) {
      setError("Failed to load profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });
      if (imageFile) {
        fd.append("profileImage", imageFile);
      }

      const updated = await api.updateProfile(fd);
      setProfile(updated);
      setSuccess("Profile updated successfully!");
      if (updated.profileImage) {
        setImagePreview(`http://localhost:5000${updated.profileImage}`);
      }
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={() => setProfileSidebarOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          opacity: profileSidebarOpen ? 1 : 0,
          pointerEvents: profileSidebarOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar */}
      <div 
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "min(400px, 90vw)",
          background: "#fff",
          zIndex: 101,
          boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
          transform: profileSidebarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1e293b" }}>Your Profile</h2>
          <button 
            onClick={() => setProfileSidebarOpen(false)}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#64748b" }}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {loading && profileSidebarOpen && !error ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {error && <div className="errb" style={{ padding: "0.75rem", marginBottom: "0" }}><p>{error}</p></div>}
              {success && <div className="sucb" style={{ padding: "0.75rem", marginBottom: "0" }}><p>{success}</p></div>}

              {/* Image Section */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "7rem", height: "7rem", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #f1f5f9" }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "2.5rem", fontWeight: "bold" }}>{profile?.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <label className="btn bsm bg" style={{ cursor: "pointer" }}>
                  Change Photo
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                </label>
              </div>

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label className="fl">Full Name</label>
                  <input className="fi" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div>
                  <label className="fl">Age</label>
                  <input className="fi" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 35" />
                </div>
                <div>
                  <label className="fl">Gender</label>
                  <select className="fi" name="gender" value={formData.gender} onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="fl">Phone</label>
                  <input className="fi" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" />
                </div>
                <div>
                  <label className="fl">Blood Group</label>
                  <input className="fi" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" />
                </div>
                <div>
                  <label className="fl">Address</label>
                  <input className="fi" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St" />
                </div>
                <div>
                  <label className="fl">Allergies</label>
                  <textarea className="fi" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="List any allergies..." rows="2"></textarea>
                </div>
                <div>
                  <label className="fl">Medical History</label>
                  <textarea className="fi" name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} placeholder="Past medical conditions..." rows="3"></textarea>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", paddingBottom: "1rem" }}>
                <button type="submit" className="btn bt" disabled={saving} style={{ flex: 1 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn bg" onClick={logout} style={{ color: "#ef4444", borderColor: "#fecaca" }}>
                  Logout
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
