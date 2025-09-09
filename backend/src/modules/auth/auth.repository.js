import pool from "../../config/db.js";

import { 
    generateRandomToken,
    hashToken
} from "../../utils/token.js"

const getClient = (client) => client || pool;


export const insertRefreshToken = async (userId, hashedRefreshToken, metadata, refreshTokenExpiresAt, client = null) => {
    const db = getClient(client);

    const { rows: [token] } = await db.query(`
        INSERT INTO refresh_tokens 
        (user_id, token_hash, metadata, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, expires_at`, 
        [userId, hashedRefreshToken, metadata, refreshTokenExpiresAt]
    );

    return token;
};

export const deleteRefreshToken = async (hashedRefreshToken, client = null) => {
    const db = getClient(client);
    await db.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [hashedRefreshToken]);
};

export const createUser = async (name, surname, birthday, phone, email, hashedPassword, company_id, role_id, client = null) => {
    const db = getClient(client);
    const { rows: [user] } = await db.query(`
        INSERT INTO users (name, surname, birthday, phone, email, password_hash, company_id, role_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email`,
        [name, surname, birthday, phone, email, hashedPassword, company_id, role_id]);
    return user;
};

export const createAndInsertUserToken = async (req, userId, purpose, expiresInMs, client = null) => {
    const db = getClient(client); 

    const verificationToken = generateRandomToken();
    const hashedVerificationToken = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + expiresInMs);
    const metadata = {
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    };

    await db.query(`
        INSERT INTO user_tokens 
        (user_id, purpose_id, token_hash, expires_at, metadata)
        VALUES ($1, $2, $3, $4, $5)`,
        [userId, purpose, hashedVerificationToken, verificationTokenExpiresAt, metadata]);

    return verificationToken;
};

export const selectRefreshToken = async (hashedRefreshToken, client = null) => {
    const db = getClient(client);

    const result = await db.query(`
        SELECT * 
        FROM refresh_tokens
        WHERE token_hash = $1`, 
        [hashedRefreshToken]);

    return result;
};

export const updateRefreshToken = async (hashedRefreshToken, refreshTokenExpiresAt, userId, oldHashedRefreshToken, client = null) => {
    const db = getClient(client);

    await db.query(`
        UPDATE refresh_tokens 
        SET token_hash = $1, 
            expires_at = $2 
        WHERE user_id = $3
        AND token_hash = $4
        `, 
        [hashedRefreshToken, refreshTokenExpiresAt, userId, oldHashedRefreshToken]);
};

export const verifyEmailByToken = async (hashedToken, purpose, client = null) => {
    const db = getClient(client);

    const { rows: [user] } = await db.query(`
        WITH verified_token AS (
            UPDATE user_tokens
            SET consumed_at = NOW()
            WHERE token_hash = $1
            AND purpose_id = $2
            AND expires_at > NOW()
            RETURNING user_id)
        UPDATE users
        SET is_verified = TRUE
        WHERE id IN (SELECT user_id FROM verified_token)
        RETURNING *`,
        [hashedToken, purpose]);
    return user;
};

export const selectUserToken = async (hashedToken, purpose, client = null) => {
    const db = getClient(client);

    const { rows: [tokenRow] } = await db.query(`
        SELECT * 
        FROM user_tokens 
        WHERE token_hash = $1
        AND purpose_id = $2
        AND expires_at > NOW()
        AND consumed_at IS NULL`,
        [hashedToken, purpose])
    return tokenRow;
};

export const updateUserPassword = async (hashedPassword, userId, client = null) => {
    const db = getClient(client);
    await db.query(`
        UPDATE users
        SET password_hash = $1
        WHERE id = $2`,
        [hashedPassword, userId]);
};

export const markTokenAsConsumed = async (tokenId, client = null) => {
    const db = getClient(client);
    await db.query(`
        UPDATE user_tokens
        SET consumed_at = NOW()
        WHERE id = $1`,
        [tokenId]);
};