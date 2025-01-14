{
	"translatorID": "bd8145f0-331a-4fe9-b088-2129410ff048",
	"label": "earticle",
	"creator": "go00od",
	"target": "^https?://(.*\\.)?earticle\\.net/Article/.+",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-14 09:15:37"
}

function detectWeb(doc, url) {
	// URL이 www.earticle.net을 포함하고 /Article/이 포함된 경우에만 작동
	if (url.includes('www.earticle.net') && url.includes('/Article/')) {
		return "journalArticle"; // 논문으로 처리
	}
	return false; // 해당하지 않으면 false 반환
}

function doWeb(doc, url) {
	scrape(doc, url); // 데이터를 추출하는 scrape 함수 호출
}

function scrape(doc, url) {
	let item = new Zotero.Item("journalArticle"); // 논문 항목 생성

	// 제목 추출
	let titleElement = doc.querySelector('meta[name="citation_title"]');
	if (titleElement) {
		item.title = titleElement.getAttribute("content").trim();
	}

	// 저자 추출
	let authors = doc.querySelectorAll('meta[name="citation_author"]');
	for (let author of authors) {
		item.creators.push(ZU.cleanAuthor(author.getAttribute("content").trim(), "author"));
	}

	// 저널 이름 추출(seriesTitle)
	let journal = doc.querySelector('meta[name="citation_journal_title"]');
	if (journal) {
		item.seriesTitle = journal.getAttribute("content").trim();
	}

	// 학회 이름 추출
	let publicationElement = doc.querySelector('a[href^="/Publisher/Detail/"]');
	if (publicationElement) {
		item.publicationTitle = publicationElement.getAttribute("title").trim();
	} else {
		Zotero.debug("Journal name not found!");
	}

	// 발행 연도 추출
	let date = doc.querySelector('meta[name="citation_publication_date"]');
	if (date) {
		item.date = date.getAttribute("content").trim();
	}

	// 권(volume) 추출
	let volume = doc.querySelector('meta[name="citation_volume"]');
	if (volume) {
		item.volume = volume.getAttribute("content").trim();
	}

	// 페이지 범위 추출
	let pagesStart = doc.querySelector('meta[name="citation_firstpage"]');
	let pagesEnd = doc.querySelector('meta[name="citation_lastpage"]');
	if (pagesStart && pagesEnd) {
		item.pages = `${pagesStart.getAttribute("content").trim()}-${pagesEnd.getAttribute("content").trim()}`;
	}

	// 키워드 추출
	let keywords = doc.querySelector('meta[name="citation_keywords"]');
	if (keywords) {
		item.tags = keywords.getAttribute("content").split(/[,;]/).map(tag => tag.trim());
	}

	// 요약(abstract) 추출
	let abstract = doc.querySelector('meta[name="citation_abstract"]');
	if (abstract) {
		item.abstractNote = abstract.getAttribute("content").trim();
	}

	// ISSN 추출
	let issn = doc.querySelector('meta[name="citation_issn"]');
	if (issn) {
		item.ISSN = issn.getAttribute("content").trim();
	}

	// URL 설정
	item.url = url;

	// 아이템 완료
	item.complete();
}

