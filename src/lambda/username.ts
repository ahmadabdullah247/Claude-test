import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { generateUsername } from "../services/username";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    let parsed: unknown;
    try {
      if (!event.body) throw new Error("missing body");
      parsed = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "invalid request body" }),
      };
    }

    const { name } = parsed as { name: unknown };
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        statusCode: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "name is required" }),
      };
    }

    const username = generateUsername(name);
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: err instanceof Error ? err.message : "internal error",
      }),
    };
  }
};
