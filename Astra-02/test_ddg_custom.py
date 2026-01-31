import requests
from bs4 import BeautifulSoup

def test_ddg_html():
    url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    data = {
        "q": "osint tools"
    }
    
    print("Testing DDG HTML with headers...")
    try:
        resp = requests.post(url, data=data, headers=headers)
        if resp.status_code == 200:
            print("Success!")
            soup = BeautifulSoup(resp.text, 'html.parser')
            results = soup.find_all('div', class_='result')
            print(f"Found {len(results)} results")
            for res in results[:2]:
                title_tag = res.find('a', class_='result__a')
                snippet_tag = res.find('a', class_='result__snippet')
                
                if title_tag:
                    print(f"Title: {title_tag.text}")
                    print(f"URL: {title_tag['href']}")
                if snippet_tag:
                    print(f"Snippet: {snippet_tag.text}")
                print("-" * 20)
        else:
            print(f"Failed: {resp.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ddg_html()
