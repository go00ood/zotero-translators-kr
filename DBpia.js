{
	"translatorID": "0c31f371-e012-4b1c-b793-f89ab1ae2610",
	"label": "DBpia",
	"creator": "go00od",
	"target": "^https?://.*dbpia.*journal.*articleDetail.*",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-02-28 06:04:31"
}

function detectWeb(doc, url) {
	Zotero.debug("Checking URL: " + url);

	if (url.match(/dbpia.*journal.*articleDetail/i)) {
		Zotero.debug("Matched as journalArticle");
		return "journalArticle";
	}

	Zotero.debug("No match found");
	return false;
}


function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var rows = doc.querySelectorAll('h5 > a[href*="/journal/articleDetail"]');
	for (let row of rows) {
		var href = row.href;
		var title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) {
				return;
			}
			ZU.processDocuments(Object.keys(items), scrape);
		});
	} else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');
	translator.setHandler('itemDone', function (obj, item) {
		let nodeId = null;
		let nodeIdMatch = url.match(/[?&]nodeId=([^&#]+)/);
		if (nodeIdMatch) {
			nodeId = nodeIdMatch[1];

			let proxyPattern = /\.access\.[a-z]+\.[a-z]+/;
			if (proxyPattern.test(url)) {
				item.url = url; // 프록시 주소 유지
			} else {
				item.url = `https://www.dbpia.co.kr/journal/articleDetail?nodeId=${nodeId}`;
			}
		} else {
			item.url = url;
		}

		let seriesTitle = text(doc, '.journalList__link[href*="publicationDetail"]');
		if (seriesTitle) {
			item.seriesTitle = seriesTitle.trim();
		}

		let publicationTitle = text(doc, '.journalList__link[href*="iprdDetail"]');
		if (publicationTitle) {
			item.publicationTitle = publicationTitle.trim();
		}

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

