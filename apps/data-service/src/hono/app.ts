import { getDestinationForCountry, getRoutingDestinations } from '@/helpers/route-ops';
import { cloudflareInfoSchema } from '@repo/data-ops/zod-schema/links';
import { LinkClickMessageType } from '@repo/data-ops/zod-schema/queue';
import { Hono } from 'hono';

export const App = new Hono<{ Bindings: Env }>();

App.get('/:id', async (c) => {
	/**
	 * Route handler for GET /:id
	 *
	 * This endpoint handles GET requests to /:id, where :id is a short link identifier.
	 * It retrieves routing information for the link (using cache and database as fallback),
	 * determines the correct destination URL based on the user's country (from Cloudflare headers),
	 * enqueues a link click event for analytics, and redirects the user to the resolved destination.
	 *
	 * Returns:
	 * - 302 Redirect to the destination URL if found
	 * - 404 Not Found if the link does not exist
	 * - 400 Bad Request if the Cloudflare header is invalid
	 */
	const id = c.req.param('id');

	const linkInfo = await getRoutingDestinations(c.env, id);
	if (!linkInfo) {
		return c.text('Link not found', 404);
	}

	const cfHeader = cloudflareInfoSchema.safeParse(c.req.raw.cf);
	if (!cfHeader.success) {
		return c.text('Invalid Cloudflare header', 400);
	}

	const headers = cfHeader.data;
	const destination = getDestinationForCountry(linkInfo, headers.country);

	const queueMessage: LinkClickMessageType = {
		type: 'LINK_CLICK',
		data: {
			id: id,
			country: headers.country,
			destination: destination,
			accountId: linkInfo.accountId,
			latitude: headers.latitude,
			longitude: headers.longitude,
			timestamp: new Date().toISOString(),
		},
	};

	// Fire-and-forget: don't await queue send to avoid blocking
	c.executionCtx.waitUntil(c.env.QUEUE.send(queueMessage));

	return c.redirect(destination);
});
