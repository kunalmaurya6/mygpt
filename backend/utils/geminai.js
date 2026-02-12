import 'dotenv/config';
const API_KEY = process.env.GOOGLE_API_KEY;
const port = process.env.PORT;
const getGeminiResponse = async (message) => {
    const option = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            "x-goog-api-key": `${API_KEY}`
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: message }
                    ]
                }
            ]
        })
    }
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent", option);
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
    }
}
export default getGeminiResponse;