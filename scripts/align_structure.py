import os
from pathlib import Path

BASE_DIR = Path("c:/Users/wwwal/Downloads/bangladesh-global-newspaper")

STRUCTURE = {
    "frontend/public": ["favicon.ico", "logo.png", "robots.txt"],
    "frontend/src/assets/images": [],
    "frontend/src/assets/icons": [],
    "frontend/src/assets/banners": [],
    "frontend/src/assets/placeholders": [],
    "frontend/src/components/common": [
        "Button.jsx", "Input.jsx", "Modal.jsx", "Loader.jsx", "Pagination.jsx", "ConfirmationDialog.jsx"
    ],
    "frontend/src/components/layout": [
        "Header.jsx", "Footer.jsx", "Sidebar.jsx", "Topbar.jsx", "MobileMenu.jsx"
    ],
    "frontend/src/components/public": [
        "HeroSection.jsx", "TopStories.jsx", "LatestNewsFeed.jsx", "CategorySpotlight.jsx",
        "CornerSection.jsx", "BreakingNewsTicker.jsx", "VideoNewsSection.jsx", "TrendingSection.jsx",
        "LiveNowSection.jsx", "SponsoredSection.jsx", "NewsletterSignup.jsx", "RelatedArticles.jsx"
    ],
    "frontend/src/components/article": [
        "ArticleCard.jsx", "ArticleMeta.jsx", "ArticleBody.jsx", "ArticleGallery.jsx",
        "ArticleTags.jsx", "AuthorBox.jsx"
    ],
    "frontend/src/components/dashboard": [
        "StatsCard.jsx", "ArticleTable.jsx", "UserTable.jsx", "ReviewQueue.jsx",
        "CornerTable.jsx", "CategoryTable.jsx", "AdTable.jsx", "NotificationList.jsx", "ActivityLogTable.jsx"
    ],
    "frontend/src/components/forms": [
        "LoginForm.jsx", "InviteUserForm.jsx", "ArticleForm.jsx", "CornerForm.jsx",
        "CategoryForm.jsx", "AdForm.jsx", "LiveStreamForm.jsx", "MediaUploadForm.jsx",
        "ReportSubmissionForm.jsx", "TranslationReviewForm.jsx"
    ],
    "frontend/src/components/editor": [
        "CKEditorWrapper.jsx", "TranslationPreview.jsx", "AudioUploadPanel.jsx", "RevisionNotes.jsx"
    ],
    "frontend/src/pages/public": [
        "HomePage.jsx", "ArticleDetailsPage.jsx", "CategoryPage.jsx", "CornerPage.jsx",
        "SearchResultsPage.jsx", "LiveCoveragePage.jsx", "VideoPage.jsx", "AboutPage.jsx",
        "ContactPage.jsx", "AuthorProfilePage.jsx"
    ],
    "frontend/src/pages/auth": [
        "LoginPage.jsx", "AcceptInvitationPage.jsx", "ForgotPasswordPage.jsx", "ResetPasswordPage.jsx"
    ],
    "frontend/src/pages/owner": [
        "OwnerDashboardPage.jsx", "ManageUsersPage.jsx", "InviteUsersPage.jsx", "ManageArticlesPage.jsx",
        "ManageCornersPage.jsx", "ManageCategoriesPage.jsx", "ManageAdsPage.jsx", "HomepageControlPage.jsx",
        "LiveManagementPage.jsx", "ActivityLogsPage.jsx", "SettingsPage.jsx"
    ],
    "frontend/src/pages/publisher": [
        "PublisherDashboardPage.jsx", "ReviewArticlesPage.jsx", "PublishedArticlesPage.jsx", "ScheduledArticlesPage.jsx",
        "BreakingNewsControlPage.jsx", "FeaturedStoryControlPage.jsx", "ManageLiveUpdatesPage.jsx"
    ],
    "frontend/src/pages/editor": [
        "EditorDashboardPage.jsx", "CreateArticlePage.jsx", "EditArticlePage.jsx", "MyArticlesPage.jsx",
        "DraftsPage.jsx", "SubmittedArticlesPage.jsx", "RejectedArticlesPage.jsx", "MediaLibraryPage.jsx"
    ],
    "frontend/src/pages/reporter": [
        "ReporterDashboardPage.jsx", "SubmitReportPage.jsx", "MyReportsPage.jsx", "TranslationStatusPage.jsx",
        "ReportFeedbackPage.jsx", "AudioReportPage.jsx"
    ],
    "frontend/src/layouts": [
        "PublicLayout.jsx", "DashboardLayout.jsx", "OwnerLayout.jsx", "PublisherLayout.jsx",
        "EditorLayout.jsx", "ReporterLayout.jsx"
    ],
    "frontend/src/routes": [
        "AppRoutes.jsx", "PublicRoutes.jsx", "AuthRoutes.jsx", "OwnerRoutes.jsx",
        "PublisherRoutes.jsx", "EditorRoutes.jsx", "ReporterRoutes.jsx"
    ],
    "frontend/src/services": [
        "apiClient.js", "authService.js", "articleService.js", "reportService.js",
        "translationService.js", "categoryService.js", "cornerService.js", "adService.js",
        "liveService.js", "mediaService.js", "userService.js", "notificationService.js"
    ],
    "frontend/src/context": [
        "AuthContext.jsx", "UserContext.jsx", "NotificationContext.jsx", "ThemeContext.jsx"
    ],
    "frontend/src/hooks": [
        "useAuth.js", "useFetch.js", "useRoleGuard.js", "useDebounce.js", "usePagination.js"
    ],
    "frontend/src/utils": [
        "formatDate.js", "slugify.js", "truncateText.js", "validateFile.js", "languageLabels.js", "constants.js"
    ],
    "frontend/src/styles": [
        "global.css", "variables.css", "editor.css"
    ],
    "frontend/src": [
        "App.jsx", "main.jsx"
    ],
    "frontend": [
        ".env", "package.json", "vite.config.js"
    ],

    # Backend
    "backend/app": [
        "__init__.py", "config.py", "extensions.py"
    ],
    "backend/app/models": [
        "user_model.py", "invitation_model.py", "report_model.py", "article_model.py",
        "category_model.py", "corner_model.py", "tag_model.py", "ad_model.py",
        "media_model.py", "live_stream_model.py", "live_update_model.py",
        "activity_log_model.py", "notification_model.py", "comment_model.py"
    ],
    "backend/app/routes": [
        "auth_routes.py", "invitation_routes.py", "user_routes.py", "report_routes.py",
        "article_routes.py", "translation_routes.py", "category_routes.py", "corner_routes.py",
        "tag_routes.py", "ad_routes.py", "media_routes.py", "live_routes.py",
        "notification_routes.py", "comment_routes.py", "dashboard_routes.py", "public_routes.py"
    ],
    "backend/app/controllers": [
        "auth_controller.py", "invitation_controller.py", "user_controller.py", "report_controller.py",
        "article_controller.py", "translation_controller.py", "category_controller.py", "corner_controller.py",
        "tag_controller.py", "ad_controller.py", "media_controller.py", "live_controller.py",
        "notification_controller.py", "comment_controller.py", "dashboard_controller.py", "public_controller.py"
    ],
    "backend/app/services": [
        "auth_service.py", "invitation_service.py", "user_service.py", "report_service.py",
        "article_service.py", "translation_service.py", "transcription_service.py", "category_service.py",
        "corner_service.py", "tag_service.py", "ad_service.py", "media_service.py",
        "live_service.py", "notification_service.py", "search_service.py", "analytics_service.py",
        "homepage_service.py", "activity_log_service.py"
    ],
    "backend/app/middleware": [
        "auth_middleware.py", "role_middleware.py", "validation_middleware.py", "error_handler.py"
    ],
    "backend/app/validators": [
        "auth_validator.py", "invitation_validator.py", "report_validator.py", "article_validator.py",
        "ad_validator.py", "media_validator.py", "live_validator.py"
    ],
    "backend/app/utils": [
        "jwt_helper.py", "password_helper.py", "slug_helper.py", "language_helper.py",
        "file_helper.py", "response_helper.py", "datetime_helper.py", "constants.py"
    ],
    "backend/app/templates": [
        "invitation_email.html", "password_reset_email.html", "article_status_email.html"
    ],
    "backend/app/static/uploads/articles": [],
    "backend/app/static/uploads/reports": [],
    "backend/app/static/uploads/ads": [],
    "backend/app/static/uploads/live": [],
    "backend/app/static/uploads/temp": [],
    "backend/tests": [
        "test_auth.py", "test_articles.py", "test_reports.py", "test_translation.py",
        "test_ads.py", "test_live.py"
    ],
    "backend": [
        "requirements.txt", "run.py", ".env"
    ],

    # Database
    "database/schemas": [
        "users_schema.md", "invitations_schema.md", "reports_schema.md", "articles_schema.md",
        "categories_schema.md", "corners_schema.md", "tags_schema.md", "ads_schema.md",
        "media_schema.md", "live_streams_schema.md", "live_updates_schema.md", "activity_logs_schema.md"
    ],
    "database/seeds": [
        "seed_users.json", "seed_categories.json", "seed_corners.json", "seed_tags.json", "seed_ads.json"
    ],
    "database": [
        "migration_notes.md"
    ],

    # Docs
    "docs": [
        "project_overview.md", "system_architecture.md", "role_permissions.md", "editorial_workflow.md",
        "ai_translation_workflow.md", "live_coverage_workflow.md", "ad_management_workflow.md",
        "homepage_management.md", "api_documentation.md", "deployment_guide.md", "testing_plan.md"
    ],

    # Scripts
    "scripts": [
        "seed_database.py", "create_owner.py", "cleanup_uploads.py", "generate_sample_articles.py"
    ],
    "": [
        ".gitignore", "README.md", "docker-compose.yml", "LICENSE"
    ]
}

def create_structure():
    print(f"Aligning project structure at {BASE_DIR}")
    
    # Create required directories
    for folder, files in STRUCTURE.items():
        folder_path = BASE_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Create __init__.py for Python packages
        if folder.startswith("backend/app") and not folder.endswith("static") and "uploads" not in folder and "templates" not in folder:
            init_file = folder_path / "__init__.py"
            if not init_file.exists():
                init_file.touch()
        
        for file in files:
            file_path = folder_path / file
            
            if not file_path.exists():
                print(f"Creating missing file: {file_path}")
                # Create with simple boilerplate depending on extension
                if file.endswith(".jsx"):
                    content = f"import React from 'react';\n\nconst {file.replace('.jsx', '')} = () => {{\n  return <div>{file.replace('.jsx', '')} Component</div>;\n}};\n\nexport default {file.replace('.jsx', '')};\n"
                elif file.endswith(".js"):
                    if "Routes" in file:
                        content = f"// Routes for {file.replace('.js', '')}\n"
                    else:
                        content = f"// Service or Util: {file.replace('.js', '')}\n"
                elif file.endswith(".css"):
                    content = f"/* Styles for {file} */\n"
                elif file.endswith(".py"):
                    content = f"# Python module: {file.replace('.py', '')}\n"
                elif file.endswith(".md"):
                    content = f"# {file.replace('.md', '').replace('_', ' ').title()}\n\nContent for {file}\n"
                elif file.endswith(".json"):
                    content = "[]\n" if "seed_" in file else "{}\n"
                elif file.endswith(".html"):
                    content = f"<!-- Template for {file} -->\n"
                else:
                    content = ""
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)

if __name__ == "__main__":
    create_structure()
    print("Project structure generation completed.")
