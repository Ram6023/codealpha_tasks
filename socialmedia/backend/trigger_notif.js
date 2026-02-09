const axios = require('axios');
const API_URL = 'http://localhost:3000/api';

async function trigger() {
    try {
        // Register/Login User 2
        console.log("Setting up User 2...");
        let token2;
        try {
            const loginResp = await axios.post(`${API_URL}/auth/login`, {
                email: 'user2@test.com',
                password: 'password123'
            });
            token2 = loginResp.data.token;
        } catch (e) {
            const regResp = await axios.post(`${API_URL}/auth/register`, {
                username: 'user2',
                email: 'user2@test.com',
                password: 'password123',
                fullName: 'User Two'
            });
            token2 = regResp.data.token;
        }

        // Get User 1 ID (agent_test)
        // We assume agent_test exists from previous steps. 
        // We'll search or just use ID 1 if we reset DB, but careful.
        // Let's rely on logging in as agent_test to find their ID? No.
        // I'll just like the first post I find.

        const postsResp = await axios.get(`${API_URL}/posts`, {
            headers: { Authorization: `Bearer ${token2}` }
        });

        if (postsResp.data.length > 0) {
            const post = postsResp.data[0];
            console.log(`Liking post ${post.id} by ${post.username}...`);
            await axios.post(`${API_URL}/posts/${post.id}/like`, {}, {
                headers: { Authorization: `Bearer ${token2}` }
            });
            console.log("Liked.");

            console.log(`Sending message to ${post.user_id}...`);
            await axios.post(`${API_URL}/messages`, {
                receiver_id: post.user_id,
                content: "Hey, nice post! " + Date.now()
            }, {
                headers: { Authorization: `Bearer ${token2}` }
            });
            console.log("Message sent.");
        }

    } catch (error) {
        console.error("Error:", error.message);
    }
}

trigger();
