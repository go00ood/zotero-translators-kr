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
	"lastUpdated": "2026-05-14 00:00:02"
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

/**
 * DBpia 상세 페이지에서 메타데이터를 추출하고 보정합니다.
 */
function scrape(doc, url) {
	var translator = Zotero.loadTranslator('web');
	// Embedded Metadata 번역기 사용 (citation_ 태그 기반)
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function (obj, item) {
		// 1. URL 보정 로직 (기존 유지)
		let nodeIdMatch = url.match(/[?&]nodeId=([^&#]+)/);
		if (nodeIdMatch) {
			let nodeId = nodeIdMatch[1];
			let proxyPattern = /\.access\.[a-z]+\.[a-z]+/;
			if (!proxyPattern.test(url)) {
				item.url = `https://www.dbpia.co.kr/journal/articleDetail?nodeId=${nodeId}`;
			} else {
				item.url = url; 
			}
		}

		// 메타 태그 추출 도우미 함수 (content.js 로직 반영)
		function getMetaContent(name) {
			return doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.content?.trim() || "";
		}

		// 2. 학술지명 (seriesTitle) 보정
		// 메타 태그(citation_journal_title)를 우선하고, 없으면 CSS 셀렉터로 찾습니다.
		let seriesTitle = getMetaContent("citation_journal_title") || 
						  doc.querySelector('.journalList__link[href*="publicationDetail"]')?.textContent?.trim();
		if (seriesTitle) {
			item.seriesTitle = seriesTitle;
		}

		// 3. 발행기관/학회명 (publicationTitle) 보정
		// 메타 태그(publisher)를 우선하고, 없으면 CSS 셀렉터로 찾습니다.
		let publicationTitle = getMetaContent("publisher") || 
							   doc.querySelector('.journalList__link[href*="iprdDetail"]')?.textContent?.trim();
		if (publicationTitle) {
			item.publicationTitle = publicationTitle;
		}

		// 4. 발행 연도 보정 (필요 시)
		if (!item.date) {
			item.date = getMetaContent("citation_publication_date")?.substring(0, 4);
		}

		item.complete();
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

/** BEGIN TEST CASES **/
var testCases = [
]
/** END TEST CASES **/
