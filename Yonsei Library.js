{
	"translatorID": "0a21bfc2-b822-4207-8567-a560eb961c69",
	"label": "Yonsei Library",
	"creator": "go00od",
	"target": "^https:\\/\\/library\\.yonsei\\.ac\\.kr\\/search\\/detail\\/CATTOT",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-03 02:34:28"
}

function detectWeb(doc, url) {
    if (url.includes('/search/detail/')) {
        return "book"; // 도서 타입
    }
    return false;
}

function getSearchResults(doc, checkOnly) {
    var items = {};
    var found = false;
    var rows = doc.querySelectorAll('h5 > a[href*="/search/detail/"]');
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
    let item = new Zotero.Item("book");

    // 서명/저자 사항 추출
    let titleAuthor = ZU.xpathText(doc, '//table[@id="moreInfo"]//th[text()="서명/저자사항"]/following-sibling::td');
    if (titleAuthor) {
        let [title, author] = titleAuthor.split('/');
        item.title = title.trim();
        if (author) {
            item.creators.push({
                lastName: author.trim(),
                creatorType: "author"
            });
        }
    }

    // 발행 사항 추출
    let publicationInfo = ZU.xpathText(doc, '//table[@id="moreInfo"]//th[text()="발행사항"]/following-sibling::td');
    if (publicationInfo) {
        let placeMatch = publicationInfo.match(/^(.+?):/); // 발행 장소
        let publisherMatch = publicationInfo.match(/:\s*(.+?),/); // 출판사
        let yearMatch = publicationInfo.match(/,\s*(\d{4})/); // 연도

        if (placeMatch) item.place = placeMatch[1].trim();
        if (publisherMatch) item.publisher = publisherMatch[1].trim();
        if (yearMatch) item.date = yearMatch[1].trim();
    }

    // 키워드 추출
    let keywords = ZU.xpathText(doc, '//form[@name="poArtiSearList"]//input[@name="hdnKeyWords"]/@value');
    if (keywords) {
        item.tags = keywords.split(',').map(tag => tag.trim());
    }

    // URL 저장
    item.url = url;

    // 아이템 완료
    item.complete();
}

// Helper 함수
function text(doc, selector, attr) {
    let el = doc.querySelector(selector);
    return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
}

