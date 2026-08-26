import express from "express";
import { parseRequestEvent } from "./telemetry/parse";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		service: "northstar-api",
	});
});

app.post("/v1/telemetry", (req, res) => {
	console.log("Received telemetry:", req.body);

	res.status(202).json({
		accepted: true,
	});
});

app.post("/v1/traces", (req, res) => {
	const requestEvent = parseRequestEvent(req.body);

	if (!requestEvent) {
		return res.status(400).json({
			error: "Could not parse telemetry",
		});
	}

    // console.log("RAW OTLP PAYLOAD:");
    // console.dir(req.body, { depth: null });

	console.log("NorthStar RequestEvent:");
	console.dir(requestEvent, { depth: null });

	return res.status(200).json({});
});

app.listen(port, () => {
	console.log(`NorthStar API listening on port ${port}`);
});