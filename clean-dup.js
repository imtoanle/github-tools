const fs = require('fs');
const path = require('path');

const inputFile = 'urls.txt';
const outputFile = 'cleaned_urls.txt';

const readUrlsFromFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data.split(/\r?\n/));
        });
    });
};

const writeUrlsToFile = (urls, filePath) => {
    const data = urls.join('\n');
    fs.writeFile(filePath, data, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Cleaned URLs have been saved to ${filePath}`);
        }
    });
};

const cleanUrls = (urls) => {
    const urlSet = new Set();
    const regex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+$/;

    urls.forEach(url => {
        if (regex.test(url.trim())) {
            urlSet.add(url.trim());
        }
    });

    return [...urlSet];
};

const main = async () => {
    try {
        const urls = await readUrlsFromFile(inputFile);
        const cleanedUrls = cleanUrls(urls);
        writeUrlsToFile(cleanedUrls, outputFile);
    } catch (error) {
        console.error('Error processing the URLs:', error);
    }
};

main();
