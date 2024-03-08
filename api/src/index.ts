import express, { Express } from "express";
import dotenv from "dotenv";
import WebSocket from "ws";
import { Kafka, KafkaConfig, EachMessagePayload } from "kafkajs";
import { IncomingMessage } from "http";
import { PrismaClient } from "@prisma/client";
import { email, minLength, object, parse, string } from "valibot";
import bodyParser from "body-parser";

dotenv.config();

const api: Express = express();
const api_port = process.env.API_PORT;

const wss_port: number = parseInt(process.env.WSS_PORT || "3001");
const wss = new WebSocket.Server({ port: wss_port });

const kafkaConfig: KafkaConfig = { brokers: ["localhost:9093"] };
const kafka = new Kafka(kafkaConfig);

const prisma = new PrismaClient();

const UserSchema = object({
  email: string([email()]),
  first_name: string([minLength(2)]),
  last_name: string([minLength(2)]),
});

api.use(bodyParser.json());

api.post("/user", async (req, res) => {
  const user = parse(UserSchema, req.body);

  // create user
  try {
    await prisma.user.create({
      data: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

    res.send({
      message: "Created user",
    });
  } catch (e) {
    console.log(e);
    res.send({
      message: "Failed to create user",
    });
  }
});

api.post("/thread", (req, res) => {
  // initialise topic for each thread-user
});

api.delete("/thread", (req, res) => {
  // remove topic for all users of thread
});

api.listen(api_port, () => {
  console.log(`[server]: Server is running at http://localhost:${api_port}`);
});

wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
  console.log("New client connected");
  console.log(req.url);

  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId: "test-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      console.log(message.value?.toString());
      if (message.value) {
        ws.send(message.value?.toString());
      }
    },
  });

  ws.on("message", async (message: string) => {
    console.log(`Received message: ${message}`);
    await producer.connect();
    await producer.send({
      topic: "test-topic",
      messages: [{ value: message as string }],
    });

    ws.send(`Server received your message: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    producer.disconnect();
    consumer.disconnect();
  });
});
