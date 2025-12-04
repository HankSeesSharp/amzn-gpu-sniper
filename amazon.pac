function FindProxyForURL(url, host) {
    if (shExpMatch(host, "*amazon.com*") ||
		shExpMatch(host, '*amazon.de*') ||
		shExpMatch(host, '*wieistmeineip.de*') ||
		shExpMatch(host, '*notebooksbilliger.de*') ||
		shExpMatch(host, '*usercentrics.eu*') ||
		shExpMatch(host, '*httpbin.dev*')) {
			return 'HTTP 127.0.0.1:3128';
    } else {
    return 'DIRECT';
	}
}