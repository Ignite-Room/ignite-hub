// Site copy for HackArena – 2027 Edition, taken from the website brief and the
// Campus Round Rule Book. Numbers here must stay real and verifiable.

export const STAGES = [
  {
    n: '01',
    title: 'Campus Round',
    when: '10 Feb – 25 Apr 2027',
    body: 'Offline idea pitching, hosted by your college. Teams of 2–5 pitch an idea on any problem. No prototype needed.',
    detail: '20% of checked-in teams (up to 20) are shortlisted the same day.',
  },
  {
    n: '02',
    title: 'Prototype Round',
    when: 'Within 5 days of your campus round',
    body: 'Shortlisted teams build and submit a complete prototype of their idea.',
    detail: 'Ignite Room reviews every submission and picks the Grand Finale teams.',
  },
  {
    n: '03',
    title: 'Grand Finale',
    when: '19–20 June 2027 · Bangalore',
    body: 'A 36-hour hackathon in Bangalore for the best teams from across India.',
    detail: '₹1.5 Lakh cash prize pool.',
  },
] as const;

export const KEY_DATES = [
  { date: '25 Nov 2026 – 5 Jan 2027', title: 'College applications', body: 'Faculty SPOC and Student Coordinator apply together.' },
  { date: '10 Feb – 25 Apr 2027', title: 'Campus rounds', body: 'Each college picks its own date in this window.' },
  { date: 'Same day as each round', title: 'Shortlist announced', body: '20% of checked-in teams, up to 20 per college.' },
  { date: '5 days after each round', title: 'Prototype due', body: 'Shortlisted teams submit a complete prototype.' },
  { date: '19–20 June 2027', title: 'Grand Finale', body: '36 hours in Bangalore.' },
] as const;

export const RULES: { topic: string; copy: string }[] = [
  { topic: 'College applications', copy: '25 November 2026 – 5 January 2027' },
  { topic: 'Campus rounds', copy: '10 February – 25 April 2027; each college picks its date' },
  { topic: 'Format', copy: 'Offline idea pitching, hosted entirely by the college; no prototype needed' },
  { topic: 'Validity', copy: 'At least 20 checked-in teams' },
  { topic: 'Teams', copy: '2–5 members, all from the same college' },
  { topic: 'Theme', copy: 'Open Innovation + sponsored tracks (to be announced)' },
  { topic: 'Shortlist', copy: '20% of checked-in teams, max 20, announced the same day' },
  { topic: 'Prototype round', copy: "Complete prototype within 5 days of the college's own round" },
  { topic: 'College sponsors', copy: 'Allowed with Ignite Room approval' },
  { topic: 'Reporting', copy: 'Recap reels, event report and feedback form within 2 days' },
  { topic: 'Certificates', copy: 'Will be given' },
  { topic: 'Grand Finale', copy: '36 hours, 19–20 June 2027, Bangalore' },
  { topic: 'Prize pool', copy: '₹1.5 Lakh cash' },
];

export interface FaqItem {
  q: string;
  a: string;
}

// Fee and finale travel/stay are still "to confirm" in the brief, so they are
// left out until decided rather than answered with a guess.
export const FAQ_STUDENTS: FaqItem[] = [
  {
    q: 'What is HackArena – 2027 Edition?',
    a: 'A national hackathon by Ignite Room in a campus format. It runs in three stages: a campus round at your college, a 5-day prototype round, and a 36-hour Grand Finale in Bangalore.',
  },
  {
    q: 'How do I take part?',
    a: "Find your college in the campus events list and register on its HackArena page. If your college isn't listed, ask your Dean, HOD or a faculty coordinator to apply before 5 January 2027.",
  },
  {
    q: "My college isn't on the list. Can I join another college's round?",
    a: "No. All team members must be from the same college, and you take part in your own college's round.",
  },
  { q: "What's the team size?", a: '2 to 5 members, all from the same college.' },
  {
    q: 'What happens in the campus round?',
    a: 'An offline idea-pitching round at your college. No prototype is needed at this stage.',
  },
  {
    q: "What's the theme?",
    a: 'Open Innovation: pitch an idea on any problem. Sponsored tracks will be announced soon.',
  },
  {
    q: 'How many teams get shortlisted?',
    a: '20% of the teams that check in and pitch, up to 20 per college. Results are announced the same day.',
  },
  {
    q: "What happens if we're shortlisted?",
    a: 'You build a complete prototype and submit it within 5 days of your campus round. Ignite Room reviews all submissions and picks the teams for the Grand Finale.',
  },
  {
    q: 'When and where is the Grand Finale?',
    a: "19–20 June 2027 in Bangalore. It's a 36-hour hackathon with a ₹1.5 Lakh cash prize pool.",
  },
  { q: 'Will I get a certificate?', a: 'Yes, certificates will be given.' },
];

export const FAQ_COLLEGES = (contactEmail: string): FaqItem[] => [
  {
    q: 'Who can apply for a college?',
    a: 'A Faculty SPOC (Dean, Faculty Coordinator or HOD) together with a Student Coordinator, at igniteroom.in/hackarena-2027.',
  },
  { q: 'When can colleges apply?', a: '25 November 2026 to 5 January 2027.' },
  {
    q: 'Does Ignite Room fund the campus round?',
    a: 'No. The campus round is a simple idea-pitching round, hosted entirely by the college.',
  },
  { q: 'Can we bring our own sponsor?', a: 'Yes, with approval from Ignite Room.' },
  { q: 'When can we hold our round?', a: 'Any date between 10 February and 25 April 2027.' },
  { q: "What's the minimum turnout?", a: 'At least 20 checked-in teams for the round to be valid.' },
  {
    q: 'How do registrations and check-in work?',
    a: 'After approval, your college creates its own private HackArena page on Nymble. It handles registrations, check-in and submissions.',
  },
  {
    q: 'What do we share after the round?',
    a: 'Recap reels, an event report and the feedback form, within 2 days.',
  },
  {
    q: 'Who contacts us after we apply?',
    a: `The Ignite Room team, at the SPOC's and Student Coordinator's email. You can reach us at ${contactEmail}.`,
  },
];

export const WHY_HOST = [
  { title: 'A national stage for your students', body: 'Your best teams go on to a 36-hour Grand Finale in Bangalore with a ₹1.5 Lakh cash prize pool.' },
  { title: 'Light to run', body: 'The campus round is offline idea pitching. No prototypes, no tech setup beyond a room and a mic.' },
  { title: 'Your college on the map', body: 'Every approved round gets its own page on igniteroom.in, listed alongside campuses across India.' },
  { title: 'Bring your own sponsor', body: 'College sponsors are welcome with Ignite Room approval, and their logo shows on your campus page.' },
];

export const COLLEGE_DUTIES = [
  'Host one offline idea-pitching round between 10 Feb and 25 Apr 2027',
  'Set up your private HackArena page on Nymble for registrations and check-in',
  'Get at least 20 teams to check in',
  'Shortlist 20% of checked-in teams (up to 20) the same day',
  'Share recap reels, an event report and the feedback form within 2 days',
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
