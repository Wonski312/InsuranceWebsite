
import os

def fix_paths(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".kit") or file.endswith(".html"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Fix CSS/JS paths
                    new_content = content.replace('href="/dist', 'href="./dist')
                    new_content = new_content.replace('src="/dist', 'src="./dist')
                    new_content = new_content.replace('href="/favicon.ico"', 'href="favicon.ico"')
                    
                    # Fix internal links (e.g. href="/about-us.html" -> href="about-us.html")
                    # Be careful not to replace https://...
                    # We can target href="/[a-zA-Z]
                    
                    # Actually, simple string replacement for known pages is safer
                    pages = [
                        "index.html", "about-us.html", "news.html", "careers.html", 
                        "contactus.html", "propertyInsurance.html", "businessInsurance.html",
                        "vehicleInsurance.html", "travelInsurance.html", "otherInsurance.html",
                        "liabilityInsurance.html", "privacy-policy.html", "complaints.html",
                        "news-details.html", "job-details.html"
                    ]
                    
                    for page in pages:
                        new_content = new_content.replace(f'href="/{page}"', f'href="{page}"')

                    if content != new_content:
                        print(f"Fixing paths in: {file}")
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"Error processing {file}: {e}")

if __name__ == "__main__":
    fix_paths(r"c:\Users\stach\Desktop\D2S Business Folder\WEBSITE WORKS\Insurance\INSURANCE\html")
