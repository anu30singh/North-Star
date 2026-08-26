import type { RequestEvent } from "../types/telemetry";

type OtlpAttribute = {
	key: string;
	value?: {
		stringValue?: string;
		intValue?: string;
		boolValue?: boolean;
		doubleValue?: number;
	};
};

type OtlpSpan = {
	traceId?: string;
	spanId?: string;
	parentSpanId?: string;
	name?: string;
	kind?: number;
	startTimeUnixNano?: string;
	endTimeUnixNano?: string;
	attributes?: OtlpAttribute[];
};

type OtlpResourceSpan = {
	resource?: {
		attributes?: OtlpAttribute[];
	};
	scopeSpans?: Array<{
		scope?: {
			name?: string;
			version?: string;
		};
		spans?: OtlpSpan[];
	}>;
};

type OtlpPayload = {
	resourceSpans?: OtlpResourceSpan[];
};

function getAttribute(
	attributes: OtlpAttribute[] | undefined,
	key: string,
): string | undefined {
	const attribute = attributes?.find((item) => item.key === key);

	if (!attribute?.value) {
		return undefined;
	}

	if (attribute.value.stringValue !== undefined) {
		return attribute.value.stringValue;
	}

	if (attribute.value.intValue !== undefined) {
		return attribute.value.intValue;
	}

	if (attribute.value.doubleValue !== undefined) {
		return String(attribute.value.doubleValue);
	}

	if (attribute.value.boolValue !== undefined) {
		return String(attribute.value.boolValue);
	}

	return undefined;
}

export function parseRequestEvent(
	payload: OtlpPayload,
): RequestEvent | null {
	let selectedResource: OtlpResourceSpan | undefined;
	let selectedSpan: OtlpSpan | undefined;

	for (const resourceSpan of payload.resourceSpans ?? []) {
		for (const scopeSpan of resourceSpan.scopeSpans ?? []) {
			for (const span of scopeSpan.spans ?? []) {
				const method = getAttribute(
					span.attributes,
					"http.request.method",
				);

				const statusCode = getAttribute(
					span.attributes,
					"http.response.status_code",
				);

				// We use the HTTP request + response attributes
				// to identify the canonical HTTP server span.
				if (method && statusCode) {
					selectedResource = resourceSpan;
					selectedSpan = span;
					break;
				}
			}

			if (selectedSpan) {
				break;
			}
		}

		if (selectedSpan) {
			break;
		}
	}

	if (!selectedResource || !selectedSpan) {
		return null;
	}

	const resourceAttributes = selectedResource.resource?.attributes;

	const serviceName = getAttribute(
		resourceAttributes,
		"service.name",
	);

	const method = getAttribute(
		selectedSpan.attributes,
		"http.request.method",
	);

	const statusCode = getAttribute(
		selectedSpan.attributes,
		"http.response.status_code",
	);

	const route =
		getAttribute(selectedSpan.attributes, "http.route") ??
		getAttribute(selectedSpan.attributes, "url.path") ??
		selectedSpan.name ??
		"unknown";

	if (
		!serviceName ||
		!method ||
		!statusCode ||
		!selectedSpan.traceId ||
		!selectedSpan.startTimeUnixNano ||
		!selectedSpan.endTimeUnixNano
	) {
		return null;
	}

	const startTimeNs = Number(selectedSpan.startTimeUnixNano);
	const endTimeNs = Number(selectedSpan.endTimeUnixNano);

	if (!Number.isFinite(startTimeNs) || !Number.isFinite(endTimeNs)) {
		return null;
	}

	return {
		timestamp: new Date(startTimeNs / 1_000_000),
		serviceName,
		route,
		method,
		statusCode: Number(statusCode),
		durationMs: (endTimeNs - startTimeNs) / 1_000_000,
		traceId: selectedSpan.traceId,
	};
}