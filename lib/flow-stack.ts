
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as connect from 'aws-cdk-lib/aws-connect';

interface FlowStackProps extends cdk.StackProps {
    instanceArn: string;
    lexAliasArn: string;
}

export class FlowStack extends cdk.Stack {
    constructor(
        scope: Construct,
        id: string,
        props: FlowStackProps
    ) {
        super(scope, id, props);

        const flowContent = {
            Version: '2019-10-30',
            StartAction: 'AskLex',
            Actions: [
                {
                    Identifier: 'AskLex',
                    Type: 'ConnectParticipantWithLexBot',
                    Parameters: {
                        Text: 'How can I help you?',
                        LexV2Bot: {
                            AliasArn: props.lexAliasArn,
                        },
                    },
                    Transitions: {
                        NextAction: 'Disconnect',
                        Errors: [
                            {
                                ErrorType: 'NoMatchingCondition',
                                NextAction: 'Disconnect',
                            },
                            {
                                ErrorType: 'NoMatchingError',
                                NextAction: 'Disconnect',
                            },
                        ],
                    },
                },
                {
                    Identifier: 'Disconnect',
                    Type: 'DisconnectParticipant',
                    Parameters: {},
                    Transitions: {},
                },
            ],
        };

        const flow = new connect.CfnContactFlow(
            this, 'OrderFlow', {
            instanceArn: props.instanceArn,
            name: 'OrderStatusFlow',
            type: 'CONTACT_FLOW',
            state: 'ACTIVE',
            content: JSON.stringify(flowContent),
        }
        );

        new cdk.CfnOutput(this, 'FlowArn', {
            value: flow.attrContactFlowArn,
        });
    }
}
