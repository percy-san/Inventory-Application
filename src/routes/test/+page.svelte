<script>
	import { onMount } from 'svelte';
	import { testConnection, getConnectionStatus } from '$lib/supabase.js';
	import { getAllCategories } from '$lib/database.js';

	let connectionStatus = null;
	let categories = null;
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			// Test connection
			const status = await getConnectionStatus();
			connectionStatus = status;

			// Try to fetch categories
			const categoriesResult = await getAllCategories();
			if (categoriesResult.error) {
				error = categoriesResult.error.message;
			} else {
				categories = categoriesResult.data;
			}
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<div class="p-8">
	<h1 class="text-2xl font-bold mb-6">Database Connection Test</h1>

	{#if loading}
		<p>Testing connection...</p>
	{:else}
		<div class="space-y-4">
			<div class="border p-4 rounded">
				<h2 class="font-semibold mb-2">Connection Status</h2>
				<pre class="bg-gray-100 p-2 rounded text-sm">{JSON.stringify(connectionStatus, null, 2)}</pre>
			</div>

			{#if error}
				<div class="border border-red-300 bg-red-50 p-4 rounded">
					<h2 class="font-semibold text-red-800 mb-2">Error</h2>
					<p class="text-red-700">{error}</p>
				</div>
			{/if}

			{#if categories}
				<div class="border border-green-300 bg-green-50 p-4 rounded">
					<h2 class="font-semibold text-green-800 mb-2">Categories ({categories.length})</h2>
					<ul class="text-green-700">
						{#each categories as category}
							<li>• {category.name} - {category.description}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>