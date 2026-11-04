import * as cdk from 'aws-cdk-lib';
import * as connect from 'aws-cdk-lib/aws-connect';
import { Construct } from 'constructs';

interface ConnectStackProps extends cdk.StackProps {
    lexAliasArn: string;
}

export class ConnectStack extends cdk.Stack {
    public readonly instanceArn: string;

    constructor(scope: Construct, id: string, props: ConnectStackProps) {
        super(scope, id, props);

        // 1. Connect Instance
        const instance = new connect.CfnInstance(
            this, 'ConnectInstance', {
            identityManagementType: 'CONNECT_MANAGED',
            instanceAlias: 'order-ivr-demo',
            attributes: {
                inboundCalls: true,
                outboundCalls: false,
            },
        }
        );

        // 2. Lex Bot Integration
        new connect.CfnIntegrationAssociation(
            this, 'LexAssociation', {
            instanceId: instance.attrArn,
            integrationType: 'LEX_BOT',
            integrationArn: props.lexAliasArn,
        }
        );

        this.instanceArn = instance.attrArn;

        new cdk.CfnOutput(this, 'InstanceArn', {
            value: this.instanceArn,
        });
    }
}