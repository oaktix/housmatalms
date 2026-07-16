import PublicLayout from "@/components/PublicLayout";

export const metadata = {
  title: "Terms of Service | Housmata Academy",
  description: "Read the Terms of Service for Housmata Academy — your rights and obligations as a student, instructor, or administrator.",
};

export default function TermsOfService() {
  const lastUpdated = "June 1, 2025";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Terms of Service
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-10 text-text-muted">

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing and using the Housmata Academy platform (the &ldquo;Service&rdquo;), operated by <strong className="text-text-main">Housmata Technologies Ltd</strong> in partnership with <strong className="text-text-main">Property Max Results Ltd</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately discontinue access to the Service.
            </p>
            <p className="text-sm leading-relaxed">
              These Terms apply to all users of the platform, including students, instructors, and administrators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">2. Description of Service</h2>
            <p className="text-sm leading-relaxed">
              Housmata Academy is a professional training and certification platform designed to equip individuals with the skills required for digital estate management and property operations within Nigeria&apos;s real estate sector. The Service includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>A structured online curriculum delivered across multiple phases and modules.</li>
              <li>Interactive quizzes, assignments, and grading systems.</li>
              <li>Live virtual class scheduling and attendance tracking.</li>
              <li>Professional certification upon successful programme completion.</li>
              <li>A graduate deployment network connecting certified operators with properties.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">3. Eligibility and Admission</h2>
            <p className="text-sm leading-relaxed">
              Access to the LMS is restricted to individuals whose admission application has been reviewed and approved by a Housmata administrator. Submitting an application does not guarantee acceptance. The Academy reserves the right to approve or reject any application at its sole discretion.
            </p>
            <p className="text-sm leading-relaxed">
              By submitting an application, you confirm that all information provided is accurate, complete, and truthful. Providing false information is grounds for immediate disqualification or account termination.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">4. User Obligations</h2>
            <p className="text-sm leading-relaxed">As a user of the Housmata Academy platform, you agree to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>Keep your login credentials confidential and not share them with any third party.</li>
              <li>Participate in all required coursework, quizzes, and assignments in good faith.</li>
              <li>Submit original work for all assignments. Plagiarism or academic dishonesty will result in immediate disqualification.</li>
              <li>Attend scheduled virtual classes as required by your cohort programme.</li>
              <li>Maintain respectful, professional conduct in all communications on the platform.</li>
              <li>Not attempt to reverse-engineer, hack, or circumvent any security features of the platform.</li>
              <li>Not share course materials, quiz questions, or any proprietary curriculum content outside the platform.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">5. Intellectual Property</h2>
            <p className="text-sm leading-relaxed">
              All curriculum content, course materials, quizzes, documents, branding, and platform design are the exclusive intellectual property of Housmata Technologies Ltd and Property Max Results Ltd. You are granted a limited, non-exclusive, non-transferable licence to access and use the content solely for your personal learning within the programme.
            </p>
            <p className="text-sm leading-relaxed">
              You may not copy, reproduce, distribute, publish, or create derivative works from any platform content without prior written consent from Housmata Technologies Ltd.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">6. Certification and Graduation</h2>
            <p className="text-sm leading-relaxed">
              Certification is awarded upon successful completion of all required modules, assignments, and quizzes to the passing standard set by the Academy. Certificates remain the property of Housmata Technologies Ltd and may be revoked if evidence of academic dishonesty or misconduct is discovered after issuance.
            </p>
            <p className="text-sm leading-relaxed">
              Certified graduates may be included in the Academy&apos;s graduate deployment network to connect with property management opportunities within the Housmata ecosystem, at the discretion of the Academy and subject to individual performance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">7. Fees and Payments</h2>
            <p className="text-sm leading-relaxed">
              Information regarding programme fees, payment schedules, and any applicable refund policies will be communicated directly by the admissions team upon application approval. All fees are non-refundable once the programme has commenced unless otherwise stated in writing by Housmata Technologies Ltd.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">8. Termination</h2>
            <p className="text-sm leading-relaxed">
              Housmata Technologies Ltd reserves the right to suspend or terminate your access to the platform at any time, with or without notice, for conduct that violates these Terms of Service or is otherwise harmful to the Academy, its users, or its reputation.
            </p>
            <p className="text-sm leading-relaxed">
              You may request account deactivation at any time by contacting the administration team. Deactivation does not erase historical academic records held by the Academy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">9. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed">
              To the maximum extent permitted by applicable law, Housmata Technologies Ltd and Property Max Results Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service, including but not limited to loss of data, loss of income, or failure to achieve intended outcomes from training.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">10. Governing Law</h2>
            <p className="text-sm leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Oyo State, Nigeria.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">11. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Changes will be notified to enrolled students through the LMS announcement system and posted on this page with an updated &ldquo;Last Updated&rdquo; date. Continued use of the Service constitutes acceptance of the updated Terms.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">12. Contact Information</h2>
            <p className="text-sm leading-relaxed">
              For any questions regarding these Terms of Service, please reach us at:
            </p>
            <div className="text-sm space-y-1 pl-2">
              <p className="font-semibold text-text-main">Housmata Technologies Ltd</p>
              <p>10b, Ladoke Akintola Avenue, Aare, Bodija, Ibadan, Oyo State, Nigeria</p>
              <p><a href="mailto:academy@housmata.com" className="text-primary hover:underline">academy@housmata.com</a></p>
              <p><a href="tel:+2349075524434" className="text-primary hover:underline">+234 907 552 4434</a></p>
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  );
}
