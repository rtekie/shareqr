// Listen for any attempts to call changePage().
$(document).bind("pagebeforechange", function(e, data) {
	// We only want to handle changePage() calls where the caller is asking to load a page by URL.
	if (typeof data.toPage === "string") {
		// We only want to handle #qrcode url.
		var u = $.mobile.path.parseUrl(data.toPage);
		var qrcode = /^#qrcode/;
		if (u.hash.search(qrcode) !== -1) {
			// Display QR code for the selected URL.
			showQRCode(u, data.options);
			e.preventDefault();
		}
	}
});

// Load the QR Code for a specific url passed in as a parameter.
// Generate markup for the page, and then make that page the current active page.
function showQRCode(urlObj, options) {
	// Get the url parameter
	var qrUrl = decodeURIComponent(urlObj.hash.replace(/.*url=/, ""));
	
	// The page we use to display QR code is already in the DOM. 
	// The id of the page we are going to write the content into is specified in the hash before the '?'.
	var	pageSelector = urlObj.hash.replace(/\?.*$/, "");

	if (qrUrl) {
		// Get the page we are going to write content into.
		var $page = $(pageSelector);

		// Get the header for the page.
		var $header = $page.children(":jqmData(role=header)");

		// Find the h1 element in the header and inject the hostname from the url.
		$header.find("h1").html(getHostname(qrUrl));
		
		// Get the content area element for the page.
		var $content = $page.children(":jqmData(role=content)");

		// The markup we are going to inject into the content area of the page.
		var markup = "<img class='center' src=https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" + qrUrl + " alt=" + qrUrl + " />";

		// Inject the QR code markup into the content element.
		$content.html(markup);

		// Make sure the url displayed in the the browser's location field includes parameters
		options.dataUrl = urlObj.href;

		// Now call changePage() and tell it to switch to the page we just modified.
		$.mobile.changePage($page, options);
	}
}

// Extract hostname from a url.
function getHostname(url) {
	return decodeURIComponent(url).replace(/.*\/\//, "").replace(/\/.*$/, "");
}
