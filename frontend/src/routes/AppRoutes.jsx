import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public pages
import HomePage from "../pages/public/HomePage";
import ArticleDetailsPage from "../pages/public/ArticleDetailsPage";
import CategoryPage from "../pages/public/CategoryPage";
import CornerPage from "../pages/public/CornerPage";
import SearchResultsPage from "../pages/public/SearchResultsPage";
import LiveCoveragePage from "../pages/public/LiveCoveragePage";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import AcceptInvitationPage from "../pages/auth/AcceptInvitationPage";

// Owner pages
import OwnerDashboardPage from "../pages/owner/OwnerDashboardPage";
import ManageUsersPage from "../pages/owner/ManageUsersPage";
import InviteUsersPage from "../pages/owner/InviteUsersPage";
import ManageCategoriesPage from "../pages/owner/ManageCategoriesPage";
import ManageCornersPage from "../pages/owner/ManageCornersPage";
import ManageAdsPage from "../pages/owner/ManageAdsPage";
import ActivityLogsPage from "../pages/owner/ActivityLogsPage";

import ManageArticlesPage from "../pages/owner/ManageArticlesPage";
import LiveManagementPage from "../pages/owner/LiveManagementPage";
import HomepageControlPage from "../pages/owner/HomepageControlPage";

// Publisher pages
import PublisherDashboardPage from "../pages/publisher/PublisherDashboardPage";
import ReviewArticlesPage from "../pages/publisher/ReviewArticlesPage";
import PublishedArticlesPage from "../pages/publisher/PublishedArticlesPage";
import ManageLiveUpdatesPage from "../pages/publisher/ManageLiveUpdatesPage";
import BreakingNewsControlPage from "../pages/publisher/BreakingNewsControlPage";
import FeaturedStoryControlPage from "../pages/publisher/FeaturedStoryControlPage";
import ScheduledArticlesPage from "../pages/publisher/ScheduledArticlesPage";

// Editor pages
import EditorDashboardPage from "../pages/editor/EditorDashboardPage";
import CreateArticlePage from "../pages/editor/CreateArticlePage";
import EditArticlePage from "../pages/editor/EditArticlePage";
import MyArticlesPage from "../pages/editor/MyArticlesPage";
import MediaLibraryPage from "../pages/editor/MediaLibraryPage";

// Reporter pages
import ReporterDashboardPage from "../pages/reporter/ReporterDashboardPage";
import SubmitReportPage from "../pages/reporter/SubmitReportPage";
import MyReportsPage from "../pages/reporter/MyReportsPage";

// Layouts
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Guards
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/articles/:slug" element={<ArticleDetailsPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/corner/:slug" element={<CornerPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/live" element={<LiveCoveragePage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/accept-invitation" element={<AcceptInvitationPage />} />

      {/* Owner Routes */}
      <Route element={<ProtectedRoute roles={["owner"]} />}>
        <Route element={<DashboardLayout role="owner" />}>
          <Route path="/owner" element={<OwnerDashboardPage />} />
          <Route path="/owner/users" element={<ManageUsersPage />} />
          <Route path="/owner/invite" element={<InviteUsersPage />} />
          <Route path="/owner/categories" element={<ManageCategoriesPage />} />
          <Route path="/owner/corners" element={<ManageCornersPage />} />
          <Route path="/owner/ads" element={<ManageAdsPage />} />
          <Route path="/owner/activity-logs" element={<ActivityLogsPage />} />
          <Route path="/owner/articles" element={<ManageArticlesPage />} />
          <Route path="/owner/articles/create" element={<CreateArticlePage />} />
          <Route path="/owner/articles/:id/edit" element={<CreateArticlePage />} />
          <Route path="/owner/live" element={<LiveManagementPage />} />
          <Route path="/owner/homepage" element={<HomepageControlPage />} />
        </Route>
      </Route>

      {/* Publisher Routes */}
      <Route element={<ProtectedRoute roles={["owner", "publisher"]} />}>
        <Route element={<DashboardLayout role="publisher" />}>
          <Route path="/publisher" element={<PublisherDashboardPage />} />
          <Route path="/publisher/review" element={<ReviewArticlesPage />} />
          <Route path="/publisher/published" element={<PublishedArticlesPage />} />
          <Route path="/publisher/live" element={<ManageLiveUpdatesPage />} />
          <Route path="/publisher/breaking" element={<BreakingNewsControlPage />} />
          <Route path="/publisher/featured" element={<FeaturedStoryControlPage />} />
          <Route path="/publisher/scheduled" element={<ScheduledArticlesPage />} />
          <Route path="/publisher/articles/create" element={<CreateArticlePage />} />
          <Route path="/publisher/articles/:id/edit" element={<CreateArticlePage />} />
        </Route>
      </Route>

      {/* Editor Routes */}
      <Route element={<ProtectedRoute roles={["owner", "publisher", "editor"]} />}>
        <Route element={<DashboardLayout role="editor" />}>
          <Route path="/editor" element={<EditorDashboardPage />} />
          <Route path="/editor/articles/create" element={<CreateArticlePage />} />
          <Route path="/editor/articles/:id/edit" element={<EditArticlePage />} />
          <Route path="/editor/articles" element={<MyArticlesPage />} />
          <Route path="/editor/media" element={<MediaLibraryPage />} />
        </Route>
      </Route>

      {/* Reporter Routes */}
      <Route element={<ProtectedRoute roles={["reporter", "owner", "publisher", "editor"]} />}>
        <Route element={<DashboardLayout role="reporter" />}>
          <Route path="/reporter" element={<ReporterDashboardPage />} />
          <Route path="/reporter/submit" element={<SubmitReportPage />} />
          <Route path="/reporter/reports" element={<MyReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
