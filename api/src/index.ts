import express, { Express } from "express";
import dotenv from "dotenv";
import WebSocket from 'ws';

dotenv.config();

const api:Express = express(); 
const api_port = process.env.API_PORT;

const wss_port: number = parseInt(process.env.WSS_PORT || "3001");
const wss = new WebSocket.Server({ port: wss_port });

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  ws.on('message', (message: string) => {
    console.log(`Received message: ${message}`);
    ws.send(`Server received your message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

api.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

api.listen(api_port, () => {
  console.log(`[server]: Server is running at http://localhost:${api_port}`);
});


