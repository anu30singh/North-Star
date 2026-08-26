import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";

const sdk = new NodeSDK({
	instrumentations: [getNodeAutoInstrumentations()],
	traceExporter: new ConsoleSpanExporter(),
});

sdk.start();