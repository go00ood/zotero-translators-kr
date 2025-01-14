# zotero-translators-kr
Zotero Translators for Korean academic sites including DBpia, RISS, KCI, KISS, erticle, and Scholar.  
KCI, DBpia, RISS, Scholar, eArticle, KISS와 같은 한국 학술 사이트에서 조테로를 통해 손쉽게 메타데이터를 추출할 수 있도록 돕는 Translator입니다.   
<br/>
<br/>

---

## 설치 방법  

1. **Translator 파일 다운로드**
   - 저장소에서 각 사이트별 Translator 파일(`KCI.js`, `DBpia.js` 등)을 다운로드합니다.
2. **Zotero의 Translator 디렉토리에 복사**
   - **Windows**: `C:\Users\<Username>\Zotero\translators`
   - **macOS/Linux**: `~/Zotero/translators`
3. **Zotero 재시작**
   - Zotero를 재시작하면 Translator가 적용됩니다.(적용이 안 될 경우 컴퓨터 재시작)   

---
<br/> 

## 지원 사이트 목록  

- [KCI (Korean Citation Index)](https://www.kci.go.kr)
- [DBpia](https://www.dbpia.co.kr)
- [RISS (Research Information Sharing Service)](https://www.riss.kr)
- [Scholar(교보문고 스콜라)](https://scholar.kyobobook.co.kr/main)
- [earticle](https://www.earticle.net)
- [KISS (Korean Studies Information Service System)](https://kiss.kstudy.com)
- [Yonsei Library](https://library.yonsei.ac.kr/)

(추가 예정)  

---
<br/>

## 저장 요소 (Item Type별)  

### **학술지 논문 (Journal Article): DBpia, KCI, KISS, earticle, Scholar**

| 요소            | 대상 설명                         |
|-----------------|-----------------------------------|
| **Item Type**   | 자료 유형 (Journal Article)        |
| **Title**       | 논문 제목                         |
| **Author**      | 저자                              |
| **Publication** | 학회명                            |
| **Volume**      | 권 (Volume)                       |
| **Issue**       | 호 (Issue)                        |
| **Pages**       | 페이지                            |
| **Date**        | 발행일                            |
| **Series Title**| 학술지명                          |
| **ISSN**        | 국제 표준 연속 간행물 번호 (ISSN)  |
| **URL**         | 논문 URL                          |
| **Library Catalog** | 라이브러리 카탈로그              |

<br/>

### **학위 논문 (Thesis): RISS**

| 요소                | 대상 설명                          |
|---------------------|------------------------------------|
| **Item Type**       | 자료 유형 (Thesis)                 |
| **Title**           | 논문 제목                          |
| **Author**          | 저자                               |
| **Type**            | 학위 종류 (석사, 박사)                   |
| **University**      | 소속 대학 (대학교)             |
| **Date**            | 발행일 (연도)                      |
| **URL**             | 논문 URL                           |
| **Library Catalog** | 라이브러리 카탈로그 (RISS)         |

<br/> 

### **도서 (Book): Yonsei Library**
| 요소                | 대상 설명                          |
|---------------------|------------------------------------|
| **Item Type**       | 자료 유형 (Book)                  |
| **Title**           | 책 제목                           |
| **Author**          | 저자                               |
| **Place**           | 출판된 지역                 |
| **Publisher**       | 출판사                |
| **Date**            | 출판일                      |
| **URL**             | 자료 URL                          |
| **Library Catalog** | 라이브러리 카탈로그 (Yonsei Library) |

