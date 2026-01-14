const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Test logo upload
const testLogoUpload = async () => {
  try {
    console.log("Starting logo upload test...");

    // Login first to get token
    console.log("\n1. Logging in...");
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "john@example.com",
      password: "password123",
    });

    const token = loginRes.data.data.token;
    console.log("Login successful, token:", token.substring(0, 20) + "...");

    // Create a simple test image (1x1 pixel red PNG)
    const testImageBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    console.log("\n2. Uploading logo...");
    const uploadRes = await axios.put(
      "http://localhost:5000/api/coaching/logo",
      {
        logoData:
          "data:image/png;base64," +
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Upload response:", uploadRes.data);

    if (uploadRes.data.success) {
      console.log("\n✓ Logo uploaded successfully!");
      console.log("Logo size stored:", uploadRes.data.data.coachingLogo.length, "bytes");
    }
  } catch (err) {
    console.error(
      "Error:",
      err.response?.data || err.message
    );
  }
};

testLogoUpload();
