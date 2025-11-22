const fs = require("fs");
const path = require("path");

const sitemapPath = path.join(process.cwd(), "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  console.log("sitemap.xml not found, skipping");
  process.exit(0);
}

let xml = fs.readFileSync(sitemapPath, "utf8");
const now = new Date().toISOString().split("T")[0];

if (xml.includes("<lastmod>")) {
  xml = xml.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${now}<\/lastmod>`);
} else {
  // Insert lastmod after first <loc>
  xml = xml.replace(/(<loc>[^<]+<\/loc>)/, `$1\n    <lastmod>${now}</lastmod>`);
}

fs.writeFileSync(sitemapPath, xml, "utf8");
console.log("Updated sitemap lastmod to", now);
