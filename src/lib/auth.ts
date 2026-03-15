export function isAllowedEmail(
    email: string | null | undefined): boolean {
        if (!email) return false;

        const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

        const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

        const normalizedEmail = email.toLowerCase();
        const domain = normalizedEmail.split("@")[1] ?? "";

        if (allowedEmails.includes(normalizedEmail)) {
            return true;
        }

        if (allowedDomains.includes(domain)) {
            return true;
        }

        return false;
    }