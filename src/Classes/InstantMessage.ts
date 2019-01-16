import {FontColor} from './FontColor'
import {ShowEffects} from './ShowEffects'

/**
 * Class which represents an instant message to be sent to the LED screen.
 */
export class InstantMessageModel {
    public messageText: string
    public fontColour: number
    public showeffect: number

    public loopCount: number = 1
    public speed: number = 100
    public stoptime: number = 100

    /**
     * Construct a new InstantMessage instance
     *
     * @param messageText
     * @param fontColor
     * @param showEffect
     * @param showTimeMinutes
     */
    constructor(messageText: string, fontColor: FontColor, showEffect: ShowEffects, showTimeMinutes: number) {
        this.messageText = messageText
        this.fontColour = fontColor
        this.showeffect = showEffect
        this.loopCount = showTimeMinutes * 10
    }

    /**
     * Lower is faster!
     *
     * @param speed
     */
    public setSpeed(speed: number) {
        this.speed = speed
    }

    public getStoptime = () => {
        return this.stoptime
    }

    public getLoopCount = () => {
        return this.loopCount
    }

    public setLoopCount = (loopCount: number) => {
        this.loopCount = loopCount
    }

    public getShoweffect = () => {
        return this.showeffect
    }

    public getMessageText = () => {
        return this.messageText
    }

    public getFontColour = () => {
        return this.fontColour
    }

    public getSpeed = () => {
        return this.speed
    }
}
