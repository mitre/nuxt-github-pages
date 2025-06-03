# GitHub Actions Setup Guide

This guide explains how to set up the CI/CD workflows for this repository.

## Required Secrets

### NPM_TOKEN
The npm automation token is required for publishing packages to npm.

1. Go to https://www.npmjs.com/
2. Sign in to your account
3. Click on your profile picture → "Access Tokens"
4. Click "Generate New Token" → "Classic Token"
5. Select "Automation" type
6. Copy the token
7. In GitHub: Settings → Secrets → Actions → New repository secret
8. Name: `NPM_TOKEN`
9. Value: Paste your npm token

## Workflow Overview

### Continuous Integration (ci.yml)
- **Triggers**: Every push to main and all PRs
- **Jobs**:
  - Lint: Code style checking
  - Type Check: TypeScript validation
  - Test: Run test suite
  - Security: Dependency vulnerability scan
- **Required**: No additional setup

### Release Workflow (release.yml)
- **Triggers**: Manual workflow dispatch
- **Purpose**: Create new releases with version bump, changelog, npm publish, and GitHub release
- **Required**: NPM_TOKEN secret

### Auto Release (auto-release.yml)
- **Triggers**: When PR is merged to main
- **Purpose**: Automatically release based on PR labels
- **Labels**:
  - `release:patch` - Triggers patch release (1.0.0 → 1.0.1)
  - `release:minor` - Triggers minor release (1.0.0 → 1.1.0)
  - `release:major` - Triggers major release (1.0.0 → 2.0.0)
- **Required**: NPM_TOKEN secret

### Label Sync (sync-labels.yml)
- **Triggers**: Changes to .github/labels.yml or manual
- **Purpose**: Keep GitHub labels in sync with configuration
- **Required**: No additional setup (uses GITHUB_TOKEN)

## Permissions

The workflows use the built-in `GITHUB_TOKEN` with these permissions:
- **contents: write** - For creating commits and tags
- **id-token: write** - For npm provenance
- **issues: write** - For managing labels

## Testing the Setup

1. **Test CI**: Open a PR to see all checks run
2. **Test Labels**: Run the "Sync Labels" workflow manually
3. **Test Release**: Use workflow dispatch to create a test release

## Troubleshooting

### NPM Publish Fails
- Verify NPM_TOKEN is set correctly
- Check npm account has publish permissions
- Ensure package name is available

### GitHub Release Fails
- Verify workflow has contents: write permission
- Check that tag doesn't already exist

### Auto-release Not Triggering
- Ensure PR has correct label before merging
- Check that PR is merged (not closed)
- Verify auto-release workflow is enabled