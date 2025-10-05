import { WorkerEntrypoint } from 'cloudflare:workers';
import { App } from './hono/app';
import { initDatabase } from '@repo/data-ops/database';
import { QueueMessageSchema } from '@repo/data-ops/zod-schema/queue';
import { handleLinkClick } from './queue-handlers/link-clicks';
export { DestinationEvaluationWorkflow } from '@/workflows/destination-evaluation-workflow';

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
	async queue(batch: MessageBatch<unknown>) {
		for (const message of batch.messages) {
			const parsedEvent = QueueMessageSchema.safeParse(message.body);
			if (parsedEvent.success) {
				const event = parsedEvent.data;
				if (event.type === 'LINK_CLICK') {
					await handleLinkClick(this.env, event);
				}
			} else {
				console.error(parsedEvent.error);
			}
		}
	}
}
