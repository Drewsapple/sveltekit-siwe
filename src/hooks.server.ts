import { SvelteKitAuth } from '@auth/sveltekit';
import CredentialsProvider from '@auth/core/providers/credentials';
import { SiweMessage } from 'siwe';
import { AUTH_URL, AUTH_SECRET } from '$env/static/private';

import { error, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

async function authorization({ event, resolve }) {
	const session = await event.locals.getSession();
	console.log('Checking Authorization');
	// Protect any routes under /authenticated
	if (event.route.id?.includes('/(authenticated)/' && !session?.user)) {
		console.log('Auth Failed', event.route.id, session?.user);
		throw error(401, 'Requires Authentication');
	}

	// If the request is still here, just proceed as normally
	const result = await resolve(event, {
		transformPageChunk: ({ html }) => html
	});
	return result;
}

const providers = [
	CredentialsProvider({
		name: 'siwe',
		credentials: {
			message: {
				label: 'Message',
				type: 'text',
				placeholder: '0x0'
			},
			signature: {
				label: 'Signature',
				type: 'text',
				placeholder: '0x0'
			}
		},
		authorize: async (credentials) => {
			try {
				const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'));
				const AuthUrl = new URL(AUTH_URL);
				const nonce = await fetch(AUTH_URL + '/auth/csrf')
					.then((res) => res.json())
					.then((res) => res.csrfToken);

        console.log("nonce", nonce);
        console.log("credentials", credentials);
				const result = await siwe.verify({
					signature: credentials?.signature || '',
					domain: AuthUrl.host,
					nonce: credentials?.csrfToken || '',
				});

				if (result.success) {
					return {
						id: siwe.address
					};
				}
				return null;
			} catch (e) {
				return null;
			}
		}
	})
];

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle: Handle = sequence(SvelteKitAuth({ providers }), authorization);
