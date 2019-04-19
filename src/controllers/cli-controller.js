const {queue} = require("async");
const {pipeline} = require("stream");
const {join: joinPath} = require("path");
const {isObject} = require("../helpers/validators");
const SubripStream = require("../helpers/subrip-stream");
const {mkdirp, createWriteStream} = require("fs-extra");

const DL_LANES = 5;

const _defaultOptions = {
    destDir = process.cwd(),
    captions = false,
    captionLangCodes = ["en"]
};

class CliController {
    constructor({pluralSight}) {
        this._pluralSight = pluralSight;
    }

    

    async getCoursePlaylist(courseId) {
        // Get course playlist.
        return await this._pluralSight.getCoursePlaylist(courseId);
    }

    async downloadCourse(course, options = defaultDownloadOptions) {       
        // Get course directory path.
        const courseDir = joinPath(options.destDir, course.title);
        
        // Create course directory.        
        await mkdirp(courseDir);

        // Download course modules.
        for (const module of course.modules) {
            await this.downloadModule(module, {
                destDir: courseDir,
                ...options
            });
        };
    }

    async downloadModule(module, options = _defaultOptions) {
        // Get module directory path.
        const dirName = `${module.index} - ${module.title}`;
        const dirPath = joinPath(options.destDir, dirName);

        // Create module directory.
        await mkdirp(dirPath);

        // Download module clips.
        for (const clip of module.clips) {
            await this.downloadClip(clip, {
                destDir: dirPath,
                ...options
            });
        };
    }

    async downloadClip(clip, options = _defaultOptions) {
        // Get clip file path.
        const fileName = `${clip.index} - ${clip.name}.mp4`;
        const filePath = joinPath(options.destDir, fileName);

        // Open clip file stream.
        const file = createWriteStream(filePath);

        // Open download stream.
        const dlStream = this._pluralSight.getClipDownloadStream();

        // Save clip to file.
        await pipeline(dlStream, file);

        // Download captions if requested.
        if (options.captions) {
            for (const langCode of options.captionLangCodes) {
                await this.downloadClipCaptions(clip, langCode);
            }
        }
    }

    async downloadClipCaptions(clip, langCode) {
        // Open source captions' stream.
        const captionsStream = await this._pluralSight
            .getClipCaptionsStream(clip.id, langCode);

        // Create a new subrip-transformer.
        const subrip = new SubripStream();

        // Generate file path.
        const fileName = `${clip.index} - ${clip.name}.${lang.code}.srt`;
        const filePath = joinPath(outDir, fileName);

        // Open destination file's write-stream.
        const file = createWriteStream(filePath);
       
        // Save clip captions as a SubRip file.
        await pipeline(captionsStream, subrip, file);
    };
}

module.exports = CliController;