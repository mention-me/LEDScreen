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

- `AWS_KEY` (must have privelages to consume the SQS queue)
- `AWS_SECRET`
- `SQS_QUEUE_LOCATION` (e.g. eu-west-1)
- `SQS_QUEUE_URL` (the full queue URL)

```
npm i
npm start
```

## Logs

Logs are automatically rotated in the `logs` directory, two types of logs are created:

- app.log (application logs)
- request.log (which slack users posted messages, what they were and when)
