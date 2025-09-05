"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindTransactionConnection = void 0;
const assertions_1 = require("../assertions");
const connectionMethods_1 = require("../connectionMethods");
const state_1 = require("../state");
const bindTransactionConnection = (parentLog, connection, clientConfiguration, transactionDepth) => {
    const poolClientState = (0, state_1.getPoolClientState)(connection);
    const assertTransactionDepth = () => {
        if (transactionDepth !== poolClientState.transactionDepth) {
            throw new Error('Cannot run a query using parent transaction.');
        }
    };
    return {
        any: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.any)(parentLog, connection, clientConfiguration, slonikSql);
        },
        anyFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.anyFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        exists: async (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return await (0, connectionMethods_1.exists)(parentLog, connection, clientConfiguration, slonikSql);
        },
        many: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.many)(parentLog, connection, clientConfiguration, slonikSql);
        },
        manyFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.manyFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        maybeOne: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.maybeOne)(parentLog, connection, clientConfiguration, slonikSql);
        },
        maybeOneFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.maybeOneFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        one: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.one)(parentLog, connection, clientConfiguration, slonikSql);
        },
        oneFirst: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.oneFirst)(parentLog, connection, clientConfiguration, slonikSql);
        },
        query: (slonikSql) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return (0, connectionMethods_1.query)(parentLog, connection, clientConfiguration, slonikSql);
        },
        stream: async (slonikSql, streamHandler) => {
            (0, assertions_1.assertSqlSqlToken)(slonikSql);
            assertTransactionDepth();
            return await (0, connectionMethods_1.stream)(parentLog, connection, clientConfiguration, slonikSql, streamHandler);
        },
        transaction: async (handler, transactionRetryLimit) => {
            assertTransactionDepth();
            return await (0, connectionMethods_1.nestedTransaction)(parentLog, connection, clientConfiguration, handler, transactionDepth, transactionRetryLimit);
        },
    };
};
exports.bindTransactionConnection = bindTransactionConnection;
