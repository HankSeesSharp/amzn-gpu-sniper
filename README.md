<br>

<div align="center">

<h1 align="center">Amazon GPU Sniper</h1>


</div>

## Table of Contents

 - [Description](#description)
 - [Installation](#installation)
 - [Customization](#customization)
 
 
## Description

This is a one-click-buy sniping tool for GPUs on Amazon.
It consists of three parts:
1. GreaseMonkey Script running on different Amazon GPU listing pages, notifying you of new listings and sending the listing data to the node.js backend
2. A simple HTML page, that displays a button linking to the quick buy page for a given product listing
3. A node.js server, that accepts an API call from the GM script to update the HTML page with current links


## Installation

Download and place the files in a folder.
Install node.js and script dependencies (cheerio "1.0.0", "express": "5.0.1"

