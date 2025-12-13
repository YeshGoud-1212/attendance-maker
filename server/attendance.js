// attendance.js
import puppeteer from "puppeteer-core";
import axios from "axios";
import * as cheerio from "cheerio";

export async function getAttendance(username, password) {
    console.log("🚀 Launching browser...");

    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://automation.vnrvjiet.ac.in/eduprime3", { waitUntil: "networkidle2" });

    // LOGIN
    await page.type('input[name="username"]', username);
    await page.type('input[name="xpassword"]', password);

    await Promise.all([
        page.keyboard.press("Enter"),
        page.waitForNavigation({ waitUntil: "networkidle2" })
    ]);

    console.log("✅ Logged in!");

    // GET COOKIES
    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    // FIRST CALL → RETURNS semester dropdown
    const firstApi =
        "https://automation.vnrvjiet.ac.in/EduPrime3/Academic/Helper/GetStdAttPer?studentId=0&semId=0";

    const headers = {
        Cookie: cookieHeader,
        "X-Requested-With": "XMLHttpRequest",
        Referer: "https://automation.vnrvjiet.ac.in/EduPrime3/VNRVJIET/App",
        "User-Agent": "Mozilla/5.0"
    };

    console.log("📡 Fetching SEMESTERS...");
    const firstResp = await axios.get(firstApi, { headers });

    const dataHtml = firstResp.data?.Data || "";
    const $ = cheerio.load(dataHtml);

    // Extract semId from dropdown
    const semId = $("#StdSemPop option[selected]").val();

    if (!semId) throw new Error("❌ Unable to detect semId — ERP changed HTML");

    console.log("🎯 semId detected:", semId);

    // SECOND CALL – REAL ATTENDANCE
    const attendanceApi =
        `https://automation.vnrvjiet.ac.in/EduPrime3/Academic/Helper/GetStdAttPer?studentId=0&semId=${semId}`;

    console.log("📡 Fetching attendance...");
    const resp = await axios.get(attendanceApi, { headers });

    const html = resp.data?.Data || "";
    const $$ = cheerio.load(html);

    // SUBJECT WISE
    const subjects = [];
    $$("table tr").each((i, row) => {
        const cols = $$(row).find("td, th");
        if (cols.length === 3 && i > 0) {
            const sub = $$(cols[0]).text().trim();
            const cum = $$(cols[2]).text().trim();
            if (!sub || sub === "Total") return;
            const [att, tot] = cum.split("/").map(x => parseInt(x.trim()));
            subjects.push({ subject: sub, attended: att, total: tot });
        }
    });

    // TOTAL
    const totalRow = $$("table tr").last().find("td").last().text();
    const [pastAttended, pastTotal] = totalRow.split("(")[0].split("/").map(x => parseInt(x.trim()));

    await browser.close();

    return {
        semId,
        pastAttended,
        pastTotal,
        subjects
    };
}
