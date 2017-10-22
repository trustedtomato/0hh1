'use strict';

const CACHE_VERSION = 1;
const CACHE_PREFIX = '0hh1';

const staticCacheName = CACHE_PREFIX+'-static-'+CACHE_VERSION;

const staticFileUrls = [
	'/',
	'manifest.json',
	'css/style.css',
	'fonts/fonts.css',
	'cordova.js',
	'js/index.js',
	'js/jquery-2.1.0.min.js',
	'js/utils.js',
	'js/state.js',
	'js/game.js',
	'js/grid.js',
	'js/hint.js',
	'js/tutorial.js',
	'js/webfont.js',
	'js/levels.js',
	'js/backgroundservice.js',
	'js/tile.js',
	'fonts/Molle-Regular.ttf',
	'fonts/JosefinSans-Bold.ttf',
	'img/trophy.png',
	'img/close.png',
	'img/eye.png',
	'img/question.png',
	'img/history.png'
];


this.addEventListener('install',e => {
	e.waitUntil(
		caches.open(staticCacheName)
			.then(cache => {
				cache.addAll(staticFileUrls);
			})
	);
});

this.addEventListener('activate', event => {
	event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
			const cacheNameParts = key.split('-');
			if (cacheNameParts[0]===CACHE_PREFIX
			&& cacheNameParts[1]==='static'
			&& Number(cacheNameParts[2])!==Number(CACHE_VERSION)
			) {
				return caches.delete(key);
			}
        })
      );
    })
  );
});



const getPathFromUrl = url => url.replace(/^.*?\/\/.*?(?=\/)/,'').replace(/\?.*/,'');

const cacheOrFetchThanMayCache = async request => {
	if(typeof request==='string'){
		request = new Request(request);
	}
	const cacheResponse = await caches.match(request);

	if(cacheResponse) return cacheResponse;
	else{
		const staticFileResponse = await fetch(request.clone()).catch(err => undefined);

		if(staticFileUrls.includes(getPathFromUrl(request.url))){
			const cache = await caches.open(staticCacheName);
			cache.put(request,staticFileResponse.clone());
		}

		return staticFileResponse;
	}
};

this.addEventListener('fetch',e => {
	e.respondWith(cacheOrFetchThanMayCache(e.request));
});
