<script>
	import { onMount } from "svelte";
	import Router, { push } from "svelte-spa-router";
	import { getRoutes, findLink } from "./helpers";

	let { skin = $bindable(), onnewpage, productTag } = $props();
	let page = $state(),
		title,
		link,
		name;
	const baseLink = $derived(
		"https://github.com/svar-widgets/" +
			productTag +
			"/blob/main/apps/demos/src/cases/"
	);

	$effect(() => {
		if (skin && page) {
			push(`/${page}/${skin}`);
		}
	});

	onMount(() => {
		onnewpage?.({ page, skin, title, link });
	});

	function onRouteChange(path) {
		const parts = path.split("/");
		skin = parts[2];

		// an alias resolves to its canonical entry, so the page segment,
		// title and code link follow the canonical route
		const matched = findLink(`/${parts[1]}/:skin`);
		page = matched ? matched[0].split("/")[1] : parts[1];
		title = matched?.[1] ?? "";
		const props = matched?.[3] ?? {};
		name = props.file ?? matched?.[1];
		// Pro samples are not in the public GitHub mirror, so they get no link
		link = props.pro ? null : `${baseLink}${name.replace(/\s+/g, "")}.svelte`;

		onnewpage?.({ page, skin, title, link });
	}

	const routes = getRoutes({}, onRouteChange);
</script>

<Router {routes} />
