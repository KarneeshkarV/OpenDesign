type Env = {
  BACKEND_API_ORIGIN: string;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  const backendOrigin = context.env.BACKEND_API_ORIGIN?.replace(/\/$/, "");

  if (!backendOrigin) {
    return new Response("BACKEND_API_ORIGIN is not configured.", {
      status: 500
    });
  }

  const incomingUrl = new URL(context.request.url);
  const targetUrl = new URL(
    `${backendOrigin}${incomingUrl.pathname}${incomingUrl.search}`
  );
  const headers = new Headers(context.request.headers);

  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  const upstreamRequest = new Request(targetUrl, {
    method: context.request.method,
    headers,
    body:
      context.request.method === "GET" || context.request.method === "HEAD"
        ? undefined
        : context.request.body,
    redirect: "manual"
  });

  return fetch(upstreamRequest);
};
