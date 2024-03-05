import express, { Express } from "express";
import dotenv from "dotenv";
import WebSocket from 'ws';
import { Kafka, KafkaConfig, EachMessagePayload } from 'kafkajs';

dotenv.config();

const api:Express = express(); 
const api_port = process.env.API_PORT;

const wss_port: number = parseInt(process.env.WSS_PORT || "3001");
const wss = new WebSocket.Server({ port: wss_port });

const kafkaConfig: KafkaConfig = { brokers: ['localhost:9093'] }
const kafka = new Kafka(kafkaConfig)

api.get('/', (req, res) => {
  res.send('Express + TypeScript Server');
});

api.listen(api_port, () => {
  console.log(`[server]: Server is running at http://localhost:${api_port}`);
});


wss.on('connection', async (ws: WebSocket) => {
  console.log('New client connected');

  const producer = kafka.producer()
  const consumer = kafka.consumer({ groupId: 'test-group' })

  await consumer.connect()
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      console.log(message.value?.toString())
      if (message.value) {
        ws.send(message.value?.toString())
      }
    },
  })

  ws.on('message', async (message: string) => {
    console.log(`Received message: ${message}`);
    await producer.connect()
    await producer.send({
      topic: 'test-topic',
      messages: [
        { value: message as string },
      ],
    })

    ws.send(`Server received your message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');    
    producer.disconnect()
    consumer.disconnect()
  });

  // detect broken connections and close
});
