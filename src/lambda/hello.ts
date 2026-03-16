import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { isPrivateIp, lookupCity } from '../services/geo';

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const sourceIp = event.requestContext?.http?.sourceIp;
    const city = isPrivateIp(sourceIp) ? 'unknown' : await lookupCity(sourceIp);
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ message: `hello ${city}` }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ error: err instanceof Error ? err.message : 'internal error' }),
    };
  }
};
