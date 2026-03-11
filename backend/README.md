# Newsroom Backend Architecture Documentation

## Core Description
The newsroom backend is the operational core of the digital newspaper platform. It is responsible for user authentication, role-based access control, reporter submissions, AI-based translation and transcription, article management, editorial review, publication workflow, media handling, live coverage management, advertisement control, notifications, and activity logging. It connects the newsroom dashboard with the database, AI services, and the public-facing website, ensuring that all newsroom operations are secure, organized, and efficient.

## One-Line Description
The newsroom backend is the central system that manages users, permissions, reports, translations, articles, approvals, publication, live coverage, advertisements, and all data flow between the dashboard, database, AI services, and the public website.

## Non-Technical Explanation
Frontend is the newspaper’s face. Backend is the newspaper office.

The office:
- receives reports
- translates them
- stores them
- sends them to editors
- sends them to publishers
- publishes them
- shows them on the website

## The 5 Main Jobs of the Backend

1. **It manages people**: The backend acts as the permission system, controlling what each person (owner, publisher, editor, reporter) can do.
2. **It manages content**: It controls the full life cycle of a news item (reports, articles, media, categories), from raw draft to final published piece.
3. **It manages workflow**: It serves as the workflow engine, tracking article states (draft, submitted, under review, approved, rejected, scheduled, published, archived).
4. **It manages automation**: The automation layer handles repetitive, smart tasks like AI translation, audio transcription, automated emails, and scheduling.
5. **It serves data to the frontend**: As a middleman, it receives requests, checks permissions, gets the data from the database, and returns clean JSON to the frontend dashboard or website.

## Module Breakdown

*   **A. Authentication module**: Login, JWT token creation, password management. Ensure only authorized personnel can enter.
*   **B. User and role module**: Role management (owner, publisher, editor, reporter), permissions, invitations, and activation statuses.
*   **C. Report module**: Raw news submissions from reporters containing original text, source details, and media.
*   **D. Translation module**: Language detection, AI text translation (into English), and audio transcription to remove language barriers.
*   **E. Article module**: Final newsroom content containing titles, summaries, bodies, SEO data, featured images, and author references.
*   **F. Review and publishing module**: Editorial workflow (submit, approve, reject, revise, publish, unpublish, schedule).
*   **G. Category and corner module**: Normal sections (World, Sports) and dynamic corners (Eid Special).
*   **H. Media module**: Global visual assets (images, banners, thumbnails).
*   **I. Live coverage module**: Real-time event streams and updates.
*   **J. Advertisement module**: Ad campaigns, banners, and sponsored content.
*   **K. Homepage control module**: Visual prioritization (hero headlines, breaking news ticker).
*   **L. Notification module**: System alerts for approvals, rejections, revisions, and publishes.
*   **M. Activity log module**: Audit trails to enforce transparency and accountability.

## Full Data Flow

1. **Reporter sides**: Sends raw report in native language (e.g. Bangla, Arabic)
2. **Backend Step 1**: Saves raw report.
3. **Backend Step 2**: Sends content/audio for AI translation.
4. **Backend Step 3**: Stores original content and new English translation.
5. **Editor side**: Opens translation, refines it, converting it to an "Article".
6. **Publisher side**: Reviews and approves the article.
7. **Backend Final Step**: Marks as published and serves to the frontend website.

## Folder Organization (Clean Architecture)

- `routes/` = URL entry points
- `controllers/` = Receives requests and orchestrates logic
- `services/` = Contains the core business rules and logic
- `models/` = Database structure and ORM helpers
- `middleware/` = Permission, authentication, and request interception
- `validators/` = Input sanitation and logic validation
- `utils/` = Reusable helper functions
