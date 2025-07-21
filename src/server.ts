import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 4000;
const QUEUE_SERVICE_URL = process.env.QUEUE_SERVICE_URL || 'http://localhost:3000';


app.use(cors());
app.use(bodyParser.json());

app.get('/api/item', async (req, res) => {
  try {
    const response = await axios.get(`${QUEUE_SERVICE_URL}/item`);
    res.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'No messages in queue' });
    } else {
      console.error('Error fetching item from queue service:', error.message);
      res.status(500).json({ error: 'Failed to fetch item from queue service' });
    }
  }
});

app.post('/api/consume', async (req, res) => {
  try {
    const { id, consume } = req.body;
    
    if (typeof id !== 'string' || typeof consume !== 'boolean') {
      res.status(400).json({ error: 'Invalid input: id must be string, consume must be boolean' });
      return;
    }

    const response = await axios.post(`${QUEUE_SERVICE_URL}/consume`, { id, consume });
    res.json(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Message not found' });
    } else if (error.response?.status === 400) {
      res.status(400).json({ error: 'Invalid input' });
    } else {
      console.error('Error consuming item from queue service:', error.message);
      res.status(500).json({ error: 'Failed to consume item from queue service' });
    }
  }
});

app.get('/api/queue', async (req, res) => {
  try {
    const response = await axios.get(`${QUEUE_SERVICE_URL}/queue`);
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching queue from queue service:', error.message);
    res.status(500).json({ error: 'Failed to fetch queue from queue service' });
  }
});

app.get('/api/hidden', async (req, res) => {
  try {
    const response = await axios.get(`${QUEUE_SERVICE_URL}/hidden`);
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching hidden messages from queue service:', error.message);
    res.status(500).json({ error: 'Failed to fetch hidden messages from queue service' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
  console.log(`Queue Service URL: ${QUEUE_SERVICE_URL}`);
});