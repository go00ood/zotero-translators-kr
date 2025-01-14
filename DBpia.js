{
	"translatorID": "0c31f371-e012-4b1c-b793-f89ab1ae2610",
	"label": "DBpia",
	"creator": "go00od",
	"target": "^https?://[^/]+\\.dbpia\\.co\\.kr/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-02 05:42:54"
}

function detectWeb(doc, url) {
	if (url.includes('/journal/articleDetail')) {
		return "journalArticle";
	} else if ((url.includes('/search/') || url.includes('/journal/articleList/')) && getSearchResults(doc, true)) {
		return "multiple";
	}
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
		// nodeId 추출 및 처리
		let nodeId = null; // 기본값 null
		let nodeIdMatch = url.match(/[?&]nodeId=([^&#]+)/);
		if (nodeIdMatch) {
			nodeId = nodeIdMatch[1];
			item.url = `https://www.dbpia.co.kr/journal/articleDetail?nodeId=${nodeId}`;
		} else {
			item.url = url; // 기본 URL 저장
		}

				// 학술지명 (seriesTitle) 추출
		let seriesTitle = text(doc, '.journalList__link[href*="publicationDetail"]');
		if (seriesTitle) {
			item.seriesTitle = seriesTitle.trim();
		}

		// 학회명 (publicationTitle) 추출
		let publicationTitle = text(doc, '.journalList__link[href*="iprdDetail"]');
		if (publicationTitle) {
			item.publicationTitle = publicationTitle.trim();
		}

		// PDF 다운로드 처리
		if (nodeId) {
			let downloadDataURL = '/download/downloadData';
			let downloadDataBody = `nodeId=${encodeURIComponent(nodeId)}&systemCode=Article&depth=Article&shape=download`;

			ZU.doPost(downloadDataURL, downloadDataBody, function (respText) {
				if (!respText || respText[0] != '{') {
					item.complete();
					return;
				}
				
				let json = JSON.parse(respText);
				if (!json.link) {
					item.complete();
					return;
				}
				
				item.attachments.push({
					url: json.link,
					title: "Full Text PDF",
					mimeType: "application/pdf"
				});
				item.complete();
			});
		} else {
			// nodeId가 없는 경우 완료 처리
			item.complete();
		}
	});

	translator.getTranslatorObject(function(trans) {
		trans.itemType = "journalArticle";
		trans.doWeb(doc, url);
	});
}

