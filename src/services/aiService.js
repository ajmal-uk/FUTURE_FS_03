const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';


const API_KEY_STORAGE = 'zychat_ai_api_key';
const AI_SETTINGS_STORAGE = 'zychat_ai_settings';
const AI_HISTORY_STORAGE = 'zychat_ai_history';
const AI_REMINDERS_STORAGE = 'zychat_ai_reminders';

export const isAIConfigured = () => {
    const apiKey = localStorage.getItem(API_KEY_STORAGE);
    return !!apiKey && apiKey.length > 10;
};

export const saveAPIKey = (apiKey) => {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
};

export const getAPIKey = () => {
    return localStorage.getItem(API_KEY_STORAGE);
};

export const removeAPIKey = () => {
    localStorage.removeItem(API_KEY_STORAGE);
};

export const getAISettings = () => {
    const settings = localStorage.getItem(AI_SETTINGS_STORAGE);
    return settings ? JSON.parse(settings) : {
        canAccessChats: false,
        canSetReminders: true,
        personality: 'helpful',
    };
};

/**
 * Save AI settings
 */
export const saveAISettings = (settings) => {
    localStorage.setItem(AI_SETTINGS_STORAGE, JSON.stringify(settings));
};

/**
 * Get chat history with AI
 */
export const getAIHistory = () => {
    const history = localStorage.getItem(AI_HISTORY_STORAGE);
    return history ? JSON.parse(history) : [];
};

/**
 * Save chat history with AI
 */
export const saveAIHistory = (history) => {
    // Keep only last 100 messages
    const trimmed = history.slice(-100);
    localStorage.setItem(AI_HISTORY_STORAGE, JSON.stringify(trimmed));
};

/**
 * Clear AI history
 */
export const clearAIHistory = () => {
    localStorage.removeItem(AI_HISTORY_STORAGE);
};

/**
 * Get reminders
 */
export const getReminders = () => {
    const reminders = localStorage.getItem(AI_REMINDERS_STORAGE);
    return reminders ? JSON.parse(reminders) : [];
};

/**
 * Save reminders
 */
export const saveReminders = (reminders) => {
    localStorage.setItem(AI_REMINDERS_STORAGE, JSON.stringify(reminders));
};

/**
 * Add a reminder
 */
export const addReminder = (reminder) => {
    const reminders = getReminders();
    reminders.push({
        id: Date.now(),
        ...reminder,
        createdAt: Date.now(),
        completed: false,
    });
    saveReminders(reminders);
    return reminders;
};

/**
 * Delete a reminder
 */
export const deleteReminder = (id) => {
    const reminders = getReminders();
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
    return updated;
};

/**
 * Build system prompt for AI
 */
const buildSystemPrompt = (userProfile, settings) => {
    let prompt = `You are ZyBot, a helpful AI assistant inside ZyChat messaging app. 
You help users with their conversations, reminders, and general questions.
Be friendly, concise, and helpful.

Current user: ${userProfile?.displayName || 'User'} (@${userProfile?.username || 'unknown'})
Current time: ${new Date().toLocaleString()}

You can help with:
- Setting reminders (respond with JSON: {"action": "reminder", "text": "...", "time": "..."})
- Answering questions
- Scheduling messages (respond with JSON: {"action": "schedule", "to": "...", "message": "...", "time": "..."})
- General assistance`;

    if (settings?.canAccessChats) {
        prompt += `\n\nYou have access to the user's chat context when they ask about their conversations.`;
    }

    return prompt;
};

/**
 * Send message to AI
 */
export const sendMessageToAI = async (message, userProfile, chatContext = null) => {
    const apiKey = getAPIKey();
    if (!apiKey) {
        throw new Error('API key not configured');
    }

    const settings = getAISettings();
    const history = getAIHistory();
    const systemPrompt = buildSystemPrompt(userProfile, settings);

    // Build conversation history for context
    const contents = [];

    // Add recent history (last 10 messages for context)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    }

    // Add current message
    let fullMessage = message;
    if (chatContext && settings.canAccessChats) {
        fullMessage = `[Context: ${chatContext}]\n\n${message}`;
    }

    contents.push({
        role: 'user',
        parts: [{ text: fullMessage }]
    });

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to get AI response');
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

        // Save to history
        const newHistory = [
            ...history,
            { role: 'user', text: message, timestamp: Date.now() },
            { role: 'assistant', text: aiResponse, timestamp: Date.now() }
        ];
        saveAIHistory(newHistory);

        // Check for actions (reminders, scheduling)
        let action = null;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*"action"[\s\S]*\}/);
            if (jsonMatch) {
                action = JSON.parse(jsonMatch[0]);
                if (action.action === 'reminder') {
                    addReminder({ text: action.text, time: action.time });
                }
            }
        } catch (e) {
            // Not a JSON action, just a regular response
        }

        return {
            text: aiResponse,
            action,
        };
    } catch (error) {
        console.error('AI Error:', error);
        throw error;
    }
};

/**
 * Validate API key
 */
export const validateAPIKey = async (apiKey) => {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: 'Hello' }]
                }],
                generationConfig: {
                    maxOutputTokens: 10,
                },
            }),
        });

        return response.ok;
    } catch (error) {
        return false;
    }
};
