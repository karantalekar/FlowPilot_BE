"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToOrganization = exports.emitToUser = exports.getIo = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const env_1 = require("../config/env");
const redis_1 = require("../config/redis");
const tokens_1 = require("../utils/tokens");
let io;
const initializeSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: env_1.env.CLIENT_URL,
            credentials: true
        }
    });
    if (redis_1.redis) {
        const pubClient = redis_1.redis.duplicate();
        const subClient = redis_1.redis.duplicate();
        pubClient.on('error', () => undefined);
        subClient.on('error', () => undefined);
        io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
    }
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token)
                return next(new Error('Authentication required'));
            const payload = (0, tokens_1.verifyAccessToken)(token);
            socket.data.userId = payload.userId;
            socket.data.organizationId = payload.organizationId;
            next();
        }
        catch (error) {
            next(error);
        }
    });
    io.on('connection', (socket) => {
        if (socket.data.organizationId)
            socket.join(`org:${socket.data.organizationId}`);
        socket.join(`user:${socket.data.userId}`);
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const getIo = () => io;
exports.getIo = getIo;
const emitToUser = (userId, event, payload) => {
    io?.to(`user:${userId}`).emit(event, payload);
};
exports.emitToUser = emitToUser;
const emitToOrganization = (organizationId, event, payload) => {
    io?.to(`org:${organizationId}`).emit(event, payload);
};
exports.emitToOrganization = emitToOrganization;
