import * as cdk from 'aws-cdk-lib/core';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class LambdaStack extends cdk.Stack {

    public readonly lambdaFunction: NodejsFunction;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.lambdaFunction = new nodejs.NodejsFunction(this, 'OrderHandlerFunction', {
            functionName: 'OrderHandlerFunction',
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: 'lambda/order-handler.ts',
            handler: 'handler',
            timeout: cdk.Duration.seconds(10),
        });

        new cdk.CfnOutput(this, 'OrderHandlerFunctionName', {
            value: this.lambdaFunction.functionName,
            description: 'Name of the Order Handler Lambda function',
        });
    }
}