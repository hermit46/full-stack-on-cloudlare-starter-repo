import { addLinkClick } from '@repo/data-ops/queries/links';
import { LinkClickMessageType } from '@repo/data-ops/zod-schema/queue';

export async function handleLinkClick(env: Env, event: LinkClickMessageType) {
	/**
	 * Handles a LINK_CLICK event by performing any necessary processing
	 * before recording the link click in the database.
	 *
	 * @param env - The environment object containing resources and configuration.
	 * @param event - The LinkClickMessageType event containing click data.
	 */
	await addLinkClick(event.data);
}
