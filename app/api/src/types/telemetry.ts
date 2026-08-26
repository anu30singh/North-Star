export type RequestEvent = {
	timestamp: Date;
	serviceName: string;
	route: string;
	method: string;
	statusCode: number;
	durationMs: number;
	traceId: string;
};