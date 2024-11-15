# Bamboo TimeSheet Filler
This project automates filling your BambooHR TimeSheet using Deno and Puppeteer.

## Prerequisites
Install Deno from [here](https://deno.com/).

## Setup
- Copy the `.env_example` file to `.env` and fill in your credentials
- Install the required Chrome browser for Puppeteer:
`npx puppeteer browsers install chrome`

## Environment Variables
The following environment variables need to be set in the `.env` file:

`BAMBOO_USER`: Your BambooHR username.
`BAMBOO_PASSWORD`: Your BambooHR password.
`BAMBOO_URL`: The BambooHR login URL.

`START_TIME`: The start time for your time sheet entries.
`END_TIME`: The end time for your time sheet entries.

- Optional
`USE_PROXY`: Set to true if you want to use a proxy.
`PROXY_HOST`: The proxy host.
`PROXY_PORT`: The proxy port.
`PROXY_USER`: The proxy username.
`PROXY_PASSWORD`: The proxy password.

## Running the Project
To start the project, run: `deno task start`

### Notes
The 2FA cannot be automated for obvious reasons.
So the browser will pause and wait for you to enter the 2FA code and click "Continue".
Then you need to return to your terminal and click ENTER for the process to continue
