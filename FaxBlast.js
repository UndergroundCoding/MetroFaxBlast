const puppeteer = require('puppeteer');
const config = require("./config.json");

async function run() {
	const browser = await puppeteer.launch({
		headless: true});
	const page = await browser.newPage();
	//await page.setViewport({width: 1500, height: 1500})	// For headless: false
	await page.goto('https://myaccount.metrofax.com/myaccount/logout');
	
	const MAX_SEND = config.numPerSend;		// Maximum number of faxes to send per request

	/* login()
	* Enter credentials and logs in
	*/
	async function login() {
		console.log("login() begin");
		// Selectors
		const USERNAME_SELECTOR = '#phoneNumber'
		const PASSWORD_SELECTOR = '#pin'
		const LOGIN_BTN = '#submitButton'

		// Log in
		// Credentials
		await page.click(USERNAME_SELECTOR);
		await page.keyboard.type(config.email);
		await page.click(PASSWORD_SELECTOR);
		await page.keyboard.type(config.password);
		
		const navigationPromise = page.waitForNavigation();
		await page.click(LOGIN_BTN);
		await navigationPromise;
		
		console.log("login() done");
	}

	/* markContacts()
	 * Creates an array with the ID of all contacts that are to receive a fax
	 * @count : The location of the last contact to receive fax.
	 */
	async function markContacts(count) {	 
		console.log("markContacts() begin");
		
		await page.goto('https://myaccount.metrofax.com/myaccount');
		
		// Open 'Send Fax' interface
		const SEND_FAXES = '#sendfaxestab';
		await page.click(SEND_FAXES);

		// Open Contacts list
		await page.waitFor(3000);		// Wait for load to disappear
		const CHOOSE_CONTACTS_SELECTOR = '#websend_to > div.right > span.doneLoadingContacts > a';
		await page.waitForSelector(CHOOSE_CONTACTS_SELECTOR);
		await page.click(CHOOSE_CONTACTS_SELECTOR);
		
		const result = await page.evaluate((config) => {
			let row = document.querySelectorAll("#addressBook_grid .ui-widget-content.jqgrow.ui-row-ltr");
			if(row.length < 1) {		// Something went wrong! No names to select
				throw "row is undefined";
			}

			let selectItems = [];	// Array to hold selectable items

			for(let i = 0; i < row.length; i++) {
				// Filter to specified "Company Name"
				if(row[i].querySelector('[aria-describedby="addressBook_grid_company"]').textContent.trim().toUpperCase() == config.company.toUpperCase()) {
					selectItems.push("#jqg_addressBook_grid_" + row[i].id);
				}
			}
			
			return selectItems;
		}, config);		
		
		console.log("Total = " + result.length + "; count = " + count);
		
		// Check if all faxes already sent
		if(count >= result.length) {
			console.log("markContacts() return -1");
			await page.goto('https://myaccount.metrofax.com/myaccount');
			return -1;
		}
		
		// Limit the number of faxes per send
		let limit = count + MAX_SEND;
		
		if(limit > result.length) {
			console.log("limit before assignment = " + limit);
			limit = result.length;
			console.log("limit after assignment = " + limit);
		}
		
		console.log("limit = " + limit);

		// Select contacts
		for(; count < limit; count++) {
			console.log("Total = " + result.length + "; count = " + count + "; limit = " + limit);
			await page.click(result[count]);
		}
		
		const ADD_SELECTOR = "#addrbook_active_add_btn > div.btn_text"
		await page.waitForSelector(ADD_SELECTOR);
		await page.click(ADD_SELECTOR);
		
		console.log("markContacts() done");
		
		return count;
	}
	
	async function uploadFile() {
		console.log("uploadFile() begin");
		// Capture confirmation message before sending fax
		const CONFIRMATION_SELECTOR = "#confirmation_sendto";
		//var preConfirmation = querySelector(CONFIRMATION_SELECTOR).innerHTML;  
		//console.log(preConfirmation);	// Debug

		// Upload faxable file
		const UPLOAD_SELECTOR = "#uploadFiles";
		await page.waitForSelector(UPLOAD_SELECTOR);  
		const fileEle = await page.$(UPLOAD_SELECTOR);
		await fileEle.uploadFile(config.file);

		// Remove cover page
		const COVERPAGE_SELECTOR = "#chk_includeCoverPage";
		await page.waitForSelector(COVERPAGE_SELECTOR);
		await page.click(COVERPAGE_SELECTOR);

		// Send
		const SEND_SELECTOR = "#btnWebsend";
		await page.waitForSelector(SEND_SELECTOR);
		await page.click(SEND_SELECTOR);
		await page.waitFor(5000);

		// Compare confirmation message after sending fax. If different, faxes send successfully
		await page.waitForSelector(CONFIRMATION_SELECTOR);
		//var postConfirmation = querySelector(CONFIRMATION_SELECTOR).innerHTML;  
		//console.log(postConfirmation);	// Debug
		
		console.log("uploadFile() done");
	}

	try {
		await login();
		let count = 0;
			do {
				count = await markContacts(count);
				await uploadFile();
			} while(count > 0);
	} catch(err) {
		console.log(err);
	}
}

run();