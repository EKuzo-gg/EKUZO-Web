# DNS Setup Instructions for ekuzo.gg

**For:** Karlin
**Where:** Namecheap DNS settings for ekuzo.gg
**When:** Whenever you're ready — changes take up to 24 hours to propagate

---

## What we're doing

We're pointing ekuzo.gg to our new website (hosted on Netlify) and setting up email sending (via Resend) so the site can send notifications from an @ekuzo.gg address.

There are **3 groups of DNS records** to add. All go in the same place: Namecheap > Domain List > ekuzo.gg > Advanced DNS.

---

## Group 1: Website (Netlify)

These point ekuzo.gg and www.ekuzo.gg to the new site.

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 75.2.60.5 | Automatic |
| CNAME | www | apex-loadbalancer.netlify.com | Automatic |

**Note:** If there's an existing A record for @ or CNAME for www (pointing to Framer), **delete the old ones first**, then add these.

---

## Group 2: Email Sending — DKIM (Resend)

This lets our site send emails from @ekuzo.gg addresses (contact form notifications).

| Type | Host | Value | TTL |
|------|------|-------|-----|
| TXT | resend._domainkey | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDfbmNumEjxUXh6gFi/2ucLFerKz3EwHU33lntAQuNpMG9wL+lbVUSc3hivhDVCRVkltjrhPdPsLkebUuPVt4rlggB/+Ym7MqGle1CzSQmWaH0+iF6owKVchuGk6tSFWOfT5ugpi9XMemc/6Iukyna6nYKiBdQ51R31rBIiKvQRkwIDAQAB | Automatic |

---

## Group 3: Email Sending — SPF + DMARC (Resend)

| Type | Host | Value | TTL | Priority |
|------|------|-------|-----|----------|
| MX | send | feedback-smtp.us-east-1.amazonses.com | Automatic | 10 |
| TXT | send | v=spf1 include:amazonses.com ~all | Automatic | — |
| TXT | _dmarc | v=DMARC1; p=none; | Automatic | — |

**Note on SPF:** If there's already a TXT record for "send" with an SPF value, replace it with this one. Don't create duplicates.

---

## After adding all records

1. Let Jamie know so we can verify on both Netlify and Resend dashboards
2. DNS propagation can take a few minutes to 24 hours — the site may be intermittent during this window
3. Netlify will automatically provision an SSL certificate (HTTPS) once DNS is verified

---

## Quick checklist

- [ ] Delete old A record for @ (Framer) if present
- [ ] Delete old CNAME for www (Framer) if present
- [ ] Add A record: @ → 75.2.60.5
- [ ] Add CNAME: www → apex-loadbalancer.netlify.com
- [ ] Add TXT: resend._domainkey → (DKIM key above)
- [ ] Add MX: send → feedback-smtp.us-east-1.amazonses.com (priority 10)
- [ ] Add TXT: send → v=spf1 include:amazonses.com ~all
- [ ] Add TXT: _dmarc → v=DMARC1; p=none;
- [ ] Tell Jamie it's done

---

**Total: 8 DNS records** (2 for website, 1 for DKIM, 3 for email sending, and removing 2 old ones)
