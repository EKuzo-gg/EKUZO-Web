import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service — EKUZO",
  description: "Terms of Service governing your access to and use of EKUZO programs and website.",
};

type Section = {
  sectionLabel: string;
  subsectionLabel?: string;
  body: string;
};

const sections: Section[] = [
  // Section 1 — The Service
  {
    sectionLabel: "1. The Service",
    subsectionLabel: "1.1 Description",
    body: "EKUZO provides structured, coach-led esports and learning programs for children and teens (the \"Service\"). The Service may include, without limitation: Live, scheduled coaching sessions; Team-based esports participation; Voice, video, and text communication; Moderated online community spaces; Curriculum-guided drills, activities, and reflection; Program administration, safety monitoring, and coaching evaluation. The Service may be delivered online, in schools, or through hybrid formats.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "1.2 Not a Software Platform",
    body: "EKUZO is a service-based program, not a self-serve software product. Participation occurs through scheduled sessions and supervised environments rather than through individual consumer accounts.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "1.3 Changes",
    body: "EKUZO reserves the right to modify, suspend, or discontinue any aspect of the Service at any time, including program structure, schedules, content, or delivery methods. We will make reasonable efforts to communicate material changes but are not liable for modifications made in good faith.",
  },
  // Section 2 — Eligibility and Authority
  {
    sectionLabel: "2. Eligibility and Authority",
    subsectionLabel: "2.1 Parents and Guardians",
    body: "Parents or legal guardians are the primary contracting parties for student participation. By enrolling a student, you represent and warrant that you have legal authority to do so and to agree to these Terms on the student's behalf.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "2.2 Students",
    body: "Students are minors and participate solely as permitted participants. Students do not independently enter into a contractual relationship with EKUZO.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "2.3 Schools and Organizations",
    body: "Schools or organizations may enroll students under separate written agreements. In the event of a conflict between these Terms and a signed school or enterprise agreement, the written agreement controls.",
  },
  // Section 3 — Age Requirements
  {
    sectionLabel: "3. Age Requirements",
    subsectionLabel: "3.2 Exceptions",
    body: "In limited circumstances, EKUZO may allow participation by younger students by exception, based on program suitability, safety considerations, and parental consent. EKUZO reserves the right to determine eligibility for any program.",
  },
  // Section 4 — Website Use
  {
    sectionLabel: "4. Website Use",
    subsectionLabel: "4.1 Permitted Use",
    body: "You may use ekuzo.gg for informational and enrollment purposes only.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "4.2 Prohibited Use",
    body: "You agree not to: Interfere with website operation; Attempt unauthorized access; Use the site for unlawful purposes; Copy or misuse content without permission.",
  },
  // Section 5 — Enrollment, Fees, and Payments
  {
    sectionLabel: "5. Enrollment, Fees, and Payments",
    subsectionLabel: "5.1 Enrollment",
    body: "Enrollment occurs through online forms or written agreements and is subject to availability, eligibility, and acceptance by EKUZO.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "5.2 Fees",
    body: "Program fees, payment schedules, and billing terms are disclosed at enrollment or in applicable agreements.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "5.3 Payment Processing",
    body: "Payments are processed through third-party payment providers. EKUZO does not store full payment card details.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "5.4 No-Refund Policy",
    body: "Because EKUZO programs are time-based, team-based, and staffed in advance, all payments are non-refundable once a program begins, except where EKUZO determines, in its sole discretion, that a refund is appropriate for reasons other than removal for cause.",
  },
  // Section 6 — Communication Platforms
  {
    sectionLabel: "6. Communication Platforms",
    subsectionLabel: "6.2 Third-Party Terms",
    body: "Participants are subject to the terms and policies of those platforms. EKUZO does not control third-party services and is not responsible for outages, changes, or failures.",
  },
  // Section 7 — Recording, Monitoring, and Safety
  {
    sectionLabel: "7. Recording, Monitoring, and Safety",
    subsectionLabel: "7.1 Recording",
    body: "All live coaching sessions are recorded for safety, quality assurance, and coaching continuity.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "7.2 Moderation",
    body: "Team communication spaces are actively moderated. EKUZO may review recordings or communications as needed.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "7.3 Consent",
    body: "Participation constitutes consent to recording and monitoring as described in these Terms and the Privacy Policy.",
  },
  // Section 8 — Student Conduct
  {
    sectionLabel: "8. Student Conduct",
    subsectionLabel: "8.1 Expectations",
    body: "Students must: Follow coach instructions; Treat others respectfully; Use communication tools appropriately; Avoid harassment, threats, or disruptive behavior.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "8.2 Enforcement",
    body: "EKUZO may take corrective action, including removal from sessions or programs, to protect safety and program integrity.",
  },
  // Section 9 — Removal and Termination
  {
    sectionLabel: "9. Removal and Termination",
    subsectionLabel: "9.1 Removal for Cause",
    body: "EKUZO may remove a student from a program without refund if removal is necessary due to conduct issues, safety concerns, or failure to participate in good faith, consistent with Section 5.4.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "9.2 Effect of Removal",
    body: "Removal does not relieve payment obligations already incurred.",
  },
  // Section 10 — Student Data and Educational Records
  {
    sectionLabel: "10. Student Data and Educational Records",
    subsectionLabel: "10.1 Role",
    body: "EKUZO acts as a service provider to parents, guardians, and schools with respect to student information and, where applicable, student education records. For programs delivered through schools, EKUZO functions as a service provider performing services on behalf of the school and under the school's direction.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "10.2 FERPA",
    body: "To the extent EKUZO receives or has access to student education records provided by a school, EKUZO handles such records in a manner consistent with its role as a service provider to the school, including limitations on use and disclosure. EKUZO uses student information and educational records solely for purposes related to: delivering and operating the Service; supporting student safety and supervision; enabling coaching continuity and development. EKUZO does not use student education records for unrelated commercial purposes.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "10.3 Control and Access",
    body: "Parents, guardians, and schools retain control over student information and education records. Requests to access, correct, or delete such records are handled as described in the Privacy Policy or through the applicable school relationship.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "10.4 Privacy Policy",
    body: "Additional details regarding data handling and retention are described in EKUZO's Privacy Policy, which is incorporated by reference.",
  },
  // Section 11 — Media and Recordings
  {
    sectionLabel: "11. Media and Recordings",
    subsectionLabel: "11.1 License",
    body: "By participating, you grant EKUZO a non-exclusive, royalty-free license to use photos, videos, audio, or recordings captured during programs for operational, training, and promotional purposes.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "11.2 Parental Consent",
    body: "Where required, EKUZO will seek parental consent before public use. Additional releases may apply.",
  },
  // Section 12 — Privacy
  {
    sectionLabel: "12. Privacy",
    body: "Use of the Service is subject to EKUZO's Privacy Policy, which is incorporated by reference.",
  },
  // Section 13 — Intellectual Property
  {
    sectionLabel: "13. Intellectual Property",
    subsectionLabel: "13.1 EKUZO Property",
    body: "All EKUZO content, curriculum, branding, and materials are owned by EKUZO or its licensors.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "13.2 Feedback",
    body: "Any feedback or suggestions you provide may be used by EKUZO without obligation or compensation.",
  },
  // Section 14 — DMCA Notice
  {
    sectionLabel: "14. DMCA Notice",
    body: "EKUZO respects intellectual property rights. If you believe content associated with the Service infringes your copyright, please submit a notice including: Identification of the copyrighted work; Identification of the infringing material; Your contact information; A statement of good-faith belief; A statement under penalty of perjury. DMCA Agent: EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: info@ekuzo.gg",
  },
  // Section 15 — Disclaimer of Warranties
  {
    sectionLabel: "15. Disclaimer of Warranties",
    body: "The Service is provided \"as is\" and \"as available.\" To the maximum extent permitted by law, EKUZO disclaims all warranties, express or implied.",
  },
  // Section 16 — Limitation of Liability
  {
    sectionLabel: "16. Limitation of Liability",
    body: "To the maximum extent permitted by law, EKUZO shall not be liable for indirect, incidental, or consequential damages. Total liability shall not exceed the amount paid for the applicable program.",
  },
  // Section 17 — Indemnification
  {
    sectionLabel: "17. Indemnification",
    body: "You agree to indemnify and hold harmless EKUZO from claims arising from your or your student's participation or violation of these Terms.",
  },
  // Section 18 — Dispute Resolution and Arbitration
  {
    sectionLabel: "18. Dispute Resolution and Arbitration",
    subsectionLabel: "18.1 Informal Resolution",
    body: "Parties agree to attempt informal resolution first.",
  },
  {
    sectionLabel: "",
    subsectionLabel: "18.2 Arbitration",
    body: "Unresolved disputes shall be resolved by binding individual arbitration, not class actions, except where prohibited by law.",
  },
  // Section 19 — Governing Law
  {
    sectionLabel: "19. Governing Law",
    body: "These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law principles.",
  },
  // Section 20 — Changes to These Terms
  {
    sectionLabel: "20. Changes to These Terms",
    body: "EKUZO may update these Terms from time to time. Continued use of the Service constitutes acceptance of the updated Terms.",
  },
  // Section 21 — Severability and Survival
  {
    sectionLabel: "21. Severability and Survival",
    body: "If any provision is unenforceable, the remaining provisions remain in effect. Provisions related to liability, indemnification, dispute resolution, and intellectual property survive termination.",
  },
  // Section 22 — Contact Information
  {
    sectionLabel: "22. Contact Information",
    body: "EKUZO Inc, 5617 Dolores Street, Houston, TX 77057. Email: info@ekuzo.gg",
  },
];

export default function TermsOfServicePage() {
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
              Terms of Service
            </h4>
            <p className="font-body text-black/60 text-sm md:text-base">
              Last Updated: February 2026
            </p>
          </div>

          {/* Intro paragraph */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-[138px] mb-16 pb-12 border-b border-black/10">
            <div className="md:max-w-[392px] md:w-[392px] shrink-0" />
            <div className="flex-1">
              <p className="font-body text-black text-sm md:text-base leading-relaxed">
                Thank you for your interest in EKUZO Inc (&ldquo;EKUZO,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of our website at ekuzo.gg (the &ldquo;Website&rdquo;) and your enrollment in, payment for, and participation in EKUZO&apos;s structured, coach-led esports and learning programs (collectively, the &ldquo;Service&rdquo;). These Terms apply to all parents, guardians, schools, organizations, students, and other individuals who access or use the Website or participate in the Service. By accessing the Website, enrolling a student, submitting payment, or participating in any EKUZO program, you acknowledge that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy, which is incorporated by reference. If you are enrolling or authorizing participation on behalf of a minor or a school or organization, you represent that you have the authority to do so and to bind the applicable parties to these Terms.
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
