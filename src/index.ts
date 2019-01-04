import * as net from 'net'
import * as RequireEnv from 'require-env'

import * as ControlGetProtocol from './Classes/ControlGetProtocol'
import {FontColor} from './Classes/FontColor'
import {InstantMessageModel} from './Classes/InstantMessage'
import {ShowEffects} from './Classes/ShowEffects'

// Constants which define connection parameters
const SCREEN_IP = RequireEnv.require('SCREEN_IP')
const SCREEN_PORT = parseInt(RequireEnv.require('SCREEN_PORT'), 10)

// Create the message
const instantMessageModel = new InstantMessageModel(
    'BRING ON THE FRIDAY DRINKS UNICORNS',
    FontColor.pink,
    ShowEffects.ScrollLeft
)

instantMessageModel.setLoopCount(30)

// Generate the packet for the message
const packet = ControlGetProtocol.generateInstantMessagePacketBuffer(instantMessageModel)

const client = new net.Socket()

// Connect to the screen and send the packet
client.connect(SCREEN_PORT, SCREEN_IP, () => {
    client.write(packet)
    client.destroy()
})
