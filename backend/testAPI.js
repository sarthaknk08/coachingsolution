const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function testAPI() {
  try {
    console.log("\n=== TESTING COACHING API ENDPOINTS ===\n");

    // 1. Get coaching config (public)
    console.log("1. Testing GET /coaching/config (public)...");
    const configRes = await axios.get(`${API_URL}/coaching/config`);
    console.log("   ✓ Success:", {
      coachingName: configRes.data.data.coachingName,
      primaryColor: configRes.data.data.primaryColor,
      secondaryColor: configRes.data.data.secondaryColor,
    });

    // 2. Login to get token
    console.log("\n2. Logging in as admin...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@coaching.com",
      password: "password",
    });
    const token = loginRes.data.token;
    console.log("   ✓ Login successful, token:", token.substring(0, 20) + "...");

    // 3. Test update phone
    console.log("\n3. Testing POST /auth/update-phone...");
    try {
      const phoneRes = await axios.post(
        `${API_URL}/auth/update-phone`,
        { newPhone: "9876543210" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("   ✓ Phone update successful:", phoneRes.data.message);
    } catch (err) {
      console.log("   ✗ Phone update failed:", err.response?.data?.message);
    }

    // 4. Test update coaching details
    console.log("\n4. Testing PUT /coaching/details...");
    try {
      const detailsRes = await axios.put(
        `${API_URL}/coaching/details`,
        {
          coachingName: "Test Coaching Center",
          coachingDescription: "Test Description",
          primaryColor: "#ff0000",
          secondaryColor: "#00ff00",
          contactEmail: "contact@test.com",
          contactPhone: "9999999999",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("   ✓ Coaching details update successful:", detailsRes.data.message);
    } catch (err) {
      console.log("   ✗ Coaching details update failed:", err.response?.data?.message);
    }

    // 5. Verify changes
    console.log("\n5. Verifying changes with GET /coaching/config...");
    const verifyRes = await axios.get(`${API_URL}/coaching/config`);
    console.log("   ✓ Updated coaching name:", verifyRes.data.data.coachingName);
    console.log("   ✓ Updated primary color:", verifyRes.data.data.primaryColor);

    console.log("\n=== ALL TESTS COMPLETED ===\n");
  } catch (error) {
    console.error("Test Error:", error.message);
    if (error.response?.data) {
      console.error("Response:", error.response.data);
    }
  }
}

testAPI();
