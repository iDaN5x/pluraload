const axois = require("axios");
const moment = require("moment");
const JSONStream = require("JSONStream");
const {Agent: HttpAgent} = require("http");
const {Agent: HttpsAgent} = require("https");
const {isString} = require("../helpers/validators");
const {parametrify} = require("../helpers/request");

const BASE_URL = "https://app.pluralsight.com";
const AUTHENTICATE_ENDPOINT = "/mobile-api/v2/user/device/authenticated";
const AUTHORIZE_ENDPOINT = "/mobile-api/v2/user/authorization/:deviceId";
const CAPTIONS_ENDPOINT = "transcript/api/v1/caption/json/:clipId/:langCode";
const GQL_ENDPOINT = "/player/api/graphql";

const DEFAULT_HEADERS = {
    "Accept-Encoding": "gzip",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36"
};

class NotAuthenticatedError extends Error {/* TODO: info */}
class AuthenticationFailedError extends Error {/* TODO: info */}
class AuthorizationFailedError extends Error {/* TODO: info */}

class PluralSightService {
    constructor() {
        this._jwtToken = null;
        this._authInfo = null;
        this._setupRestClient();
    }

    _setupRestClient() {
        // Used to send REST requests.
        this.rest = axois.create({
            baseURL: BASE_URL,
            headers: DEFAULT_HEADERS,
            httpAgent: new HttpAgent({ keepAlive: true }),
            httpsAgent: new HttpsAgent({ keepAlive: true }),
            
            // Called before POST/PUT/PATCH requests.
            transformRequest: [(data, headers) => {
                // If authorized, add JWT token to cookia-header.
                if (this.authorized)
                    headers["cookie"] = `PsJwt-production=${this._jwtToken.token};`;
            }]
        });
    }

    get authenticated() {
        const {deviceId, refreshToken} = this._authInfo || {};
        return (isString(deviceId) && isString(refreshToken));
    }

    get authorized() {
        const {jwt, expiration} = this._jwtToken || {};
        return (isString(jwt) && moment(expiration).isAfter());
    }

    async authenticate({username, password, jwtRefreshToken = null}) {
        // If existing JWT refresh token was provided, use it.
        if (typeof(jwtRefreshToken) === "object")
            this._authInfo = jwtRefreshToken;

        else try {
            // Request a new JWT refresh token.
            this._authInfo = await rest.post(AUTHENTICATE_ENDPOINT, {
                "DeviceModel": "Windows Desktop",
                username, password
            });
        }

        catch (e) {
            // TODO: handle.
        }
    
        return this._authInfo;
    }

    async authorize({jwtToken = null}) {
        // User must be authenticatied on the system.
        if (!this.authenticated)
            throw new NotAuthenticatedError();

        // If JWT token was provided, try using it.
        this._jwtToken = this._jwtToken || jwtToken;

        // If missing or expired JWT token, try fetching a new one.
        if (!this.authorized) {
            // Inject device id to url.
            const endpoint = parametrify(AUTHORIZE_ENDPOINT, {
                deviceId: this._authInfo.deviceId
            });

            try {
                // Get a fresh JWT token.
                this._jwtToken = await this.rest.post(endpoint, this._authInfo);
            }

            catch (e) {
                // TODO: handle
            }
        }       

        return this._jwtToken;
    }

    async gql(query, variables = {}) {
        return await this.rest.post(GQL_ENDPOINT, {query, variables});
    }

    async getCoursePlaylist(courseId) {
        // Query course playlist.
        const res = await this.gql(`
            query BootstrapPlayer {
                rpc {
                    bootstrapPlayer {
                        course(courseId: ${courseId}) {
                            name,
                            title,
                            modules {
                                name,
                                title,
                                clips {
                                    name,
                                    title
                                }
                            }                    
                        }
                    }
                }
            }
        `);

        // Get playlist from response body.
        const playlist = res.data.rpc.bootstrapPlayer.course
        
        // TODO: prefare immutability.
        // Add module & clip indexs to enhance usability.
        playlist.modules.forEach((index, module) => {
            module.index = index;
            module.clips.forEach((index, clip) => {
                clip.index = index;
            });
        });

        // Return playlist.
        return playlist;
    }

    async getCourseCaptionLangs(courseId) {
        // TODO: use gql vars?
        // Query course's translation languages.
        const res = await this.gql(`
            query BootstrapPlayer {
                rpc {
                    bootstrapPlayer {
                        course(courseId: ${courseId}) {
                            translationLanguages
                        }
                    }
                }
            }
        `);

        // Get query result from response body.
        const resBody = res.data;
        
        return data.rpc.bootstrapPlayer.course.translationLanguages;
    }

    async getClipDownloadUrl(clipId) {
        // Query variable including format & quality.
        const getClipInfo = {clipId, quality: "1280x720", mediaType: "mp4"};

        // Query clip download link.
        const res = await this.gql(`
            query BootstrapPlayer {
                rpc {
                    bootstrapPlayer {
                        GetClip(input: $getClipInput) {
                            urls {
                                cdn
                            }
                        }
                    }
                }
            }
        `, {getClipInfo});

        // Get urls from response data.
        const urls = res.data.rpc.bootstrapPlayer.urls;

        // Return first CDN url.
        return urls[0].cdn;

    }

    async getClipDownloadStream(clipId) {
        // Get clip's download clip.
        const clipDownloadUrl = await this.getClipDownloadUrl(clipId);

        // Request clip file.
        const res = await this.rest(clipDownloadUrl, {responseType: "stream"});

        // Return download stream.
        return res.data;
    }

    async getClipCaptionsStream(clipId, langCode) {
        // Inject path-parameters to endpoint URL.
        const endpoint = parametrify(CAPTIONS_ENDPOINT, {clipId, langCode});

        // Request clip captions in desired language.
        const res = await this.rest.get(endpoint, {responseType:'stream'});

        // Transform the JSON string into objects efficiently.
        const jsonStream = JSONStream.parse("*");

        // Return captions as a stream of JSON objects.
        return res.data.pipe(jsonStream);
    }
}

module.exports = PluralSightService;