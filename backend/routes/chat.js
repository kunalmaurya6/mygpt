import express from 'express'
import { Thread, Messages } from '../models/Thread.js';
import getGeminiResponse from '../utils/geminai.js';

const router = express.Router();

//test
//router.post("/test", async (req, res) => {
//    try {
//        const thread = new Thread({
//            threadId: "1212abcd",
//            title: "testing11111"
//        })
//        const response = await thread.save()
//        res.send(response);
//    } catch (e) {
//        console.log(e);
//        res.status(500).json({ error: "failed to save data" });
//    }
//})

//get all thread
router.get("/thread", async (req, res) => {
    try {
        const userId = req.userId;
        const threads = await Thread.find({ cookieId: userId }).sort({ updatedAt: -1 });
        //descending order of updated at
        res.json(threads);1
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to fetch thread" });
    }
})

router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    const userId = req.userId;
    try {
        const thread = await Thread.findOne({ threadId, cookieId: userId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        //console.log(thread);

        const messages = await Messages.find({ threadId: thread._id }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to fetch chat" });
    }
})


router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    const userId = req.userId;
    try {
        const thread = await Thread.findOneAndDelete({ threadId, cookieId: userId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        console.log(thread);

        await Messages.deleteMany({ threadId: thread._id });

        res.status(200).json({ success: "Thread is deleted succesfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "failed to delete chat" });
    }
})


router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;
    const userId = req.userId;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing requider field" });
    }
    try {
        let thread = await Thread.findOne({ threadId, cookieId: userId });
        if (!thread) {
            thread = await Thread.create({
                threadId,
                cookieId: userId,
                title: message
            });
        }

        await Messages.create({
            threadId: thread._id,
            role: "user",
            content: message
        });

        const assistantReply = await getGeminiResponse(message);


        await Messages.create({ threadId: thread._id, role: "model", content: assistantReply.candidates[0].content.parts[0].text });

        thread.updatedAt = new Date();

        await thread.save();

        res.json({ reply: assistantReply.candidates[0].content.parts[0].text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: "somting went wrong" });
    }
})

export default router;