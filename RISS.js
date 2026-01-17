{
	"translatorID": "e05a0077-b156-4235-8d2c-fbcb7ae164e3",
	"label": "RISS",
	"creator": "go00od",
	"target": "^https?:\\/\\/.*riss\\.kr\\/.*search\\/detail\\/DetailView",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2026-01-17 13:07:55"
}

function detectWeb(doc, url) {
	const rissPattern = /^https?:\/\/(m\.riss\.kr|www\.riss\.kr|www-riss-kr-ssl\.[^\/]+)\/search\/detail\/DetailView/;
	
	if (!rissPattern.test(url)) {
		return false;
	}

	let typeMatch = url.match(/p_mat_type=([^&]+)/);
	
	if (typeMatch) {
		let pMatType = typeMatch[1];
		
		if (pMatType === "be54d9b8bc7cdb09") {
			return "thesis"; // 학위논문
		}
		else if (pMatType === "d7345961987b50bf") {
			return "book"; // 단행본
		}
		else if (pMatType === "1a0202e37d52c72d") {
			return "journalArticle"; // 학술지논문
		}
	}
	
	return false;
}

function doWeb(doc, url) {
	let type = detectWeb(doc, url);
	
	if (type === "thesis") {
		scrapeThesis(doc, url);
	} else if (type === "book") {
		scrapeBook(doc, url);
	} else if (type === "journalArticle") {
		scrapeJournal(doc, url);
	}
}

// ============================================================
// 1. 학위논문 (Thesis)
// ============================================================
function scrapeThesis(doc, url) {
	let item = new Zotero.Item("thesis");
	item.url = url;

	let titleElement = doc.querySelector('h3.title');
	if (titleElement) {
		let rawTitle = titleElement.textContent.trim();
		let titleParts = rawTitle.split('=');
		item.title = titleParts[0].trim();
	}

	let authorElement = doc.querySelector('a.instituteInfo');
	if (authorElement) {
		item.creators.push({
			lastName: authorElement.textContent.trim(),
			creatorType: "author"
		});
	}

	let degreeInfoSpan = Array.from(doc.querySelectorAll('span.strong')).find(el => el.textContent.includes("학위논문사항"));
	if (degreeInfoSpan) {
		let degreeInfo = degreeInfoSpan.parentElement.querySelector('div > p');
		if (degreeInfo) {
			let degreeType = degreeInfo.textContent.match(/박사|석사/);
			if (degreeType) {
				item.thesisType = degreeType[0];
			}
			let universityElement = degreeInfo.querySelector('a');
			if (universityElement) {
				item.university = universityElement.textContent.split(' ')[0].trim(); 
			}
		}
	}

	let publicationYearSpan = Array.from(doc.querySelectorAll('span.strong')).find(el => el.textContent.includes("발행연도"));
	if (publicationYearSpan) {
		let yearInfo = publicationYearSpan.parentElement.querySelector('div > p');
		if (yearInfo) {
			item.date = yearInfo.textContent.trim(); 
		}
	}

	item.libraryCatalog = "RISS";
	item.complete();
}

// ============================================================
// 2. 단행본 (Book)
// ============================================================
function scrapeBook(doc, url) {
	let item = new Zotero.Item("book");
	
	let urlMeta = doc.querySelector('meta[property="og:url"]');
	item.url = urlMeta ? urlMeta.content.trim() : url;

	item.libraryCatalog = "RISS"; 

	let titleMeta = doc.querySelector('meta[name="DC.Title"]');
	if (titleMeta) {
		item.title = titleMeta.content.trim();
	}

	let authorMeta = doc.querySelector('meta[name="DC.Creator"]');
	if (authorMeta) {
		let rawAuthor = authorMeta.content;
		let cleanAuthor = rawAuthor.split('▼')[0].trim();
		item.creators.push({
			lastName: cleanAuthor,
			creatorType: "author"
		});
	}

	let publisherMeta = doc.querySelector('meta[name="DC.Publisher"]');
	if (publisherMeta) {
		let pubContent = publisherMeta.content;
		let parts = pubContent.split(':');
		
		if (parts.length > 1) {
			item.place = parts[0].trim(); 
			let publisherPart = parts[1].trim();
			let pubName = publisherPart.split(',')[0].trim();
			item.publisher = pubName;
		} else {
			item.publisher = pubContent.trim();
		}
	}

	let dateMeta = doc.querySelector('meta[name="DC.Date"]');
	if (dateMeta) {
		item.date = dateMeta.content.trim();
	}

	item.complete();
}

// ============================================================
// 3. 학술지 논문 (Journal Article) 
// ============================================================
function scrapeJournal(doc, url) {
    let item = new Zotero.Item("journalArticle");
    item.libraryCatalog = "RISS";

    // 1. 메타 태그 정보 (URL, 제목, 저자, 날짜)
    let urlMeta = doc.querySelector('meta[property="og:url"]');
    item.url = urlMeta ? urlMeta.content.trim() : url;

    let titleMeta = doc.querySelector('meta[name="DC.Title"]');
    if (titleMeta) item.title = titleMeta.content.trim();

    let authorMeta = doc.querySelector('meta[name="DC.Creator"]');
    if (authorMeta) {
        item.creators.push({
            lastName: authorMeta.content.trim(),
            creatorType: "author"
        });
    }

    let dateMeta = doc.querySelector('meta[name="DC.Date"]');
    if (dateMeta) item.date = dateMeta.content.trim();
    
    // 2. 학회명 (Publisher) -> publicationTitle
    let publisherMeta = doc.querySelector('meta[name="DC.Publisher"]');
    if (publisherMeta) {
        item.publicationTitle = publisherMeta.content.trim();
    }

    // 3. 학술지명 (Journal Name) -> seriesTitle
    let journalElement = doc.querySelector('a.text.mgb7');
    if (journalElement) {
        let rawJournal = journalElement.textContent.replace(/\s+/g, " ").trim();
        item.seriesTitle = rawJournal.replace(/\s*\(.*?\)/g, "").trim();
    }

    // 4. 권/호 (Volume & Issue)
    let volIssueElement = Array.from(doc.querySelectorAll('div.infoDetail ul li div p a'))
        .find(el => el.textContent.includes("Vol") || el.textContent.includes("No"));

    if (volIssueElement) {
        let text = volIssueElement.textContent.replace(/\s+/g, " ").trim();
        text = text.replace(/\[.*?\]/g, "").trim();

        let volMatch = text.match(/Vol\.([^\s]*)/i);
        let noMatch = text.match(/No\.([^\s]*)/i);

        let volVal = volMatch ? volMatch[1].trim() : null;
        let noVal = noMatch ? noMatch[1].trim() : null;

        if (volVal === '-') volVal = null;
        if (noVal === '-') noVal = null;

        let values = [];
        if (volVal) values.push(volVal);
        if (noVal) values.push(noVal);

        if (values.length === 2) {
            item.volume = values[0];
            item.issue = values[1];
        } else if (values.length === 1) {
            item.volume = values[0];
        }
    }

    // 5. 페이지 (Pages) 
    let pageLabel = Array.from(doc.querySelectorAll('li > span.strong'))
                         .find(el => el.textContent.trim() === "페이지");

    if (pageLabel) {
        let pageP = pageLabel.parentElement.querySelector('div > p');
        if (pageP) {
            let rawPage = pageP.textContent.replace(/\s+/g, " ").trim();
            item.pages = rawPage.replace(/\s*\(.*?\)/g, "").trim();
        }
    } else {
        // 백업 로직
        let backupPageElement = Array.from(doc.querySelectorAll('div.infoDetail ul li div p'))
            .find(el => (el.textContent.includes("쪽)") || /\d+-\d+/.test(el.textContent)) 
                        && !el.textContent.includes("Vol") 
                        && !el.textContent.includes("No"));
        
        if (backupPageElement) {
            let rawPage = backupPageElement.textContent.replace(/\s+/g, " ").trim();
            item.pages = rawPage.replace(/\s*\(.*?\)/g, "").trim();
        }
    }

    item.complete();
}

function text(doc, selector, attr) {
	let el = doc.querySelector(selector);
	return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
}


