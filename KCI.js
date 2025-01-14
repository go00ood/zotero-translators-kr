{
	"translatorID": "179714c7-b3a1-4dcd-8a5a-d9dc69121ff7",
	"label": "KCI",
	"creator": "tong",
	"target": "^https?://www\\.kci\\.go\\.kr/kciportal/ci/sereArticleSearch/ciSereArtiView\\.kci\\?sereArticleSearchBean\\.artiId=[A-Z0-9]+$",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-03 02:17:54"
}

function detectWeb(doc, url) {
	if (url.includes('/kciportal/ci/sereArticleSearch/ciSereArtiView.kci')) {
		return "journalArticle"; // 논문으로 처리
	}
	return false; // 해당하지 않으면 false 반환
}

function doWeb(doc, url) {
	scrape(doc, url); // 데이터를 추출하는 scrape 함수 호출
}
function scrape(doc, url) {
	let item = new Zotero.Item("journalArticle");

	// 1. Extract BibTeX data
	let bibtex = text(doc, '#BibTex');
	if (bibtex) {
		// Title
		let titleMatch = bibtex.match(/title=\{([\s\S]+?)\},/);
		if (titleMatch) item.title = titleMatch[1].trim();

		// Authors
		let authorMatch = bibtex.match(/author=\{(.+?)\}/);
		if (authorMatch) {
			let authors = authorMatch[1].split(/\s+and\s+/);
			authors.forEach(author => {
				let names = author.split(',');
				item.creators.push({
					firstName: names[1] ? names[1].trim() : "",
					lastName: names[0].trim(),
					creatorType: "author"
				});
			});
		}

		// Journal title (seriesTitle)
		let journalMatch = bibtex.match(/journal=\{(.+?)\}/);
		if (journalMatch) item.seriesTitle = journalMatch[1].trim();

		// Volume
		let volumeMatch = bibtex.match(/volume=\{(\d+)\}/);
		if (volumeMatch) item.volume = volumeMatch[1].trim();

		// Pages
		let pagesMatch = bibtex.match(/pages=\{(.+?)\}/);
		if (pagesMatch) item.pages = pagesMatch[1].trim();

		// ISSN
		let issnMatch = bibtex.match(/issn=\{(.+?)\}/);
		if (issnMatch) item.ISSN = issnMatch[1].trim();

		// Date/Year
		let yearMatch = bibtex.match(/year=\{(\d{4})\}/);
		if (yearMatch) item.date = yearMatch[1].trim();
	} else {
		Zotero.debug("No BibTeX data found");
	}

	// 2. Extract Publication Title (학회명) from <p class="pub"> > <a>
	let publicationElement = text(doc, 'p.pub a'); // <p class="pub">의 <a> 태그에서 학회명을 추출
	if (publicationElement) {
		item.publicationTitle = publicationElement.trim();
	}

	// 3. Extract keywords from <input id="hdnKeyWords">
	let keywordsElement = doc.querySelector('input[name="hdnKeyWords"]'); // 'name' 속성으로 태그 찾기
	if (keywordsElement) {
		let keywordsValue = keywordsElement.getAttribute('value'); // 'value' 속성 추출
		if (keywordsValue) {
			let keywords = keywordsValue.split(',').map(keyword => keyword.trim()); // 쉼표로 분리 후 공백 제거
			item.tags = keywords.map(keyword => ({ tag: keyword })); // Zotero 태그로 저장
		}
	} else {
		console.log("hdnKeyWords element not found!");
	}

	// 4. URL and default language
	item.url = url;
	item.language = "ko";

	// 5. Complete the item
	item.complete();
}

// Helper function to safely get text content or attribute
function text(doc, selector, attr) {
	let el = doc.querySelector(selector);
	return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
}


// Helper function to safely get text content or attribute
function text(doc, selector, attr) {
	let el = doc.querySelector(selector);
	return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
}

