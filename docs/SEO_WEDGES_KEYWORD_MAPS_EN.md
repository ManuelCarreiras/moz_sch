# SEO Wedges + Keyword Maps (English, Global)

This document defines **wedges** (landing-page clusters) for *Santa Isabel Escola* and provides a **keyword mapping template**, initial keyword seeds for priority wedges, and a suggested **SEO page tree** designed to reduce cannibalization.

## What a “wedge” means here

A wedge is a **single, focused search intent** that can support a cluster of pages:

- 1 **money** page (conversion-focused landing page)
- Supporting pages (feature detail, use cases, FAQs, comparisons, how-tos)

## Wedges (crisp definitions + boundaries)

### Wedge01_SchoolManagementSystem (Umbrella)
- **Who searches**: School decision-makers (admins), secretaries, finance teams (sometimes “principal”).
- **Promise**: Run core school operations (students, academics, attendance, grades, schedules, fees/payroll) in one platform with role-based portals.
- **Include**: High-level overview, modules summary, role portals, security, deployment/self-host options if applicable.
- **Exclude / link out to**: Deep module detail (belongs in module wedges below).
- **Cannibalization rule**: Only this wedge targets the broad head term “school management system” as primary.

### Wedge02_StudentInformationSystem_SIS
- **Who searches**: Admin/secretary teams evaluating an SIS.
- **Promise**: Manage student records from enrollment onward (student profiles, guardians, placement into year levels/classes).
- **Include**: Student creation, guardian relationships, student-year-level tracking, class enrollment.
- **Exclude / link out to**: Gradebook/attendance (separate wedges) except as “works with”.

### Wedge03_AcademicSetup (Setup Wizard / Academic Foundation)
- **Who searches**: Admin/secretary teams setting up a school year.
- **Promise**: Configure the academic structure (school years, terms, periods, year levels, departments, subjects, grading scales).
- **Include**: Academic setup wizard, “cascading filters” concept, foundational entities (terms/periods/score ranges).
- **Exclude / link out to**: Daily operations (attendance, grade entry) except as outcomes.

### Wedge04_SchoolScheduling_Timetable
- **Who searches**: Admin/secretary (timetabling), teachers/students (schedule view).
- **Promise**: Publish and view clear schedules by year/term with teacher/classroom/period context.
- **Include**: Timetable viewing per role; structure around periods/terms; conflict avoidance (if positioned).
- **Exclude / link out to**: Attendance taking (separate wedge) and gradebook (separate wedge).

### Wedge05_AssignmentManagement
- **Who searches**: Teachers/admins: “assignment management”, “homework tracking”, “class assignments”.
- **Promise**: Create, publish, filter, and track assignments aligned to classes/subjects/terms.
- **Include**: Teacher workflow (create/publish), student view, filtering by year/term/subject/class.
- **Exclude / link out to**: Gradebook mechanics (separate wedge), resources library (if separate).

### Wedge06_Gradebook_Grading
- **Who searches**: Teachers/admins: “gradebook software”, “weighted grades”, “report card grades”.
- **Promise**: Enter grades efficiently and compute weighted averages / year grades consistently.
- **Include**: Grade entry workflow, grading criteria, assessment types, weighting, year-grade calculation/caching.
- **Exclude / link out to**: Assignments creation (separate wedge) except as inputs to grading.

### Wedge07_AttendanceTracking
- **Who searches**: Teachers/admins: “attendance tracking”, “class attendance app”, “student attendance”.
- **Promise**: Take attendance by roster with statuses (present/absent/late/excused) and view attendance history.
- **Include**: Teacher attendance taking, student attendance view, filtering by year/term/class.
- **Exclude / link out to**: Timetable/scheduling logic (separate wedge) except as context.

### Wedge08_FinancialManagement (Fees + Payroll)
- **Who searches**: Finance teams, admins: “school fee management”, “tuition billing”, “payroll for teachers”.
- **Promise**: Track student monthly payments and manage staff/teacher salaries with paid/unpaid status and monthly generation.
- **Include**: Student payments (mensality), teacher salaries, staff salaries, salary grids, generation flows, role access.
- **Exclude / link out to**: Accounting integrations unless you actually have them.
- **Terminology rule**: Use “student fees / tuition / monthly payments” as primary wording; include “mensality” as a synonym if you keep it in-product.

### Wedge09_TeacherPortal
- **Who searches**: Teachers evaluating tools; admins evaluating teacher workflows.
- **Promise**: A teacher workspace to manage assignments, gradebook, attendance, and schedules.
- **Include**: Teacher capabilities overview + links into Wedge05/06/07/04.
- **Exclude / link out to**: Admin/finance operations.
- **Cannibalization rule**: This page targets “teacher portal” / “teacher dashboard” terms, not “gradebook software”.

### Wedge10_StudentPortal
- **Who searches**: Schools promoting transparency; sometimes students/parents searching “student portal”.
- **Promise**: A student view for assignments, grades, attendance, and schedule.
- **Include**: Student experience overview + links into Wedge05/06/07/04.
- **Exclude / link out to**: Parent portal (future).

### Wedge11_GuardianManagement (Contacts)
- **Who searches**: Secretaries/admins: “parent contact management”, “guardian information system”.
- **Promise**: Store guardian contact details and relationships to students for quick access.
- **Include**: Guardian CRUD, relationship types, where it shows up in student workflows.
- **Exclude / link out to**: Parent self-service portal (future).

### Wedge12_Security_RBAC_Login (Role-Based Portals)
- **Who searches**: IT/admin evaluators: “role-based access school software”, “secure school portal login”.
- **Promise**: Secure login + role-based access so each role sees what they need (admin/secretary/financial/teacher/student).
- **Include**: RBAC concept, portal separation, authentication provider (AWS Cognito), session/token basics at a high level.
- **Exclude / link out to**: Deep “AWS Cognito tutorial” content unless it’s truly part of your marketing strategy.

## Future wedges (do NOT market as current features)

- **ParentPortal**: mentioned as a next phase idea; keep it on a roadmap page if needed.
- **Analytics_Reports**: grade analytics, attendance reports; also “next phase”.

## Keyword map template (copy/paste per wedge)

Use one sheet/table per wedge.

| Field | What to fill |
|------|--------------|
| Wedge | e.g. Wedge06_Gradebook_Grading |
| ICP / Role | Admin, Secretary, Financial, Teacher, Student |
| PrimaryKW | The main head term (1) |
| SecondaryKWs | Synonyms + close variants |
| PainKWs | “how to…”, “fix…”, “track…”, “reduce…” queries |
| FeatureKWs | Specific functions (weighted grades, roster attendance, etc.) |
| RoleKWs | “for teachers”, “for administrators”, etc. modifiers |
| ComparisonKWs | “best”, “alternatives”, “vs”, “open source” (only if applicable) |
| IntegrationKWs | exports, SSO, Google/Microsoft, API, etc. (only if true) |
| Intent buckets | TOFU / MOFU / BOFU keyword grouping |
| Target page type | Money page / Feature page / Use-case / FAQ / How-to / Glossary |
| CTA | demo, contact sales, self-host guide, pricing, etc. |
| Proof points | screenshots, workflow steps, security claims, metrics (only if true) |
| Internal links | Parent wedge ↔ child wedges ↔ related wedges |
| Cannibalization note | What *this* page should not target as primary |

## Priority wedges (start here)

Given “English/global” and a broad audience, prioritize wedges that match **buyer intent** and showcase your strongest completed features:

1. **Wedge01_SchoolManagementSystem** (umbrella money page)
2. **Wedge02_StudentInformationSystem_SIS** (classic evaluation term)
3. **Wedge06_Gradebook_Grading** (high-intent teacher/admin searches)
4. **Wedge07_AttendanceTracking** (high-intent and ubiquitous)
5. **Wedge04_SchoolScheduling_Timetable** (high-intent operational need)

## Initial keyword seeds (draft sets for the priority wedges)

These are **seed keywords** to start mapping and content planning (not a final list; you’ll expand using a keyword tool).

### Wedge01_SchoolManagementSystem
- **PrimaryKW**: school management system
- **SecondaryKWs**: school administration software, school management software, K-12 school management system, school ERP software, school portal software
- **PainKWs**: manage a school online, digitize school administration, reduce paperwork in schools
- **FeatureKWs**: student records, gradebook, attendance tracking, school timetable, assignments, fees management, payroll
- **RoleKWs**: for administrators, for secretaries, for school staff
- **ComparisonKWs**: best school management system, school management system alternatives, open source school management system

### Wedge02_StudentInformationSystem_SIS
- **PrimaryKW**: student information system
- **SecondaryKWs**: SIS software, student information management system, student records system, enrollment management system (school)
- **PainKWs**: organize student records, track student enrollment, manage guardians/parent contacts
- **FeatureKWs**: student profiles, guardian management, class enrollment, academic year setup (link to Wedge03)
- **RoleKWs**: for school administrators, for school secretaries
- **ComparisonKWs**: best SIS for small schools, SIS alternatives, open source SIS

### Wedge06_Gradebook_Grading
- **PrimaryKW**: gradebook software
- **SecondaryKWs**: online gradebook, teacher gradebook app, grading software for teachers, weighted grade calculator (software), student grading system
- **PainKWs**: calculate weighted averages, speed up grade entry, keep grading consistent across classes
- **FeatureKWs**: assessment types, grading criteria/weights, year grade calculation, assignment-based grading workflow
- **RoleKWs**: for teachers, for schools
- **ComparisonKWs**: best gradebook app, gradebook software alternatives

### Wedge07_AttendanceTracking
- **PrimaryKW**: attendance tracking software
- **SecondaryKWs**: student attendance system, class attendance app, school attendance software, attendance register online
- **PainKWs**: take attendance faster, reduce attendance errors, track late students
- **FeatureKWs**: roster attendance, attendance statuses (present/absent/late/excused), attendance history, filters by term/year/class
- **RoleKWs**: for teachers, for schools, for administrators
- **ComparisonKWs**: best attendance tracking app for schools, attendance software alternatives

### Wedge04_SchoolScheduling_Timetable
- **PrimaryKW**: school timetable software
- **SecondaryKWs**: class scheduling software (school), school scheduling system, timetable planner for schools
- **PainKWs**: publish class schedules, avoid schedule confusion, keep term schedules organized
- **FeatureKWs**: timetable views (teacher/student), periods/terms/school years, classroom + teacher context
- **RoleKWs**: for administrators, for schools
- **ComparisonKWs**: best timetable software for schools, timetable software alternatives

## Proposed SEO page tree (aligned to wedges)

This is a “wedge-first” structure. Exact routes can be adapted to your frontend router.

- `/` (Home) → targets Wedge01 summary + links to top wedges
- `/school-management-system/` (Wedge01 money page)
- `/student-information-system/` (Wedge02 money page)
- `/features/`
  - `/features/gradebook/` (Wedge06 money page)
  - `/features/attendance-tracking/` (Wedge07 money page)
  - `/features/school-timetable/` (Wedge04 money page)
  - `/features/assignment-management/` (Wedge05 money page)
  - `/features/academic-setup/` (Wedge03 money page)
  - `/features/financial-management/` (Wedge08 money page)
  - `/features/guardian-management/` (Wedge11 money page)
  - `/features/role-based-access/` (Wedge12 money page)
- `/roles/`
  - `/roles/teachers/` (Wedge09)
  - `/roles/students/` (Wedge10)
  - `/roles/secretaries/` (role-focused aggregator linking to Wedge02/03/04/11)
  - `/roles/financial/` (role-focused aggregator linking to Wedge08)
  - `/roles/administrators/` (role-focused aggregator linking to most wedges)
- `/compare/` (only if you want this strategy)
  - `/compare/open-source-school-management-system/`
  - `/compare/gradebook-software/` (alternatives/buying guide)
- `/resources/`
  - `/resources/how-to-take-attendance/`
  - `/resources/how-to-calculate-weighted-grades/`
  - `/resources/school-timetable-template/` (if you provide one)
  - `/resources/glossary/` (SIS, term, period, etc.)

### Internal linking rules (simple)
- Each **module money page** links to:
  - the **umbrella** page (`/school-management-system/`)
  - the **role portal** pages that use that module
  - 1–2 adjacent modules (e.g., Gradebook ↔ Assignments, Attendance ↔ Timetable)
- Each **role page** links to:
  - the top 3–4 modules relevant to that role
- Avoid linking “gradebook” anchor text heavily from the umbrella page to prevent it ranking instead of the dedicated gradebook page.

## Keyword maps (draft) for chosen wedges

These are **draft keyword maps** for the first three wedges you selected: **Gradebook**, **Timetable**, and **Financial**. They are organized by intent (BOFU/MOFU/TOFU) so you can assign each bucket to a page and avoid cannibalization. Expand these using a keyword tool (volume/difficulty/SERP intent) before publishing.

### Wedge06_Gradebook_Grading (Keyword map)

- **BOFU (money page target)**:
  - gradebook software
  - online gradebook for teachers
  - teacher gradebook app
  - grading software for schools
  - school gradebook system
- **MOFU (feature / use-case pages)**:
  - weighted gradebook software
  - weighted grades calculator for teachers (software)
  - gradebook with assignment categories
  - gradebook with assessment types
  - calculate term grade automatically
  - calculate final grade automatically
  - gradebook for multiple classes
- **TOFU (how-to / glossary / pain)**:
  - how to calculate weighted grades
  - how to set grading weights
  - what is a gradebook (school)
  - grading criteria examples for teachers
  - assessment types in grading (quiz, test, homework)
- **Comparison (optional)**:
  - best gradebook software
  - gradebook software alternatives
  - spreadsheet gradebook vs gradebook software
  - free gradebook software (only if you offer free)
- **Internal links to prioritize**:
  - Wedge05_AssignmentManagement (inputs to grading)
  - Wedge09_TeacherPortal (teacher workflow context)
  - Wedge10_StudentPortal (student grade viewing)

### Wedge04_SchoolScheduling_Timetable (Keyword map)

- **BOFU (money page target)**:
  - school timetable software
  - school scheduling software
  - class scheduling software for schools
  - timetable planner for schools
- **MOFU (feature / use-case pages)**:
  - student timetable portal
  - student schedule online
  - teacher timetable portal
  - teacher schedule online
  - school timetable by term
  - school timetable by semester
  - period-based school timetable
  - classroom scheduling for schools (only if applicable)
  - avoid double booking teachers (only if applicable)
- **TOFU (how-to / templates / pain)**:
  - how to make a school timetable
  - school timetable template (if you provide one)
  - what is a school period vs term
  - how to publish class schedules to students
- **Comparison (optional)**:
  - best school timetable software
  - timetable software alternatives
  - google sheets timetable vs timetable software
- **Internal links to prioritize**:
  - Wedge07_AttendanceTracking (adjacent module)
  - Wedge09_TeacherPortal and Wedge10_StudentPortal (schedule view)
  - Wedge03_AcademicSetup (terms/periods underpin scheduling)

### Wedge08_FinancialManagement (Fees + Payroll) (Keyword map)

- **BOFU (money page target)**:
  - school fee management software
  - tuition management software
  - school billing software
  - school payroll software (only if you market payroll)
  - teacher salary management (for schools)
- **MOFU (feature / use-case pages)**:
  - track paid and unpaid tuition
  - track paid and unpaid school fees
  - generate monthly fees for students
  - manage teacher salaries monthly
  - staff salary management
  - salary grid management
  - payment due dates tracking
  - fees by month and year (reporting) (only if applicable)
- **TOFU (how-to / pain)**:
  - how to track school fee payments
  - how to manage tuition payments
  - how to manage teacher payroll at a school
  - what is tuition management software
- **Comparison (optional)**:
  - best tuition management software
  - school fee management software alternatives
  - free tuition management software (only if you offer free)
- **Terminology note**:
  - Use **fees / tuition / monthly payments** on marketing pages; include **mensality** as a synonym only if needed.
- **Internal links to prioritize**:
  - Wedge12_Security_RBAC_Login (financial role access)
  - Wedge01_SchoolManagementSystem (umbrella positioning)

