# LED Screen

Listens to an AWS SQS queue for messages which adhere to the following message format:

```
{
    username: string
    screenIP: string
    screenPort: number
    message: string
    colour: number
    effect: number
    showTimeMinutes: number
}
```

And sends the message to an LED screen at the IP address and port in the message packet.

## Instructions

Set the following environment variables:

- AWS_KEY
- AWS_SECRET
- SQS_QUEUE_LOCATION
- SQS_QUEUE_URL

```
npm i
npm start
```

