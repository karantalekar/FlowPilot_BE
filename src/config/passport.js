"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configurePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../models/user.model");
const configurePassport = () => {
    if (!env_1.env.GOOGLE_CLIENT_ID || !env_1.env.GOOGLE_CLIENT_SECRET || !env_1.env.GOOGLE_CALLBACK_URL)
        return;
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env_1.env.GOOGLE_CALLBACK_URL
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email)
                return done(new Error('Google account has no email'));
            const user = await user_model_1.User.findOneAndUpdate({ email }, {
                $setOnInsert: {
                    name: profile.displayName,
                    email,
                    provider: 'google',
                    isEmailVerified: true
                }
            }, { upsert: true, new: true });
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    }));
};
exports.configurePassport = configurePassport;
