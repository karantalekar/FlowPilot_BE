"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const env_1 = require("../config/env");
const ai_model_1 = require("../models/ai.model");
const customer_model_1 = require("../models/customer.model");
const lead_model_1 = require("../models/lead.model");
const project_model_1 = require("../models/project.model");
const task_model_1 = require("../models/task.model");
const fallbackAnswer = (prompt) => `AI provider is not configured. RAG-ready prompt received: ${prompt.slice(0, 500)}`;
const complete = async (messages) => {
    if (!env_1.env.GEMINI_API_KEY)
        return fallbackAnswer(messages[messages.length - 1]?.content || '');
    const systemInstruction = messages
        .filter(({ role }) => role === 'system')
        .map(({ content }) => content)
        .join('\n\n');
    const contents = messages
        .filter(({ role }) => role !== 'system')
        .map(({ role, content }) => ({
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content }]
    }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env_1.env.GEMINI_MODEL)}:generateContent`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env_1.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
            ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
            contents
        }),
        signal: AbortSignal.timeout(30000)
    });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data?.error?.message || `Gemini request failed with status ${response.status}`);
    return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';
};
const chunkText = (text, size = 1200) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += size)
        chunks.push({ index: chunks.length, content: text.slice(i, i + size) });
    return chunks;
};
exports.aiService = {
    async chat(organizationId, userId, message, conversationId) {
        const conversation = (conversationId ? await ai_model_1.Conversation.findOne({ _id: conversationId, organization: organizationId, user: userId }) : null) ||
            (await ai_model_1.Conversation.create({ organization: organizationId, user: userId, title: message.slice(0, 60), messages: [] }));
        conversation.messages.push({ role: 'user', content: message, createdAt: new Date() });
        const history = conversation.messages.slice(-10).map(({ role, content }) => ({ role, content }));
        const answer = await complete([{ role: 'system', content: 'You are a concise business operations assistant.' }, ...history]);
        conversation.messages.push({ role: 'assistant', content: answer, createdAt: new Date() });
        await conversation.save();
        return { conversationId: conversation._id, answer };
    },
    listConversations(organizationId, userId) {
        return ai_model_1.Conversation.find({ organization: organizationId, user: userId }).sort('-updatedAt').select('-messages.content');
    },
    async uploadDocument(organizationId, userId, file) {
        const raw = await promises_1.default.readFile(file.path, 'utf8').catch(() => '');
        return ai_model_1.AIDocument.create({
            organization: organizationId,
            uploadedBy: userId,
            originalName: file.originalname,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            chunks: chunkText(raw || `Binary document placeholder for ${file.originalname}`)
        });
    },
    async askDocument(organizationId, question, documentId) {
        const filter = { organization: organizationId, ...(documentId ? { _id: documentId } : {}) };
        const docs = await ai_model_1.AIDocument.find(filter).limit(5);
        const context = docs.flatMap((doc) => doc.chunks.slice(0, 3).map((chunk) => chunk.content)).join('\n\n');
        const answer = await complete([
            { role: 'system', content: 'Answer using the supplied business document context. Say when context is insufficient.' },
            { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` }
        ]);
        return { answer, sources: docs.map((doc) => ({ id: doc._id, name: doc.originalName })) };
    },
    async generateReport(organizationId, type, prompt) {
        const [leads, customers, projects, tasks] = await Promise.all([
            lead_model_1.Lead.countDocuments({ organization: organizationId }),
            customer_model_1.Customer.countDocuments({ organization: organizationId }),
            project_model_1.Project.countDocuments({ organization: organizationId }),
            task_model_1.Task.countDocuments({ organization: organizationId })
        ]);
        const answer = await complete([
            { role: 'system', content: 'Generate an executive business report with clear bullets and action items.' },
            { role: 'user', content: `Report type: ${type}. Metrics: leads=${leads}, customers=${customers}, projects=${projects}, tasks=${tasks}. ${prompt || ''}` }
        ]);
        return { type, report: answer };
    }
};
