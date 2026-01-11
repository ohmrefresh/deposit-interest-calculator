# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do Not** disclose the vulnerability publicly until it has been addressed
2. Send a detailed report to the project maintainers via GitHub Issues (mark as security-related) or directly through GitHub's private vulnerability reporting feature
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will provide regular updates on the status of the fix
- **Timeline**: We aim to release a patch within 7-14 days for critical vulnerabilities
- **Credit**: We will credit you in the release notes (unless you prefer to remain anonymous)

## Security Considerations

### Client-Side Application

This is a client-side single-page application (SPA) that runs entirely in the browser:

- **No backend API**: All calculations are performed locally
- **No data transmission**: No user data is sent to external servers
- **Local storage only**: Data is stored in browser's localStorage
- **No authentication**: Application does not require user accounts or credentials

### Data Privacy

- All calculation data remains on the user's device
- No cookies or tracking mechanisms are implemented
- No analytics or telemetry data is collected
- Users have full control over their data (can clear localStorage)

### Known Security Scope

As a client-side calculator application, potential security concerns are limited to:

- **Dependencies**: Third-party npm packages vulnerabilities
- **XSS**: Cross-site scripting through input fields (mitigated by React's built-in escaping)
- **Browser security**: Relies on browser's security model
- **localStorage**: Data accessible to other scripts on same origin

## Dependency Management

We regularly update dependencies to patch known vulnerabilities:

```bash
# Check for vulnerabilities
bun audit

# Update dependencies
bun update
```

## Best Practices for Users

1. Use the latest version of the application
2. Keep your browser updated
3. Be cautious when importing/exporting sensitive financial data
4. Clear localStorage if using a shared device
5. Use HTTPS when hosting this application

## Secure Development

When contributing to this project:

- Never commit secrets, API keys, or credentials
- Validate and sanitize all user inputs
- Use Decimal.js for all monetary calculations to prevent precision errors
- Follow principle of least privilege
- Keep dependencies up to date

## Contact

For security-related inquiries, please open a GitHub issue or contact the repository maintainer through GitHub.

---

**Last Updated**: 2026-01-11
