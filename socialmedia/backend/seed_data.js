const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function seed() {
    try {
        // 1. Register
        console.log("Registering user...");
        const user = {
            username: 'agent_test',
            email: 'agent@test.com',
            password: 'password123',
            fullName: 'Agent Test'
        };

        // Try login first in case user exists
        let token;
        try {
            const loginResp = await axios.post(`${API_URL}/auth/login`, {
                email: user.email,
                password: user.password
            });
            token = loginResp.data.token;
            console.log("User already exists, logged in.");
        } catch (e) {
            const regResp = await axios.post(`${API_URL}/auth/register`, user);
            token = regResp.data.token;
            console.log("User registered.");
        }

        // 2. Create Post
        console.log("Creating post...");
        await axios.post(`${API_URL}/posts`, {
            content: "Hello World! This is an automated test post.",
            image_url: "https://via.placeholder.com/600",
            location: "Test Lab"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Post created.");

    } catch (error) {
        console.error("Error seeding data:", error.response ? error.response.data : error.message);
    }
}

seed();
