"use strict";
/* global describe, it, expect */

const request = require('supertest');
const { app } = require('../app');

describe('AI route authentication', () => {
    it('returns 401 instead of crashing when the access token is missing', async () => {
        const response = await request(app)
            .post('/api/v1/ai/chat')
            .send({ message: 'hello' });

        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
            success: false,
            message: 'Authentication required'
        });
    });
});
