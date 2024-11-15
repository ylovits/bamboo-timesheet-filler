import "jsr:@std/dotenv/load";
import puppeteer from 'puppeteer';
import { randomDelay, config, launchOptions, interruptedFunc } from "./noise.ts";

try {
	const browser = await puppeteer.launch(launchOptions);

	Deno.addSignalListener("SIGINT", async () => await interruptedFunc(browser));
	Deno.addSignalListener("SIGTERM", async () => await interruptedFunc(browser));

	const page = await browser.newPage();
	await randomDelay(3000);

	if (config.proxyUser) {
		await page.authenticate({
			username: config.proxyUser!,
			password: config.proxyPass!,
		});
	}

	await page.goto(config.bambooURL!, { waitUntil: 'domcontentloaded', timeout: 65000 });

	await page.locator('#lemail').fill(config.bambooUser!);
	await randomDelay(2000);
	await page.locator('#password').fill(config.bambooPassword!);
	await randomDelay(1000);

	await page.click('.login-actions button');
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

	await randomDelay(2000);

	// Pause until user presses the enter/return key in the terminal
	alert('After you done with the 2FA, and clicked "Continue", press enter to continue. The script handles the "No Thanks" for you');

	await randomDelay(2000);

	console.log('Clicking trust this browser');
	await page.waitForSelector('.MuiButton-outlinedSecondary');
	await page.click('.MuiButton-outlinedSecondary');
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
	await randomDelay(2000);

	console.log('Clicking "My TimeSheet"');
	await page.waitForSelector('.TimeTrackingWidget__summary-link');
	await page.click('.TimeTrackingWidget__summary-link');
	console.log('Navigating to the TimeSheet page');
	try { await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }); } catch (error) { null; }

	await page.mouse.wheel({ deltaY: 1000 });
	await randomDelay(2000);

	await page.waitForSelector('.TimesheetEntries');
	const slats = await page.$$('.TimesheetSlat:not(.TimesheetSlat--disabled):not(.TimesheetSlat--expandable)');

	console.log('Looping through available dates');
	for (const slat of slats) {
		const day = await slat.$eval('.TimesheetSlat__dayOfWeek', (el: any) => el.textContent);
		if (day == 'Sat' || day == 'Sun') {
			continue;
		}

		await slat.hover();

		const hasEntry = await slat.$('.TimesheetSlat__firstAndLast');
		if (hasEntry) {
			continue;
		}
		const hasAddEntry = await slat.$('.TimesheetSlat__addEntryLink');

		if (hasAddEntry) {
			await hasAddEntry.click();
		}

		await page.waitForSelector('.legacyModal__main');

		await fillTimeEntry(page, config.startTime!, config.endTime!);
	}

	// close the browser
	await browser.close();
	console.log('Done!');
	Deno.exit(0);

} catch (error) {
	console.error(error);
}

async function fillTimeEntry(page: puppeteer.Page, startTime: string, endTime: string) {

	for (let i = 0; i < startTime.length; i++) {
		await page.keyboard.type(startTime[i]);
		await randomDelay();
	}

	await page.click('.legacyModal__main .AddEditEntry__fieldRow .ClockField:nth-child(2) .ClockField__formInput');

	for (let i = 0; i < endTime.length; i++) {
		await page.keyboard.type(endTime[i]);
		await randomDelay();
	}

	await page.waitForSelector('.legacyModal__actionsContainer .legacyModal__actions button:nth-child(2)');
	await randomDelay();

	await new Promise((resolve) => setTimeout(resolve, 1000));

	const saveButton = await page.waitForSelector('.legacyModal__actionsContainer .legacyModal__actions button:nth-child(2):not([disabled])');
	await randomDelay();
	await saveButton!.hover();
	await randomDelay();
	await saveButton!.click();
	await randomDelay(2000);
}
