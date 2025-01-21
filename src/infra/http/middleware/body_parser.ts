import express, { Application } from "express";

export default function bodyParser(app: Application) {
	app.use(express.json({ limit: "50mb" }));
}
