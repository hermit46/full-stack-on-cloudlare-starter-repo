import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';

// This is the main entry point for the data service, handles incoming requests for the worker
export default class DataService extends WorkerEntrypoint<Env> {
	constructor(ctx: ExecutionContext, env: Env) {
		// Call the parent WorkerEntrypoint constructor to initialize the worker with the provided context and environment
		super(ctx, env);
		initDatabase(env.DB);
	}
	fetch(request: Request) {
		return App.fetch(request, this.env, this.ctx);
	}
}
