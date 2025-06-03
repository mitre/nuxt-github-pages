# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of nuxt-github-pages seriously. If you have discovered a security vulnerability, please follow these steps:

### 1. **Do NOT** create a public GitHub issue

Security vulnerabilities should be reported privately to prevent malicious use.

### 2. Report the vulnerability

Please report security vulnerabilities by emailing the MITRE open source team or by creating a security advisory on GitHub:

- Go to the [Security tab](https://github.com/mitre/nuxt-github-pages/security)
- Click "Report a vulnerability"
- Provide detailed information about the vulnerability

### 3. What to include

Please include the following information:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### 4. Response timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a more detailed response within 7 days
- We will work on a fix and coordinate release timing with you

## Security Best Practices for Users

1. **Keep dependencies updated**: Run `pnpm audit` regularly
2. **Use lock files**: Always commit `pnpm-lock.yaml`
3. **Review module options**: Only enable features you need
4. **Monitor security advisories**: Watch this repository for security updates

## Automated Security

This project uses:
- **Dependabot** for automatic dependency updates
- **pnpm audit** in CI/CD pipeline
- **ESLint** with security rules
- **Git hooks** to prevent common security issues

## Scope

This security policy applies to:
- The nuxt-github-pages module code
- Dependencies directly used by the module
- The build and release process

Out of scope:
- Security issues in Nuxt itself (report to Nuxt team)
- Security issues in user implementations
- Security of GitHub Pages hosting