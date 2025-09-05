"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const createSqlTag_1 = require("../../../../src/factories/createSqlTag");
const tokens_1 = require("../../../../src/tokens");
const sql = (0, createSqlTag_1.createSqlTag)();
(0, ava_1.default)('creates an empty make_interval invocation', (t) => {
    const query = sql `SELECT ${sql.interval({})}`;
    t.deepEqual(query, {
        sql: 'SELECT make_interval()',
        type: tokens_1.SqlToken,
        values: [],
    });
});
(0, ava_1.default)('throws if contains unknown properties', (t) => {
    const error = t.throws(() => {
        sql `SELECT ${sql.interval({
            // @ts-expect-error
            foo: 'bar',
        })}`;
    });
    t.is(error === null || error === void 0 ? void 0 : error.message, 'Interval input must not contain unknown properties.');
});
