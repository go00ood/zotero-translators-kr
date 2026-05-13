{
	"translatorID": "bd8145f0-331a-4fe9-b088-2129410ff048",
	"label": "earticle",
	"creator": "go00od",
	"target": "^https?://[^/]*earticle[^/]*/.*Article.*",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2026-05-14 00:04:00"
}

function detectWeb(doc, url) {
	let hostname = new URL(url).hostname;
	if (hostname.includes('earticle') && url.match(/Article/i)) {
		return "journalArticle";
	}
	return false;
}

function doWeb(doc, url) {
	scrape(doc, url);
}

function scrape(doc, url) {
	let item = new Zotero.Item("journalArticle");

	// 메타 태그 추출 헬퍼 함수 (content.js 로직 반영: name과 property 모두 검색)
	function getMeta(name) {
		let meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
		return meta ? meta.getAttribute("content").trim() : "";
	}

	// 1. 제목
	item.title = getMeta("citation_title");

	// 2. 저자
	let authors = doc.querySelectorAll('meta[name="citation_author"]');
	for (let author of authors) {
		let authorName = author.getAttribute("content").trim();
		item.creators.push(ZU.cleanAuthor(authorName, "author"));
	}

	// 3. 학술지명 (Journal Title) -> seriesTitle에 입력
	item.seriesTitle = getMeta("citation_journal_title");

	// 4. 학회명 (Publisher/Society) -> publicationTitle에 입력
	// content.js의 방식인 a 태그 내부의 span 텍스트를 우선 추출합니다.
	let pubSpan = doc.querySelector('a[href^="/Publisher/Detail/"] span');
	if (pubSpan) {
		item.publicationTitle = pubSpan.textContent.trim();
	} else {
		// Fallback: span이 없을 경우 a 태그의 title 속성이나 텍스트를 확인합니다.
		let pubAnchor = doc.querySelector('a[href^="/Publisher/Detail/"]');
		if (pubAnchor) {
			item.publicationTitle = pubAnchor.getAttribute("title")?.trim() || pubAnchor.textContent.trim();
		}
	}

	// 5. 발행 연도 및 기타 정보
	item.date = getMeta("citation_publication_date");
	item.volume = getMeta("citation_volume");
	item.issue = getMeta("citation_issue");

	// 6. 페이지 범위
	let fPage = getMeta("citation_firstpage");
	let lPage = getMeta("citation_lastpage");
	if (fPage && lPage) {
		item.pages = `${fPage}-${lPage}`;
	} else if (fPage) {
		item.pages = fPage;
	}

	// 7. 키워드, 초록, ISSN/DOI
	let keywords = getMeta("citation_keywords");
	if (keywords) {
		item.tags = keywords.split(/[,;]/).map(tag => tag.trim());
	}
	item.abstractNote = getMeta("citation_abstract");
	item.ISSN = getMeta("citation_issn");
	item.DOI = getMeta("citation_doi");

	// 8. URL 및 설정
	item.url = url;
	item.libraryCatalog = "eArticle";

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = []
/** END TEST CASES **/
