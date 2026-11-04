# Welcome to your CDK TypeScript project

This is a Amazon Connect IVR Demo  for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   type-check the project
* `npm run watch`   watch for changes and type-check
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


## Amazon Connect IVR Demo –  Setup and Testing Guide
### 1. Configure AWS Profile

```bash
aws configure --profile cdk-deployer
```

Enter the following information:

- AWS Access Key ID
- AWS Secret Access Key
- Default Region: `us-east-1`
- Default Output Format: `json`

Verify AWS credentials:

```bash
aws sts get-caller-identity --profile cdk-deployer
```

### 2. Deploy AWS CDK

Install dependencies:

```bash
npm install
```

Bootstrap CDK (first deployment only):

```bash
npx cdk bootstrap --profile cdk-deployer
```

Deploy all stacks:

```bash
npx cdk deploy --all --profile cdk-deployer
```

Wait until all stacks are deployed successfully.

### 3. Configure Phone Number

1. Log in to the **Amazon Connect Admin Console**.
2. Navigate to **Channels → Phone numbers**.
3. Select an existing DID number or click **Claim a number**.
4. Set the **Contact Flow / IVR** to `OrderStatusFlow`.
5. Click **Save**.

### 4. Test the IVR

1. Call the configured DID number.
2. Say **"Check my order."**
3. When prompted, provide an order number, such as **"123456."**
4. Verify that the bot returns the order status.

**Expected Flow:**

Phone Call → Amazon Connect → Lex V2 → Lambda → Order Status Response
