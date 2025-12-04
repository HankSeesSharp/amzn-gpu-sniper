const express = require('express');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 42097;

// Base URL string to manipulate
const urlBase = 'https://www.amazon.de/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?offeringID=$OID$&ASIN=$ASIN$&quantity.1=1&asin.1=$ASIN$&quantity=1&submit.buy-now=1';
const urlDefault = 'https://www.amazon.de/gp/product/handle-buy-box/ref=dp_start-bbf_1_glance?ASIN=$ASIN$&amp;quantity.1=1&amp;asin.1=$ASIN$&amp;quantity=1&amp;submit.buy-now=1';

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data

app.get('/update-button', (req, res) => {
    const { oid, asin } = req.query; // Extract 'oid' and 'asin' from GET query

    if (!oid || !asin) {
        return res.status(400).send('Missing required parameters: oid and asin.');
		console.log('Missing required parameters: oid and asin.');
    }

    // Construct the URL
    const newUrl = (oid != 0) ? urlBase.replace('$OID$', oid).replaceAll('$ASIN$', asin) : urlDefault.replaceAll('$ASIN$', asin); // Build new url or use the default Buy Now Button in case the href gets messed up

    // Path to the HTML file
    const filePath = path.join(__dirname, 'rtx5080.html');

    // Read the HTML file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading HTML file.');
			console.log('Error reading HTML file.');
        }

        const $ = cheerio.load(data); // Load the HTML content with Cheerio

        // Find the button by its <a> ID and change the 'href' attribute to the new URL
        const button = $(`#${asin}`);
        if (button.length === 0) {
            return res.status(404).send('Button not found.');
			console.log('Button not found.');
        }
		
		button.attr('href', newUrl); // Update the 'href' attribute with the new URL

        // Write the modified HTML back to the file
        fs.writeFile(filePath, $.html(), (writeErr) => {
            if (writeErr) {
                return res.status(500).send('Error writing to HTML file.');
				console.log('Error writing to HTML file.');
            }

            res.send(`Button ${asin} link updated successfully!`);
			console.log(`Button ${asin} link updated successfully with OID ${oid}!`);
        });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
});