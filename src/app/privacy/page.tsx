import PublicLayout from "@/components/PublicLayout";

export const metadata = {
  title: "Privacy Policy | Housmata Academy",
  description: "Read the Privacy Policy for Housmata Academy — how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "June 1, 2025";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 border-b border-border-main bg-bg-card overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(38,196,150,0.08),transparent_40%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-text-main">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-sm max-w-none space-y-10 text-text-muted">

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">1. Introduction</h2>
            <p className="text-sm leading-relaxed">
              Housmata Technologies Ltd (<strong className="text-text-main">&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;</strong>) operates the Housmata Academy Learning Management System and public website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform, submit an application, or participate in our training programmes.
            </p>
            <p className="text-sm leading-relaxed">
              By using our services, you consent to the data practices described in this policy. If you do not agree with the terms of this policy, please do not access or use our platform.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">2. Information We Collect</h2>
            <p className="text-sm leading-relaxed">We collect information in the following ways:</p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li><strong className="text-text-main">Application Data:</strong> Full name, email address, phone number, state of residence, prior experience, and motivation statement submitted through the public admission form.</li>
              <li><strong className="text-text-main">Account Data:</strong> Email address and role (student, instructor, administrator) assigned upon admission approval.</li>
              <li><strong className="text-text-main">Learning Data:</strong> Course progress, quiz attempt scores, assignment submissions, and attendance records generated through use of the LMS.</li>
              <li><strong className="text-text-main">Certificate Data:</strong> Certification codes, issue dates, and qualification levels earned through the programme.</li>
              <li><strong className="text-text-main">Usage Data:</strong> Pages visited, features accessed, and session duration on the platform.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>To process and review your admission application to the Academy.</li>
              <li>To create and manage your LMS account and course access.</li>
              <li>To track your learning progress and generate certification upon completion.</li>
              <li>To communicate important updates, schedules, and announcements about your cohort.</li>
              <li>To maintain attendance records and grading for instructors and administrators.</li>
              <li>To facilitate graduate deployment and placement opportunities within the Housmata ecosystem.</li>
              <li>To improve and personalise our educational platform and curriculum.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">4. Information Sharing and Disclosure</h2>
            <p className="text-sm leading-relaxed">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li><strong className="text-text-main">Service Providers:</strong> We may share data with Supabase (database hosting) and other trusted service providers who assist in operating our platform, subject to confidentiality obligations.</li>
              <li><strong className="text-text-main">Property Max Results Ltd:</strong> As our curriculum partner and operator, instructor and graduation data may be shared to facilitate programme delivery and certification issuance.</li>
              <li><strong className="text-text-main">Legal Compliance:</strong> We may disclose information if required by law, court order, or regulatory authority.</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">5. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Our database is hosted on Supabase with Row-Level Security (RLS) policies enforced on all tables. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">6. Data Retention</h2>
            <p className="text-sm leading-relaxed">
              We retain your personal data for as long as your account is active or as needed to provide our services. Certificate and graduation records are retained indefinitely for verification purposes. You may request deletion of your account data by contacting us at <a href="mailto:academy@housmata.com" className="text-primary hover:underline">academy@housmata.com</a>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">7. Your Rights</h2>
            <p className="text-sm leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm pl-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="text-sm leading-relaxed">
              To exercise any of these rights, please contact us at <a href="mailto:academy@housmata.com" className="text-primary hover:underline">academy@housmata.com</a>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">8. Cookies</h2>
            <p className="text-sm leading-relaxed">
              Our platform uses browser local storage to maintain your session and preferences. We do not use tracking cookies for advertising purposes. Session data is stored locally on your device and can be cleared at any time by logging out or clearing your browser storage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">9. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify enrolled students of significant changes via the LMS announcement system. Continued use of the platform after changes constitutes your acceptance of the revised policy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main space-y-3">
            <h2 className="text-lg font-heading font-bold text-text-main">10. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please contact:
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
