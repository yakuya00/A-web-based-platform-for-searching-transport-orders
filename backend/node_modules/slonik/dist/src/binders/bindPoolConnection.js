"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindPoolConnection = void 0;
const assertions_1 = require("../assertions");
const connectionMethods_1 = require("../connectionMethods");
const bindPoolConnection = (parentLog, connection, clientConfiguration) => {
    return {
        any: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.any)(parentLog, connection, clientConfiguration, slonikSql);
        },
        anyFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.anyFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        copyFromBinary: async (slonikSql, values, columnTypes) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return await (0, connectionMethods_1.copyFromBinary)(parentLog, connection, clientConfiguration, slonikSql, values, columnTypes);
        },
        exists: async (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return await (0, connectionMethods_1.exists)(parentLog, connection, clientConfiguration, slonikSql);
        },
        many: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.many)(parentLog, connection, clientConfiguration, slonikSql);
        },
        manyFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.manyFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        maybeOne: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.maybeOne)(parentLog, connection, clientConfiguration, slonikSql);
        },
        maybeOneFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.maybeOneFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        one: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.one)(parentLog, connection, clientConfiguration, slonikSql);
        },
        oneFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.oneFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        query: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return (0, connectionMethods_1.query)(parentLog, connection, clientConfiguration, slonikSql);
        },
        stream: async (slonikSql, streamHandler, config) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            return await (0, connectionMethods_1.stream)(parentLog, connection, clientConfiguration, slonikSql, streamHandler, undefined, config);
        },
        transaction: async (handler, transactionRetryLimit) => {
            return await (0, connectionMethods_1.transaction)(parentLog, connection, clientConfiguration, handler, transactionRetryLimit);
        },
    };
};
exports.bindPoolConnection = bindPoolConnection;
