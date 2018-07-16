# MetroFax Automatic Send API
The purpose of this program is to facilitate sending bulk fax to a list of contacts through MetroxFax.

Because MetroFax limits fax blasts to 50 hand-marked contacts, sending faxes to thousands of contacts can become a laborious and time-consuming task.

## To Run
1. Make sure Node.js is installed and install the puppeteer api.
2. Adjust config.JSON to desired settings.
3. Run with `node FaxBlast.js`

## Known Errors
* The last send iteration throws error and does not send file

## To Do
* Add more sending criterias besides company == <something>
* Add checks for empty fields in config.JSON
