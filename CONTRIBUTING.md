# Contributing to the DOME Registry

Thank you for your interest in contributing to the DOME Registry. This project, hosted by the **UNIPD Biocomputing Lab**, aims to provide a curated, FAIR-compliant registry for machine learning methods in the life sciences.

We primarily use a GitHub-based workflow. Contributions are made via Pull Requests (PRs) which are then reviewed and merged by the UNIPD lead developer. For general enquiries or coordination before starting a large contribution, you can reach the team at **contact@dome-ml.org**.

## On this page
* [How to Contribute](#how-to-contribute)
    * [Reporting Issues or Suggesting Improvements](#reporting-issues-or-suggesting-improvements)
    * [Submitting Changes via Pull Requests](#submitting-changes-via-pull-requests)
* [What to Contribute](#what-to-contribute)
* [What Not to Contribute](#what-not-to-contribute)
* [Contribution Licensing](#contribution-licensing)
* [Review Process](#review-process)

---

## How to Contribute

### Reporting Issues or Suggesting Improvements
If you find a bug, want to suggest a new feature, or have an idea for improving the registry structure:

1. **Check existing issues:** See if someone has already reported the same item or made a similar suggestion.
2. **Create a new issue:** If not, please [create a new issue](https://github.com/Biocomputing-UP/dome-registry/issues) (ensure you use the correct repository link).
    * Provide a clear title and description.
    * For bug reports, include steps to reproduce the issue.
    * For complex suggestions, feel free to email **contact@dome-ml.org** to discuss the roadmap.

### Submitting Changes via Pull Requests
This is the preferred way to modify the registry code, documentation, or static resources.

1. **Fork the Repository:** Create your own copy of the [DOME Registry repository](https://github.com/Biocomputing-UP/dome-registry) on GitHub.
2. **Create a Local Branch:** In your forked repository, create a new branch for your changes.
    ```bash
    git checkout -b feature/add-new-integration
    ```
3. **Make Your Changes:**
    * Add your modifications or corrections to the relevant files.
    * Ensure each change is clear, concise, and follows the existing style.
4. **Commit Your Changes:**
    ```bash
    git add .
    git commit -m "feat: add EPMC integration description"
    ```
    (Use clear, descriptive commit messages starting with a prefix like `feat:`, `fix:`, or `docs:`).
5. **Push to Your Fork:**
    ```bash
    git push origin feature/add-new-integration
    ```
6. **Open a Pull Request:**
    * Navigate to the original DOME Registry repository on GitHub.
    * Click the "New Pull Request" button.
    * Provide a clear title and a brief description of your changes.
    * Submit the Pull Request for review.

---

## What to Contribute
We welcome contributions that add or improve:

* **Registry Metadata:** Corrections to existing method descriptions or improvements to metadata schemas.
* **Documentation:** Improvements to the README, API documentation, or user tutorials.
* **Bug Fixes:** Resolving issues in the registry front-end or back-end integration scripts.
* **Integration Standards:** Updates to Bioschemas markup or other FAIR-related annotations.

---

## What Not to Contribute
* Off-topic content that does not align with the goals of promoting FAIR machine learning methods.
* Proprietary code or resources that do not permit open-access sharing.
* Changes to core infrastructure without prior discussion via an Issue or email.
* Promotional material or advertisements.

---

## Contribution Licensing
By contributing to this project, you agree that your contributions will be licensed under the project's **CC-BY-4.0** license. All contributed content must respect the copyrights and intellectual property of others.

---

## Review Process
The **UNIPD lead developer** will review all Pull Requests.
* We aim to provide feedback on contributions promptly.
* Requests for changes or clarifications may be made via comments on the Pull Request.
* Once the PR is approved and passes any automated checks, the UNIPD lead developer will merge it into the `main` branch.

For any questions regarding the review process or if you need to report an urgent issue, please contact **contact@dome-ml.org**.

We appreciate your effort in helping the UNIPD Biocomputing Lab build a robust and FAIR ecosystem for machine learning methods.
