import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const config: UserConfig = {
	plugins: [sveltekit(), nodePolyfills()],
	ssr: {
		// this only seems to make a difference in amount of transformed code
		noExternal: ['@sveltejs/kit', 'svelte/internal', 'svelte'],
	},
	optimizeDeps: {
		// with this line, build has problems, without it, no polyfills
		disabled: false,
	},
	build: {
		commonjsOptions: {
// With the below line, build fails with exports.byteLength from buffer at the
// top level, which is invalid in ES modules
			include: [/buffer/, /process/, /cookie/, '@sveltejs/kit', 'svelte/internal', 'svelte'],
// Without this line, build fails with "Promises from plugins cannot be resolved"
		}
	}
};

export default config;
