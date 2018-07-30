# MetroFax Blast API
The purpose of this program is to facilitate sending bulk fax to a list of contacts through MetroxFax.

Because MetroFax limits fax blasts to 50 hand-marked contacts, sending faxes to thousands of contacts can become a laborious and time-consuming task.

With the aid of this simple script, let Puppeteer headless browser do all the work for you.

## To Run
1. Make sure Node.js is installed and install the puppeteer api.
2. Adjust config.JSON to desired settings.
3. Run with `node FaxBlast.js`

## Adjusting config.JSON
1. email and password: account credentials.
2. numPerSend: Total number of contacts to send fax at once. Working max = 49.
3. company: Every client matching this parameter will be added to the send list.
4. file: File path. Check with MetroFax for acceptable extensions. The program makes no effor to ensure proper file selection.

## Known Errors
* There are no known errors at the moment.

## To Do
* Add more sending criterias besides company == <something>
* Add checks for empty fields in config.JSON
* Check "file" input for valid extension
