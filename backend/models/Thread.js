import mongoose from 'mongoose'


const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true
    },
    cookieId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        expires: "50d"
    }
})

const Thread = mongoose.model("Thread", ThreadSchema);

const MessageSchema = new mongoose.Schema({
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Thread',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: ["user", "model"],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Messages = mongoose.model("Messages", MessageSchema);

export { Thread, Messages };