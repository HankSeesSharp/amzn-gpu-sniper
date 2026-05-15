<br>

<div align="center">

<h1 align="center">GPU Sniper</h1>


</div>

## Table of Contents

 - [Description](#description)
 - [Installation](#installation)
 - [Customization](#customization)
 - [Disclaimer](#disclaimer)
 
 
## Description

This is a one-click-buy sniping tool for GPUs on Amazon.
It consists of three parts:
1. GreaseMonkey Script running on different Amazon GPU listing pages, notifying you of new listings and sending the listing data to the node.js backend
2. A simple HTML page, that displays a button linking to the quick buy page for a given product listing
3. A node.js server, that accepts an API call from the GM script to update the HTML page with current links


## Installation

Download and place the files in a folder.
Install node.js and script dependencies (cheerio "1.0.0", "express": "5.0.1"
You might need to change the port of your node.js server, the HTML elements used to check for offers etc. 
Also it is highly recommended to use a rotating proxy setup, so you don't get an IP block from amazon for botting :D
I tried to find a good balance between being respectful with server load and effective with the scanning, but Amazon might still try to prevent all automation.
Alternatively you can reduce the frequency with which the script scans for new offers.
(Technical knowledge required. Use at your own discretion. No support provided (probably^^).)


## Disclaimer
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
