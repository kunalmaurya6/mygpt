import express from 'express'
import Thread from '../models/Thread.js';
import getGeminiResponse from '../utils/geminai.js';

const router = express.Router();

//test
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: "abcd",
            title: "testing"
        })
        const response = await thread.save()
        res.send(response);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to save data" });
    }
})

//get all thread
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        //descending order of updated at
        res.json(threads);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to fetch thread" });
    }
})

router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            res.status(404).json({ error: "Thread not found" });
        }

        res.json(thread.messages);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to fetch chat" });
    }
})


router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOneAndDelete({ threadId });

        if (!thread) {
            res.status(404).json({ error: "Thread not found" });
        }

        res.status(200).json({ success: "Thread is deleted succesfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to delete chat" });
    }
})


router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        res.status(400).json({ error: "missing requider field" });
    }
    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            //create new thread
            thread = new Thread({
                threadId,
                title: message,
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getGeminiResponse(message);
        

        thread.messages.push({ role: "model", content: assistantReply.candidates[0].content.parts[0].text });

        thread.updatedAt = new Date();

        await thread.save();

        res.json({ reply: assistantReply.candidates[0].content.parts[0].text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "somting went wrong" });
    }
})

export default router;