from duckduckgo_search import DDGS
import json
import time

def test_search():
    print("Testing 'html' backend...")
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text("python programming", max_results=3, backend="html"):
                results.append(r)
        print(f"Found {len(results)} results (html)")
    except Exception as e:
        print(f"Error (html): {e}")

    time.sleep(2)

    print("Testing 'lite' backend...")
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text("python programming", max_results=3, backend="lite"):
                results.append(r)
        print(f"Found {len(results)} results (lite)")
    except Exception as e:
        print(f"Error (lite): {e}")

if __name__ == "__main__":
    test_search()
