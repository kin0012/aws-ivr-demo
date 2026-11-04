#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { LexStack } from '../lib/lex-stack';
import { LambdaStack } from '../lib/lambda-stack';
import { ConnectStack } from '../lib/connect-stack';
import { FlowStack } from '../lib/flow-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT ?? "123456789012",
  region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
};

// Create the LambdaStack 
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  env: env,
});
// Create the LexStack 
const lexStack = new LexStack(app, 'LexStack', {
  env: env,
  orderHandler: lambdaStack.lambdaFunction,
});

//create the ConnectStack
const connect = new ConnectStack(
  app, 'ConnectStack', {
  env: env,
  lexAliasArn: lexStack.lexAliasArn,
});

//create the FlowStack
const flow = new FlowStack(
  app, 'FlowStack', {
  env: env,
  instanceArn: connect.instanceArn,
  lexAliasArn: lexStack.lexAliasArn,
});

flow.addStackDependency(connect);