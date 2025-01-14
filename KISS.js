{
	"translatorID": "9e92e8b4-a906-469f-97d1-6303f80cb918",
	"label": "KISS",
	"creator": "go00od",
	"target": "^https?://(?:[^/]+\\.)?kiss\\.kstudy\\.com(?:-[^/]+)?/Detail/Ar\\?key=\\d+(&.+)?$",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-01-03 03:00:12"
}

  
  function detectWeb(doc, url) {
	  // This function checks the URL and returns the type of item
	  if (url.includes('/Detail/Ar?key=')) {
		  return "journalArticle"; // Matches journal articles
	  }
	  return false; // If not matched, return false
  }
  
  function doWeb(doc, url) {
	  scrape(doc, url); // Calls the scrape function to extract data
  }
  
  function scrape(doc, url) {
	  let item = new Zotero.Item("journalArticle");
  
	  // Metadata extraction logic
	  item.title = ZU.xpathText(doc, '//meta[@name="citation_title"]/@content');
	let author = ZU.xpathText(doc, '//meta[@name="citation_author"]/@content');
	if (!author) {
		// If meta author is missing, fallback to class="author mb-1"
		let authorElements = doc.querySelectorAll('.author.mb-1');
		if (authorElements.length > 0) {
			author = Array.from(authorElements).map(el => el.textContent.trim()).join(', ');
		}
	}

	if (author) {
		let authors = author.split(',');
		authors.forEach(author => {
			item.creators.push(ZU.cleanAuthor(author.trim(), "author"));
		});
	}

	  item.date = ZU.xpathText(doc, '//meta[@name="citation_year"]/@content');
	  item.seriesTitle = ZU.xpathText(doc, '//meta[@name="citation_journal_title"]/@content');
	  item.publicationTitle = ZU.xpathText(doc, '//meta[@name="citation_publisher"]/@content');
	  item.volume = ZU.xpathText(doc, '//meta[@name="citation_volume"]/@content');
	  item.issue = ZU.xpathText(doc, '//meta[@name="citation_issue"]/@content');
	  item.pages = ZU.xpathText(doc, '//meta[@name="citation_firstpage"]/@content') + "-" +
				   ZU.xpathText(doc, '//meta[@name="citation_lastpage"]/@content');
	  item.ISSN = ZU.xpathText(doc, '//meta[@name="citation_issn"]/@content');
  
	  // Attach the URL
	  item.url = url;
  
	  // Abstracts
	  let korAbst = text(doc, '#korAbst');
	  let engAbst = text(doc, '#engAbst');
	  item.abstractNote = korAbst || engAbst || "";
  
	  // Complete the item
	  item.complete();
  }
  
  function text(doc, selector, attr) {
	  let el = doc.querySelector(selector);
	  return el ? (attr ? el.getAttribute(attr) : el.textContent.trim()) : null;
  }

