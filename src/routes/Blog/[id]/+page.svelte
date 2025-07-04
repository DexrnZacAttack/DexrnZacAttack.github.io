<script lang="ts">
	import { page } from '$app/state';
	import { loadPostByTitle } from '$lib/blog.js';
	import { parse } from 'marked';
	import Card from '../../../components/Card.svelte';
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { fade } from 'svelte/transition';
	import { zoomIn } from '$lib/background';
	import { getCanvas } from '../../../components/Background.svelte';
	import { cubicOut } from 'svelte/easing';
	import CardTop from '../../../components/CardTop.svelte';
	import { status, LoadingScreen } from '$lib/loadingScreen';
	import { DexrnSite } from '$lib/DexrnSite';
	import type { Post } from '$lib/api';

	let post: Post;

	let body: string;
	onMount(async () => {
		// for loading text
		await DexrnSite.sleep(100);
		LoadingScreen.loadingStatus = true;
		LoadingScreen.loadingText = $t('blog.fetchingPost');

		try {
			post = await loadPostByTitle(page.params.id);
		} catch {
			await LoadingScreen.setShowLoadingScreenError(
				true,
				$t('errors.postNotFound', { values: { name: page.params.id } })
			);
			return;
		}

		if (!post) {
			await LoadingScreen.setShowLoadingScreenError(true, $t('errors.postFetchFailed'));
			return;
		}

		LoadingScreen.loadingText = $t('blog.loadingPost', { values: { name: post.title } });

		body = await parse(post.body);

		if (!body) {
			await LoadingScreen.setShowLoadingScreenError(
				true,
				$t('errors.postRenderFailed', { values: { name: post.title } })
			);
			return;
		}

		await zoomIn(getCanvas());
		LoadingScreen.resetLoadingScreenText();
		LoadingScreen.loadingStatus = false;
	});
</script>

<svelte:head>
	<meta property="og:title" content="Dexrn's Website | {post?.title ?? 'Loading post...'}" />
	<meta property="og:type" content="article" />
	<meta property="og:description" content={post?.body ? `${post?.body.substring(0, 25)}...` : ''} />
	<meta property="article:published_time" content={post?.timestamp.toString() ?? 0} />
	<meta property="article:author" content="Dexrn ZacAttack" />
	<title>@Dexrn | {post?.title ?? 'Loading post...'}</title>
	<meta property="twitter:title" content="Dexrn's Website | {post?.title ?? 'Loading post...'}" />
	<meta
		property="twitter:description"
		content={post?.body ? `${post?.body.substring(0, 25)}...` : ''}
	/>
</svelte:head>

{#if !$status.transitioning && !$status.loading}
	<div
		class="Page"
		in:fade={{ delay: 200, duration: 200, easing: cubicOut }}
		out:fade={{ duration: 200, easing: cubicOut }}
	>
		{#if post}
			<CardTop></CardTop>
			<Card
				cardTitle={$t('path.blog.post', {
					values: { title: post?.title ?? $t('loadingScreen.loading') }
				})}
			>
				<div class="content">
					{@html body}
				</div>
			</Card>
		{/if}
	</div>
{/if}

<style>
	.Page {
		height: 100%;
		justify-content: unset; /* makes element taller than I can scroll if set */
		overflow-y: auto;
		padding-bottom: 15px; /* overflow breaks shadows */
	}

	.blogCard {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 100%;
	}

	:global .content p img {
		height: 250px;
		object-fit: contain;
		max-width: 50%;
	}
</style>
