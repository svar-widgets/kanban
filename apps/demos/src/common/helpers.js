import { push, replace } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import { links as raw } from "../routes";

const flatLinks = raw.flatMap(g => g.items);

// "/basic/:skin" -> "/basic/willow"
function withSkin(route, skin) {
	return route.replace(":skin", skin);
}

const routes = {
	"/": wrap({
		component: {},
		conditions: () => {
			void replace(withSkin(flatLinks[0][0], "willow"));
			return false;
		},
	}),
};

// alias route ("/base/:skin") -> canonical entry
const aliases = new Map();
flatLinks.forEach(a => a[3]?.aliases?.forEach(alias => aliases.set(alias, a)));

function getRoutes(skinSettings, cb) {
	flatLinks.forEach(
		a =>
			(routes[a[0]] = wrap({
				component: a[2],
				userData: a,
				props: { ...skinSettings },
				conditions: x => {
					cb(x.location);
					return true;
				},
			}))
	);

	// an alias opens the canonical route with the same skin
	aliases.forEach((a, alias) => {
		routes[alias] = wrap({
			component: {},
			conditions: x => {
				void replace(withSkin(a[0], x.params.skin));
				return false;
			},
		});
	});

	return routes;
}

function findLink(route) {
	return flatLinks.find(a => a[0] === route) ?? aliases.get(route);
}

function getLinks() {
	return raw;
}

function getFlatLinks() {
	return flatLinks;
}

export { push, replace, getRoutes, getLinks, getFlatLinks, findLink };
