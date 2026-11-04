export const handler = async (event: any) => {
    console.log('Lex event:', JSON.stringify(event));
    const intent = event.sessionState.intent;
    const orderId = intent.slots?.orderId?.value?.interpretedValue;

    const orders: Record<string, string> = {
        '123': 'Shipped',
        '456': 'Processing',
        '789': 'Delivered',
    };

    const status = orders[orderId];

    const message = status
        ? `Order ${orderId} is ${status}.`
        : `Order ${orderId} was not found.`;

    return {
        sessionState: {
            dialogAction: { type: "Close" },
            intent: {
                name: intent.name,
                slots: intent.slots,
                state: "Fulfilled",
            },
        },
        messages: [
            {
                contentType: "PlainText",
                content: message,
            },
        ],
    };
};