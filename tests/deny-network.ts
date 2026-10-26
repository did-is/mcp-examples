/** Test bootstrap: accidental network access is a failure, never an external probe. */
import { Socket } from 'node:net';
globalThis.fetch = async () => { throw new Error('OFFLINE_TEST_NETWORK_DENIED'); };
Socket.prototype.connect = function (): never { throw new Error('OFFLINE_TEST_SOCKET_DENIED'); };
