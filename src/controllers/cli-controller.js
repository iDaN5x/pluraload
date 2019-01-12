const mkdirp = require("mkdirp");
const {queue} = require("async");
const {promisify} = require("util");
const {pipeline} = require("stream");
const {join: joinPath} = require("path");
const {createWriteStream} = require("fs");
const {isObject} = require("../helpers/validators");
const SubripStream = require("../helpers/subrip-stream");

const _defaultDownloadOptions = {
    destDir = process.cwd(),
    captions = false,
    selection = undefined,
    captionLangCodes = ["en"]
};

// Promisifed version to use in async functions.
const mkdirpAsync = promisify(mkdirp);

class CliController {
    constructor({pluralSight, config}) {
        this._pluralSight = pluralSight;
        this._config = config;

        // Used to download clip files in parallel.
        this._downloadQueue = queue(
            this._downloadFile.bind(this),
            this._config.dlLanes);
    }

    async getCoursePlaylist(courseId) {
        // Get course playlist.
        return await this._pluralSight.getCoursePlaylist(courseId);
    }

    async downloadCourse(playlist, options = defaultDownloadOptions) {       
        // Get course target directory.
        const courseDir = joinPath(options.destDir, playlist.course.title);

        // Download desired course modules.
        const modules = playlist.course.modules;

        for (let i = 0; i < modules.length; i++) {
            // Download module.
            await this.downloadModule(playlist, i, options);
        }
    }

    async downloadModule(playlist, moduleIdx, options = _defaultDownloadOptions) {
        // Get module's destination directory path.
        const destDir = joinPath(courseDir, `${i} - ${$module.title}`);

    }

    async downloadClip(playlist, moduleIdx, clipIdx, options = _defaultDownloadOptions) {
        
    }

    async downloadClipCaptions(clip, _defaultDownloadOptions) {
        // Open source captions' stream.
        const captionsStream = await this._pluralSight
            .getClipCaptionsStream(clip.id, lang.code);

        // Create a new subrip-transformer.
        const subrip = new SubripStream();

        // Generate file path.
        const fileName = `${clip.index} - ${clip.name} - ${lang.code}.srt`;
        const filePath = joinPath(outDir, fileName);

        // Open destination file's write-stream.
        const destFile = createWriteStream(filePath);
       
        // Save clip captions as a SubRip file.
        await pipeline(captionsStream, subrip, destFile);
    };
}

module.exports = CliController;