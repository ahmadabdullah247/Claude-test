import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Construct } from "constructs";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloFn = new NodejsFunction(this, "HelloFunction", {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 128,
      entry: "src/lambda/hello.ts",
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: false,
      },
    });

    const usernameFn = new NodejsFunction(this, "UsernameFn", {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 128,
      entry: "src/lambda/username.ts",
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: false,
      },
    });

    const httpApi = new HttpApi(this, "HelloApi");

    httpApi.addRoutes({
      path: "/",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration("HelloIntegration", helloFn),
    });

    httpApi.addRoutes({
      path: "/username",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration("UsernameIntegration", usernameFn),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: httpApi.apiEndpoint,
      description: "HTTP API endpoint URL",
    });
  }
}
