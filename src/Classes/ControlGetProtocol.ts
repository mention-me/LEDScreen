/**
 * Please don't hate me for the code in here, it is a shortened version of the code contained in ControlGetProtocol.java
 * from the decompiled APK of ControlCenter1.7.apk
 *
 * Currently the methods in here are used to generate an instant message packet to the LED screen. I have tried to
 * comment as much as I possibly can, but I simply don't understand what every part of it does, and the original code
 * had NO commenting at all.
 *
 * Here be dragons (which I have tried to tame).
 */

// @ts-ignore
import * as BufferUtils from 'arraybuffer-to-buffer'

import {InstantMessageModel} from './InstantMessage'
import {MotionEventCompat} from './MotionEventCompat'

/**
 * Given an instant object, generate the packet buffer to send to the LED screen
 *
 * @param instant
 */
export const generateInstantMessagePacketBuffer = (instant: InstantMessageModel) => {
    let i
    const instanttext = instant.getMessageText()
    const textviewlength = instanttext.length

    // Step 1, generate the packet using integer values
    const basePacket: number[] = []
    basePacket[0] = instant.getLoopCount()
    basePacket[1] = 0
    basePacket[2] = 0
    basePacket[3] = 0
    basePacket[4] = 0
    basePacket[5] = (((MotionEventCompat.ACTION_POINTER_INDEX_MASK & 0) >> 8) & MotionEventCompat.ACTION_MASK)
    basePacket[6] = (0 & MotionEventCompat.ACTION_MASK)
    basePacket[7] = (((MotionEventCompat.ACTION_POINTER_INDEX_MASK & 0) >> 8) & MotionEventCompat.ACTION_MASK)
    basePacket[8] = (0 & MotionEventCompat.ACTION_MASK)
    basePacket[9] = (2 + ((instant.getFontColour() + 1) * 16))
    basePacket[10] = 0
    basePacket[11] = 0
    basePacket[12] = 0
    basePacket[13] = 0
    basePacket[14] = instant.getShoweffect()
    basePacket[15] = (100 - instant.getSpeed())
    basePacket[16] = instant.getStoptime()
    basePacket[17] = (((MotionEventCompat.ACTION_POINTER_INDEX_MASK & (textviewlength * 2)) >> 8)
        & MotionEventCompat.ACTION_MASK)
    basePacket[18] = ((textviewlength * 2) & MotionEventCompat.ACTION_MASK)

    // Convert the packet to the closest thing we have to a byte array, a Uint8Array
    const uint8Array = Uint8Array.from(basePacket)

    // Step 2, using the uintarray format what we're going to send as our data packet
    const senddata: number[] = []

    let totalsum = 0

    // Get the total value of the existing packet, used to generate the checksum bits
    uint8Array.forEach((val) => {
        totalsum += val & MotionEventCompat.ACTION_MASK
    })

    // Calculate checksum bits (?)
    senddata[0] = 119
    senddata[1] = (((MotionEventCompat.ACTION_POINTER_INDEX_MASK & totalsum) >> 8) & MotionEventCompat.ACTION_MASK)
    senddata[2] = (totalsum & MotionEventCompat.ACTION_MASK)

    // Add the existing data in
    for (i = 0; i < uint8Array.length; i++) {
        senddata[i + 3] = uint8Array[i]
    }

    // Pad out the rest of the array to clear out any previous data
    for (i = i + 3; i < (textviewlength * 2) + 22; i++) {
        senddata[i] = 0
    }

    // Add the text
    for (i = 0; i < textviewlength; i++) {
        senddata[(uint8Array.length + 3) + i] = instanttext.charCodeAt(i)
    }

    // Now we have our packet, we need to wrap additional data around it (obviously).
    return addHeadersAndFinalisePacket(Uint8Array.from(senddata))
}

/**
 * Given a partially formatted packet, add stuff to it (sorry that's as specific as I can be)
 *
 * @param senddata
 */
const addHeadersAndFinalisePacket = (senddata: Uint8Array) => {
    const datafirst: number[] = []

    const length = senddata.length + 13

    /**
     * Start header
     */

    // These first four bits regard the card id, which seems to be correct as-is
    datafirst[0] = Number(255)
    datafirst[1] = Number(255)
    datafirst[2] = Number(255)
    datafirst[3] = Number(255)

    // The next set of bits appear to relate to the length of the string being sent, not sure what the other hard coded
    // values do
    datafirst[4] = length & MotionEventCompat.ACTION_MASK
    datafirst[5] = ((length & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8) & MotionEventCompat.ACTION_MASK
    datafirst[6] = 0
    datafirst[7] = 0
    datafirst[8] = 104
    datafirst[9] = 50
    datafirst[10] = -1
    datafirst[11] = 116
    datafirst[12] = 17
    datafirst[13] = 0
    datafirst[14] = 0
    datafirst[15] = 0
    datafirst[16] = 0
    datafirst[17] = senddata.length & MotionEventCompat.ACTION_MASK
    datafirst[18] = ((senddata.length & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8)
        & MotionEventCompat.ACTION_MASK

    /**
     * End header
     *
     * Start payload
     */

    let i
    let totalsum = 0

    // Add our existing data in
    for (i = 0; i < senddata.length; i++) {
        datafirst[i + 19] = senddata[i]
    }

    // Calculate values for checksum
    for (i = 8; i < datafirst.length - 2; i++) {
        totalsum += datafirst[i] & MotionEventCompat.ACTION_MASK
    }

    // Add last checksum bits
    datafirst[senddata.length + 19] = (totalsum & MotionEventCompat.ACTION_MASK)
    datafirst[senddata.length + 20] = (((totalsum & MotionEventCompat.ACTION_POINTER_INDEX_MASK) >> 8)
        & MotionEventCompat.ACTION_MASK)

    /**
     * End payload
     */

    const packet = Uint8Array.from(datafirst)

    // Convert everything to a buffer which can then be sent
    return BufferUtils.arrayBufferToBuffer(packet.buffer)
}
