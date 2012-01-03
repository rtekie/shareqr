// Refresh home page using dynamic url list.
$(document).ready(function() {
	$.mobile.changePage("#home");
});

// Listen for any attempts to call changePage().
$(document).bind( "pagebeforechange", function(e, data) {
	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
	if (typeof data.toPage === "string") {
		// We only want to handle a subset of URLs.
		var u = $.mobile.path.parseUrl(data.toPage);
		var home = /^#home/;
		var qrcode = /^#qrcode/;
		var delurl = /^#delurl/;
		if (u.hash.search(home) !== -1) {
			// Display a list of URLs.
			showUrlList(u, data.options);
			e.preventDefault();
		}
		else if (u.hash.search(qrcode) !== -1) {
			// Display QR code for the selected URL.
			showQRCode(u, data.options);
			e.preventDefault();
		}
		else if (u.hash.search(delurl) !== -1) {
			// Display URL delete confirmation dialog box.
			showDelUrl(u, data.options);
			e.preventDefault();
		}
	}
});

// When a new url is added, save it in the local storage and display the home page.
$("#addurl").live("submit" , function(e, data) {
	var url = $("#url").val();
	addUrl(url);
	$.mobile.changePage("#home");
	return false;
});

// When a url is deleted, remove it from the local storage and display the home page.
$("#delurl").live("submit" , function(e, data) {
	var url = $("#url_value").val();
	delUrl(url);
	$.mobile.changePage("#home");
	return false;
});

// Display a list of urls you want to share.
function showUrlList(urlObj, options) {
	// Get list of urls
	var myUrls = getMyUrls();

	// Get the page we are going to write our content into.
	var $page = $("#home");
	// Get the content area element for the page.
	var $content = $page.children(":jqmData(role=content)");

	// Build the list of urls.
	var markup = "<ul data-role='listview' data-split-icon='delete'>";
  for (var i=0; i<myUrls.length; i++) {
		markup = markup + "<li><a href='#qrcode?url=" + myUrls[i] + "'>" + getHostname(myUrls[i]) + "</a>" + "<a href='#delurl?url=" + myUrls[i] + "' data-rel='dialog'>Delete</a></li>";
  }	
	markup = markup + "</ul>";
	// Inject the list markup into the content element.
	$content.html(markup);

	// Pages are lazily enhanced. We call page() on the page
	// element to make sure it is always enhanced before we
	// attempt to enhance the listview markup we just injected.
	$page.page();

	// Enhance the listview we just injected.
	$content.find( ":jqmData(role=listview)" ).listview();
	
	// Now call changePage() and tell it to switch to the page we just modified.
	$.mobile.changePage($page, options);
}

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

// Display Delete URL confirmation dialog for a specific url passed in as a parameter.
function showDelUrl(urlObj, options) {
	// Get the url parameter
	var url = decodeURIComponent(urlObj.hash.replace(/.*url=/, ""));
	
	// The pages we use to display our content are already in
	// the DOM. The id of the page we are going to write our
	// content into is specified in the hash before the '?'.
	var	pageSelector = urlObj.hash.replace(/\?.*$/, "");

	// Get the page we are going to write our content into.
	var $page = $(pageSelector);

	// Get the content area element for the page.
	var $content = $page.children(":jqmData(role=content)");

	// Set url elements of the page.
	$content.find("#url_value").val(url);
	$content.find("#url_prompt").html(getHostname(url));	

	// Pages are lazily enhanced. We call page() on the page
	// element to make sure it is always enhanced.
	$page.page();

	// Now call changePage() and tell it to switch to the page we just modified.
	$.mobile.changePage($page, options);
}

// Extract hostname from a url.
function getHostname(url) {
	return decodeURIComponent(url).replace(/.*\/\//, "").replace(/\/.*$/, "");
}

// Retrieve a list of URLs from the local storage. 
// Use defaults if storage has not been initialized yet.
// URLs are serialized using JSON for storage.
function getMyUrls() {
	var myUrls;
	var storedUrls = localStorage.getItem("myUrls");
	if (storedUrls) {
		// Deserialize URLs
		myUrls = JSON.parse(storedUrls);
	}
	else {
		// Initialize defaults
		myUrls = [encodeURIComponent("http://ctoinsights.wordpress.com"), encodeURIComponent("http://www.book-current.com")];
		localStorage.setItem("myUrls", JSON.stringify(myUrls));
	}
	return myUrls;
}

// Find URL in the url list.
// Return index or -1 if not found.
function findUrl(url) {
	var index = -1;
	var myUrls = getMyUrls();
	for (var i=0; i < myUrls.length; i++) {
		if (myUrls[i] === encodeURIComponent(url)) {
			return i;
		}
	}
	return index;
}

// Add a URL to the list.
function addUrl(url) {
	var myUrls = getMyUrls();
	// Check for duplicates
	if (findUrl(url) === -1) {
		myUrls = myUrls.concat(encodeURIComponent(url));
		localStorage.setItem("myUrls", JSON.stringify(myUrls));
	}
}

// Delete URL from the list.
function delUrl(url) {
	var myUrls = getMyUrls();
	var index = findUrl(url);	
	if (index !== -1) {
		myUrls.splice(index, 1);
		localStorage.setItem("myUrls", JSON.stringify(myUrls));
	}	
}
