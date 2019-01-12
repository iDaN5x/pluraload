const moment = require("moment");
const {Transform} = require("stream");
const dedent = require("dedent-js");

// Patch moment.js to support duration-string formatting.
require("moment-duration-format");

class SubRipStream extends Transform {
    constructor() {
        super({writableObjectMode: true});
        this._lastFrame = null;
        this._frameCount = 0;
    }

    _transform(frame, _, callback) {
        // We start transformation from the second frame.   
        if (this._lastFrame) {
            // Get current frame details.
            const {text, displayTimeOffset: start} = this._lastFrame;
            const {displayTimeOffset: end} = frame;

            // Generate caption.
            const caption = dedent`
                ${this._frameCount++}
                ${this._durationStr(start)} --> ${this._durationStr(end)}
                ${text}
                
            `;

            // Push caption down stream.
            this.push(caption);
        }
        
        // Update last frame reference.
        this._lastFrame = frame;

        return void callback();
    }

    static _durationStr(seconds, trim = false) {
        return moment
            .duration({seconds})
            .format("HH:mm:ss,SSS", {trim});
    }
}

module.exports = SubRipStream;