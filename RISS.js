{
	"translatorID": "e05a0077-b156-4235-8d2c-fbcb7ae164e3",
	"label": "RISS",
	"creator": "go00od",
	"target": "^https?:\\/\\/.*riss\\.kr\\/.*search\\/detail\\/DetailView.*p_mat_type=be54d9b8bc7cdb09",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-14 09:36:01"
}

function detectWeb(doc, url) {
	const rissPattern = /^https?:\/\/(m\.riss\.kr|www\.riss\.kr|www-riss-kr-ssl\.[^\/]+)\/search\/detail\/DetailView/;
	if (!rissPattern.test(url)) {
		return false; // URL이 패턴에 맞지 않으면 처리하지 않음
	}

	let typeMatch = url.match(/p_mat_type=([^&]+)/);
	if (typeMatch) {
		let pMatType = typeMatch[1];
		if (pMatType === "be54d9b8bc7cdb09") {
			return "thesis"; // 학위논문
		}
	}
	return false; // 해당하지 않을 경우
}

function doWeb(doc, url) {
	let type = detectWeb(doc, url);
	if (type === "thesis") {
		scrapeThesis(doc, url); // 학위논문 처리
	}
}

function scrapeThesis(doc, url) {
	let item = new Zotero.Item("thesis");

	// 1. URL 저장
	item.url = url;

	// 2. 제목 추출
	let titleElement = doc.querySelector('h3.title');
	if (titleElement) {
		let rawTitle = titleElement.textContent.trim(); // 제목 추출
		let titleParts = rawTitle.split('='); // '=' 기준으로 분리
		item.title = titleParts[0].trim(); // '=' 이전 부분 저장
	}

	// 3. 저자 추출
	let authorElement = doc.querySelector('a.instituteInfo');
	if (authorElement) {
		item.creators.push({
			lastName: authorElement.textContent.trim(), // 저자 이름
			creatorType: "author"
		});
	}

	// 4. 학위논문사항에서 석사 박사와 대학 이름 추출
	let degreeInfoSpan = Array.from(doc.querySelectorAll('span.strong')).find(el => el.textContent.includes("학위논문사항"));
	if (degreeInfoSpan) {
		let degreeInfo = degreeInfoSpan.parentElement.querySelector('div > p');
		if (degreeInfo) {
			// "박사" 추출
			let degreeType = degreeInfo.textContent.match(/박사|석사/);
			if (degreeType) {
				item.thesisType = degreeType[0]; // "박사" or "석사"
			}

			// 대학 이름 추출
			let universityElement = degreeInfo.querySelector('a');
			if (universityElement) {
				item.university = universityElement.textContent.split(' ')[0].trim(); 
			}
		}
	}

	// 5. 발행연도 추출
	let publicationYearSpan = Array.from(doc.querySelectorAll('span.strong')).find(el => el.textContent.includes("발행연도"));
	if (publicationYearSpan) {
		let yearInfo = publicationYearSpan.parentElement.querySelector('div > p');
		if (yearInfo) {
			item.date = yearInfo.textContent.trim(); 
		}
	}

	// 6. Complete the item
	item.complete();
}

// Helper function for text extraction
function text(doc, selector, attr) {
	let el = doc.querySelector(selector);
	return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
}

