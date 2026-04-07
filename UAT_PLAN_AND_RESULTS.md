# Gatore User Acceptance Test Plan and Results

**Project:** Gatore  
**Document Type:** User Acceptance Test Plan and Results  
**Project Context:** Capstone Project  
**Prepared On:** April 7, 2026  
**Application Scope:** Full system acceptance testing for client and server user workflows

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Objectives](#2-objectives)
3. [Scope](#3-scope)
4. [UAT Team Structure and 4-Person Division](#4-uat-team-structure-and-4-person-division)
5. [Test Environment and Preconditions](#5-test-environment-and-preconditions)
6. [Entry and Exit Criteria](#6-entry-and-exit-criteria)
7. [Defect Severity and Status Definitions](#7-defect-severity-and-status-definitions)
8. [Execution Method](#8-execution-method)
9. [UAT Test Plan by Workstream](#9-uat-test-plan-by-workstream)
10. [Baseline Technical Validation Already Completed](#10-baseline-technical-validation-already-completed)
11. [UAT Results Recording Section](#11-uat-results-recording-section)
12. [Known Risks and Special Notes](#12-known-risks-and-special-notes)
13. [Final Sign-Off Template](#13-final-sign-off-template)

---

## 1. Purpose

This document defines the User Acceptance Testing strategy for the Gatore capstone project and provides a structured results framework for recording execution outcomes.

It is designed to:

- validate that the application meets end-user expectations,
- confirm that major customer and business workflows are usable,
- identify defects that affect acceptance readiness,
- divide work cleanly across a 4-person team,
- produce a professional capstone-ready testing artifact.

This document covers both:

- the **customer-facing application**, and
- the **business-facing dashboard and settings experience**.

---

## 2. Objectives

The UAT process is intended to confirm that Gatore is acceptable for demonstration and end-user evaluation in the following areas:

1. Customer onboarding works as expected.
2. Customers can discover cafes and games efficiently.
3. Customers can create and manage reservations.
4. Cafe owners can request access and complete onboarding.
5. Approved business users can manage reservations and business configuration.
6. The system behaves consistently across realistic end-user scenarios.
7. Critical user-facing failures are identified before final submission or demo.

---

## 3. Scope

### Included in Scope

- Public site navigation
- Customer authentication
- Google sign-in flow
- OTP verification flow
- Customer profile and preferences
- Cafe discovery
- Game-based discovery
- Cafe detail and reservation flow
- Reservation review and cancellation
- Business access request workflow
- Business OTP sign-in
- Business onboarding/setup wizard
- Business dashboard
- Business reservation management
- Business settings:
  - business info
  - pricing
  - tables
  - game library
  - operating hours
  - account deletion flow

### Out of Scope

- Internal code quality review
- Unit test design itself
- Database schema migration authoring
- Infrastructure hardening beyond the deployed/testing environment
- Production payment gateway validation, because the current project build presents a payment-style interface rather than a fully integrated live payment processor

---

## 4. UAT Team Structure and 4-Person Division

The application can be divided cleanly into **four balanced UAT ownership areas** so that each team member has clear accountability and minimal overlap.

### Recommended Team Split

| Team Member | Workstream                                        | Main Focus                                                                                           |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Graham      | Public Discovery and Informational Experience     | Public pages, navigation, search, browse, content pages                                              |
| Chloe       | Customer Identity and Reservation Experience      | Signup, signin, OTP, Google auth, profile, reservation flow, reservation management                  |
| Sahil       | Business Access and Onboarding Experience         | Partner page, business access request, business OTP signin, setup wizard                             |
| Justin      | Business Operations and Administration Experience | Dashboard, reservations management, settings, tables, hours, pricing, game library, account controls |

### Why this 4-part split works well

### Graham - Member 1: Public Discovery and Informational Experience

This area covers the top-level site and non-authenticated user journey:

- Home
- Find a Cafe
- Find by Game
- Cafe Detail Page
- How It Works
- For Cafe Owners
- Pricing
- About
- Contact

This stream is ideal for testing usability, page routing, content clarity, and search/discovery behavior.

### Chloe - Member 2: Customer Identity and Reservation Experience

This area covers the full customer lifecycle:

- email signup
- OTP verification
- password creation
- Google sign-in
- customer sign-in
- guest reservation flow
- authenticated reservation flow
- My Profile
- My Reservations
- reservation cancellation

This stream is ideal for validating the highest-value customer workflows end to end.

### Sahil - Member 3: Business Access and Onboarding Experience

This area covers partner acquisition and first-time activation:

- partner landing page
- request access flow
- business OTP sign-in
- setup-required gating
- setup wizard:
  - profile
  - tables
  - operating hours
  - game library
  - menu setup step
  - pricing

This stream is ideal for validating the first-use experience for business users.

### Justin - Member 4: Business Operations and Administration Experience

This area covers day-to-day partner operations:

- dashboard KPIs
- reservation list and filters
- new walk-in reservation
- edit reservation
- update status
- delete reservation
- settings tabs:
  - business info
  - pricing
  - tables
  - game library
  - operating hours
  - account deletion workflow

This stream is ideal for validating operational readiness and sustained business use.

### Suggested Execution Rule

Each member should:

1. Execute their assigned test cases first.
2. Record evidence for pass/fail.
3. Raise defects immediately for blocking issues.
4. Hand off cross-workstream blockers during the daily sync.

---

## 5. Test Environment and Preconditions

### Required Environment

The UAT environment should have:

- frontend running and accessible,
- backend API running and accessible,
- PostgreSQL database connected,
- email delivery working,
- Google OAuth configured if Google login is in scope for that run,
- BoardGameGeek token configured if game search/setup testing is in scope.

### Required Test Data

The following data should be prepared before team execution:

1. At least one customer test email
2. At least one Google-enabled test account
3. At least one business access request email
4. At least one approved business user
5. At least one configured business profile with:
   - tables
   - hours
   - game library
6. At least one reservation created for status-update testing

### Strongly Recommended Test Accounts

| Account Type               | Purpose                             |
| -------------------------- | ----------------------------------- |
| Customer Email Account     | OTP signup and login testing        |
| Customer Google Account    | Google sign-in testing              |
| Business Pending Account   | Access-request and approval testing |
| Business Approved Account  | Dashboard and settings testing      |
| Guest Reservation Identity | Reservation without account testing |

---

## 6. Entry and Exit Criteria

### Entry Criteria

UAT may begin when:

1. The application is deployable and accessible.
2. Environment variables are configured.
3. Database migrations are applied.
4. Email flows are operational.
5. At least one business approval path is available.
6. Core application routes load without fatal startup errors.

### Exit Criteria

UAT is considered complete when:

1. All assigned test cases have been executed.
2. All results have been documented.
3. Critical and high-severity blockers have either:
   - been fixed and re-tested, or
   - been explicitly accepted as known limitations by the team/instructor.
4. A final acceptance summary has been prepared.

---

## 7. Defect Severity and Status Definitions

### Severity Levels

| Severity | Meaning                                                                  |
| -------- | ------------------------------------------------------------------------ |
| Critical | Core system or primary flow is unusable; demo or acceptance is blocked   |
| High     | Important business or customer task fails or behaves incorrectly         |
| Medium   | Workflow completes but with confusion, inconsistency, or partial failure |
| Low      | Cosmetic, wording, layout, or non-blocking usability issue               |

### Result Statuses

| Status           | Meaning                                                   |
| ---------------- | --------------------------------------------------------- |
| Pass             | Expected behavior matches actual behavior                 |
| Fail             | Expected behavior does not occur                          |
| Blocked          | Test cannot be completed because of another issue         |
| Not Run          | Test has not yet been executed                            |
| Conditional Pass | Function works, but with a minor caveat noted in comments |

---

## 8. Execution Method

Each test case should be executed using the same structure:

1. Confirm preconditions.
2. Follow the listed steps exactly.
3. Compare the actual result to the expected result.
4. Record:
   - status,
   - tester name,
   - test date,
   - evidence reference,
   - notes/defect ID if needed.

### Evidence Expectations

For strong capstone-quality evidence, each tester should capture:

- screenshot or screen recording reference,
- email proof where relevant for OTP flows,
- short defect summary where a failure occurs.

### File Naming Recommendation for Evidence

Use a consistent format such as:

`UAT-M2-CR-04-Pass-2026-04-08.png`

Where:

- `M2` = Member 2
- `CR` = Customer Reservation
- `04` = test case number

---

## 9. UAT Test Plan by Workstream

### Workstream 1: Public Discovery and Informational Experience

**Owner:** Graham - Member 1
**Primary Goal:** Validate the public-facing experience before authentication.

### W1 Test Cases

| ID    | Test Case                                  | Preconditions                           | Steps                            | Expected Result                                   | Priority |
| ----- | ------------------------------------------ | --------------------------------------- | -------------------------------- | ------------------------------------------------- | -------- |
| W1-01 | Open home page                             | App running                             | Navigate to home page            | Home page loads without fatal error               | High     |
| W1-02 | Header navigation routes correctly         | Home page open                          | Click each public nav link       | Correct page opens each time                      | High     |
| W1-03 | Find a Cafe page loads                     | App running                             | Open Find a Cafe page            | Cafe discovery page loads                         | High     |
| W1-04 | Cafe list renders                          | Data available or empty-state supported | Observe cafe list                | Cafes display or empty state appears clearly      | High     |
| W1-05 | Cafe search by name works                  | Cafe data available                     | Search by venue name             | Matching cafes are shown                          | High     |
| W1-06 | Cafe detail page opens from search results | Search results visible                  | Open a cafe detail page          | Detailed venue page loads                         | High     |
| W1-07 | Find by Game page loads                    | App running                             | Open Find by Game                | Game search page loads                            | High     |
| W1-08 | Search for a known game returns results    | BGG configured                          | Search `Catan`                   | Matching game results are displayed               | High     |
| W1-09 | Selecting a game shows supporting cafes    | Game results visible                    | Choose one game                  | Cafes carrying that game are shown                | High     |
| W1-10 | How It Works page is readable and complete | App running                             | Open page                        | Step-based booking explanation displays correctly | Medium   |
| W1-11 | Partner page presents clear business CTA   | App running                             | Open For Cafe Owners             | Partner information and CTA appear correctly      | Medium   |
| W1-12 | Pricing page loads and content is clear    | App running                             | Open Pricing                     | Pricing cards and messaging display properly      | Medium   |
| W1-13 | About page loads correctly                 | App running                             | Open About                       | Mission/value content displays properly           | Low      |
| W1-14 | Contact page loads and form is visible     | App running                             | Open Contact                     | Contact page and form display correctly           | Medium   |
| W1-15 | Mobile navigation usability check          | Responsive browser or device            | Test navigation at smaller width | Navigation remains accessible and readable        | Medium   |

---

### Workstream 2: Customer Identity and Reservation Experience

**Owner:** Chloe - Member 2
**Primary Goal:** Validate account creation, login, booking, and self-service reservation management.

### W2 Test Cases

| ID    | Test Case                                         | Preconditions                            | Steps                                     | Expected Result                    | Priority |
| ----- | ------------------------------------------------- | ---------------------------------------- | ----------------------------------------- | ---------------------------------- | -------- |
| W2-01 | Open signup modal                                 | App running                              | Click Get Started / signup                | Signup modal opens                 | High     |
| W2-02 | Email signup accepts valid email                  | Signup modal open                        | Enter valid email and continue            | OTP step is shown                  | High     |
| W2-03 | Invalid email is rejected                         | Signup modal open                        | Enter invalid email                       | Validation message appears         | High     |
| W2-04 | OTP verification succeeds with valid code         | OTP email received                       | Enter valid 6-digit OTP                   | Flow moves to password step        | High     |
| W2-05 | Invalid OTP is rejected                           | OTP step active                          | Enter invalid OTP                         | Error message appears              | High     |
| W2-06 | Resend OTP works                                  | OTP step active                          | Use resend action                         | OTP re-send request succeeds       | Medium   |
| W2-07 | Password rules are enforced                       | Password step active                     | Enter weak password                       | Validation blocks progress         | High     |
| W2-08 | Valid password allows continuation                | Password step active                     | Enter valid password                      | Flow moves to profile step         | High     |
| W2-09 | Profile details can be submitted                  | Profile step active                      | Enter name and continue                   | Flow moves to preferences          | High     |
| W2-10 | Preferences can be saved or completed             | Preferences step active                  | Save preferences                          | Success screen appears             | Medium   |
| W2-11 | Customer sign-in works with valid credentials     | Existing customer account                | Sign in using email/password              | User becomes authenticated         | High     |
| W2-12 | Incorrect credentials are rejected                | Existing customer account                | Enter wrong password                      | Error message appears              | High     |
| W2-13 | Google sign-in works for valid configured account | Google OAuth configured                  | Use Google sign-in                        | User is authenticated successfully | High     |
| W2-14 | My Profile page loads after sign-in               | Authenticated customer                   | Open My Profile                           | Profile data is visible            | High     |
| W2-15 | Contact info can be edited and saved              | Authenticated customer                   | Edit profile details and save             | Updated values are preserved       | High     |
| W2-16 | Preferences can be updated later                  | Authenticated customer                   | Change game preferences and save          | Updated preferences persist        | Medium   |
| W2-17 | Reservation flow opens from cafe detail page      | Cafe detail page open                    | Start reservation                         | Reservation modal appears          | High     |
| W2-18 | Date/time/party step accepts valid inputs         | Reservation modal open                   | Choose date/time/party size               | User can continue                  | High     |
| W2-19 | Unavailable table scenario is communicated        | No suitable table or constrained data    | Choose unsupported party/time combo       | Clear warning appears              | High     |
| W2-20 | Game selection step supports optional skip        | Reservation flow step 2                  | Continue without selecting a game         | User can proceed                   | Medium   |
| W2-21 | Guest booking path works                          | Reservation flow open                    | Choose guest path and enter valid details | Flow continues to confirm          | High     |
| W2-22 | Authenticated booking path works                  | Logged-in customer                       | Complete reservation flow                 | Reservation submits successfully   | High     |
| W2-23 | Reservation confirmation screen appears           | Successful reservation                   | Confirm booking                           | Success screen is shown            | High     |
| W2-24 | My Reservations page displays customer bookings   | Authenticated customer with reservation  | Open My Reservations                      | Reservation list appears           | High     |
| W2-25 | Reservation cancellation works                    | Existing cancellable reservation         | Cancel reservation                        | Status updates to cancelled        | High     |
| W2-26 | Reservation filters behave correctly              | Existing reservations in multiple states | Change filter tabs                        | Correct reservation subset appears | Medium   |

---

### Workstream 3: Business Access and Onboarding Experience

**Owner:** Sahil - Member 3
**Primary Goal:** Validate first-time cafe-owner experience from request to setup completion.

### W3 Test Cases

| ID    | Test Case                                            | Preconditions                             | Steps                                   | Expected Result                                     | Priority |
| ----- | ---------------------------------------------------- | ----------------------------------------- | --------------------------------------- | --------------------------------------------------- | -------- |
| W3-01 | Partner page opens correctly                         | App running                               | Open For Cafe Owners                    | Page loads with CTA and partner information         | High     |
| W3-02 | Business portal modal opens                          | Partner page or header CTA available      | Open Business Portal                    | Modal opens successfully                            | High     |
| W3-03 | Access request form validates required fields        | Portal request form open                  | Submit empty/invalid fields             | Validation messages appear                          | High     |
| W3-04 | Valid access request can be submitted                | Valid test business details available     | Submit request form                     | Success confirmation appears                        | High     |
| W3-05 | Approved business user can request OTP               | Approved business account exists          | Open business sign-in and request OTP   | OTP step appears                                    | High     |
| W3-06 | Invalid business email is handled correctly          | Non-approved or invalid business email    | Request OTP                             | Clear failure or rejection response shown           | High     |
| W3-07 | Valid business OTP allows dashboard entry            | OTP email received                        | Enter valid OTP                         | User is authenticated as business user              | High     |
| W3-08 | Incomplete setup triggers setup guard                | Approved business with no completed setup | Sign in                                 | Setup-required screen appears                       | High     |
| W3-09 | Setup wizard prefill appears where available         | Approved access request linked to user    | Begin setup                             | Business request data is prefilled where applicable | Medium   |
| W3-10 | Business profile step validates required information | Setup step 1                              | Enter incomplete/invalid fields         | Validation messages appear                          | High     |
| W3-11 | Tables step allows adding valid tables               | Setup step 2                              | Add table names, capacities, types      | Tables can be saved in wizard state                 | High     |
| W3-12 | Tables step rejects invalid values                   | Setup step 2                              | Enter incomplete/invalid table settings | Validation blocks continuation                      | High     |
| W3-13 | Operating hours step works for all days              | Setup step 3                              | Set hours and closed/open states        | Hours persist in wizard state                       | High     |
| W3-14 | Apply-to-all hours shortcut works                    | Setup step 3                              | Apply Monday hours to all               | Week schedule updates correctly                     | Medium   |
| W3-15 | Game library search works in setup                   | Setup step 4 and BGG configured           | Search known game title                 | Results appear                                      | Medium   |
| W3-16 | Game selection works in setup                        | Setup step 4                              | Add one or more games                   | Selected games appear in wizard                     | Medium   |
| W3-17 | Pricing step validates model data                    | Setup step 6                              | Enter invalid pricing values            | Validation blocks submission                        | High     |
| W3-18 | Valid pricing setup completes onboarding             | Full setup data ready                     | Submit final setup                      | Setup completes and dashboard becomes available     | High     |
| W3-19 | Post-setup redirect lands on business dashboard      | Setup completed                           | Finish wizard                           | User reaches dashboard                              | High     |

---

### Workstream 4: Business Operations and Administration Experience

**Owner:** Justin - Member 4
**Primary Goal:** Validate daily operational use of the business portal after onboarding.

### W4 Test Cases

| ID    | Test Case                                           | Preconditions                                | Steps                              | Expected Result                          | Priority |
| ----- | --------------------------------------------------- | -------------------------------------------- | ---------------------------------- | ---------------------------------------- | -------- |
| W4-01 | Business dashboard loads with KPI cards             | Approved setup-complete business user        | Open dashboard                     | Dashboard loads successfully             | High     |
| W4-02 | Today's reservations list is visible                | Business account with reservation data       | Review dashboard reservations list | Reservations display correctly           | High     |
| W4-03 | Dashboard filters reduce reservation list correctly | Existing reservations with varied states     | Apply filters                      | Matching subset is shown                 | High     |
| W4-04 | Reservation status update works from dashboard      | Existing reservation                         | Change status                      | Status updates successfully              | High     |
| W4-05 | Full reservations page loads                        | Setup-complete business account              | Open Reservations page             | Page loads with timeline/list areas      | High     |
| W4-06 | Walk-in reservation can be created                  | Tables available                             | Create new reservation             | Reservation appears in list              | High     |
| W4-07 | Edit reservation updates details correctly          | Existing reservation                         | Modify reservation fields and save | Changes persist                          | High     |
| W4-08 | Reservation can be deleted                          | Existing reservation                         | Delete reservation                 | Reservation is removed                   | High     |
| W4-09 | Business Info settings load current data            | Settings available                           | Open Business Info                 | Saved business data displays             | High     |
| W4-10 | Business Info changes save correctly                | Settings page open                           | Update profile fields and save     | Changes persist                          | High     |
| W4-11 | Pricing settings save correctly                     | Settings page open                           | Change pricing model and values    | Pricing updates successfully             | High     |
| W4-12 | Tables settings allow add/remove actions            | Settings page open                           | Add or remove table                | Table inventory updates correctly        | High     |
| W4-13 | Operating Hours settings save correctly             | Settings page open                           | Update hours and save              | Hours persist correctly                  | High     |
| W4-14 | Game Library settings can add games                 | BGG configured                               | Search and add game                | Game appears in library                  | Medium   |
| W4-15 | Game Library settings can remove games              | Existing library entries                     | Remove game                        | Game is removed from library             | Medium   |
| W4-16 | Account deletion warning is clear                   | Settings page open                           | Open Account tab                   | Danger zone messaging is visible         | Medium   |
| W4-17 | Account deletion requires typed confirmation        | Account tab open                             | Attempt without `DELETE` text      | Delete action remains blocked            | High     |
| W4-18 | Account deletion completes only when confirmed      | Disposable business test account recommended | Type `DELETE` and submit           | Business account deletion flow completes | High     |

---

## 10. Baseline Technical Validation Already Completed

The following technical validation was already performed on **April 7, 2026** before manual UAT execution:

| Validation Item                 | Result | Notes                                             |
| ------------------------------- | ------ | ------------------------------------------------- |
| Backend TypeScript compile      | Pass   | `npx tsc -p tsconfig.json` completed successfully |
| Frontend unit/integration tests | Pass   | `23` test files passed, `512` tests passed        |
| Backend unit tests              | Pass   | `12` suites passed, `282` tests passed            |

### Interpretation

This means:

- the codebase has a strong automated baseline in many areas,
- the backend is in a technically stable state for testing,
- the frontend dev/test experience is usable,
- but the current repository still has a known build issue that should be recorded as a pre-UAT technical risk.

### Important UAT Note

The frontend build failure should **not** automatically invalidate the manual UAT effort if:

- the application still runs successfully in development mode,
- the user-facing flows can still be exercised and accepted.

However, it should be documented as a known issue in the final capstone testing summary.

---

## 11. UAT Results Recording Section

This section is designed for your team to complete during execution.

### 11.1 Summary Dashboard

| Workstream                                | Owner    | Total Cases | Pass | Fail | Blocked | Not Run | Notes |
| ----------------------------------------- | -------- | ----------- | ---- | ---- | ------- | ------- | ----- |
| W1 Public Discovery                       | Member 1 | 15          |      |      |         |         |       |
| W2 Customer Identity and Reservations     | Member 2 | 26          |      |      |         |         |       |
| W3 Business Access and Onboarding         | Member 3 | 19          |      |      |         |         |       |
| W4 Business Operations and Administration | Member 4 | 18          |      |      |         |         |       |
| **Total**                                 | Team     | **78**      |      |      |         |         |       |

### 11.2 Detailed Result Log Template

Use the following structure for each executed test.

| Test ID | Tester | Date | Status | Expected Result                                    | Actual Result | Evidence | Defect ID / Notes |
| ------- | ------ | ---- | ------ | -------------------------------------------------- | ------------- | -------- | ----------------- |
| W1-01   |        |      |        | Home page loads without fatal error                |               |          |                   |
| W1-02   |        |      |        | Correct page opens each time                       |               |          |                   |
| W1-03   |        |      |        | Cafe discovery page loads                          |               |          |                   |
| W1-04   |        |      |        | Cafes display or empty state appears clearly       |               |          |                   |
| W1-05   |        |      |        | Matching cafes are shown                           |               |          |                   |
| W1-06   |        |      |        | Detailed venue page loads                          |               |          |                   |
| W1-07   |        |      |        | Game search page loads                             |               |          |                   |
| W1-08   |        |      |        | Matching game results are displayed                |               |          |                   |
| W1-09   |        |      |        | Cafes carrying that game are shown                 |               |          |                   |
| W1-10   |        |      |        | Booking explanation displays correctly             |               |          |                   |
| W1-11   |        |      |        | Partner info and CTA appear correctly              |               |          |                   |
| W1-12   |        |      |        | Pricing cards and messaging display properly       |               |          |                   |
| W1-13   |        |      |        | About page content displays properly               |               |          |                   |
| W1-14   |        |      |        | Contact page and form display correctly            |               |          |                   |
| W1-15   |        |      |        | Mobile navigation remains usable                   |               |          |                   |
| W2-01   |        |      |        | Signup modal opens                                 |               |          |                   |
| W2-02   |        |      |        | OTP step is shown                                  |               |          |                   |
| W2-03   |        |      |        | Validation message appears                         |               |          |                   |
| W2-04   |        |      |        | Flow moves to password step                        |               |          |                   |
| W2-05   |        |      |        | Error message appears                              |               |          |                   |
| W2-06   |        |      |        | OTP resend succeeds                                |               |          |                   |
| W2-07   |        |      |        | Weak password is blocked                           |               |          |                   |
| W2-08   |        |      |        | Flow moves to profile step                         |               |          |                   |
| W2-09   |        |      |        | Flow moves to preferences                          |               |          |                   |
| W2-10   |        |      |        | Success screen appears                             |               |          |                   |
| W2-11   |        |      |        | User is authenticated                              |               |          |                   |
| W2-12   |        |      |        | Incorrect credentials are rejected                 |               |          |                   |
| W2-13   |        |      |        | Google login succeeds                              |               |          |                   |
| W2-14   |        |      |        | Profile page data is visible                       |               |          |                   |
| W2-15   |        |      |        | Edited details persist                             |               |          |                   |
| W2-16   |        |      |        | Updated preferences persist                        |               |          |                   |
| W2-17   |        |      |        | Reservation modal appears                          |               |          |                   |
| W2-18   |        |      |        | User can continue from step 1                      |               |          |                   |
| W2-19   |        |      |        | Clear warning appears                              |               |          |                   |
| W2-20   |        |      |        | User can skip game selection                       |               |          |                   |
| W2-21   |        |      |        | Guest path continues correctly                     |               |          |                   |
| W2-22   |        |      |        | Authenticated booking succeeds                     |               |          |                   |
| W2-23   |        |      |        | Success screen appears                             |               |          |                   |
| W2-24   |        |      |        | Reservations list appears                          |               |          |                   |
| W2-25   |        |      |        | Reservation status updates to cancelled            |               |          |                   |
| W2-26   |        |      |        | Filters show correct subset                        |               |          |                   |
| W3-01   |        |      |        | Partner page loads correctly                       |               |          |                   |
| W3-02   |        |      |        | Business portal modal opens                        |               |          |                   |
| W3-03   |        |      |        | Validation messages appear                         |               |          |                   |
| W3-04   |        |      |        | Request success confirmation appears               |               |          |                   |
| W3-05   |        |      |        | OTP step appears                                   |               |          |                   |
| W3-06   |        |      |        | Invalid business email is handled clearly          |               |          |                   |
| W3-07   |        |      |        | Business user is authenticated                     |               |          |                   |
| W3-08   |        |      |        | Setup-required screen appears                      |               |          |                   |
| W3-09   |        |      |        | Prefill appears where expected                     |               |          |                   |
| W3-10   |        |      |        | Validation blocks bad profile data                 |               |          |                   |
| W3-11   |        |      |        | Tables can be entered successfully                 |               |          |                   |
| W3-12   |        |      |        | Invalid tables are blocked                         |               |          |                   |
| W3-13   |        |      |        | Hours step works correctly                         |               |          |                   |
| W3-14   |        |      |        | Apply-to-all updates schedule                      |               |          |                   |
| W3-15   |        |      |        | Game search results appear                         |               |          |                   |
| W3-16   |        |      |        | Selected games remain visible                      |               |          |                   |
| W3-17   |        |      |        | Invalid pricing is blocked                         |               |          |                   |
| W3-18   |        |      |        | Setup completes successfully                       |               |          |                   |
| W3-19   |        |      |        | User reaches dashboard                             |               |          |                   |
| W4-01   |        |      |        | Dashboard loads correctly                          |               |          |                   |
| W4-02   |        |      |        | Reservations list displays                         |               |          |                   |
| W4-03   |        |      |        | Filters update reservation list correctly          |               |          |                   |
| W4-04   |        |      |        | Status updates succeed                             |               |          |                   |
| W4-05   |        |      |        | Full reservations page loads                       |               |          |                   |
| W4-06   |        |      |        | Walk-in reservation is created                     |               |          |                   |
| W4-07   |        |      |        | Reservation updates persist                        |               |          |                   |
| W4-08   |        |      |        | Reservation is deleted                             |               |          |                   |
| W4-09   |        |      |        | Business Info shows current data                   |               |          |                   |
| W4-10   |        |      |        | Business Info changes persist                      |               |          |                   |
| W4-11   |        |      |        | Pricing changes persist                            |               |          |                   |
| W4-12   |        |      |        | Tables add/remove works                            |               |          |                   |
| W4-13   |        |      |        | Operating hours save correctly                     |               |          |                   |
| W4-14   |        |      |        | Games can be added                                 |               |          |                   |
| W4-15   |        |      |        | Games can be removed                               |               |          |                   |
| W4-16   |        |      |        | Danger zone messaging is clear                     |               |          |                   |
| W4-17   |        |      |        | Delete action remains blocked without confirmation |               |          |                   |
| W4-18   |        |      |        | Account deletion completes when confirmed          |               |          |                   |

### 11.3 Defect Log Template

| Defect ID | Reported By | Date | Severity | Related Test ID | Summary | Steps to Reproduce | Current Status |
| --------- | ----------- | ---- | -------- | --------------- | ------- | ------------------ | -------------- |
| DEF-001   |             |      |          |                 |         |                    |                |

---

## 12. Known Risks and Special Notes

These items should be acknowledged during UAT review:

1. **Frontend production build currently fails** because of existing TypeScript issues in the repository.
2. The **reservation payment step is currently a user-facing booking/payment-style interface**, not a full live payment gateway integration.
3. The **menu setup step exists in onboarding**, but the strongest finalized business operations in the current build are business info, tables, hours, game library, pricing, reservations, and account management.
4. Business access testing depends on email delivery and administrative approval setup.
5. Game discovery and business game-library workflows depend on BoardGameGeek integration being configured.

These are not reasons to skip UAT. They are reasons to record acceptance results carefully and distinguish between:

- feature limitation,
- known technical debt,
- acceptance failure,
- environmental issue.

---

## 13. Final Sign-Off Template

### Final UAT Recommendation

Choose one final outcome after team execution:

- **Accepted**
- **Accepted with Known Issues**
- **Rejected Pending Fixes**

### Acceptance Summary

| Item                      | Value |
| ------------------------- | ----- |
| Total Test Cases Executed |       |
| Passed                    |       |
| Failed                    |       |
| Blocked                   |       |
| Critical Defects Open     |       |
| High Defects Open         |       |
| Final Decision            |       |

### Sign-Off Record

| Name   | Role                                              | Signature / Initials | Date |
| ------ | ------------------------------------------------- | -------------------- | ---- |
| Graham | Member 1 - Public Discovery                       |                      |      |
| Chloe  | Member 2 - Customer Identity and Reservations     |                      |      |
| Sahil  | Member 3 - Business Access and Onboarding         |                      |      |
| Justin | Member 4 - Business Operations and Administration |                      |      |
