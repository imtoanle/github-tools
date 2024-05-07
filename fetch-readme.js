require('dotenv').config()

const axios = require('axios');
const fs = require('fs');
const path = require('path');
console.log(process.env.GITHUB_TOKEN)
const inputFile = 'urls.txt';  // File containing GitHub URLs
const failedUrls = [];

const downloadReadme = async (repoUrl, branchName = 'main') => {
    let username, repoName;
    try {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) throw new Error('Invalid GitHub repository URL');

        username = match[1];
        repoName = match[2];
        const rawUrl = `https://api.github.com/repos/${username}/${repoName}/contents/README.md`;
        
        
        const axiosInstance = axios.create({
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });

        
        const response = await axiosInstance.get(rawUrl);
        
        if (response.status === 200) {
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            const dir = './readmes';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(path.join(dir, `${username}-${repoName}-README.md`), content);
            console.log(`Downloaded README for ${repoName}`);
        } else {
            throw new Error(`Failed to download with status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error downloading README from both main and master branches for ${repoUrl}: ${error}`);
        failedUrls.push(repoUrl);
        // if (branchName === 'main') {
        //     console.log(`Failed to download README from main branch, trying master branch for ${repoName}`);
        //     await downloadReadme(repoUrl, 'master');
        // } else {
        //     console.error(`Error downloading README from both main and master branches for ${repoUrl}: ${error}`);
        //     failedUrls.push(repoUrl);
        // }
    }
};

const readUrlsAndDownload = async () => {
    try {
        const data = fs.readFileSync(inputFile, 'utf8');
        const urls = data.split(/\r?\n/).filter(line => line.trim() !== '');  // Remove empty lines
        const uniqueUrls = new Set(urls);  // Remove duplicates

        for (const url of uniqueUrls) {
            await downloadReadme(url);
        }

        if (failedUrls.length > 0) {
            console.log('Failed to download README from the following URLs:');
            failedUrls.forEach(url => console.log(url));
        } else {
            console.log('All README files downloaded successfully.');
        }
    } catch (error) {
        console.error('Error processing the URLs:', error);
    }
};

readUrlsAndDownload();
