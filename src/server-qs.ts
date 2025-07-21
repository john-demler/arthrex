import express from 'express';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import { QueueMessage, colorHexMap } from './model';

// Enable logging for debugging purposes - Disable to reduce console spam
const loggingEnabled = true;
const maxQueueSize = Number(process.env.MAX_QUEUE_SIZE) || 100; // Maximum size of the queue

const app = express();
app.use(bodyParser.json());

let messageQueue: QueueMessage[] = [];

// Configurable interval (ms) from environment variable
const intervalMs = Number(process.env.QUEUE_INTERVAL_MS) || 2000;
let intervalHandle: NodeJS.Timeout | null = null;

function getColor() {
    const color = colorHexMap[Math.floor(Math.random() * colorHexMap.length)];
    return color;
}

// Simple message generator (increments a counter)
let messageCounter = 1;
function generateMessage(): QueueMessage {
    let color = getColor();
    return {
        id: uuidv4(),
        hex: color.hex,
        color: color.color
    };
}

function logMessage(msg: String) {
    if(loggingEnabled) console.log(`${msg}`);
}

// Start generating messages at the configured interval
function startQueueService() {
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = setInterval(() => {
        if (messageQueue.length >= maxQueueSize) {
            logMessage(`Queue is full (${maxQueueSize} messages). Skipping message generation.`);
            return;
        }
        const msg = generateMessage();
        messageQueue.push(msg);
        logMessage(`Generated: ${msg.color} Hex: ${msg.hex} (ID: ${msg.id})`);
    }, intervalMs);
}

// API to peek at the queue (for debugging)
app.get('/queue', (req, res) => {
    res.json({ 
        queue: messageQueue,
        hiddenMessages: hiddenMessages.map(h => ({
            messageId: h.messageId,
            hiddenAt: h.hiddenAt,
            availableAt: new Date(h.hiddenAt.getTime() + h.hideTimeoutMs)
        }))
    });
});

// API to get hidden messages status
app.get('/hidden', (req, res) => {
    res.json({ 
        hiddenMessages: hiddenMessages.map(h => ({
            messageId: h.messageId,
            hiddenAt: h.hiddenAt,
            availableAt: new Date(h.hiddenAt.getTime() + h.hideTimeoutMs),
            isAvailable: isMessageAvailable(h.messageId)
        }))
    });
});

// API to get the next message (does not remove from queue)
app.get('/item', (_, res) => {
    if (messageQueue.length === 0) {
        res.status(404).json({ error: 'No messages in queue' });
        return;
    }
    
    // Find first available message (not hidden)
    const availableMessage = messageQueue.find(msg => isMessageAvailable(msg.id));
    if (!availableMessage) {
        res.status(404).json({ error: 'No available messages in queue' });
        return;
    }
    
    // Hide the message temporarily when someone gets it
    hideMessage(availableMessage.id);
    
    res.json({ message: availableMessage });
});

// API to consume or keep a message by ID
app.post('/consume', (req, res) => {
    const { id, consume } = req.body;
    if (typeof id !== 'string' || typeof consume !== 'boolean') {
        res.status(400).json({ error: 'Invalid input' });
        return;
    }
    const index = messageQueue.findIndex(msg => msg.id === id);
    if (index === -1) {
        res.status(404).json({ error: 'Message not found' });
        return;
    }
    let removed = false;
    if (consume) {
        // Permanently remove from queue and unhide
        messageQueue.splice(index, 1);
        unhideMessage(id);
        removed = true;
        logMessage(`Message consumed and removed: ${id}`);
    } else {
        // Return message to available pool by unhiding it
        unhideMessage(id);
        logMessage(`Message returned to queue: ${id}`);
    }
    res.json({ success: true, consumed: removed });
});

// Message availability logic
// Once consumed, messages should be "hidden" from other users
// and after a certain time if a message is not consumed, 
// it should be available again

interface MessageAvailability {
  messageId: string;
  hiddenAt: Date;
  hideTimeoutMs: number;
}

let hiddenMessages: MessageAvailability[] = [];

// Default timeout for messages to be hidden (5 seconds)
const DEFAULT_HIDE_TIMEOUT_MS = 5000;

// Function to check if a message should be available again
function isMessageAvailable(messageId: string): boolean {
  const hiddenMessage = hiddenMessages.find(h => h.messageId === messageId);
  if (!hiddenMessage) return true;
  
  const now = new Date();
  const hiddenUntil = new Date(hiddenMessage.hiddenAt.getTime() + hiddenMessage.hideTimeoutMs);
  
  if (now >= hiddenUntil) {
    hiddenMessages = hiddenMessages.filter(h => h.messageId !== messageId);
    return true;
  }
  
  return false;
}

// Function to hide a message temporarily
function hideMessage(messageId: string, timeoutMs: number = DEFAULT_HIDE_TIMEOUT_MS) {
  hiddenMessages = hiddenMessages.filter(h => h.messageId !== messageId);
  
  hiddenMessages.push({
    messageId,
    hiddenAt: new Date(),
    hideTimeoutMs: timeoutMs
  });
}

// Function to unhide a message (when consumed or returned)
function unhideMessage(messageId: string) {
  hiddenMessages = hiddenMessages.filter(h => h.messageId !== messageId);
}

// Start the service
const PORT = process.env.PORT_QS || 3000;
app.listen(PORT, () => {
    logMessage(`Queue Service running on port ${PORT}`);
    logMessage(`Message interval set to ${intervalMs} ms`);
    startQueueService();
});