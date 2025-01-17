{
	"translatorID": "1a1d0bd8-7164-4b71-9509-a8b7c5e061b3",
	"label": "scholar",
	"creator": "go00od",
	"target": "^https?://(.*\\.)?scholar\\.kyobobook\\.co\\.kr/article/detail/.+",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-14 08:56:44"
}

function detectWeb(doc, url) {
	// scholar.kyobobook.co.kr 도메인에서 동작
	if (url.includes('scholar.kyobobook.co.kr') && url.includes('/article/detail/')) {
		return "journalArticle"; // 논문 처리
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
	} else {
		Zotero.debug("Title not found!");
		throw new Error("No title specified for item");
	}

	// 저자 추출
	let authorElements = doc.querySelectorAll('meta[name="citation_author"]');
	if (authorElements.length > 0) {
		authorElements.forEach(authorElement => {
			item.creators.push(ZU.cleanAuthor(authorElement.getAttribute("content").trim(), "author"));
		});
	}
	
	// 학회 이름 추출
	let seriesTitleElement = doc.querySelector('meta[name="citation_journal_title"]');
	if (seriesTitleElement) {
		item.seriesTitle = seriesTitleElement.getAttribute("content").trim();
	} else {
		Zotero.debug("Series title not found!");
	}


	// 저널 이름 추출
	let journalElement = doc.querySelector('#academyTitle');
	if (journalElement) {
		item.publicationTitle = journalElement.textContent.trim(); // 텍스트 콘텐츠를 가져옴
	} else {
		Zotero.debug("Publication title not found!");
	}




	// 발행 연도 추출
	let dateElement = doc.querySelector('meta[name="citation_publication_date"]');
	if (dateElement) {
		item.date = dateElement.getAttribute("content").trim();
	}

	// 권(volume) 추출
	let volumeElement = doc.querySelector('meta[name="citation_volume"]');
	if (volumeElement) {
		item.volume = volumeElement.getAttribute("content").trim();
	}

	// 호(issue) 추출 - 존재 여부 확인
	let issueElement = doc.querySelector('meta[name="citation_issue"]');
	if (issueElement && issueElement.getAttribute("content")) {
		item.issue = issueElement.getAttribute("content").trim();
	} else {
		Zotero.debug("Issue not found, skipping...");
	}

	// 페이지 범위 추출
	let startPageElement = doc.querySelector('meta[name="citation_firstpage"]');
	let endPageElement = doc.querySelector('meta[name="citation_lastpage"]');
	if (startPageElement && endPageElement) {
		item.pages = `${startPageElement.getAttribute("content").trim()}-${endPageElement.getAttribute("content").trim()}`;
	} else {
		Zotero.debug("Page range not found, skipping...");
	}

	// 키워드 추출
	let keywordsElement = doc.querySelector('meta[name="citation_keywords"]');
	if (keywordsElement) {
		item.tags = keywordsElement.getAttribute("content").split(/[,;]/).map(tag => tag.trim());
	}

	// 요약(abstract) 추출
	let abstractElement = doc.querySelector('meta[name="citation_abstract"]');
	if (abstractElement) {
		item.abstractNote = abstractElement.getAttribute("content").trim();
	}

	// ISSN 추출
	let issnElement = doc.querySelector('meta[name="citation_issn"]');
	if (issnElement) {
		item.ISSN = issnElement.getAttribute("content").trim();
	}

	// URL 설정
	item.url = url;

	// 아이템 완료
	item.complete();
}

