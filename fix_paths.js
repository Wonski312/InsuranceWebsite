
const fs = require('fs');
const path = require('path');

const directoryPath = String.raw`c:\Users\stach\Desktop\D2S Business Folder\WEBSITE WORKS\Insurance\INSURANCE\html`;

function fixPaths(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(function (file) {
            const filepath = path.join(dir, file);

            if (file.endsWith('.kit') || file.endsWith('.html')) {
                fs.readFile(filepath, 'utf8', (err, content) => {
                    if (err) {
                        return console.log(err);
                    }

                    let newContent = content;

                    // Fix CSS/JS paths
                    newContent = newContent.replace(/href="\/dist/g, 'href="./dist');
                    newContent = newContent.replace(/src="\/dist/g, 'src="./dist');
                    newContent = newContent.replace(/href="\/favicon.ico"/g, 'href="favicon.ico"');

                    // Fix page links
                    const pages = [
                        "index.html", "about-us.html", "news.html", "careers.html",
                        "contactus.html", "propertyInsurance.html", "businessInsurance.html",
                        "vehicleInsurance.html", "travelInsurance.html", "otherInsurance.html",
                        "liabilityInsurance.html", "privacy-policy.html", "complaints.html",
                        "news-details.html", "job-details.html"
                    ];

                    pages.forEach(page => {
                        const regex = new RegExp(`href="/${page}"`, 'g');
                        newContent = newContent.replace(regex, `href="${page}"`);
                    });

                    if (content !== newContent) {
                        console.log(`Fixing paths in: ${file}`);
                        fs.writeFile(filepath, newContent, 'utf8', (err) => {
                            if (err) console.log(err);
                        });
                    }
                });
            }
        });
    });
}

fixPaths(directoryPath);
