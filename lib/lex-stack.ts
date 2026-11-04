
import * as cdk from 'aws-cdk-lib/core';
import * as lex from 'aws-cdk-lib/aws-lex';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface LexStackProps extends cdk.StackProps {
  orderHandler: lambda.IFunction;
}

export class LexStack extends cdk.Stack {
  public readonly lexAliasArn: string;

  constructor(scope: Construct, id: string, props: LexStackProps) {
    super(scope, id, props);

    // 1. IAM Role for Lex V2
    const role = new iam.Role(this, 'LexRole', {
      assumedBy: new iam.ServicePrincipal('lexv2.amazonaws.com'),
    });

    // 2. Create Lex Bot
    const bot = new lex.CfnBot(this, 'OrderBot', {
      name: 'OrderBot',
      description: 'Order status IVR bot',
      roleArn: role.roleArn,
      dataPrivacy: {
        ChildDirected: false,
      },
      idleSessionTtlInSeconds: 300,
      botType: 'Bot',
      autoBuildBotLocales: true,
      botLocales: [
        {
          localeId: 'en_US',
          nluConfidenceThreshold: 0.4,
          voiceSettings: {
            voiceId: 'Joanna',
          },

          intents: [
            {
              name: 'OrderIntent',
              sampleUtterances: [
                { utterance: 'Order status' },
                { utterance: 'Check my order' },
              ],

              slots: [
                {
                  name: 'orderId',
                  slotTypeName: 'AMAZON.Number',

                  valueElicitationSetting: {
                    slotConstraint: 'Required',
                    promptSpecification: {
                      messageGroupsList: [
                        {
                          message: {
                            plainTextMessage: {
                              value: 'What is your order number?',
                            },
                          },
                        },
                      ],
                      maxRetries: 2,
                    },
                  },
                },
              ],
              slotPriorities: [
                {
                  priority: 1,
                  slotName: 'orderId',
                },
              ],
              fulfillmentCodeHook: {
                enabled: true,
              },
            },
            {
              name: 'FallbackIntent',
              parentIntentSignature: 'AMAZON.FallbackIntent',
            },
          ],
        },
      ],
    });

    // 3. Lambda permission for TestBotAlias
    const testAliasArn = cdk.Stack.of(this).formatArn({
      service: 'lex',
      resource: 'bot-alias',
      resourceName: `${bot.attrId}/TSTALIASID`,
      arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
    });

    new lambda.CfnPermission(this, 'LexTestInvokePermission', {
      action: 'lambda:InvokeFunction',
      functionName: props.orderHandler.functionArn,
      principal: 'lexv2.amazonaws.com',
      sourceAccount: this.account,
      sourceArn: testAliasArn,
    });

    // 4. Create Bot Version from DRAFT
    const version = new lex.CfnBotVersion(this, 'Version2', {
      botId: bot.attrId,
      botVersionLocaleSpecification: [
        {
          localeId: 'en_US',
          botVersionLocaleDetails: {
            sourceBotVersion: 'DRAFT',
          },
        },
      ],
    });

    version.addResourceDependency(bot);

    // 5. Lambda permission for production Alias
    const botAliasArnPattern = cdk.Stack.of(this).formatArn({
      service: 'lex',
      resource: 'bot-alias',
      resourceName: `${bot.attrId}/*`,
      arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
    });

    const prodPermission = new lambda.CfnPermission(
      this,
      'LexProdInvokePermission',
      {
        action: 'lambda:InvokeFunction',
        functionName: props.orderHandler.functionArn,
        principal: 'lexv2.amazonaws.com',
        sourceAccount: this.account,
        sourceArn: botAliasArnPattern,
      },
    );

    // 6. Create production Bot Alias
    const alias = new lex.CfnBotAlias(this, 'Alias', {
      botId: bot.attrId,
      botAliasName: 'bot-alias',
      botVersion: version.attrBotVersion,

      botAliasLocaleSettings: [
        {
          localeId: 'en_US',
          botAliasLocaleSetting: {
            enabled: true,
            codeHookSpecification: {
              lambdaCodeHook: {
                lambdaArn: props.orderHandler.functionArn,
                codeHookInterfaceVersion: '1.0',
              },
            },
          },
        },
      ],
    });

    alias.addResourceDependency(version);
    alias.addResourceDependency(prodPermission);

    this.lexAliasArn = alias.attrArn;

    // 7. Outputs
    new cdk.CfnOutput(this, 'BotId', {
      value: bot.attrId,
      description: 'Lex Bot ID',
    });

    new cdk.CfnOutput(this, 'BotAliasId', {
      value: alias.attrBotAliasId,
      description: 'Production Lex Bot Alias ID',
    });

    new cdk.CfnOutput(this, 'BotAliasArn', {
      value: alias.attrArn,
      description: 'Lex Bot Alias ARN for Amazon Connect',
    });
  }
}
