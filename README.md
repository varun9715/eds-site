# Qantas Q.com EDS Site Rebuild

This repository contains the codebase for the Q.com rebuild using Adobe's Edge Delivery Services (EDS).

## Environments

- Preview: https://main--dev-eds-site-qantas-cloud.aem.page/
- Live: https://main--dev-eds-site-qantas-cloud.aem.live/

## Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed:

### Node.js 22

Download it from [nodejs.org](https://nodejs.org/en/download) or install it via Homebrew:

```sh
brew install node@22
```

Consider using **Node Version Manager (nvm)** to manage Node.js versions:
Install nvm with Homebrew:

```sh
brew install nvm
```

Use the desired Node.js version:

```sh
nvm use 22  # Switch to Node.js 22
```

### Installation

1. Clone the repository

```sh
git clone https://github.com/qantas-cloud/a1689-eds-qantas.git
cd a1689-eds-qantas
```

2. Install dependencies (With VPN on or inside Qantas network):

```sh
npm install
```

3. If you're only interested in the Cypress tests, feel free to jump [here](#cypress-test-framework)

### Local development

1. Start AEM Proxy: aem up (opens your browser at http://localhost:3000)

```sh
npm start
```

2. Build EDS Editor JSON Files

```sh
npm run build:json
```

3. To run JS and CSS linting on the project files:

```sh
npm run lint
```

### Hooks

This project uses **Husky** to enforce coding standards via pre-commit hooks. These hooks run **ESLint, Prettier, and Vitest unit tests** to maintain consistency and code quality. All checks must pass before committing changes.

If code with failing checks gets pushed, the same validations will run on PRs to enforce these rules. Please ensure all checks pass to avoid delays and maintain smooth development workflow.

When attempting to commit changes, a pre-commit hook powered by Husky is triggered to run the following tasks:

- **copy-assets** - Copy everything from @runway-core/assets-svg into /assets
- **copy-tokens** - Copy everything from @runway-core/tokens-css/tokens.css into /styles
- **build:json** - Process all the \_<block-name>.json into component-definition.json, component-filters.json and component-models.json
- **Linters**: Ensures code follows the project's style and formatting guidelines.
- **Vitest**: Runs test cases to ensure code quality.

### Storybook

This project uses **Storybook** to document and test components in isolation. Use the following commands to run storybook:

Run storybook:

```sh
npm run storybook
```

### Local Testing

This project uses **Vitest** for unit tests and **Cypress** for integration and end-to-end (E2E) tests. Use the following commands to run tests:

Run unit tests:

```sh
npm run test
```

## Cypress Test Framework

This project uses [Cypress](https://www.cypress.io/) to handle regression UI tests at both the block and page levels. The primary goal of these tests is to catch issues as early as possible and ensure there are no regressions when making changes to the EDS repository.

### Workflow

Cypress tests are triggered at various stages throughout the release cycle:

1. **Locally** – If you want to run the tests locally against your branch or a local environment, you can use:
   - `npm run cypress:e2e:local` to run tests against your local setup.
   - `npm run cypress:e2e:branch` to run tests against a pushed branch.

2. **PR Level** – All Cypress integration tests run automatically at the pull request level on your branch. Read more about Cypress integration tests [below](#cypress-integration-tests).

3. **Post Merge to Trunk** – Once a branch is merged into `trunk`, both Cypress integration tests and end-to-end (E2E) page-level tests are triggered against the test environment. The `trunk` branch points to the test environment to validate stability.

---

### Cypress Integration Tests

We refer to these as Cypress Integration Tests because their purpose is to validate the integration between **AEM Cloud Services Author**, **Universal Editor**, and **EDS**. These tests verify that individual blocks function correctly in isolation on an AEM page.

The test workflow consists of the following steps:

1. Log in to the **AEM Author Environment**.
2. Create a new **AEM page**.
3. Exchange **Technical Account certificate credentials** for an access token to authenticate with the Universal Editor.
4. Create a **desired block** using the **Universal Editor API**.
5. Update the block through the **Universal Editor API**.
6. Publish the block.
7. Publish the page.
8. Visit the **published page**.
9. Verify that the block is rendered correctly on the published page.

📌 **Example:** [Cypress Integration Test](cypress/e2e/integration.cy.js)

Cypress Integration tests should have the highest level of coverage since they are quick to execute and provide the greatest return on investment (ROI).

---

### Visual Regression Tests

Visual Regression Tests ensure that blocks are visually identical to a stable baseline saved in the `trunk` branch. If unexpected visual changes occur, developers can choose to either accept the new version as the new baseline or investigate and resolve issues before proceeding.

- These tests serve as an **extra layer of confidence** to catch unintended visual changes.
- Initially, they will be **non-blocking** but may transition into blocking tests once the framework matures.
- We use **[Applitools](https://applitools.com/)** as the visual testing tool of choice.
- These tests are initiated as part of the Cypress integration tests at the block level, as well as another strategy that creates a single page and places all blocks on it to align with our subscription model and avoid exceeding its limits.

📌 **Example:** [Visual Regression Test](cypress/e2e/visreg.cy.js)

Visual regression tests should also have extensive coverage, similar to integration tests, as they allow us to efficiently verify multiple block variations and enhance confidence in UI consistency.

---

### Page-Level Tests

Page-level tests serve as **end-to-end (E2E) tests**, verifying critical workflows at the page level. While they start out as extensive tests for the first release, over time, they should be trimmed down to a **lean smoke test** that fails only if a major issue is detected.

- These tests cover **high-level critical workflows**.
- They should be optimized for speed and reliability.
- They help ensure the overall integrity of a page rather than testing individual blocks in isolation.

📌 **Example:** [Page-Level Test](cypress/e2e/pageLevel.cy.js)

Page-level tests should focus only on critical, high-level scenarios, ensuring minimal but effective coverage for detecting major issues.

---

### Test Framework Details

### Page Object Model
This project follows the **Page Object Model (POM)** pattern to manage locators and encapsulate UI interactions in reusable components. Each page or block has its own corresponding **Page Object file**, which contains:

- Selectors for elements on the page.
- Helper methods to interact with UI components.
- Assertions to validate expected behaviors.

This approach ensures better maintainability and reduces code duplication.

### Tagging Mechanism
To efficiently run tests in different scenarios, we utilize a **tagging mechanism** powered by [`cypress-grep`](https://github.com/cypress-io/cypress/tree/develop/npm/grep#readme):

- Each test is tagged based on its environment as well as purpose (e.g., `@dev`, `@test`, `@local`, `@smoke`).
- Developers can filter tests based on tags, e.g., `npm run cypress -- --env grep=@smoke` to run only smoke tests.
- On CI, environment tags are used to determine which tests to run on which environment. By default all tests will be triggered on `local` and `dev`.

### Environment Configurations
Cypress is configured to run tests against different environments, each with its own set of configurations. These configs are stored in the [configs](cypress/configs) folder

### Environment Variables
Sensitive data such as user credentials, akamai headers etc. are stored as **environment variables** rather than hardcoded in test scripts. These can be defined in the `.env` file in the root directory.

On Github Actions, all of these Environment variables are stored as Github Secrets and can be modified (if required) using the QCP console.

### Reporting (TO DO)
To track and analyze test results, we have integrated the following reporting mechanisms:

- **[Mochawesome](https://www.npmjs.com/package/mochawesome)** – Generates detailed HTML reports for test runs.
- **Slack Notifications** – Sends test execution summaries to a Slack channel.


---

## Getting Started with Running Cypress Tests  

Before you begin writing and executing Cypress tests, ensure that you have completed the necessary steps outlined in the [Prerequisites](#prerequisites) and [Installation](#installation) sections. Additionally, there are a few essential configurations required to enable Cypress tests to run successfully.  

### 1. Obtain Local User Credentials  
Local user credentials are required to authenticate and execute Cypress integration tests.  

- You can request these credentials from any member of the platform team.
- These credentials are different to your SSO credentials and are specific to automated tests.
- Once you receive your credentials, add them to the `.env` file in the following format:  

  ```plaintext
  AEM_USERNAME={localUsername}  
  AEM_PASSWORD={localPassword}  
  ```  

### 2. Retrieve Akamai Headers (If Applicable)  
Akamai headers are necessary **only if you do not have ZScaler installed on your local machine**.  

- You can obtain these headers from the **Qantas Quality Engineering** team’s channel.  
- Once you have the required values, add them to the `.env` file as shown below:  

  ```plaintext
  AKAMAIHEADER={headerName}  
  AKAMAIHEADERPASSWORD={headerValue}  
  ```

### 3. Retrieve Applitools API key
If you want to run visual regression tests, you'll need an Applitools API key. Reach out to the platform team to get your hands on the API key.

- Once you have the API key, add them to the `.env` file as shown below:

  ```plaintext
  APPLITOOLS_API_KEY={apiKey}
  ```

### 4. Obtain Technical Account Credentials  
To authenticate with Adobe’s services, you will need a **technical account JSON file** from the Adobe Developer Console for the environment where you plan to run the tests.  

- Ensure that you have **SSO access** to the relevant environment before proceeding.  
- Follow these steps to download the credentials:  
  1. Log in to the [Adobe Developer Console](https://dev-console-ns-team-aem-cm-prd-n141303.ethos15-prod-aus5.dev.adobeaemcloud.com/#release-cm-p147452-e1510306) for RDE using SSO.
  2. Navigate to the **Integrations** tab.  
  3. Locate the row labeled `PRIVATE-KEY-${SOME_GUID}` and click on it.  
  4. Click on the `...` (options menu) and select **View**. This will redirect you to a URL similar to `/#integration-certificate_view_cm-...`.  
  5. Click **Download** to obtain the JSON file.  
  6. Save the file as **`tech_account_creds.json`** in the root directory of the **EDS repo**.  

💡 **Important:**  
- The filename must be exactly **`tech_account_creds.json`**, and it should be placed in the **root of the repository**.  
- Cypress relies on this file to exchange credentials for an access token, which is used to communicate with the **Universal Editor**.  
- The json file is base64 encoded and saved as a github secret for CI jobs. If you need to update the technical account credentials, you'll need to follow the below steps:
  1. echo "YOUR_JSON_FILE_CONTENTS" | base64
  2. Copy the output
  3. Log into [QCP Console](https://qcp-console.qcpaws.qantas.com.au/qda/A1689/as/A1689-01?view=Github%20Secrets)
  4. Update the value of **`TECH_ACCOUNT_CRED_JSON`**
  5. That's it! The GHA runner will download and decode everything as expected so you won't have to worry about it.

---

## Running Cypress Tests  

Once you have completed the above configurations, you can run the Cypress tests in the **development environment** using either of the following commands:  

```sh
npm run cypress:e2e:dev
```
or  
```sh
npx cypress open --env environmentName=dev --config-file cypress/cypress.config.js
```

---

## Notes for System Administrators: Creating or Updating Technical Account Details  

If you are setting up a **new technical account** or if an **environment reset** has caused permissions to be revoked, ensure that the following permissions are assigned to the **technical account**:  

- **`readwrite`** access to `/content/eds-site`  
- **`read`** access to the root (`/`)  

Failure to assign these permissions will prevent Cypress tests from communicating with the **Universal Editor**, resulting in an authentication error.  

---

### Documentation

[Getting Started with the Q.com Rebuild Project](https://qantas.atlassian.net/wiki/x/Irf_Gg)
