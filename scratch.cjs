const axios = require('axios');

async function run() {
  const baseURL = 'http://127.0.0.1:8081';
  try {
    const email = `test_${Date.now()}@test.com`;
    // Register
    console.log("Registering...", email);
    await axios.post(`${baseURL}/api/auth/register`, {
      name: "Test User",
      email: email,
      password: "password123"
    });

    // Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${baseURL}/api/auth/login`, {
      email: email,
      password: "password123"
    });
    const token = loginRes.data.data.access_token;

    // Fetch catalog to get a book ID
    console.log("Fetching catalog...");
    const catalogRes = await axios.get(`${baseURL}/api/books`);
    const books = catalogRes.data.data;
    if (!books || books.length === 0) {
      console.log("No books found in catalog, cannot add to library.");
      return;
    }
    const bookId = books[0].id;

    // Add to library
    console.log("Adding book to library...", bookId);
    await axios.post(`${baseURL}/api/library/`, { book_id: bookId }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Fetch library
    console.log("Fetching library...");
    const libRes = await axios.get(`${baseURL}/api/library/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("LIBRARY RESPONSE:");
    console.log(JSON.stringify(libRes.data, null, 2));

  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
