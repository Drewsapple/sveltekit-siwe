<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		connect,
		fetchSigner,
		getAccount,
		getNetwork,
		InjectedConnector,
		watchAccount
	} from '@wagmi/core';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { SiweMessage } from 'siwe';

	import { page } from '$app/stores';

	const unwatchAccount = watchAccount(async (account) => {
		if (account?.address) {
			connected = true;
		} else {
			connected = false;
		}
	});

	onDestroy(() => {
		// unwatchSigner();
		unwatchAccount();
	});

	const signInFromClient = async () => {
		try {
			const message = new SiweMessage({
				domain: window.location.host,
				address: getAccount().address,
				statement: 'Sign in with Ethereum to the app.',
				uri: window.location.origin,
				version: '1',
				chainId: getNetwork().chain?.id,
				nonce: await fetch('/auth/csrf')
					.then((res) => res.json())
					.then((res) => res.csrfToken)
			});
			const signature = await (await fetchSigner())?.signMessage(message.prepareMessage());
			signIn('credentials', {
				message: JSON.stringify(message),
				redirect: false,
				signature,
			});
		} catch (error) {
			window.alert(error);
		}
	};

	const signOutFromClient = async () => {
		await signOut();
	};

	$: connected = getAccount().isConnected;
</script>

<div class="m-auto flex flex-wrap justify-center">
	<button
		class="btn rounded-lg m-1"
		on:click={() => connect({ chainId: 1, connector: new InjectedConnector() })}
		>{connected ? 'Connected' : 'Connect Wallet'}</button
	>
	{#if $page.data.session}
		<button class="btn rounded-lg m-1" on:click={signOutFromClient}
			>Sign Out</button
		>
	{:else}
		<button class="btn rounded-lg m-1" on:click={signInFromClient} disabled={!connected}
			>Sign In</button
		>
	{/if}
</div>
