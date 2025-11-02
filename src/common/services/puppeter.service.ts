import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeterService {
    async getEmbedMasterUrl(html: string): Promise<string | null> {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();

            // Load the given HTML content
            await page.setContent(html, { waitUntil: 'domcontentloaded' });

            // Extract the form action inside the browser context
            const embedMasterUrl = await page.evaluate(() => {
                const form = document.querySelector('form');
                return form ? form.getAttribute('action') : null;
            });

            return embedMasterUrl;
        } catch (error) {
            throw new Error(`Failed to extract form action: ${error.message}`);
        } finally {
            await browser.close();
        }
    }
}
