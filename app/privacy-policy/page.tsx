import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy — EKUZO",
  description: "EKUZO's Privacy Policy explaining how we collect, use, store, and protect information about parents, students, and school partners.",
};

type Section = {
  sectionLabel: string;
  subsectionLabel?: string;
  body: string;
};

const sections: Section[] = [
  {
    sectionLabel: "1. Who We Are",
    body: "Legal name: EKUZO Inc. Entity type: Delaware C Corporation. Address: 5617 Dolores Street, Houston, Texas 77057. Website: ekuzo.gg",
  },
  {
    sectionLabel: "2. Scope of This Policy",
    body: "This policy applies to information collected through: EKUZO enrollment forms and communications; Live coaching sessions and team coordination; Our website and basic analytics; Email and program communications. EKUZO is a service-based program, not a consumer software platform. Parents and schools are the customers and decision-makers. Students participate as minors under adult consent.",
  },
  {
    sectionLabel: "3. Information We Collect",
    body: "We collect only the information reasonably necessary to run safe, effective, coach-led programs.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "A. Parent / Guardian Information",
    body: "We may collect: Full name; Email address; Phone number (if provided); Payment information (processed securely by a third-party provider); Communication preferences. We do not store full payment card numbers on EKUZO systems.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "B. Student Information",
    body: "We may collect: Student full name; Age range; Games played; Availability windows; Team placement information; School name (for school-based programs). During programs, EKUZO coaches also maintain coaching notes (for example: progress, communication patterns, and areas of growth) to support personalized development and continuity across sessions.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "C. Live Session Data (Voice, Video, Chat)",
    body: "EKUZO programs are delivered through live, coach-led sessions, currently using Discord. As part of providing the service: Sessions include voice and video participation; Text and voice communication may occur between teammates; All sessions are recorded for safety, quality assurance, and coaching continuity; Team Discord spaces are actively moderated. These recordings are used to: Support coach training and accountability; Ensure student safety; Review incidents if concerns are raised; Improve program quality. They are not used for advertising or unrelated purposes.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "D. Technical & Website Information",
    body: "When you visit ekuzo.gg, we may collect limited technical data such as: IP address; Browser type; Pages visited; General usage patterns. This information is collected through standard analytics and cookies (see Section 8).",
  },
  {
    sectionLabel: "4. How We Use Information",
    body: "We use information to: Deliver and operate EKUZO programs; Place students on appropriate teams; Support coaching, development, and safety; Communicate schedules, updates, and program information; Process payments and enrollment; Maintain records required for safety and accountability; Improve our programs and services. We do not sell personal information.",
  },
  {
    sectionLabel: "5. How We Share Information",
    subsectionLabel: "A. Service Providers",
    body: "We use trusted third-party providers to operate our programs, including: Discord – for live coaching sessions and team communication; Stripe – for payment processing; Email and infrastructure providers that support communications and operations. These providers receive only the information needed to perform their services and are expected to protect it appropriately.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "B. Schools",
    body: "When EKUZO programs are delivered through schools, we may share relevant enrollment or participation information with the partnering school, consistent with the school's role and parental consent.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "C. Legal or Safety Reasons",
    body: "We may disclose information if required to: Comply with legal obligations; Protect the safety of students, families, coaches, or the public; Investigate or respond to serious concerns.",
  },
  {
    sectionLabel: "6. Children's Privacy & Parental Role",
    body: "EKUZO programs are designed for minors, and we take that responsibility seriously. Parents or guardians provide consent for participation; Parents remain the responsible parties for decisions related to their child; Students do not create independent consumer accounts with EKUZO; Coaches and staff are trained to work with minors in supervised environments. We take steps to design programs, communications, and data practices with children's safety and well-being in mind.",
  },
  {
    sectionLabel: "7. Communications & Email Preferences",
    body: "Parents and schools may receive: Transactional communications (required): schedules, enrollment confirmations, safety updates; Program updates related to active participation; Optional newsletters or announcements. You may opt out of non-essential emails at any time using standard unsubscribe methods. Transactional communications cannot be disabled, as they are required to deliver the service.",
  },
  {
    sectionLabel: "8. Cookies & Analytics",
    body: "EKUZO uses basic cookies and analytics to understand how our website is used and to improve it. Cookies help us: Understand which pages are helpful; Improve site performance; Avoid technical issues. You can control cookies through your browser settings. Disabling cookies may affect site functionality but will not affect program participation.",
  },
  {
    sectionLabel: "9. Data Retention",
    body: "EKUZO retains records, including coaching notes and session recordings, for up to five (5) years. We do this to: Support long-term safety and accountability; Address delayed concerns or incidents; Maintain consistent coaching records. When information is no longer needed, we take reasonable steps to delete or anonymize it.",
  },
  {
    sectionLabel: "10. Data Security",
    body: "We use reasonable administrative, technical, and organizational safeguards to protect information, including: Access controls; Secure systems and vendors; Staff training and oversight. No system is perfectly secure, but we work to protect information appropriate to the nature of our programs and the sensitivity of working with minors.",
  },
  {
    sectionLabel: "11. Parent Rights: Access, Updates, and Deletion",
    body: "Parents or guardians may request to: Access information we have about their child; Correct inaccurate information; Request deletion of certain records (including coaching notes), subject to our retention obligations. Requests can be made by contacting us at the email below. We may need to verify your identity before responding.",
  },
  {
    sectionLabel: "12. U.S. Operations & California Privacy Rights",
    body: "EKUZO is a United States–based organization and currently operates its programs primarily within the United States. We do not actively market or offer programs in the European Union. California Residents: If you are a California resident, you may have additional rights regarding access to and deletion of personal information under California law. EKUZO does not sell personal information. Parents or guardians may request access to or deletion of information about their child. Requests are handled as described in Section 11 above.",
  },
  {
    sectionLabel: "13. Media, Photos, and Recordings",
    body: "EKUZO may occasionally share photos, clips, or quotes from programs to reflect the experience. We aim to obtain parental permission before public use. Session recordings are primarily for internal safety and quality purposes. We do not sell or license student likenesses for advertising. Separate consent may apply where required.",
  },
  {
    sectionLabel: "14. Changes to This Policy",
    body: "We may update this Privacy Policy as EKUZO grows or our practices evolve. Updates will be posted on our website with a revised effective date. Continued participation after changes means you accept the updated policy.",
  },
  {
    sectionLabel: "15. Contact Us",
    body: "EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: INFO@ekuzo.gg. This Privacy Policy is intended to clearly explain how EKUZO operates and how we treat information with care and respect. It is designed to support transparency and trust for families and schools.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav variant="light" />

      <main className="bg-white min-h-screen">
        <div
          className="mx-auto max-w-[1232px]"
          style={{
            paddingLeft: "clamp(1.5rem, 7.2vw, 104px)",
            paddingRight: "clamp(1.5rem, 7.2vw, 104px)",
            paddingTop: "clamp(8rem, 15vw, 12rem)",
            paddingBottom: "clamp(8rem, 15vw, 12rem)",
          }}
        >
          {/* Page header */}
          <div className="mb-16">
            <h4
              className="font-display font-black uppercase text-black leading-[0.9] mb-3"
              style={{ fontSize: "clamp(2.5rem, 8vw, 3.5rem)" }}
            >
              Privacy Policy
            </h4>
            <p className="font-body text-black/60 text-sm md:text-base">
              Effective Date: February 2026
            </p>
          </div>

          {/* Intro paragraph */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-[138px] mb-16 pb-12 border-b border-black/10">
            <div className="md:max-w-[392px] md:w-[392px] shrink-0" />
            <div className="flex-1">
              <p className="font-body text-black text-sm md:text-base leading-relaxed">
                EKUZO Inc (&ldquo;EKUZO,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) provides structured, coach-led esports and learning programs for kids and teens. We work with families and schools to deliver live, supervised experiences &ndash; not a self-serve software product. This Privacy Policy explains how we collect, use, store, and protect information about parents, guardians, students, and school partners when you engage with EKUZO through our programs or our website at ekuzo.gg. This policy is written for parents and guardians. Students participate in EKUZO programs only with parental or school consent, and parents remain the responsible decision-makers.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col divide-y divide-black/10">
            {sections.map((section, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row gap-8 md:gap-[138px] py-10"
              >
                {/* Left column — labels */}
                <div className="md:max-w-[392px] md:w-[392px] shrink-0">
                  {section.sectionLabel && (
                    <p className="font-body font-semibold text-black text-sm mb-1">
                      {section.sectionLabel}
                    </p>
                  )}
                  {section.subsectionLabel && (
                    <p className="font-body text-black/50 text-sm">
                      {section.subsectionLabel}
                    </p>
                  )}
                </div>
                {/* Right column — body */}
                <div className="flex-1">
                  <p className="font-body text-black text-sm md:text-base leading-relaxed">
                    {section.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
