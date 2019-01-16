/* tslint:disable:no-console */
import {SQS} from 'aws-sdk'
import * as log4js from 'log4js'
import * as net from 'net'
import * as RequireEnv from 'require-env'
import Consumer from 'sqs-consumer'

import * as ControlGetProtocol from './Classes/ControlGetProtocol'
import {InstantMessageModel} from './Classes/InstantMessage'

// Constants which define connection parameters
const AWS_KEY = RequireEnv.require('AWS_KEY')
const AWS_SECRET = RequireEnv.require('AWS_SECRET')
const SQS_QUEUE_LOCATION = RequireEnv.require('SQS_QUEUE_LOCATION')
const SQS_QUEUE_URL = RequireEnv.require('SQS_QUEUE_URL')

const logger = log4js.getLogger('app')
const requestLogger = log4js.getLogger('request')

logger.level = 'debug' || process.env.LOG_LEVEL

/*
 * Basically what this does is sets up the logging handlers: console, app, request
 *
 * Then tells log4js to log EVERYTHING to the console (stdout)
 * And depending on the loggers context:
 *      The app logs go to a file called app.log
 *      The request logs go to a file called request.log
 *
 */
log4js.configure({
    appenders: {
        console: {type: 'console'},
        app: {type: 'file', category: ['app'], filename: 'logs/app.log', maxLogSize: 1e6},
        request: {type: 'file', category: ['request'], filename: 'logs/request.log', maxLogSize: 1e6}
    },
    categories: {
        default: {appenders: ['console'], level: 'info'},
        app: {appenders: ['app', 'console'], level: 'info'},
        request: {appenders: ['request', 'console'], level: 'info'}
    },
    pm2: true
})

/**
 * Connect to AWS and authenticate to SQS
 */
const sqs = new SQS({
    accessKeyId: AWS_KEY,
    secretAccessKey: AWS_SECRET,
    region: SQS_QUEUE_LOCATION,
    apiVersion: '2012-11-05'
})

/**
 * Create a poller, which will regularly poll for new SQS messages
 */
const sqsPoller = new Consumer({
    sqs,
    queueUrl: SQS_QUEUE_URL,
    handleMessage: (messagePacket: any, done: any) => {

        const message: SQSLEDMessage = JSON.parse(messagePacket.Body)

        logger.info('Received message: ' + message.message)
        logger.debug(message)

        // Create the message based off the queue message
        const instantMessageModel = new InstantMessageModel(
            message.message,
            message.colour,
            message.effect,
            message.showTimeMinutes
        )

        requestLogger.info(message.username + ': ' + message.message)

        // Generate the packet for the message
        const packet = ControlGetProtocol.generateInstantMessagePacketBuffer(instantMessageModel)

        // Actually send it
        sendMessageToLedScreen(message.screenIP, message.screenPort, packet, () => {
            // On success, we ack the message to stop it from being received multiple times
            done()
        })
    }
})

/**
 * Method to send a packet to the LED screen at the specified IP and port
 *
 * @param ip
 * @param port
 * @param packet
 * @param ack
 */
const sendMessageToLedScreen = (ip: string, port: number, packet: Buffer, ack: any) => {
    logger.info('About to send the message')

    const client = new net.Socket()

    client.setTimeout(5000, () => {
        logger.error('Socket timeout')
        client.end()
    })

    client.on('error', (e) => {
        logger.error(e)
    }).end()

    // Connect to the screen and send the packet

    client.connect(port, ip, () => {
        logger.debug('Connected to LED Screen at ' + ip + ':' + port)

        client.write(packet)
        client.destroy()

        // Acknowledge the message so we don't receive it again
        ack()

        logger.debug('Disconnecting from screen')
    })

}

logger.info('Ready to receive SQS messages from ' + SQS_QUEUE_URL)

sqsPoller.on('error', (err: any) => {
    logger.error(err)
})

sqsPoller.start()

/**
 * Defines what an incoming SQS message should look like
 */
export interface SQSLEDMessage {
    username: string
    screenIP: string
    screenPort: number
    message: string
    colour: number
    effect: number
    showTimeMinutes: number
}
