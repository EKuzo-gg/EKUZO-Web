# N7 GA4 and Clarity network calls on /season1 (Sentry)

Scripted session on `/season1?ad=d5&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content=d5-a-showup&utm_term=Instagram_Feed&utm_id=120251332838180600&site=ig`, run on baseline :3001 and build :3002: load, scroll, tap hero CTA, tap header CTA (visible), type in the top email field, open two FAQ items, submit a valid email, wait. gtag.js and clarity.js load from the real network; every GA4 collect and Clarity collect request is answered locally (204) so nothing reaches Google or Clarity. Two views of each call: page level (dataLayer entries; wrapper around `window.clarity`) and network level (decoded collect beacons).

**Result: the ordered page-level calls and the decoded beacons are identical between baseline and build** (compared in this script). Raw captures: `raw-n7-ga4-clarity.json` (includes the GA4 request URLs and POST bodies and the decoded Clarity records).

| # | Event | Page-level call seen (baseline = build) | Network beacon (baseline = build) |
|---|---|---|---|
| 1 | GA4 page_view | gtag config for G-8LM45PX53W (dataLayer `config`) | POST https://www.google-analytics.com/g/collect, query `en=page_view`, `tid=G-8LM45PX53W`, 0 B body |
| 2 | GA4 cta_click hero | `event cta_click {ad:d5, location:hero}` | in the batched POST /g/collect body (300 B, no `en` in the query): `en=cta_click ep.ad=d5 ep.location=hero` |
| 3 | GA4 cta_click header | `event cta_click {ad:d5, location:header}` | same batched body: `en=cta_click ep.ad=d5 ep.location=header` |
| 4 | GA4 form_start top | `event form_start {ad:d5, where:top}` | same batched body: `en=form_start ep.ad=d5 ep.where=top` (exactly one) |
| 5 | GA4 faq_open x2 | `event faq_open {ad:d5, question:when_does_it_start}` and `{question:do_i_pay_anything_now}` | same batched body: two `en=faq_open` lines with those `ep.question` values |
| 6 | GA4 generate_lead | `event generate_lead {source:season_one_d5}` | own POST /g/collect, query `en=generate_lead ep.source=season_one_d5`, 0 B body |
| 7 | GA4 user_engagement | none from our code (gtag's own, sent on the page-hide flush the script triggers) | POST /g/collect `en=user_engagement` |
| 8 | Clarity set ad / utm_content / utm_term / site | `clarity("set","ad","d5")`, `("set","utm_content","d5-a-showup")`, `("set","utm_term","Instagram_Feed")`, `("set","site","ig")` queued by the stub at page load (logged again when clarity.js replays them) | session-start beacon: POST https://<x>.clarity.ms/collect, 60114 B gzip, decoded record `[t,34,"ad",["d5"],"utm_content",["d5-a-showup"],"utm_term",["Instagram_Feed"],"site",["ig"],...]` |
| 9 | Clarity event signup + set signed_up | `clarity("event","signup")` then `clarity("set","signed_up","yes")` | POST .../collect, 1092 B gzip (seq 4 in this run), decoded `[t,24,"signup"]` and `[t,34,"signed_up",["yes"]]` about 1 s after the call |

Also seen on both: a GET https://c.clarity.ms/c.gif (Clarity's own cookie-sync pixel) and, for Clarity, 6 collect beacons in total (60 KB start beacon, small interaction beacons, the signup beacon, a final tiny one). Console and page errors: none on either server.

## Raw per-server capture (decoded)

### Baseline :3001

```json
{
 "dataLayer": [
  [
   "config",
   "G-8LM45PX53W"
  ],
  [
   "event",
   "cta_click",
   {
    "ad": "d5",
    "location": "hero"
   }
  ],
  [
   "event",
   "cta_click",
   {
    "ad": "d5",
    "location": "header"
   }
  ],
  [
   "event",
   "form_start",
   {
    "ad": "d5",
    "where": "top"
   }
  ],
  [
   "event",
   "faq_open",
   {
    "ad": "d5",
    "question": "when_does_it_start"
   }
  ],
  [
   "event",
   "faq_open",
   {
    "ad": "d5",
    "question": "do_i_pay_anything_now"
   }
  ],
  [
   "event",
   "generate_lead",
   {
    "source": "season_one_d5"
   }
  ]
 ],
 "clarityPageCalls": [
  [
   "set",
   "ad",
   "d5"
  ],
  [
   "set",
   "utm_content",
   "d5-a-showup"
  ],
  [
   "set",
   "utm_term",
   "Instagram_Feed"
  ],
  [
   "set",
   "site",
   "ig"
  ],
  [
   "set",
   "ad",
   "d5"
  ],
  [
   "set",
   "utm_content",
   "d5-a-showup"
  ],
  [
   "set",
   "utm_term",
   "Instagram_Feed"
  ],
  [
   "set",
   "site",
   "ig"
  ],
  [
   "event",
   "signup"
  ],
  [
   "set",
   "signed_up",
   "yes"
  ]
 ],
 "ga": [
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "page_view",
   "ep": {},
   "batched": []
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 300,
   "ep": {},
   "batched": [
    {
     "en": "cta_click",
     "params": {
      "ep.ad": "d5",
      "ep.location": "hero"
     }
    },
    {
     "en": "cta_click",
     "params": {
      "ep.ad": "d5",
      "ep.location": "header"
     }
    },
    {
     "en": "form_start",
     "params": {
      "ep.ad": "d5",
      "ep.where": "top"
     }
    },
    {
     "en": "faq_open",
     "params": {
      "ep.ad": "d5",
      "ep.question": "when_does_it_start"
     }
    },
    {
     "en": "faq_open",
     "params": {
      "ep.ad": "d5",
      "ep.question": "do_i_pay_anything_now"
     }
    }
   ]
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "generate_lead",
   "ep": {
    "ep.source": "season_one_d5"
   },
   "batched": []
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "user_engagement",
   "ep": {},
   "batched": []
  }
 ],
 "clarity": [
  {
   "url": "https://<x>.clarity.ms/c.gif",
   "method": "GET",
   "bytes": 0,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 60110,
   "tags": [
    "ad=d5",
    "utm_content=d5-a-showup",
    "utm_term=Instagram_Feed",
    "site=ig",
    "C_IS=0,0"
   ],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 455,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 616,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 1088,
   "tags": [
    "signed_up=yes"
   ],
   "ev": [
    "signup"
   ]
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 530,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 426,
   "tags": [],
   "ev": []
  }
 ]
}
```

### Build :3002

```json
{
 "dataLayer": [
  [
   "config",
   "G-8LM45PX53W"
  ],
  [
   "event",
   "cta_click",
   {
    "ad": "d5",
    "location": "hero"
   }
  ],
  [
   "event",
   "cta_click",
   {
    "ad": "d5",
    "location": "header"
   }
  ],
  [
   "event",
   "form_start",
   {
    "ad": "d5",
    "where": "top"
   }
  ],
  [
   "event",
   "faq_open",
   {
    "ad": "d5",
    "question": "when_does_it_start"
   }
  ],
  [
   "event",
   "faq_open",
   {
    "ad": "d5",
    "question": "do_i_pay_anything_now"
   }
  ],
  [
   "event",
   "generate_lead",
   {
    "source": "season_one_d5"
   }
  ]
 ],
 "clarityPageCalls": [
  [
   "set",
   "ad",
   "d5"
  ],
  [
   "set",
   "utm_content",
   "d5-a-showup"
  ],
  [
   "set",
   "utm_term",
   "Instagram_Feed"
  ],
  [
   "set",
   "site",
   "ig"
  ],
  [
   "set",
   "ad",
   "d5"
  ],
  [
   "set",
   "utm_content",
   "d5-a-showup"
  ],
  [
   "set",
   "utm_term",
   "Instagram_Feed"
  ],
  [
   "set",
   "site",
   "ig"
  ],
  [
   "event",
   "signup"
  ],
  [
   "set",
   "signed_up",
   "yes"
  ]
 ],
 "ga": [
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "page_view",
   "ep": {},
   "batched": []
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 300,
   "ep": {},
   "batched": [
    {
     "en": "cta_click",
     "params": {
      "ep.ad": "d5",
      "ep.location": "hero"
     }
    },
    {
     "en": "cta_click",
     "params": {
      "ep.ad": "d5",
      "ep.location": "header"
     }
    },
    {
     "en": "form_start",
     "params": {
      "ep.ad": "d5",
      "ep.where": "top"
     }
    },
    {
     "en": "faq_open",
     "params": {
      "ep.ad": "d5",
      "ep.question": "when_does_it_start"
     }
    },
    {
     "en": "faq_open",
     "params": {
      "ep.ad": "d5",
      "ep.question": "do_i_pay_anything_now"
     }
    }
   ]
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "generate_lead",
   "ep": {
    "ep.source": "season_one_d5"
   },
   "batched": []
  },
  {
   "path": "/g/collect",
   "method": "POST",
   "bytes": 0,
   "en": "user_engagement",
   "ep": {},
   "batched": []
  }
 ],
 "clarity": [
  {
   "url": "https://<x>.clarity.ms/c.gif",
   "method": "GET",
   "bytes": 0,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 60114,
   "tags": [
    "ad=d5",
    "utm_content=d5-a-showup",
    "utm_term=Instagram_Feed",
    "site=ig",
    "C_IS=0,0"
   ],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 495,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 608,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 1092,
   "tags": [
    "signed_up=yes"
   ],
   "ev": [
    "signup"
   ]
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 526,
   "tags": [],
   "ev": []
  },
  {
   "url": "https://<x>.clarity.ms/collect",
   "method": "POST",
   "bytes": 425,
   "tags": [],
   "ev": []
  }
 ]
}
```

**N7 PASS.**
