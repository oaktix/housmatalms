import { Quiz, QuizQuestion } from "./mockData";

export const generatedQuizzesHCPA: Quiz[] = [
  { id: "quiz-hcpa-m0", module_id: "hcpa-m0", title: "Orientation Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m1", module_id: "hcpa-m1", title: "Module 1 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m2", module_id: "hcpa-m2", title: "Module 2 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m3", module_id: "hcpa-m3", title: "Module 3 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m4", module_id: "hcpa-m4", title: "Module 4 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m5", module_id: "hcpa-m5", title: "Module 5 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m6", module_id: "hcpa-m6", title: "Module 6 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m7", module_id: "hcpa-m7", title: "Module 7 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m8", module_id: "hcpa-m8", title: "Module 8 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m9", module_id: "hcpa-m9", title: "Module 9 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m10", module_id: "hcpa-m10", title: "Module 10 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m11", module_id: "hcpa-m11", title: "Module 11 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m12", module_id: "hcpa-m12", title: "Module 12 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m13", module_id: "hcpa-m13", title: "Module 13 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m14", module_id: "hcpa-m14", title: "Module 14 Assessment", passing_score: 75 },
  { id: "quiz-hcpa-m15", module_id: "hcpa-m15", title: "Module 15 Assessment", passing_score: 75 }
];

export const generatedQuizQuestionsHCPA: QuizQuestion[] = [
  // ==================== ORIENTATION (MODULE 0) ====================
  {
    id: "q-hcpa-m0-1",
    quiz_id: "quiz-hcpa-m0",
    question: "What is the primary asset that distinguishes a Housmata Certified Property Advisor?",
    options: ["Aggressive sales closure speed", "Trust and verification protocols", "Having the lowest prices", "Knowing local developers personally"],
    correct_option_index: 1,
    explanation: "Trust is the primary asset in the Housmata ecosystem. Advisors verify before they market, and educate before they recommend."
  },
  {
    id: "q-hcpa-m0-2",
    quiz_id: "quiz-hcpa-m0",
    question: "What is the main focus of a trusted advisor compared to a traditional salesperson?",
    options: ["Earning commission on day one", "Solving client problems and matching the right properties", "Advertising as many properties as possible", "Relying on verbal agreements"],
    correct_option_index: 1,
    explanation: "A trusted advisor focuses on solving problems and matching the right property to the client's objective."
  },
  {
    id: "q-hcpa-m0-3",
    quiz_id: "quiz-hcpa-m0",
    question: "According to the orientation, what question should an advisor ask before recommending a property?",
    options: ["How much commission will I make?", "If this were my own money, would I still buy it?", "Is this the biggest building in the area?", "Can I close this deal in 24 hours?"],
    correct_option_index: 1,
    explanation: "Asking yourself if you would buy the property with your own money anchors your fiduciary duty of honesty to the client."
  },
  {
    id: "q-hcpa-m0-4",
    quiz_id: "quiz-hcpa-m0",
    question: "What is the primary cause of investor hesitation in the Nigerian property market?",
    options: ["A general dislike of owning physical land", "Fear of fraud, double allocations, and unverified titles", "Low historical returns on land investment", "High cost of transport for site tours"],
    correct_option_index: 1,
    explanation: "Buyers avoid property because they fear making an expensive mistake due to lack of verification."
  },
  {
    id: "q-hcpa-m0-5",
    quiz_id: "quiz-hcpa-m0",
    question: "What does the Housmata model recommend before marketing a property?",
    options: ["Gathering a deposit immediately", "Thoroughly verifying document titles and coordinates", "Creating a high-budget social media video", "Finding a buyer first"],
    correct_option_index: 1,
    explanation: "The core rule is: verify before you market, educate before you recommend, and advise before you sell."
  },
  {
    id: "q-hcpa-m0-6",
    quiz_id: "quiz-hcpa-m0",
    question: "Which of these best defines the professional identity of a Housmata Advisor?",
    options: ["A transactional broker searching for commissions", "A guardian of transparency and bridge between buyers and developers", "A private land surveyor", "A freelance mortgage broker"],
    correct_option_index: 1,
    explanation: "You represent a professional who coordinates searches, coordinates title flows, and ensures transparency."
  },
  {
    id: "q-hcpa-m0-7",
    quiz_id: "quiz-hcpa-m0",
    question: "Why does the orientation emphasize 'educating' before 'recommending'?",
    options: ["To delay the sale as long as possible", "To ensure the client understands the risks and rules of their investment", "To show off academic qualifications", "To charge a tutoring fee"],
    correct_option_index: 1,
    explanation: "Educating the client builds authority and ensures they make decisions based on clear information, not hype."
  },
  {
    id: "q-hcpa-m0-8",
    quiz_id: "quiz-hcpa-m0",
    question: "How does the Housmata orientation define double allocation?",
    options: ["Allocating double commissions to an advisor", "Allocating the same physical plot of land to two different buyers", "Building two houses on one plot", "Approving two mortgage applications at once"],
    correct_option_index: 1,
    explanation: "Double allocation is a fraudulent practice where developers or sellers sell the same plot to multiple buyers."
  },
  {
    id: "q-hcpa-m0-9",
    quiz_id: "quiz-hcpa-m0",
    question: "What is the outcome when an advisor successfully matches the right property to the right objective?",
    options: ["The client cancels the deal", "Sales become the natural, friction-free outcome", "Double taxation is triggered", "The advisor must refund the agency fee"],
    correct_option_index: 1,
    explanation: "When client alignment is handled honestly, high-trust sales follow naturally without aggressive pressure."
  },
  {
    id: "q-hcpa-m0-10",
    quiz_id: "quiz-hcpa-m0",
    question: "The orientation states that trust is the primary asset. Why is this critical in Nigeria?",
    options: ["Because land registry offices are fully automated and transparent", "Because informal, unverified brokerage has eroded client confidence", "Because there is no demand for real estate in urban areas", "Because developers always offer money-back guarantees"],
    correct_option_index: 1,
    explanation: "Unverified operations have made clients suspicious; proving you verify titles overcomes this barrier."
  },

  // ==================== MODULE 1 ====================
  {
    id: "q-hcpa-m1-1",
    quiz_id: "quiz-hcpa-m1",
    question: "Which of the following describes the key economic role of the real estate sector?",
    options: ["Creating a high level of speculative debt", "It supports economic growth and provides employment for builders, surveyors, and lawyers", "It only benefits high-net-worth individuals", "It reduces municipal taxation options"],
    correct_option_index: 1,
    explanation: "Real estate supports economic growth, provides community housing, and creates jobs across multiple professions."
  },
  {
    id: "q-hcpa-m1-2",
    quiz_id: "quiz-hcpa-m1",
    question: "What is the advisor's primary task regarding a client's investment budget?",
    options: ["Push them to purchase the most expensive land banking options", "Ensure the property matches their specific objectives (investment horizon, risk, location)", "Advise them to purchase without verification", "Make lending decisions for them"],
    correct_option_index: 1,
    explanation: "Advisors do not sell the same property to everyone; they match properties to the client's target goals."
  },
  {
    id: "q-hcpa-m1-3",
    quiz_id: "quiz-hcpa-m1",
    question: "What are the primary drivers of real estate growth in Nigeria?",
    options: ["Zoning restrictions and flat populations", "Urbanisation, expanding infrastructure, and demographic growth", "Decreases in commercial activity", "A drop in building material costs"],
    correct_option_index: 1,
    explanation: "Rapid migration into urban areas like Lagos and Abuja creates sustained demand for housing and commercial structures."
  },
  {
    id: "q-hcpa-m1-4",
    quiz_id: "quiz-hcpa-m1",
    question: "What is the difference between residential and commercial property classifications?",
    options: ["Residential is for living; commercial is for business operations and income generation", "Residential is owned by the state; commercial is privately owned", "Residential requires no document checks; commercial does", "There is no difference under Nigerian law"],
    correct_option_index: 0,
    explanation: "Residential properties host tenants, while commercial properties include offices, plazas, and warehouses focused on business."
  },
  {
    id: "q-hcpa-m1-5",
    quiz_id: "quiz-hcpa-m1",
    question: "Why should an advisor monitor 'appreciation corridors'?",
    options: ["To find properties that will appreciate rapidly due to infrastructure expansions", "To buy cheap farmland that will never be developed", "To increase their rental collection charges", "To avoid paying land taxes"],
    correct_option_index: 0,
    explanation: "Appreciation corridors emerge where governments construct roads, ports, or major commercial centers, boosting nearby values."
  },
  {
    id: "q-hcpa-m1-6",
    quiz_id: "quiz-hcpa-m1",
    question: "Which property classification deals with manufacturing, logistics, and warehousing?",
    options: ["Residential", "Mixed-Use", "Industrial", "Agricultural"],
    correct_option_index: 2,
    explanation: "Industrial real estate includes logistics hubs, storage yards, and factories."
  },
  {
    id: "q-hcpa-m1-7",
    quiz_id: "quiz-hcpa-m1",
    question: "What is a 'growth corridor'?",
    options: ["A narrow hallway inside a commercial plaza", "An area experiencing rapid development and capital inflow due to infrastructure projects", "A government-committed forest reserve", "A property with structural foundation defects"],
    correct_option_index: 1,
    explanation: "Growth corridors present the highest capital gains potential for real estate investors."
  },
  {
    id: "q-hcpa-m1-8",
    quiz_id: "quiz-hcpa-m1",
    question: "How does property investment contribute to wealth creation in Nigeria?",
    options: ["Through short-term currency trading", "Through rental income yield and long-term capital appreciation", "By avoiding all local tax obligations", "By keeping money in local savings accounts"],
    correct_option_index: 1,
    explanation: "Real estate creates wealth by yielding recurrent cash flows and appreciating in asset value over time."
  },
  {
    id: "q-hcpa-m1-9",
    quiz_id: "quiz-hcpa-m1",
    question: "What does 'mixed-use development' mean?",
    options: ["Using a property for both residential living and commercial business purposes", "Mixing multiple titles on one survey plan", "Selling one land plot to two buyers", "A building without clear coordinates"],
    correct_option_index: 0,
    explanation: "Mixed-use properties combine residential units (like apartments) and commercial units (like retail ground floors) in one structure."
  },
  {
    id: "q-hcpa-m1-10",
    quiz_id: "quiz-hcpa-m1",
    question: "Why must a property advisor understand different asset classes?",
    options: ["To sell every client the most expensive property available", "To align recommendations with a client's risk appetite and investment objective", "To bypass official land registry searches", "To claim commissions from multiple developers at once"],
    correct_option_index: 1,
    explanation: "An investor seeking immediate monthly cash flow needs different properties than one seeking long-term land banking capital gains."
  },

  // ==================== MODULE 2 ====================
  {
    id: "q-hcpa-m2-1",
    quiz_id: "quiz-hcpa-m2",
    question: "How should a Housmata advisor handle representing both the buyer and the seller in a deal?",
    options: ["Keep it quiet to maximize commission chances", "Proactively disclose the dual agency role to both parties to maintain transparency", "Refuse to take commissions from the buyer", "Ignore it as standard practice"],
    correct_option_index: 1,
    explanation: "Advisors must disclose dual agency and any conflicts of interest to maintain trust."
  },
  {
    id: "q-hcpa-m2-2",
    quiz_id: "quiz-hcpa-m2",
    question: "Why do buyers typically fear the Nigerian property market?",
    options: ["High cost of land inspection transportation", "Fear of fraud, double allocations, and unverified titles", "Lack of luxury estates", "Too many corporate agencies"],
    correct_option_index: 1,
    explanation: "Fear of fraud and title encumbrances makes buyers risk-averse; advisors mitigate this with verification."
  },
  {
    id: "q-hcpa-m2-3",
    quiz_id: "quiz-hcpa-m2",
    question: "What is the Housmata rule regarding the separation of client funds?",
    options: ["Advisors can use client funds for personal transport if they refund it later", "All client transaction funds must flow through designated accounts and never mix with personal funds", "Only commercial transaction funds need to be separated", "Verbal tracking is sufficient"],
    correct_option_index: 1,
    explanation: "Co-mingling client funds with personal funds is a severe ethical violation and legal risk."
  },
  {
    id: "q-hcpa-m2-4",
    quiz_id: "quiz-hcpa-m2",
    question: "What is an advisor's duty if they discover a structural defect in a listed property?",
    options: ["Hide it from the buyer to avoid losing the sale", "Disclose it clearly to the buyer before any transaction documents are signed", "Tell the developer to paint over it", "Pretend they didn't see it"],
    correct_option_index: 1,
    explanation: "Ethical conduct requires complete, honest disclosure of all known structural or document issues."
  },
  {
    id: "q-hcpa-m2-5",
    quiz_id: "quiz-hcpa-m2",
    question: "If a developer offers an advisor a secret bonus to push a property with a disputed title, what should the advisor do?",
    options: ["Accept it and close the deal quickly", "Reject the offer, prioritize the client's safety, and report the title issue", "Tell the client verbally but recommend the property anyway", "Ask for a higher bonus"],
    correct_option_index: 1,
    explanation: "Accepting secret incentives to recommend disputed properties is a direct breach of fiduciary duty."
  },
  {
    id: "q-hcpa-m2-6",
    quiz_id: "quiz-hcpa-m2",
    question: "What does 'fiduciary duty' mean for a property advisor?",
    options: ["The legal and ethical obligation to act in the best financial interest of the client", "The duty to collect as many commissions as possible", "A requirement to register a company in another country", "The right to verify coordinates without a surveyor"],
    correct_option_index: 0,
    explanation: "Fiduciary duty means placing the client's financial safety and legal security above your own short-term commission goals."
  },
  {
    id: "q-hcpa-m2-7",
    quiz_id: "quiz-hcpa-m2",
    question: "Why are verbal-only real estate agreements prohibited in the Housmata platform?",
    options: ["Because they are too easy to write down", "Because they lead to 'he said/she said' disputes and offer no legal protection", "Because the app cannot track spoken audio", "Because government offices charge fees for verbal agreements"],
    correct_option_index: 1,
    explanation: "All agreements, pricing structures, and commitments must have a clear, signed written record."
  },
  {
    id: "q-hcpa-m2-8",
    quiz_id: "quiz-hcpa-m2",
    question: "What constitutes 'price manipulation' in real estate brokerage?",
    options: ["Secretly inflating the price of a property to earn an extra commission on the markup", "Lowering the price during negotiation", "Offering a loyalty discount to clients", "Reporting market value updates to the government"],
    correct_option_index: 0,
    explanation: "Artificially marking up prices beyond the seller's true asking price without disclosure is unethical and fraudulent."
  },
  {
    id: "q-hcpa-m2-9",
    quiz_id: "quiz-hcpa-m2",
    question: "How does radical transparency benefit the advisor's career?",
    options: ["It makes deals close faster by rushing document checks", "It builds long-term authority, referral loops, and client loyalty", "It exempts the advisor from paying taxes", "It guarantees double allocation protection automatically"],
    correct_option_index: 1,
    explanation: "Clients refer advisors who protect their money and verify documents honestly, creating a sustainable career."
  },
  {
    id: "q-hcpa-m2-10",
    quiz_id: "quiz-hcpa-m2",
    question: "What should an advisor do if a client insists on buying a property that has failed coordinate verification?",
    options: ["Proceed with the sale since the client is willing", "Refuse to facilitate the transaction and document the verification failure clearly to the client", "Charge a double agency fee to cover the risk", "Tell the client to buy it under another name"],
    correct_option_index: 1,
    explanation: "Protecting the client from known loss of title (e.g., land in a committed forest reserve) is paramount, even if the client is eager."
  },

  // ==================== MODULE 3 ====================
  {
    id: "q-hcpa-m3-1",
    quiz_id: "quiz-hcpa-m3",
    question: "What is land banking?",
    options: ["Depositing money into a real estate escrow account", "Acquiring undeveloped land in growth corridors and holding it for appreciation", "Building immediate residential estates", "Renting farmland out to commercial operations"],
    correct_option_index: 1,
    explanation: "Land banking is purchasing cheap land in emerging development paths and holding it until infrastructure drives up values."
  },
  {
    id: "q-hcpa-m3-2",
    quiz_id: "quiz-hcpa-m3",
    question: "What is a major growth driver for land appreciation?",
    options: ["Arbitrary inflation by local agents", "Government infrastructure like new highways, ports, or universities", "High weather humidity", "Lack of documentation"],
    correct_option_index: 1,
    explanation: "Appreciation corridors are heavily driven by municipal and national infrastructure extensions."
  },
  {
    id: "q-hcpa-m3-3",
    quiz_id: "quiz-hcpa-m3",
    question: "What is a key risk to investigate when land banking?",
    options: ["High quality soil structure", "Zoning changes, local community disputes, and overlapping government claims", "Excessive road network expansions", "High rate of tenant move-ins"],
    correct_option_index: 1,
    explanation: "Land banking assets are vulnerable to encroachment, local land disputes, or government committed forest acquisitions."
  },
  {
    id: "q-hcpa-m3-4",
    quiz_id: "quiz-hcpa-m3",
    question: "How long is the typical holding period for standard land banking investments?",
    options: ["1 to 2 weeks", "3 to 10 years", "Exactly 6 months", "No holding period is required"],
    correct_option_index: 1,
    explanation: "Land banking is a medium-to-long term strategy that relies on development timelines to mature."
  },
  {
    id: "q-hcpa-m3-5",
    quiz_id: "quiz-hcpa-m3",
    question: "Which of these areas represents a classic historical growth corridor in Lagos?",
    options: ["Densely populated central markets", "The Ibeju-Lekki axis driven by the Lekki Free Zone and Deep Sea Port", "Fully developed inner residential streets", "Swamps with no road access"],
    correct_option_index: 1,
    explanation: "The Ibeju-Lekki corridor is a prime example of infrastructure projects driving massive land banking gains."
  },
  {
    id: "q-hcpa-m3-6",
    quiz_id: "quiz-hcpa-m3",
    question: "What is 'zoning' in real estate land banking?",
    options: ["Dividing land into 10 equal plots", "Government designation of specific areas for residential, commercial, industrial, or agricultural use", "Measuring coordinates using GPS", "Building fences around properties"],
    correct_option_index: 1,
    explanation: "Zoning laws dictate what you can build. Buying agricultural land expecting to build a commercial factory is a major risk if zoning is not updated."
  },
  {
    id: "q-hcpa-m3-7",
    quiz_id: "quiz-hcpa-m3",
    question: "Why is physical accessibility important for land banking?",
    options: ["It prevents government officers from inspecting it", "It ensures developers and future buyers can access the land for construction", "It reduces land registry document fees", "It makes coordinates easier to scan"],
    correct_option_index: 1,
    explanation: "Landlocked plots with no access roads appreciate much slower and are harder to resell to developers."
  },
  {
    id: "q-hcpa-m3-8",
    quiz_id: "quiz-hcpa-m3",
    question: "What does 'encroachment' mean in land banking?",
    options: ["Buying land next to a river", "Illegal occupation or construction on your land by unauthorized third parties", "Submitting a title to the registry", "Selling land at a discount"],
    correct_option_index: 1,
    explanation: "Because land banking plots are left vacant, they must be regularly inspected and secured to prevent encroachment."
  },
  {
    id: "q-hcpa-m3-9",
    quiz_id: "quiz-hcpa-m3",
    question: "Which of these is a secure method to protect a land banking investment?",
    options: ["Doing nothing and waiting for 10 years", "Fencing the perimeter, installing signposts, and registering the title immediately", "Relying on verbal agreements with local leaders", "Hiding the coordinates from surveyors"],
    correct_option_index: 1,
    explanation: "Physical boundaries (fencing) and registered legal titles are the primary shields against encroachment."
  },
  {
    id: "q-hcpa-m3-10",
    quiz_id: "quiz-hcpa-m3",
    question: "How should an advisor explain land banking appreciation to a client?",
    options: ["Guarantee that the land value will double every month", "Explain that value increases as infrastructure develops, but holding times require patience", "Tell them land banking has zero risk", "Advise them to buy land banking plots using short-term rent money"],
    correct_option_index: 1,
    explanation: "Honest advisors manage client expectations, detailing infrastructure growth timelines and liquidity limits."
  },

  // ==================== MODULE 4 ====================
  {
    id: "q-hcpa-m4-1",
    quiz_id: "quiz-hcpa-m4",
    question: "Which document represents the statutory occupancy rights granted by state governors in Nigeria?",
    options: ["Survey Plan", "Certificate of Occupancy (C of O)", "Deed of Assignment", "Allocation Letter"],
    correct_option_index: 1,
    explanation: "The C of O is the primary document issued by the government confirming occupancy rights for 99 years."
  },
  {
    id: "q-hcpa-m4-2",
    quiz_id: "quiz-hcpa-m4",
    question: "What is the purpose of a Survey Plan?",
    options: ["To list the tenant's payment history", "To show the boundary coordinates and exact measurements of a land plot", "To assign ownership from seller to buyer", "To request a mortgage referral"],
    correct_option_index: 1,
    explanation: "A survey plan measures and describes the physical boundaries of a plot, recorded by a registered surveyor."
  },
  {
    id: "q-hcpa-m4-3",
    quiz_id: "quiz-hcpa-m4",
    question: "What is a Deed of Assignment?",
    options: ["A document showing coordinates scanned from the site", "The legal agreement transferring interest and ownership from the seller to the buyer", "A certificate of occupancy issued by the federal court", "A letter of invitation for an inspection"],
    correct_option_index: 1,
    explanation: "The Deed of Assignment is the transaction document that legally transfers the property rights from the assignor to the assignee."
  },
  {
    id: "q-hcpa-m4-4",
    quiz_id: "quiz-hcpa-m4",
    question: "What does 'Governor's Consent' mean under the Land Use Act of 1978?",
    options: ["The governor agreeing to attend a property launch", "The mandatory approval required from the state governor to validate any land interest transfer", "A discount on land registry fees approved by the governor", "A surveyor's signature on a survey plan"],
    correct_option_index: 1,
    explanation: "Under the Land Use Act, any transfer of interest in land requires the Governor's official consent to be legally valid."
  },
  {
    id: "q-hcpa-m4-5",
    quiz_id: "quiz-hcpa-m4",
    question: "What is a Gazette in land administration?",
    options: ["A newspaper containing real estate listings", "An official government record showing land areas that have been excised or released to communities", "A layout plan for residential estates", "A receipt for governor's consent fees"],
    correct_option_index: 1,
    explanation: "A Gazette publishes government decisions, including land acquisitions, excisions, and official titles."
  },
  {
    id: "q-hcpa-m4-6",
    quiz_id: "quiz-hcpa-m4",
    question: "What does 'excision' mean?",
    options: ["Cutting down trees on a plot of land", "The process by which the government releases land to local communities, taking it out of global acquisition", "A survey plan correction", "Rejecting a mortgage application"],
    correct_option_index: 1,
    explanation: "When land is excised, the government officially releases it to the native community, making it secure to purchase and title."
  },
  {
    id: "q-hcpa-m4-7",
    quiz_id: "quiz-hcpa-m4",
    question: "Why is a 'search report' from the Lands Registry critical before purchasing?",
    options: ["To check if the property has water supply", "To verify the true owner of the title and check if the property is mortgaged or in dispute", "To find out how many bedrooms are in the house", "To register the advisor's company"],
    correct_option_index: 1,
    explanation: "A search report reveals the legal status of the land title, active disputes, or bank liens."
  },
  {
    id: "q-hcpa-m4-8",
    quiz_id: "quiz-hcpa-m4",
    question: "What is an 'encumbrance' on a property?",
    options: ["A decorative wall design", "A legal claim, mortgage, or liability attached to the property that affects its transfer", "A registered surveyor's stamp", "An access road network"],
    correct_option_index: 1,
    explanation: "An encumbrance (like a bank charge or court dispute) restricts the clean transfer of property ownership."
  },
  {
    id: "q-hcpa-m4-9",
    quiz_id: "quiz-hcpa-m4",
    question: "What is an Allocation Letter?",
    options: ["A letter from the bank approving a mortgage", "A document issued by the government or a developer assigning a specific plot number in an estate to a buyer", "A request to verify coordinates", "An invoice for commission"],
    correct_option_index: 1,
    explanation: "An allocation letter defines which specific physical plot belongs to the buyer within a larger partitioned area."
  },
  {
    id: "q-hcpa-m4-10",
    quiz_id: "quiz-hcpa-m4",
    question: "What is 'root of title'?",
    options: ["The deep foundation structure of a building", "The chronological trail of documents proving how the current owner acquired the property historically", "The coordinates registered on the survey plan", "The first page of a tenancy agreement"],
    correct_option_index: 1,
    explanation: "A clean root of title ensures that you can trace ownership back to a government allocation, excision, or valid C of O."
  },

  // ==================== MODULE 5 ====================
  {
    id: "q-hcpa-m5-1",
    quiz_id: "quiz-hcpa-m5",
    question: "What is the first step in the Housmata Property Verification Framework?",
    options: ["Paying the commitment deposit", "Verifying the property title, ownership records, and site GPS coordinates", "Creating a listing video", "Recommending mortgage options"],
    correct_option_index: 1,
    explanation: "Verification begins with gathering documents, confirming ownership details, and scanning GPS coordinates."
  },
  {
    id: "q-hcpa-m5-2",
    quiz_id: "quiz-hcpa-m5",
    question: "Why must GPS coordinates be checked against government land registry charts?",
    options: ["To see if the land is close to a shopping mall", "To verify if the land falls under government-committed acquisitions or forest reserves", "To measure the quality of soil", "To generate automatic listings"],
    correct_option_index: 1,
    explanation: "Checking coordinates ensures you don't buy land inside committed government zones, where any construction would be demolished."
  },
  {
    id: "q-hcpa-m5-3",
    quiz_id: "quiz-hcpa-m5",
    question: "What is a 'committed acquisition' in land administration?",
    options: ["Land purchased by a private cooperative", "Land reserved strictly by the government for public infrastructure, roads, or reserves", "Land that has received a Certificate of Occupancy", "Land with no access roads"],
    correct_option_index: 1,
    explanation: "Committed acquisition land cannot be privately titled or owned; buying it leads to loss of capital."
  },
  {
    id: "q-hcpa-m5-4",
    quiz_id: "quiz-hcpa-m5",
    question: "How do you verify the integrity of a property developer?",
    options: ["By looking at their logo design", "By researching their past completed projects, delivery timelines, and legal dispute history", "By checking how many sales agents they have", "By calling their main office for a discount"],
    correct_option_index: 1,
    explanation: "Developer verification involves checking past delivery track records and confirming they allocate plots on time."
  },
  {
    id: "q-hcpa-m5-5",
    quiz_id: "quiz-hcpa-m5",
    question: "What is the role of a Registered Surveyor in property verification?",
    options: ["To draft the tenancy agreements", "To physically pick site coordinates, draft survey plans, and lodge them at the surveyor general's office", "To value the property price", "To approve mortgage eligibility"],
    correct_option_index: 1,
    explanation: "Surveyors verify physical boundaries on earth and cross-reference them with official charts."
  },
  {
    id: "q-hcpa-m5-6",
    quiz_id: "quiz-hcpa-m5",
    question: "What is a 'charting' process?",
    options: ["Making a list of top properties", "Plotting land coordinates on government maps to determine its acquisition status and zoning", "Calculating commission percentages", "Taking aerial photos with a drone"],
    correct_option_index: 1,
    explanation: "Charting reveals the exact legal classification of a land plot on official government master plans."
  },
  {
    id: "q-hcpa-m5-7",
    quiz_id: "quiz-hcpa-m5",
    question: "Which of these is a physical encumbrance you must check during site inspection?",
    options: ["The color of the front gate", "Active building construction by a different claimant, or red demolition signs from the state government", "The size of the listing video file", "The distance to the airport"],
    correct_option_index: 1,
    explanation: "Physical signs of dispute, court notices, or state demolition warnings indicate title ownership clashes."
  },
  {
    id: "q-hcpa-m5-8",
    quiz_id: "quiz-hcpa-m5",
    question: "What does 'demolition warning' (red writing on walls) usually mean?",
    options: ["The developer is renovating the building", "The structure lacks proper planning permits or occupies committed government land", "The property is ready for sale", "The owner is offering a discount"],
    correct_option_index: 1,
    explanation: "State town planning warnings indicate severe regulatory violations that can lead to structural loss."
  },
  {
    id: "q-hcpa-m5-9",
    quiz_id: "quiz-hcpa-m5",
    question: "Why should you verify the identity of the person signing the Deed of Assignment?",
    options: ["To make sure they have a bank account", "To confirm they are the legally registered owner or authorized signatory of the asset", "To record their age", "To invite them to the inspection"],
    correct_option_index: 1,
    explanation: "Verifying the signatory prevents fraud from impostors selling family or corporate land without permission."
  },
  {
    id: "q-hcpa-m5-10",
    quiz_id: "quiz-hcpa-m5",
    question: "What is the Housmata standard when coordinate checks reveal a land is in a forest reserve?",
    options: ["Sell it but advise the client to build quickly", "Cancel the transaction immediately, document the failure, and refuse to list the plot", "Charge double agency commissions", "Wait for the client to discover it themselves"],
    correct_option_index: 1,
    explanation: "Housmata enforces absolute compliance; listings in committed reserves are banned immediately."
  },

  // ==================== MODULE 6 ====================
  {
    id: "q-hcpa-m6-1",
    quiz_id: "quiz-hcpa-m6",
    question: "What is the primary objective of real estate brokerage?",
    options: ["To buy as many properties as possible for personal use", "To act as an agent facilitating property sales between buyers and sellers, matching demand with supply", "To build houses on agricultural land", "To manage rent ledgers on a weekly basis"],
    correct_option_index: 1,
    explanation: "Brokerage is the professional matchmaking and transaction advisory service that closes property deals."
  },
  {
    id: "q-hcpa-m6-2",
    quiz_id: "quiz-hcpa-m6",
    question: "What is an 'exclusive listing'?",
    options: ["A listing only available to wealthy buyers", "An agreement where only one broker has the right to market and sell a property for a set period", "A property with no survey plan", "A listing uploaded without documents"],
    correct_option_index: 1,
    explanation: "An exclusive listing prevents other agents from marketing the property, ensuring the broker gets paid if sold."
  },
  {
    id: "q-hcpa-m6-3",
    quiz_id: "quiz-hcpa-m6",
    question: "What is 'lead qualification' in real estate sales?",
    options: ["Checking if a lead has a university degree", "Evaluating a prospect's budget, readiness, and investment objective to see if they are a fit", "Adding a prospect to a WhatsApp group", "Charging a fee for site inspections"],
    correct_option_index: 1,
    explanation: "Qualifying leads saves time by filtering out buyers who lack budget, funding, or serious intent."
  },
  {
    id: "q-hcpa-m6-4",
    quiz_id: "quiz-hcpa-m6",
    question: "What is a 'listing presentation'?",
    options: ["A walk through the site coordinates", "A structured pitch showing a property owner how you will market and verify their asset", "A contract between two buyers", "A tax document filed at the land registry"],
    correct_option_index: 1,
    explanation: "A listing presentation demonstrates your marketing plan, pricing strategy, and verification system to a seller."
  },
  {
    id: "q-hcpa-m6-5",
    quiz_id: "quiz-hcpa-m6",
    question: "What is 'prospecting'?",
    options: ["Buying mining equipment", "The continuous process of searching for new clients (buyers, sellers, developers)", "Reconciling rent ledgers", "Applying for governor's consent"],
    correct_option_index: 1,
    explanation: "Prospecting involves cold calls, networking, database emails, and referrals to keep your sales funnel full."
  },
  {
    id: "q-hcpa-m6-6",
    quiz_id: "quiz-hcpa-m6",
    question: "What does 'closing' mean in real estate sales?",
    options: ["Locking the front door of a property", "The final agreement where the buyer signs documents and commits funds to complete the sale", "Deleting listing details from the website", "Refusing to take new clients"],
    correct_option_index: 1,
    explanation: "Closing is the successful culmination of negotiations where the transaction is finalized."
  },
  {
    id: "q-hcpa-m6-7",
    quiz_id: "quiz-hcpa-m6",
    question: "How should an advisor handle a client objection regarding high price?",
    options: ["Tell the client they cannot afford it", "Compare the property's features, location, and verified title to similar assets in the area to justify the value", "Ask the seller to cut the price in half immediately", "Ignore the concern and repeat the sales pitch"],
    correct_option_index: 1,
    explanation: "Objections are opportunities to educate. Justifying value with data helps the client make an informed choice."
  },
  {
    id: "q-hcpa-m6-8",
    quiz_id: "quiz-hcpa-m6",
    question: "What is 'dual agency'?",
    options: ["Representing two developers at the same time", "Representing both the buyer and the seller in a single transaction", "Having two real estate agencies registered", "Working in two different states"],
    correct_option_index: 1,
    explanation: "Dual agency is legal but highly sensitive. It requires written disclosure to prevent conflict of interest."
  },
  {
    id: "q-hcpa-m6-9",
    quiz_id: "quiz-hcpa-m6",
    question: "What is a 'co-brokerage' agreement?",
    options: ["Two buyers purchasing one plot", "An agreement where two brokers collaborate to close a deal and split the commission", "A mortgage loan shared by two banks", "A listing uploaded without verification details"],
    correct_option_index: 1,
    explanation: "Co-brokerage expands listing reach by allowing agents representing buyers to match with agents representing sellers."
  },
  {
    id: "q-hcpa-m6-10",
    quiz_id: "quiz-hcpa-m6",
    question: "Why is product knowledge critical for property brokers?",
    options: ["To convince clients to skip surveyor checks", "To explain building features, titles, neighborhood trends, and values with absolute confidence", "To charge higher fees for inspections", "To register properties with the federal government"],
    correct_option_index: 1,
    explanation: "Brokers who know their products inside-out build fast authority and close deals by resolving buyer doubts with facts."
  },

  // ==================== MODULE 7 ====================
  {
    id: "q-hcpa-m7-1",
    quiz_id: "quiz-hcpa-m7",
    question: "What is the primary purpose of digital marketing for property professionals?",
    options: ["To post personal holiday pictures", "To build online visibility, attract qualified leads, and showcase verified listings", "To bypass lands registry searches", "To decrease the property purchase price"],
    correct_option_index: 1,
    explanation: "Digital marketing puts verified listings in front of interested buyers via social channels, search, and email funnels."
  },
  {
    id: "q-hcpa-m7-2",
    quiz_id: "quiz-hcpa-m7",
    question: "What represents 'high-quality property media'?",
    options: ["Low-resolution pictures taken in the dark", "Clear smartphone walkthrough videos, drone footage, and well-lit professional photos", "Stock pictures of buildings from other countries", "A written listing with no pictures"],
    correct_option_index: 1,
    explanation: "Quality media shows the true condition of the property, including access roads, to build initial trust."
  },
  {
    id: "q-hcpa-m7-3",
    quiz_id: "quiz-hcpa-m7",
    question: "How should walkthrough videos be structured?",
    options: ["A fast, unguided walk through the property", "A structured tour highlighting key rooms, title verification summaries, and neighborhood infrastructure advantages", "Focusing only on the front gate", "Using loud music that blocks your voice description"],
    correct_option_index: 1,
    explanation: "Walkthroughs must act as educational tours, explaining key specifications clearly."
  },
  {
    id: "q-hcpa-m7-4",
    quiz_id: "quiz-hcpa-m7",
    question: "Which of these is a key platform for B2B real estate networking and professional branding?",
    options: ["TikTok", "LinkedIn", "Pinterest", "Reddit"],
    correct_option_index: 1,
    explanation: "LinkedIn is ideal for connecting with institutional developers, corporate buyers, and mortgage partners."
  },
  {
    id: "q-hcpa-m7-5",
    quiz_id: "quiz-hcpa-m7",
    question: "What is a 'landing page' in real estate lead generation?",
    options: ["A flat piece of land ready for development", "A single web page designed to collect contact information from prospects in exchange for a property catalog or guide", "The front page of a lands registry site", "The final page of a deed of assignment"],
    correct_option_index: 1,
    explanation: "Landing pages convert casual social media viewers into qualified leads by gathering emails and phone numbers."
  },
  {
    id: "q-hcpa-m7-6",
    quiz_id: "quiz-hcpa-m7",
    question: "Why are stock images of properties banned in the Housmata platform?",
    options: ["They occupy too much storage space in the database", "They mislead buyers about the true state and appearance of the listing", "They require government licensing fees", "They prevent coordinate charting"],
    correct_option_index: 1,
    explanation: "Housmata prioritizes integrity. Only real, verified photos of the actual property can be uploaded."
  },
  {
    id: "q-hcpa-m7-7",
    quiz_id: "quiz-hcpa-m7",
    question: "What is 'retargeting' in digital advertising?",
    options: ["Targeting a completely new location axis", "Showing ads to prospects who have previously visited your website or interacted with your listings", "Changing the coordinates on a survey plan", "Hiring a new sales team"],
    correct_option_index: 1,
    explanation: "Retargeting keeps your listings top-of-mind for buyers who are actively considering a purchase."
  },
  {
    id: "q-hcpa-m7-8",
    quiz_id: "quiz-hcpa-m7",
    question: "How does educational content marketing build sales pipelines?",
    options: ["By explaining how to bypass official land charges", "By posting guides on title verification and land rights, proving your expertise so prospects reach out for advice", "By offering properties at half price", "By cold calling prospects at night"],
    correct_option_index: 1,
    explanation: "Sharing valuable insights builds authority, attracting clients who want a safe transaction, not just a salesperson."
  },
  {
    id: "q-hcpa-m7-9",
    quiz_id: "quiz-hcpa-m7",
    question: "What is the best use of WhatsApp for property advisors?",
    options: ["Spamming links to random contacts daily", "Posting educational market updates, listing tours, and client reviews on status", "Sending long generic holiday messages", "Hiding listing details from potential buyers"],
    correct_option_index: 1,
    explanation: "WhatsApp status is a highly engaging channel to nurture existing relationships with verified insights."
  },
  {
    id: "q-hcpa-m7-10",
    quiz_id: "quiz-hcpa-m7",
    question: "What metric is most important in a digital ad campaign?",
    options: ["Total number of likes", "Cost per qualified lead and conversion rate of inquiries to site inspections", "The background color of the ad image", "The age of the developer"],
    correct_option_index: 1,
    explanation: "LMS and sales growth depend on conversions and qualified lead metrics, not vanity likes."
  },

  // ==================== MODULE 8 ====================
  {
    id: "q-hcpa-m8-1",
    quiz_id: "quiz-hcpa-m8",
    question: "What is the main purpose of the Housmata app platform?",
    options: ["To play real estate management games", "To centralize property listings, coordinate client leads, request verifications, and track sales progress", "To bypass governor's consent filings", "To build houses automatically"],
    correct_option_index: 1,
    explanation: "The Housmata platform provides digital tools to run a professional, high-integrity property business."
  },
  {
    id: "q-hcpa-m8-2",
    quiz_id: "quiz-hcpa-m8",
    question: "How do you submit a property for verification on the Housmata app?",
    options: ["By writing a post on social media", "By uploading the survey plan, title documents, and GPS coordinates through the app's verification module", "By calling the developer on the phone", "By depositing commission funds"],
    correct_option_index: 1,
    explanation: "Submitting files and coordinates through the app triggers the survey charting and registry search workflows."
  },
  {
    id: "q-hcpa-m8-3",
    quiz_id: "quiz-hcpa-m8",
    question: "What is the 'listings pipeline' in the app?",
    options: ["The physical sewer layout of an estate", "The dashboard showing your uploaded listings and their approval status (pending, verified, sold)", "The contact list of other brokers", "The land registry tax history chart"],
    correct_option_index: 1,
    explanation: "The dashboard tracks your inventory's status through the verification lifecycle."
  },
  {
    id: "q-hcpa-m8-4",
    quiz_id: "quiz-hcpa-m8",
    question: "What does the CRM (Customer Relationship Management) tool do in the app?",
    options: ["Calculates building structural strength", "Tracks client records, preferences, inquiry histories, and follow-up tasks", "Generates survey plans automatically", "Applies for loans on behalf of the developer"],
    correct_option_index: 1,
    explanation: "The CRM tool helps advisors manage interactions, organize prospects, and stay on top of client follow-ups."
  },
  {
    id: "q-hcpa-m8-5",
    quiz_id: "quiz-hcpa-m8",
    question: "How can you view your commission earnings on the platform?",
    options: ["By calling the bank", "Through the commissions wallet tab in the app, showing tracked transactions and payouts", "By waiting for a physical paper invoice", "The app does not track commissions"],
    correct_option_index: 1,
    explanation: "The app features a transparent commissions dashboard linking closed deals to payouts."
  },
  {
    id: "q-hcpa-m8-6",
    quiz_id: "quiz-hcpa-m8",
    question: "What is the 'verification status' badge in the app?",
    options: ["A decorative element on profiles", "A digital stamp showing a listing's title, coordinates, and developers have been fully verified by Housmata", "An award for top sellers", "A license to practice surveying"],
    correct_option_index: 1,
    explanation: "Only listings with verified status badges are pushed to public buyers, guaranteeing transaction safety."
  },
  {
    id: "q-hcpa-m8-7",
    quiz_id: "quiz-hcpa-m8",
    question: "Why should you log client communication notes in the app?",
    options: ["Because the government demands it", "To build a shared history of client preferences and agreements to prevent memory disputes", "To increase your storage bill", "To share it with other competing brokers"],
    correct_option_index: 1,
    explanation: "Logging notes creates a single source of truth, ensuring premium service delivery."
  },
  {
    id: "q-hcpa-m8-8",
    quiz_id: "quiz-hcpa-m8",
    question: "What happens when a lead is assigned to you on the app?",
    options: ["You are charged a fee immediately", "You receive a notification with client details and must contact them within the platform response window", "The client is called automatically by a robot", "The deal is marked as closed"],
    correct_option_index: 1,
    explanation: "Lead assignments match certified advisors to high-intent buyers, requiring fast response times."
  },
  {
    id: "q-hcpa-m8-9",
    quiz_id: "quiz-hcpa-m8",
    question: "How does the app protect client data privacy?",
    options: ["By sharing contact files publicly on WhatsApp", "By encrypting contact details and limiting access strictly to the assigned advisor", "By deleting client files after 24 hours", "By refusing to save client phone numbers"],
    correct_option_index: 1,
    explanation: "Housmata enforces standard data privacy compliance, protecting client profiles within secure database views."
  },
  {
    id: "q-hcpa-m8-10",
    quiz_id: "quiz-hcpa-m8",
    question: "What is the outcome of keeping listing information updated on the app?",
    options: ["Fewer site inspections are needed", "Higher search visibility, faster matching, and accurate stock records that prevent false sales", "A drop in commission percentages", "Automatic governor's consent approval"],
    correct_option_index: 1,
    explanation: "Accurate listings maintain marketplace integrity, driving conversion and investor trust."
  },

  // ==================== MODULE 9 ====================
  {
    id: "q-hcpa-m9-1",
    quiz_id: "quiz-hcpa-m9",
    question: "What are the primary property payment methods in Nigeria?",
    options: ["Cash, Installments, Developer Financing, and Cooperative Finance", "Bitcoin transfers only", "State taxes and donations", "Physical bartering of goods"],
    correct_option_index: 0,
    explanation: "Advisors must understand different payment structures to match client capital availability."
  },
  {
    id: "q-hcpa-m9-2",
    quiz_id: "quiz-hcpa-m9",
    question: "What is an installment payment plan?",
    options: ["Paying the entire sum at the beginning", "Spreading the property cost over a set period (e.g., 12 to 24 months) in structural milestones", "Renting the property without buying it", "A government grant for home ownership"],
    correct_option_index: 1,
    explanation: "Installment plans enable buyers to fund property purchases using cash flow rather than massive single deposits."
  },
  {
    id: "q-hcpa-m9-3",
    quiz_id: "quiz-hcpa-m9",
    question: "What is a 'milestone payment' in development construction?",
    options: ["A payment made on the first day of every month", "Payments triggered only when specific construction phases (e.g., foundation, roofing) are completed", "A tip paid to bricklayers", "A payment made after the C of O is signed"],
    correct_option_index: 1,
    explanation: "Milestone payments protect the buyer by linking funding releases directly to building progress."
  },
  {
    id: "q-hcpa-m9-4",
    quiz_id: "quiz-hcpa-m9",
    question: "What is 'developer financing'?",
    options: ["The developer borrowing money from the advisor", "The developer offering credit directly to the buyer to pay for the property over time without bank underwriting", "A bank loan given to the developer", "A government grant for builders"],
    correct_option_index: 1,
    explanation: "Developer financing cuts out bank delays, enabling buyers to purchase directly through structured contracts."
  },
  {
    id: "q-hcpa-m9-5",
    quiz_id: "quiz-hcpa-m9",
    question: "What is a major risk of over-leverage for real estate buyers?",
    options: ["Having too much equity in the asset", "Committing to payment plans that exceed their predictable monthly income, leading to default and loss of deposits", "The property value appreciating too fast", "Paying off the debt ahead of schedule"],
    correct_option_index: 1,
    explanation: "Over-leveraged clients face default risks. Advisors must evaluate affordability before signing installment deals."
  },
  {
    id: "q-hcpa-m9-6",
    quiz_id: "quiz-hcpa-m9",
    question: "What is a 'cooperative finance' model in Nigerian property acquisitions?",
    options: ["Two developers building a shared plaza", "A group of individuals pooling monthly capital to purchase land tracts in bulk at discounted rates", "A government land registry loan program", "A mortgage referral system for salary earners"],
    correct_option_index: 1,
    explanation: "Cooperatives leverage collective bargaining strength to secure cheap land and infrastructure development."
  },
  {
    id: "q-hcpa-m9-7",
    quiz_id: "quiz-hcpa-m9",
    question: "Why should advisors calculate the total cost of acquisition across payment plans?",
    options: ["To increase their brokerage commission", "Because installment options often include interest markups that increase the final purchase cost compared to cash", "To delay the transaction sign-off", "To report it to local tax authorities"],
    correct_option_index: 1,
    explanation: "Advisors must show buyers the difference between cash discounts and installment premiums for complete transparency."
  },
  {
    id: "q-hcpa-m9-8",
    quiz_id: "quiz-hcpa-m9",
    question: "What does 'escrow' mean in real estate finance?",
    options: ["A discount voucher offered by sellers", "A neutral third-party account holding transaction funds until contract terms are fully met", "A fee paid to registry surveyors", "A type of land banking zoning"],
    correct_option_index: 1,
    explanation: "Escrow accounts prevent fraud by ensuring funds are only released when title documents are verified and handed over."
  },
  {
    id: "q-hcpa-m9-9",
    quiz_id: "quiz-hcpa-m9",
    question: "What is an 'equity contribution' in real estate purchase?",
    options: ["The down payment or personal cash portion the buyer must pay before securing a mortgage or installment loan", "The commission split between two brokers", "The tax rate applied to commercial properties", "The coordinate check fee paid to a surveyor"],
    correct_option_index: 0,
    explanation: "Mortgage banks and developers demand an equity contribution (e.g., 20% to 30%) before financing the balance."
  },
  {
    id: "q-hcpa-m9-10",
    quiz_id: "quiz-hcpa-m9",
    question: "What should an advisor do if a developer's contract states deposits are non-refundable under default?",
    options: ["Ignore it and sign the contract anyway", "Point it out clearly to the client, explain the risks, and negotiate fallback clauses", "Tell the client to pay in cash to avoid the rule", "Cancel the client's mortgage referral"],
    correct_option_index: 1,
    explanation: "Ethical advisors review contracts, protecting clients from predatory clauses by highlighting default refund terms."
  },

  // ==================== MODULE 10 ====================
  {
    id: "q-hcpa-m10-1",
    quiz_id: "quiz-hcpa-m10",
    question: "What is the primary role of a Housmata advisor in the mortgage process?",
    options: ["To underwrite the mortgage loan", "To assess client affordability, prepare documents, and refer to partner mortgage banks", "To approve interest rate waivers", "To act as guarantor for the loan"],
    correct_option_index: 1,
    explanation: "The advisor's role is to assess readiness and package the file; the finance partner approves the mortgage."
  },
  {
    id: "q-hcpa-m10-2",
    quiz_id: "quiz-hcpa-m10",
    question: "Who are ULE Homes and Yalo in the Housmata platform?",
    options: ["Estate management software firms", "Approved mortgage and housing finance partners", "Government land registries", "Real estate construction developers"],
    correct_option_index: 1,
    explanation: "They are the approved mortgage partners integrated with Housmata to offer financing to buyers."
  },
  {
    id: "q-hcpa-m10-3",
    quiz_id: "quiz-hcpa-m10",
    question: "What is the primary metric mortgage banks use to assess affordability?",
    options: ["The size of the client's home", "The debt-to-income ratio (typically limiting monthly mortgage payments to 33-40% of net income)", "The client's age only", "The total number of properties owned"],
    correct_option_index: 1,
    explanation: "Banks limit mortgage obligations to prevent defaults, ensuring clients have enough income left for living expenses."
  },
  {
    id: "q-hcpa-m10-4",
    quiz_id: "quiz-hcpa-m10",
    question: "What is the National Housing Fund (NHF) in Nigeria?",
    options: ["A tax on developers", "A government scheme enabling workers to contribute to a pool for low-interest housing loans", "A private mortgage bank", "A database of property listings"],
    correct_option_index: 1,
    explanation: "The NHF allows contributors to access mortgages at competitive rates (usually 6%) to build or purchase residential homes."
  },
  {
    id: "q-hcpa-m10-5",
    quiz_id: "quiz-hcpa-m10",
    question: "What is the difference between a salary earner and a business owner in mortgage documentation?",
    options: ["Salary earners do not need bank statements", "Salary earners submit pay slips and tax records; business owners submit corporate accounts, registration documents, and audited statements", "Business owners cannot apply for mortgages", "There is no difference in requirements"],
    correct_option_index: 1,
    explanation: "Lenders require business owners to prove corporate health and consistent cash flow since they don't have pay slips."
  },
  {
    id: "q-hcpa-m10-6",
    quiz_id: "quiz-hcpa-m10",
    question: "What does 'amortization' mean in mortgage finance?",
    options: ["A discount on property purchase price", "The process of spreading loan payments over time into principal and interest portions until fully paid", "A penalty for late payment", "An increase in interest rates"],
    correct_option_index: 1,
    explanation: "Amortization charts show how each monthly payment slowly reduces the total outstanding debt over the life of the loan."
  },
  {
    id: "q-hcpa-m10-7",
    quiz_id: "quiz-hcpa-m10",
    question: "Why do banks require a Certificate of Occupancy (C of O) for mortgage approvals?",
    options: ["To verify the color of the building", "Because it is the ultimate legal proof of occupancy right, which the bank holds as collateral", "To increase their survey fee", "To confirm the advisor's commission status"],
    correct_option_index: 1,
    explanation: "Lenders will not finance properties with weak titles (e.g., unregistered surveys) because they cannot resell them if the client defaults."
  },
  {
    id: "q-hcpa-m10-8",
    quiz_id: "quiz-hcpa-m10",
    question: "What is 'equity contribution' in mortgage referrals?",
    options: ["The money paid to surveyors for coordinate charting", "The percentage of the property price the buyer must fund in cash before the bank finances the rest", "The advisor's commission payout share", "The fee charged for governor's consent filing"],
    correct_option_index: 1,
    explanation: "Lenders require buyers to put skin in the game (often 10% to 30% of the asset cost) to reduce loan risk."
  },
  {
    id: "q-hcpa-m10-9",
    quiz_id: "quiz-hcpa-m10",
    question: "What should an advisor do if a client has a poor credit history or untracked bank statements?",
    options: ["Advise them to wait, build clean transaction statements for 6 months, and pay off active debts first", "Falsify their pay slips to secure the loan", "Tell them to buy land banking plots instead without checking documents", "Submit the application anyway to test the bank"],
    correct_option_index: 0,
    explanation: "Honest advisors help clients correct their financial profiles before applying to prevent bank rejection."
  },
  {
    id: "q-hcpa-m10-10",
    quiz_id: "quiz-hcpa-m10",
    question: "What is a 'pre-qualification letter' in housing finance?",
    options: ["A deed of assignment signed by a developer", "An official document from a lender indicating the estimated mortgage amount a buyer qualifies for based on initial income checks", "A certificate of graduation from the academy", "An allocation letter for a land plot"],
    correct_option_index: 1,
    explanation: "Pre-qualification gives buyers a clear budget before they start physical site tours, saving time and aligning expectations."
  },

  // ==================== MODULE 11 ====================
  {
    id: "q-hcpa-m11-1",
    quiz_id: "quiz-hcpa-m11",
    question: "During a physical site inspection, what should the advisor prioritize?",
    options: ["Getting the tour over quickly", "Active storytelling about neighborhood trends and infrastructure", "Explaining how to buy adjacent structures", "Letting the client walk completely unguided"],
    correct_option_index: 1,
    explanation: "Inspections succeed on structured showings, highlighted benefits, and active objection handling."
  },
  {
    id: "q-hcpa-m11-2",
    quiz_id: "quiz-hcpa-m11",
    question: "If a buyer objects that the access road is not asphalted, the advisor should:",
    options: ["Argue that asphalt is unnecessary", "Acknowledge the concern and outline planned infrastructure or neighborhood schedules", "Tell the client to buy a different house", "Blame the developer"],
    correct_option_index: 1,
    explanation: "Handle objections calmly with factual data on development timelines."
  },
  {
    id: "q-hcpa-m11-3",
    quiz_id: "quiz-hcpa-m11",
    question: "What is the 'inspection protocol' for advisors before the client arrives?",
    options: ["Wait for the client at home", "Arrive 30 minutes early, confirm route access, verify keys open doors, and check site cleanliness", "Call the lands registry to verify coordinates again", "Arrange for immediate deposit collection"],
    correct_option_index: 1,
    explanation: "Premium service requires prep. Checking structural integrity, locks, and accessibility prevents awkward surprises."
  },
  {
    id: "q-hcpa-m11-4",
    quiz_id: "quiz-hcpa-m11",
    question: "How should an advisor dress for a site inspection?",
    options: ["Extremely casual, in sports wear", "Professional, brand-aligned, and clean, projecting authority and respect for the client's time", "In construction gear with hard hats (unless it's an active work zone)", "The clothing choices do not matter"],
    correct_option_index: 1,
    explanation: "Visual presentation anchors trust. Professional appearance matches the high-value transaction being discussed."
  },
  {
    id: "q-hcpa-m11-5",
    quiz_id: "quiz-hcpa-m11",
    question: "Why should an advisor show the 'neighborhood amenities' during a tour?",
    options: ["To distract the client from the property", "To showcase lifestyle value, proximity to schools, hospitals, and transit hubs that drive value", "To increase their transportation charge", "To show off their knowledge of the city"],
    correct_option_index: 1,
    explanation: "Property value is directly tied to neighborhood utility. Highlighting infrastructure validates the investment."
  },
  {
    id: "q-hcpa-m11-6",
    quiz_id: "quiz-hcpa-m11",
    question: "What is the best way to handle a client who brings their own surveyor to an inspection?",
    options: ["Refuse to let the surveyor onto the site", "Welcome the surveyor, provide coordinate records, and assist them in charting the boundaries", "Charge an extra fee for surveyor access", "Tell the client that surveyors are not allowed under Housmata rules"],
    correct_option_index: 1,
    explanation: "Honest advisors encourage verification. Welcoming the client's surveyor proves you have nothing to hide."
  },
  {
    id: "q-hcpa-m11-7",
    quiz_id: "quiz-hcpa-m11",
    question: "What is 'objection handling' in property tours?",
    options: ["Arguing with the client to force them to agree", "Addressing doubts or fears with facts, data, and alternatives to help the client make decisions", "Ignoring negative feedback", "Offering an immediate price drop without permission"],
    correct_option_index: 1,
    explanation: "Objections are signs of interest. Resolving them with verified information builds confidence."
  },
  {
    id: "q-hcpa-m11-8",
    quiz_id: "quiz-hcpa-m11",
    question: "What safety standard must be followed on active construction sites?",
    options: ["Let clients explore freely", "Require hard hats, avoid open elevator shafts, and guide the tour only through safe zones", "Conduct the inspection at night", "Tell the client to inspect alone"],
    correct_option_index: 1,
    explanation: "Client safety is paramount. Advisors must actively guide tours in active work zones."
  },
  {
    id: "q-hcpa-m11-9",
    quiz_id: "quiz-hcpa-m11",
    question: "How should an advisor close a physical inspection tour?",
    options: ["Say goodbye and leave immediately", "Ask the client for their feedback, summarize next steps, and set up a follow-up timeline", "Demand a deposit before they exit the site", "Tell the client to contact the developer directly"],
    correct_option_index: 1,
    explanation: "Every inspection must have a clear closing call to action: defining timelines for reservation or questions."
  },
  {
    id: "q-hcpa-m11-10",
    quiz_id: "quiz-hcpa-m11",
    question: "What is the standard if an inspection reveals structural damage the developer didn't disclose?",
    options: ["Hide it from the client and close the deal", "Point it out to the client, contact the developer for corrections, and record it in the app logs", "Offer the client a secret discount to buy it anyway", "Tell the developer to blame the weather"],
    correct_option_index: 1,
    explanation: "Transparency is non-negotiable. Pointing out issues protects client capital and maintains Housmata standards."
  },

  // ==================== MODULE 12 ====================
  {
    id: "q-hcpa-m12-1",
    quiz_id: "quiz-hcpa-m12",
    question: "What is the final stage of a successful real estate transaction?",
    options: ["Securing the verbal agreement", "Compiling the transaction file, executing agreements, and coordinating handover", "Deleting the client's contact info", "Collecting the cash envelope"],
    correct_option_index: 1,
    explanation: "Handovers must be documented, contracts signed, and records archived safely."
  },
  {
    id: "q-hcpa-m12-2",
    quiz_id: "quiz-hcpa-m12",
    question: "Why is after-sales service important for property advisors?",
    options: ["It is a government regulation", "It drives repeat business and high-value referrals from satisfied clients", "It allows you to sell their data", "It reduces tax obligations"],
    correct_option_index: 1,
    explanation: "Advisors build long-term value; satisfied clients are the primary source of referrals."
  },
  {
    id: "q-hcpa-m12-3",
    quiz_id: "quiz-hcpa-m12",
    question: "What is a 'reservation form' in closing transactions?",
    options: ["A form to reserve a slot for a site inspection", "A document where the buyer officially commits to purchasing a specific plot/property and logs their deposit details", "A request to verify survey plan coordinates", "An invoice for corporate tax filings"],
    correct_option_index: 1,
    explanation: "The reservation form commits the plot to the buyer, taking it off the active market while payments clear."
  },
  {
    id: "q-hcpa-m12-4",
    quiz_id: "quiz-hcpa-m12",
    question: "What does 'handover protocol' mean in property sales?",
    options: ["Giving keys to the buyer without visiting the property", "A joint physical walk-through with the buyer, signing off on inventory and structural condition before key transfer", "Collecting the final commission payment", "Submitting survey coordinates to registry"],
    correct_option_index: 1,
    explanation: "Handover protocols confirm that the property is delivered as contracted, resolving defects before transfer."
  },
  {
    id: "q-hcpa-m12-5",
    quiz_id: "quiz-hcpa-m12",
    question: "What constitutes the complete transaction file for a closed deal?",
    options: ["Just the receipt of payment", "Offer Letter, signed Reservation Form, Proof of Payment, signed Deed of Assignment, and Allocation Letter", "The listing video file and photos", "The coordinate check report from the surveyor"],
    correct_option_index: 1,
    explanation: "A complete paper trail protects both buyer and developer, logged in the Housmata database."
  },
  {
    id: "q-hcpa-m12-6",
    quiz_id: "quiz-hcpa-m12",
    question: "What is the 'cooling-off' period in real estate contracts?",
    options: ["The time it takes to build a house", "A contractually agreed window where the buyer can cancel the deal and receive their deposit back (subject to rules)", "The period between site inspection and signing the offer letter", "The time required to process governor's consent consent"],
    correct_option_index: 1,
    explanation: "Cooling-off windows build buyer confidence by offering fallback options if financial crises hit."
  },
  {
    id: "q-hcpa-m12-7",
    quiz_id: "quiz-hcpa-m12",
    question: "Why should an advisor support the client during the legal title registration phase?",
    options: ["To charge an extra fee", "To ensure the client secures their Statutory occupancy rights without bureaucratic delays", "Because it is required to unlock commission funds", "To verify the developer's registry account"],
    correct_option_index: 1,
    explanation: "True advisors assist until the title is secure, ensuring the transaction is fully complete."
  },
  {
    id: "q-hcpa-m12-8",
    quiz_id: "quiz-hcpa-m12",
    question: "What is a 'snag list' in new property handovers?",
    options: ["A list of problems in the title flow history", "A documented list of minor defects or incomplete items in a new building that the developer must fix before final handover", "A list of coordinates to check", "A directory of local utility providers"],
    correct_option_index: 1,
    explanation: "The snag list ensures that developers deliver the quality promised, protecting buyer interests."
  },
  {
    id: "q-hcpa-m12-9",
    quiz_id: "quiz-hcpa-m12",
    question: "How does negotiation differ from aggressive sales closure?",
    options: ["Negotiation focuses on finding win-win agreements; sales closure focuses on pushing a sale regardless of alignment", "Negotiation requires no document verification", "Negotiation is only for commercial properties", "There is no difference between the two terms"],
    correct_option_index: 0,
    explanation: "Negotiation creates long-term relationships by addressing interests, whereas aggressive sales pressure breeds buyer remorse."
  },
  {
    id: "q-hcpa-m12-10",
    quiz_id: "quiz-hcpa-m12",
    question: "What is the Housmata rule for transaction record archiving?",
    options: ["Keep records on personal mobile phones for 6 months", "Upload all transaction documents, signed agreements, and receipts to the app database for permanent storage", "Send physical copies to the land registry office only", "Delete transaction files after commissions are paid"],
    correct_option_index: 1,
    explanation: "Digital archiving guarantees that records can be retrieved at any time if future ownership disputes arise."
  },

  // ==================== MODULE 13 ====================
  {
    id: "q-hcpa-m13-1",
    quiz_id: "quiz-hcpa-m13",
    question: "Which of the following is a pillar of personal branding for advisors?",
    options: ["Posting client confidential information", "Rigid consistency, documented authority, and professional image", "Aggressive calling at odd hours", "Competing purely on price"],
    correct_option_index: 1,
    explanation: "Authority is built on consistency, visible track records, and professional communication."
  },
  {
    id: "q-hcpa-m13-2",
    quiz_id: "quiz-hcpa-m13",
    question: "How can you build professional credibility on WhatsApp?",
    options: ["By spamming links into random groups", "By publishing verified property reviews and legal checklist walkthroughs on status", "By sending long greetings", "By hiding your company details"],
    correct_option_index: 1,
    explanation: "WhatsApp is a powerful advisory channel when used to distribute verified market insights."
  },
  {
    id: "q-hcpa-m13-3",
    quiz_id: "quiz-hcpa-m13",
    question: "What content represents 'expert positioning' for property advisors?",
    options: ["Posting memes about real estate", "Writing detailed breakdowns of the land Use Act, title search workflows, and coordinate checks", "Advertising properties at impossible discounts", "Sharing developer contact details openly"],
    correct_option_index: 1,
    explanation: "Educational content shows you understand the law and logistics of property, proving your value to clients."
  },
  {
    id: "q-hcpa-m13-4",
    quiz_id: "quiz-hcpa-m13",
    question: "Why should an advisor update their professional profile on LinkedIn?",
    options: ["To find jobs in other industries", "To showcase their Housmata certification, build corporate authority, and attract high-net-worth investors", "To upload listing videos for free", "LinkedIn is not useful for real estate"],
    correct_option_index: 1,
    explanation: "LinkedIn connects you with professional networks, institutional developers, and serious investment clients."
  },
  {
    id: "q-hcpa-m13-5",
    quiz_id: "quiz-hcpa-m13",
    question: "What is 'niche marketing' in real estate branding?",
    options: ["Marketing properties to everyone in the country", "Focusing on a specific segment (e.g., land banking in Ibeju-Lekki or duplexes in Abuja) to build specialized authority", "Selling cheap products in local markets", "Uploading listings without verification details"],
    correct_option_index: 1,
    explanation: "Focusing on a niche makes you the go-to expert for that segment, driving conversion."
  },
  {
    id: "q-hcpa-m13-6",
    quiz_id: "quiz-hcpa-m13",
    question: "What is the impact of sharing client video reviews or success stories?",
    options: ["It exposes client privacy to risk", "It provides social proof, reducing buyer fear and validating your trustworthiness", "It increases your website tax rate", "It delays the closing process"],
    correct_option_index: 1,
    explanation: "Social proof is a powerful tool to overcome buyer skepticism in low-trust markets."
  },
  {
    id: "q-hcpa-m13-7",
    quiz_id: "quiz-hcpa-m13",
    question: "How does consistency in branding affect advisor sales?",
    options: ["It reduces the number of listings needed", "It builds brand recall, making prospects think of you first when they are ready to invest", "It increases the cost of advertisement", "It makes document verification faster"],
    correct_option_index: 1,
    explanation: "Consistent educational posts build trust over time, so clients contact you when they have budget."
  },
  {
    id: "q-hcpa-m13-8",
    quiz_id: "quiz-hcpa-m13",
    question: "What is the professional standard for responding to client inquiries on social media?",
    options: ["Reply within 2 to 3 days", "Response within 1 hour during business hours, using polite, structured templates", "Tell the client to call you immediately", "Ignore comments and only reply to DMs"],
    correct_option_index: 1,
    explanation: "Speed and politeness reflect your professionalism, directly affecting lead conversion."
  },
  {
    id: "q-hcpa-m13-9",
    quiz_id: "quiz-hcpa-m13",
    question: "Why should an advisor avoid bad-mouthing other agents or developers in public?",
    options: ["It is a government tax violation", "It reflects poorly on your professionalism, reducing your brand's authority and trust", "It increases coordinate verification costs", "It blocks your mortgage referral pipelines"],
    correct_option_index: 1,
    explanation: "Focus on presenting your own verified listings and professional ethics; attacking others drives away high-value clients."
  },
  {
    id: "q-hcpa-m13-10",
    quiz_id: "quiz-hcpa-m13",
    question: "What is a personal 'positioning statement'?",
    options: ["A statement showing your bank balance", "A clear sentence defining who you serve, what value you provide, and why your verification process is unique", "A document signed by a surveyor", "An allocation letter format"],
    correct_option_index: 1,
    explanation: "A positioning statement summarizes your professional brand value (e.g., 'Helping busy professionals invest safely in Lagos real estate through coordinate verification')."
  },

  // ==================== MODULE 14 ====================
  {
    id: "q-hcpa-m14-1",
    quiz_id: "quiz-hcpa-m14",
    question: "What is a sales pipeline in property advisory?",
    options: ["The physical pipe connecting water systems", "The structured representation of prospects from first contact to closing", "The list of properties available", "The network of legal advisors"],
    correct_option_index: 1,
    explanation: "The pipeline tracks deal progression from prospecting, evaluation, to closing."
  },
  {
    id: "q-hcpa-m14-2",
    quiz_id: "quiz-hcpa-m14",
    question: "Why should property advisors set up a dedicated business bank account?",
    options: ["To hide income from developers", "To separate business operations from personal expenses for clean audits", "It is required for mobile apps", "To get loans automatically"],
    correct_option_index: 1,
    explanation: "Financial discipline requires separating company operational capital from personal use."
  },
  {
    id: "q-hcpa-m14-3",
    quiz_id: "quiz-hcpa-m14",
    question: "What is 'commission pipeline forecasting'?",
    options: ["Estimating your future earnings based on active leads, inspection rates, and closed deals in progress", "Paying taxes in advance", "Calculating interest rates for mortgages", "Managing utility bills for estates"],
    correct_option_index: 0,
    explanation: "Forecasting helps you plan business expenses, marketing budgets, and hiring timelines."
  },
  {
    id: "q-hcpa-m14-4",
    quiz_id: "quiz-hcpa-m14",
    question: "Why should an advisor set aside a percentage of every commission payout?",
    options: ["To pay developer referral fees", "For tax reserves, professional development, and business marketing budgets", "To buy properties immediately", "It is a requirement of the Lands Registry"],
    correct_option_index: 1,
    explanation: "Running a business requires reinvestment. Allocating funds to marketing and taxes keeps your operations solvent."
  },
  {
    id: "q-hcpa-m14-5",
    quiz_id: "quiz-hcpa-m14",
    question: "What is a CRM tool's primary advantage in scaling a property business?",
    options: ["It automates physical land surveying", "It stores client history and automatically schedules follow-up tasks, preventing leads from falling through the cracks", "It approves housing finance", "It bypasses registry search delays"],
    correct_option_index: 1,
    explanation: "As your client list grows, CRM tools systemize follow-ups, ensuring premium service at scale."
  },
  {
    id: "q-hcpa-m14-6",
    quiz_id: "quiz-hcpa-m14",
    question: "What is 'operating capital'?",
    options: ["The money used to buy land banking plots", "The cash reserves required to fund daily business expenses like transport, marketing, and data", "The total value of listings in your catalog", "The commission split with co-brokers"],
    correct_option_index: 1,
    explanation: "Operating capital keeps your business running during lean months when deals are still in the pipeline."
  },
  {
    id: "q-hcpa-m14-7",
    quiz_id: "quiz-hcpa-m14",
    question: "What is a KPI in real estate business management?",
    options: ["Key Property Indicator", "Key Performance Indicator (e.g., number of qualified leads, weekly inspections, closed deals)", "Lands Registry payment code", "Survey coordinate coordinates"],
    correct_option_index: 1,
    explanation: "KPIs measure your operational efficiency, helping you identify bottlenecks in your sales funnel."
  },
  {
    id: "q-hcpa-m14-8",
    quiz_id: "quiz-hcpa-m14",
    question: "How do you scale a property consultancy business?",
    options: ["By working 24 hours a day alone", "By systemizing processes, utilizing tools (like Housmata), and hiring assistants to handle routine tasks", "By listing unverified properties", "By cutting commissions to win clients"],
    correct_option_index: 1,
    explanation: "Scaling requires moving from solo hustle to business systems where technology handles administration."
  },
  {
    id: "q-hcpa-m14-9",
    quiz_id: "quiz-hcpa-m14",
    question: "Why is 'data privacy' compliance important when managing client databases?",
    options: ["Because developers charge data fees", "To protect client financial details and phone numbers from identity theft and unsolicited spam", "It is not important in Nigeria", "It makes coordinate searches faster"],
    correct_option_index: 1,
    explanation: "Keeping client data secure is a legal obligation and builds professional integrity."
  },
  {
    id: "q-hcpa-m14-10",
    quiz_id: "quiz-hcpa-m14",
    question: "What should a property advisor do at the end of every financial quarter?",
    options: ["Refuse to take new listings", "Audit their income, calculate business expenses, evaluate marketing ROI, and set new sales targets", "Refund deposits to clients", "Delete all client communication files"],
    correct_option_index: 1,
    explanation: "Quarterly reviews ensure your property consultancy is profitable, compliant, and growing."
  },

  // ==================== MODULE 15 ====================
  {
    id: "q-hcpa-m15-1",
    quiz_id: "quiz-hcpa-m15",
    question: "What is required before you can receive the HCPA certification badge?",
    options: ["Paying a high graduation fine", "Completing all 16 self-paced modules, passing the exams, and submitting the Capstone portfolio", "Winning an exclusive listing", "Recommending 10 mortgage applications"],
    correct_option_index: 1,
    explanation: "Verification, exam passes, and the practical capstone portfolio are all mandatory requirements."
  },
  {
    id: "q-hcpa-m15-2",
    quiz_id: "quiz-hcpa-m15",
    question: "Once activated on the Housmata app, what benefits does an HCPA operator get?",
    options: ["Free property acquisitions", "A verified advisor profile badge, lead assignments, and tracked commission flows", "Exemption from state registry searches", "Automatic bank loans"],
    correct_option_index: 1,
    explanation: "App activation connects certified advisors directly to live leads and platform verification tools."
  },
  {
    id: "q-hcpa-m15-3",
    quiz_id: "quiz-hcpa-m15",
    question: "What is the 'Capstone Project' for HCPA graduation?",
    options: ["Building a house from foundation to roof", "A practical project demonstrating physical coordinate verification, title flow analysis, and deal compilation", "Writing a history of real estate", "Passing a physical fitness test"],
    correct_option_index: 1,
    explanation: "The capstone project tests your ability to execute the complete Housmata verification and advisory system under supervision."
  },
  {
    id: "q-hcpa-m15-4",
    quiz_id: "quiz-hcpa-m15",
    question: "What does the 'ethics review panel' evaluate?",
    options: ["Your knowledge of construction materials", "Your adherence to transparency, separation of funds, and compliance with the Professional Code", "The speed at which you close sales", "Your educational qualifications only"],
    correct_option_index: 1,
    explanation: "The panel ensures that only professionals committed to high-integrity practices receive the Housmata badge."
  },
  {
    id: "q-hcpa-m15-5",
    quiz_id: "quiz-hcpa-m15",
    question: "What happens if an advisor violates the Housmata Code of Conduct after graduation?",
    options: ["They are charged a minor fee", "Their profile badge is revoked, their access to lead assignments is suspended, and they may be banned", "Nothing happens", "They are forced to take the course again"],
    correct_option_index: 1,
    explanation: "Housmata protects platform trust; violations lead to immediate profile suspension."
  },
  {
    id: "q-hcpa-m15-6",
    quiz_id: "quiz-hcpa-m15",
    question: "How do you unlock 'live lead assignments' on the app?",
    options: ["By paying a monthly subscription", "By completing the certification pathway and keeping your profile status active and compliant", "By listing 100 properties without documents", "By referring 5 other agents"],
    correct_option_index: 1,
    explanation: "Certified operators receive priority leads from the central database as long as they maintain clean audit trails."
  },
  {
    id: "q-hcpa-m15-7",
    quiz_id: "quiz-hcpa-m15",
    question: "Why is the HCPA certificate recognized by mortgage partners like Yalo?",
    options: ["Because they own the academy", "Because they know certified advisors prepare mortgage-ready, thoroughly verified client files", "Because the certificate has a gold stamp", "Because it is required by state law"],
    correct_option_index: 1,
    explanation: "Mortgage banks trust Housmata graduates to deliver verified documentation, speeding up approval times."
  },
  {
    id: "q-hcpa-m15-8",
    quiz_id: "quiz-hcpa-m15",
    question: "What is the standard for maintaining 'active status' on the platform?",
    options: ["Logging in once a year", "Responding to assigned leads promptly, keeping listings updated, and maintaining clean financial records", "Paying a weekly fee", "Exchanging client contact lists with others"],
    correct_option_index: 1,
    explanation: "Active status depends on performance quality, response metrics, and ongoing compliance."
  },
  {
    id: "q-hcpa-m15-9",
    quiz_id: "quiz-hcpa-m15",
    question: "What does 'deployment' mean for an HCPA graduate?",
    options: ["Going to work on a construction site", "Launching your public advisor profile to begin consulting, listing, and closing transactions", "Completing your university degree", "Registering your company name"],
    correct_option_index: 1,
    explanation: "Deployment is your official entry into the market as a certified professional, backed by Housmata tech."
  },
  {
    id: "q-hcpa-m15-10",
    quiz_id: "quiz-hcpa-m15",
    question: "What is the ultimate goal of the Housmata Certified Property Advisor program?",
    options: ["To maximize transaction speed and sales commissions", "To produce competent, ethical, and technology-enabled advisors who restore trust in real estate", "To compile government land maps", "To replace traditional banks in housing finance"],
    correct_option_index: 1,
    explanation: "The program standardizes training to eliminate fraud, protect buyer capital, and professionalize property sales."
  }
];
