import requests
import json

def test_searx():
    instances = [
        "https://searx.be",
        "https://search.bus-hit.me",
        "https://opensearch.vnet.name"
    ]
    
    query = "osint tools"
    
    for url in instances:
        print(f"Testing {url}...")
        try:
            # Searx API format: /search?q=...&format=json
            resp = requests.get(
                f"{url}/search",
                params={"q": query, "format": "json", "language": "en"},
                timeout=5
            )
            
            if resp.status_code == 200:
                data = resp.json()
                results = data.get('results', [])
                print(f"Success! Found {len(results)} results.")
                if results:
                    print(f"Sample: {results[0].get('title')} - {results[0].get('url')}")
                break
            else:
                print(f"Failed: {resp.status_code}")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_searx()
