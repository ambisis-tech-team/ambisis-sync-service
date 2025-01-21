import {
  SPAN_STATUS_ERROR,
  SPAN_STATUS_OK,
  type Span,
  type SpanAttributes,
} from "@sentry/core";

export const ambisisSpan = (
  span: Span,
  {
    status,
    message,
  }: {
    status: "ok" | "error";
    message?: string;
  },
  attrs?: SpanAttributes
) => {
  span.setStatus({
    code: status === "ok" ? SPAN_STATUS_OK : SPAN_STATUS_ERROR,
    message,
  });
  if (attrs) span.setAttributes(attrs);
};
