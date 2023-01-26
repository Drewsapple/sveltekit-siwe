<script lang="ts">
    // Setup web3 

	import { configureChains, createClient } from '@wagmi/core';
	import { alchemyProvider } from '@wagmi/core/providers/alchemy';
	import { mainnet } from '@wagmi/core/chains';
	const chains = [mainnet];

	// Wagmi Core Client
	const { provider } = configureChains(chains, [
		alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_KEY })
	]);

	const wagmiClient = createClient({
		autoConnect: true,
		provider
	});
</script>

<slot />