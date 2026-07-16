import { Quiz, QuizQuestion } from "./mockData";

export const generatedQuizzes: Quiz[] = [
  {
    id: "quiz-module-2",
    module_id: "p1-m2",
    title: "Module 2: Ethics of Estate Management Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-3",
    module_id: "p1-m3",
    title: "Module 3: Tenant & Landlord Relationship Management Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-4",
    module_id: "p1-m4",
    title: "Module 4: Property Inspection Systems Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-5",
    module_id: "p1-m5",
    title: "Module 5: Property Media & Content Creation Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-6",
    module_id: "p1-m6",
    title: "Module 6: Rent Collection & Financial Flow Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-7",
    module_id: "p1-m7",
    title: "Module 7: Property Documentation Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-8",
    module_id: "p1-m8",
    title: "Module 8: Client Communication Assessment",
    passing_score: 50,
  },
  {
    id: "quiz-module-9",
    module_id: "p1-m9",
    title: "Module 9: Property Marketing Assessment",
    passing_score: 50,
  },
];

export const generatedQuizQuestions: QuizQuestion[] = [


  // MODULE 2
  { id: "q-m2-1", quiz_id: "quiz-module-2", question: "What is the most fundamental ethical rule regarding client funds?", options: ["You can borrow them if you pay them back within 48 hours.", "Always invest client funds into high-yield stocks.", "Use them to fix your office, as long as it benefits the business.", "Strict segregation: Never mix personal and client funds."], correct_option_index: 3 },
  { id: "q-m2-2", quiz_id: "quiz-module-2", question: "What is a 'Ghost Listing' in the Nigerian real estate context?", options: ["A house that is reported to be haunted.", "An uncompleted building.", "A property that was demolished by the government.", "A fake, aggressively priced listing used merely as bait to capture client contacts."], correct_option_index: 3 },
  { id: "q-m2-3", quiz_id: "quiz-module-2", question: "Information withholding is considered unethical because:", options: ["It destroys the foundation of informed consent and puts the tenant at risk.", "Landlords prefer surprises.", "It saves the tenant time.", "It makes the manager look too smart."], correct_option_index: 0 },
  { id: "q-m2-4", quiz_id: "quiz-module-2", question: "When resolving a dispute between a landlord and a tenant, the manager must act as a:", options: ["Neutral, objective arbiter enforcing the written agreement.", "Subservient yes-man to the landlord.", "Silent observer.", "Fierce advocate for the tenant."], correct_option_index: 0 },
  { id: "q-m2-5", quiz_id: "quiz-module-2", question: "Why is an undocumented action in property management legally dangerous?", options: ["Because the government taxes undocumented actions.", "It is actually safer to not document things.", "Because paper is expensive.", "Because it is legally non-existent and cannot be defended in a dispute."], correct_option_index: 3 },
  { id: "q-m2-6", quiz_id: "quiz-module-2", question: "If a landlord demands you list a property with a severely compromised foundation without disclosing it, what should you do?", options: ["Refuse the listing, explaining the ethical standard of radical disclosure.", "Fix the foundation yourself secretly.", "List it but quietly warn the tenant later.", "List it, as the landlord pays your fee."], correct_option_index: 0 },
  { id: "q-m2-7", quiz_id: "quiz-module-2", question: "What is 'Price Manipulation'?", options: ["Charging a standard 10% agency fee.", "Arbitrarily inflating the rent price above the landlord's mandate and pocketing the difference.", "Negotiating a fair discount for a tenant.", "Lowering the rent to fill the property faster."], correct_option_index: 1 },
  { id: "q-m2-8", quiz_id: "quiz-module-2", question: "A digital financial platform helps enforce ethics by:", options: ["Automatically generating immutable receipts and tracking payment histories.", "Arresting defaulting tenants.", "Hiding the landlord's phone number.", "Automatically increasing rent."], correct_option_index: 0 },
  { id: "q-m2-9", quiz_id: "quiz-module-2", question: "Radical transparency means:", options: ["Posting all your personal information online.", "Providing stakeholders complete, proactive visibility into processes, finances, and property conditions.", "Refusing to sign any contracts.", "Only communicating via public social media."], correct_option_index: 1 },
  { id: "q-m2-10", quiz_id: "quiz-module-2", question: "Illegal self-help evictions (like removing the roof) are:", options: ["A necessary evil in Nigeria.", "Only acceptable if the rent is a year late.", "A profound ethical and legal violation that professional managers must avoid.", "The fastest way to resolve a tenancy dispute."], correct_option_index: 2 },

  // MODULE 3
  { id: "q-m3-1", quiz_id: "quiz-module-3", question: "What is the manager's role in the Landlord-Tenant-Manager triangle?", options: ["To be best friends with the tenant.", "To act as a shock absorber, translating emotional friction into structured processes.", "To pass angry messages directly between the two parties.", "To take the landlord's side no matter what."], correct_option_index: 1 },
  { id: "q-m3-2", quiz_id: "quiz-module-3", question: "When does the professional onboarding of a tenant truly begin?", options: ["When they move their furniture into the house.", "The moment the lease is signed and the joint physical Move-In Inventory is conducted.", "When they first call the agent.", "When they complain about the first broken item."], correct_option_index: 1 },
  { id: "q-m3-3", quiz_id: "quiz-module-3", question: "Why must communication protocols be established during onboarding?", options: ["So the tenant knows they can call at 2 AM for non-emergencies.", "So the landlord can call the tenant directly.", "Because WhatsApp is the only legal communication tool.", "To prevent manager burnout and ensure requests are logged systematically."], correct_option_index: 3 },
  { id: "q-m3-4", quiz_id: "quiz-module-3", question: "What is the primary purpose of mid-tenancy routine inspections?", options: ["To secretly increase the rent.", "To check if the tenant bought new furniture.", "To harass the tenant for more money.", "To identify minor maintenance issues before they escalate into catastrophic failures."], correct_option_index: 3 },
  { id: "q-m3-5", quiz_id: "quiz-module-3", question: "When should rent renewal discussions ideally commence?", options: ["The day the lease expires.", "Never, wait for the tenant to reach out.", "A week after the rent is due.", "At least ninety days before the lease expiration."], correct_option_index: 3 },
  { id: "q-m3-6", quiz_id: "quiz-module-3", question: "How is 'Fair wear and tear' defined in property management?", options: ["When a tenant refuses to pay rent.", "When the landlord refuses to fix the roof.", "The natural degradation of a property over time (e.g., slightly faded paint).", "When a tenant smashes a window."], correct_option_index: 2 },
  { id: "q-m3-7", quiz_id: "quiz-module-3", question: "During the offboarding phase, deductions from the caution deposit must be:", options: ["Kept by the manager as a bonus.", "Arbitrarily decided by the landlord.", "Used to upgrade the property for the next tenant.", "Based strictly on objective proof comparing the exit condition to the original Move-In Inventory."], correct_option_index: 3 },
  { id: "q-m3-8", quiz_id: "quiz-module-3", question: "Why is disappearing after rent collection a severe management mistake?", options: ["Because active management requires consistent engagement to protect the physical asset.", "Because you miss out on monthly agency fees.", "Because the tenant will get lonely.", "It's not a mistake, it's efficient."], correct_option_index: 0 },
  { id: "q-m3-9", quiz_id: "quiz-module-3", question: "If a tenant claims they were promised a new AC unit upon moving in, how should the manager respond?", options: ["Buy them a new AC immediately.", "Tell them they are lying.", "Ask the landlord to pay for it just to keep the peace.", "Check the signed lease and communication logs; if it is not documented, it cannot be enforced."], correct_option_index: 3 },
  { id: "q-m3-10", quiz_id: "quiz-module-3", question: "What document is the absolute baseline for determining security deposit refunds?", options: ["The original property listing.", "The final utility bill.", "The Move-In Inventory Report.", "The Tenancy Agreement."], correct_option_index: 2 },

  // MODULE 4
  { id: "q-m4-1", quiz_id: "quiz-module-4", question: "A property inspection must always be driven by:", options: ["A quick casual walk-through.", "A comprehensive, structured, and zoned checklist.", "The agent's memory.", "The tenant's personal opinions."], correct_option_index: 1 },
  { id: "q-m4-2", quiz_id: "quiz-module-4", question: "Why is relying on human memory considered a failure in property inspections?", options: ["Because it takes too much brain power.", "Because it's an old-fashioned method.", "Because memories are legally admissible.", "Because subjective memory cannot serve as objective, undeniable proof in a dispute."], correct_option_index: 3 },
  { id: "q-m4-3", quiz_id: "quiz-module-4", question: "A diagonal crack in the foundation is classified as a:", options: ["Green Flag issue.", "Structural defect requiring immediate engineering intervention.", "Cosmetic issue.", "Minor wear and tear."], correct_option_index: 1 },
  { id: "q-m4-4", quiz_id: "quiz-module-4", question: "In coastal areas like Lagos, what specific environmental wear and tear must an inspector look for?", options: ["Desert sand accumulation.", "Snow damage.", "Frostbite on plumbing.", "Saline air accelerating the rusting of metal fixtures and AC units."], correct_option_index: 3 },
  { id: "q-m4-5", quiz_id: "quiz-module-4", question: "What is a 'Red Flag' in a Risk Flagging System?", options: ["A preventative maintenance task.", "A minor cosmetic issue.", "An immediate safety or structural hazard requiring emergency funds.", "A tenant requesting a rent reduction."], correct_option_index: 2 },
  { id: "q-m4-6", quiz_id: "quiz-module-4", question: "What is the primary purpose of a 'Yellow Flag' issue (e.g., clearing gutters)?", options: ["To proactively prevent the issue from escalating into an expensive Red Flag emergency.", "To justify a rent increase.", "To force the tenant to move out.", "To give contractors busy work."], correct_option_index: 0 },
  { id: "q-m4-7", quiz_id: "quiz-module-4", question: "What ensures consistency across inspections for a massive portfolio?", options: ["Hiring the same person for every inspection.", "Only inspecting the exterior of buildings.", "Using identical, structured digital criteria and checklists for every property.", "Skipping smaller properties to save time."], correct_option_index: 2 },
  { id: "q-m4-8", quiz_id: "quiz-module-4", question: "Who must sign the Baseline Condition Report?", options: ["Only the landlord.", "A government official.", "Both the estate manager and the tenant.", "Only the estate manager."], correct_option_index: 2 },
  { id: "q-m4-9", quiz_id: "quiz-module-4", question: "If a deep scratch is NOT on the baseline report but is found during move-out, what happens legally?", options: ["The landlord must fix it for free.", "The manager pays for it.", "The tenant can legally claim the scratch was there before they moved in, avoiding liability.", "The tenant is automatically fined double."], correct_option_index: 2 },
  { id: "q-m4-10", quiz_id: "quiz-module-4", question: "A dripping tap is a symptom. What might be the root cause that an analytical manager investigates?", options: ["Hidden pipe bursts or significant water pressure issues.", "A loud tenant.", "High water bills.", "Bad aesthetic design."], correct_option_index: 0 },
];
