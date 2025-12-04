// ==UserScript==
// @name         Amazon Productpage Watch
// @version      1.0
// @description  Find decently priced GPUs on amazon and update external one-click buy button via API call to the node.js server 
// @author       HankSeesSharp
// @match        *://*.amazon.de/dp/*
// @match        *://*.amazon.de/gp/product/*
// @match        *://*.amazon.de/*/dp/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

   function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

	function checkRuntime() {
		//Set Greasemonkey var to track runtime of the script - same script in multiple tabs tracks same runtime
        const test = GM_getValue("firstRun_Amz", false);
        if (!test) {
			// if first run: initialize 
            const firstRun = new Date();
            const firstRunTime = firstRun.getTime();
			//convert date to ISO string for storage
            const firstRunISO = firstRun.toISOString();
            GM_setValue("firstRunTime_Amz", firstRunTime);
            GM_setValue("firstRun_Amz", firstRunISO);
            const actualTime = firstRun.toLocaleTimeString("de-DE");
            console.log('First Run: '+actualTime);
        }
        else {
			// if not first run, check how long since first run
            const firstRunTime = GM_getValue("firstRunTime_Amz", null);
            let firstRun = GM_getValue("firstRun_Amz", null);
			// convert ISO string of first run date value back into date
            firstRun = firstRun ? new Date(firstRun) : null;
            const actualTime = firstRun.toLocaleTimeString("de-DE");

            const d = new Date();
            const current = d.getTime();

			// If script ran for more than 30min, pause for 5-7 1/2 min - also make sure date conversion went well
            if (firstRunTime) {
                const difference = current - firstRunTime;
                if (difference >= 1800000) {
                    const pause = getRandomDelay(300000, 450000);
                    console.log('First Run: '+actualTime);
                    console.log('Taking a break for '+(pause/60000).toFixed(2));
                    GM_setValue("firstRunTime_Amz", null);
                    GM_setValue("firstRun_Amz", null);
                    new Promise((resolve) => setTimeout(resolve, pause));
                }
                else {
                    console.log('Start time: '+actualTime);
                    console.log('Time elapsed since first run: '+(difference/60000).toFixed(2)+'min');
                }
            }
        }
    }

  	function sendNotification(notificationBody) {
      if ("Notification" in window) {
        // Ask for permission to send notifications
        Notification.requestPermission().then(function(permission) {
          if (permission === "granted") {
            // If permission is granted, create and display a notification
            new Notification("GPU FOUND!", {
              body: notificationBody,
              icon: "https://www.amazon.com/favicon.ico", // Optional: Add an icon
            });
          } else {
            console.log("Notification permission denied.");
          }
        });
      } else {
        console.log("This browser does not support notifications.");
      }
	}

    //Wait for page load
	window.addEventListener('load', function() {
		console.log('Checking results...');

		if (document.querySelector('div.a-box-inner h4').textContent.includes("Geben Sie die Zeichen unten ein") || document.querySelector('#errorShortDesc')){
				location.reload(true);
		}

		checkRuntime();
		Notification.requestPermission(); //makes sure notification can be send before the first one is send
		
		// grab amazon product name, remove whitespaces and shorten for windows notification popup
		let name = document.querySelector('span#productTitle')?.textContent;
		name = name?.replace(/^\s*/, "");
		name = name?.slice(0, 75) + (name?.length > 75 ? "..." : "");

		// get container that display the price - omit cents
		const priceElement = document.querySelector('#corePriceDisplay_desktop_feature_div span.a-price-whole') || null;
		const priceElementAlt = document.querySelector('#dynamic-aod-ingress-box span.a-price-whole') || null;


		let notificationBody = "";
		// get random time between 10 and 20 sec for page refresh and inititate it
		let time = getRandomDelay(10000, 20000);
		console.log('Refreshing in '+time+' ms');
		setTimeout(() => location.reload(true), time);

		// if either main offer or secondary offers are available 
		if (priceElement || priceElementAlt) {
			//parse actually unneccessary for amazon since price already whole
			const price = priceElement ? parseFloat(priceElement.textContent.replace(/(\.|\,)/g, '')) : 0;
			const priceAlt = priceElementAlt ? parseFloat(priceElementAlt.textContent.replace(/(\.|\,)/g, '')) : 0;
			// set up notification body
			notificationBody = (price < priceAlt) ? `Name: ${name}\nPrice: ${price}€` : `Name: ${name}\nPrice ALT: ${price}€`;
			//notificationBody = (price < priceAlt) ? notificationBody.replace("$(name)", name).replace("$(price)", price) : notificationBody.replace("$(name)", name).replace("$(price)", priceAlt);
			console.log(notificationBody);
			// if either price is in desiredd range play audio cue and send notification
			if ((price > 0 && price < 1600) || (priceAlt > 0 && priceAlt < 1600)) {
				const audio = new Audio('http://127.0.0.1:42096/alarm.mp3');
				const asin = location.href.replace(/(.*amazon.*dp\/)/g,'').replace(/(\?+.*)/g,'');
				const lastNotification_asin = 'lastNotification_'+asin; // store last Notification info per product 
				const notificationTime = (new Date()).getTime();
				const lastNotificationTime = GM_getValue(lastNotification_asin, 0); // grab lastNotificationTime for current asin or set to zero if it fails

			  //setTimeout(() => location.href = location.href.replace(/\?+.*/g,''), time);
				const diff = notificationTime - lastNotificationTime;
				let oid = 0;
				// if alternative offer are cheaper open the aod area to extract offeringID 
				if (priceAlt && priceAlt >= price) {
					let clickLink = document.querySelector('.daodi-content a');
					if (clickLink) {
						let event = new MouseEvent('click', {
						  bubbles: true,
						  cancelable: true,
						  view: window
						});
									
						clickLink.dispatchEvent(event);
					}
					new Promise(resolve => setTimeout(resolve, 4000)); // wait for aod area to fully load
					// grad all alternative offers, select first one since auto sorted for cheapest per default
					const aodOffers = document.querySelector('#aod-offer-list').querySelectorAll('#aod-offer');
					const cheapestOffer = aodOffers[0];
					const oidCheapest= cheapestOffer.querySelector('div.aod-atc-column span.a-declarative').getAttribute('data-aod-atc-action'); //extract string with offeringID in it
					oid = oidCheapest.replace(/.*"oid":"/g,'').replace(/".*/g,'');
					console.log(oid);
				}
				// build url to local backend to update the buy now buttons for sniping
				const urlUpdate = `http://127.0.0.1:42097/update-button?oid=${oid}&asin=${asin}`;
				console.log(urlUpdate);
			  //  .catch(error => console.error("Error:", error)); not needed since amazon has report only CSP header setup
			
			  //if last Notification longer than 2min ago send again - also works for first Notification since notificationTime - 0 will always be greater than 2min
				if (diff >= 120000) {
					GM_xmlhttpRequest({
						method: "GET",
						url: urlUpdate,
						onerror: function(respone) {
							console.log('Request failed: ', error);
						}
					});
					GM_setValue(lastNotification_asin, notificationTime);
					audio.play();
					sendNotification(notificationBody);
				}
			}
		}
		else {
			// if no price available on the product page, it's not available so fall back
			const status = document.querySelector("#availability > span:nth-child(4) > span").textContent;
			notificationBody = "Name: $(name)\nStatus: $(status)";
			notificationBody = notificationBody.replace("$(name)", name).replace("$(status)", status);
			console.log(notificationBody);
		}
	}, false);	
})();