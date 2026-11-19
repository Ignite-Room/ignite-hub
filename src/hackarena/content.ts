// Site copy for HackArena – 2027 Edition, taken from the website brief and the
// Campus Round Rule Book (public/ha2027/HackArena-2027-Campus-Round-Rule-Book.pdf).
// Numbers here must stay real and verifiable.

export const RULEBOOK_PDF = '/ha2027/HackArena-2027-Campus-Round-Rule-Book.pdf';

export const STAGES = [
  {
    n: '01',
    emoji: '💡',
    title: 'Campus Round',
    when: '10 Feb – 25 Apr 2027',
    body: 'Offline idea pitching, hosted by your college. Teams of 2–5 pitch an idea on any problem. No prototype needed.',
    detail: '20% of checked-in teams (up to 20) are shortlisted the same day.',
  },
  {
    n: '02',
    emoji: '🛠️',
    title: 'Prototype Round',
    when: 'Within 5 days of your campus round',
    body: 'Shortlisted teams build a complete prototype of the idea they pitched and submit it on their college’s Nymble page.',
    detail: 'Ignite Room reviews every submission and picks the Grand Finale teams.',
  },
  {
    n: '03',
    emoji: '🏆',
    title: 'Grand Finale',
    when: '19–20 June 2027 · Bangalore',
    body: 'A 36-hour hackathon in Bangalore for the teams selected by Ignite Room from across India.',
    detail: '₹1.5 Lakh cash prize pool.',
  },
] as const;

export const KEY_DATES = [
  { date: '25 Nov 2026 – 5 Jan 2027', title: 'College applications', body: 'Faculty SPOC and Student Coordinator apply together at igniteroom.in/hackarena-2027.' },
  { date: '10 Feb – 25 Apr 2027', title: 'Campus rounds', body: 'Each college picks its own date in this window.' },
  { date: 'Same day as each round', title: 'Shortlist announced', body: '20% of checked-in teams, up to 20 per college.' },
  { date: 'Within 2 days of each round', title: 'Recap, report & feedback', body: 'Recap reels, event report and feedback form from the college.' },
  { date: 'Within 5 days of each round', title: 'Prototype due', body: 'Each college’s own 5-day window. No common national date.' },
  { date: '19–20 June 2027', title: 'Grand Finale', body: '36 hours in Bangalore.' },
] as const;

// ── Full rule book (rendered on /hackarena-2027/rules) ──────────────────────

export const RULEBOOK = {
  intro:
    "HackArena 2027 Edition is Ignite Room's national hackathon in a campus format. Each participating college hosts its own internal round. The best teams from every campus build a full prototype, and the top teams from across India meet at a 36-hour Grand Finale in Bangalore.",
  stages: [
    { label: 'Stage 1', title: 'Campus Round', body: 'Offline idea-pitching round, hosted entirely by the college. No prototype needed.', when: '10 Feb – 25 Apr 2027' },
    { label: 'Stage 2', title: 'Prototype Round', body: 'Shortlisted teams build a complete prototype and submit it within 5 days of their campus round.', when: '' },
    { label: 'Stage 3', title: 'Grand Finale', body: '36-hour finale for teams selected by Ignite Room.', when: '19–20 June 2027 · Bangalore' },
  ],
  keyDates: [
    { milestone: 'College SPOC applications', date: '25 November 2026 – 5 January 2027', note: 'at igniteroom.in/hackarena-2027' },
    { milestone: 'Campus round window', date: '10 February – 25 April 2027', note: 'each college picks its date within this window' },
    { milestone: 'Shortlist announcement', date: 'Same day', note: "as the college's campus round" },
    { milestone: 'Recap reels, event report & feedback form', date: 'Within 2 days', note: 'of the campus round' },
    { milestone: 'Prototype submission', date: 'Within 5 days', note: "of the college's own campus round" },
    { milestone: 'Grand Finale (36 hours)', date: '19–20 June 2027', note: 'Bangalore' },
  ],
  noCommonTimeline: "Every college's shortlisted teams get their own 5-day window, counted from that college's campus round, not a single national date.",
  joinSteps: [
    { title: 'Apply on the website.', body: 'Submit the college application at igniteroom.in/hackarena-2027 between 25 November 2026 and 5 January 2027.' },
    { title: 'Name two coordinators.', body: 'A Faculty SPOC (Dean, Faculty Coordinator or HOD) and a Student Coordinator for HackArena.' },
    { title: 'Get approval from Ignite Room.', body: 'Ignite Room reviews the application and approves the college.' },
    { title: "Create the college's private page on Nymble.", body: 'After approval, the college sets up its own private HackArena page on Nymble for registrations, check-in and submissions.' },
    { title: 'Host the campus round', body: 'on a date between 10 February and 25 April 2027.' },
  ],
  roles: [
    {
      label: 'Faculty SPOC',
      title: 'Dean · Faculty Coordinator · HOD',
      points: [
        'Official point of contact between the college and Ignite Room',
        'Responsible for the college hosting the campus round',
        'Takes any college sponsor proposals to Ignite Room for approval',
      ],
    },
    {
      label: 'Student Coordinator',
      title: 'Student lead for HackArena',
      points: [
        "Runs the college's Nymble page: registrations, check-in, submissions",
        'Manages check-in on the day of the round',
        'Shares recap reels, event report and feedback form within 2 days',
      ],
    },
  ],
  participation: [
    { rule: 'Team size', detail: '2 to 5 members' },
    { rule: 'Same college', detail: 'All members of a team must be from the same college' },
    { rule: 'Team composition', detail: 'No gender requirement for teams' },
    { rule: 'Registration', detail: "Through the college's private HackArena page on Nymble" },
  ],
  theme: {
    main: { title: 'Open Innovation', body: 'Teams can pitch an idea on any problem they choose.' },
    tracks: { title: 'To be announced', body: 'Some sponsored tracks will be added. Details will be shared with colleges as soon as they are decided.' },
  },
  hosting: [
    { rule: 'Hosted by', detail: 'The college team, entirely' },
    { rule: 'Funding', detail: 'No funds are provided for the campus round' },
    { rule: 'Format', detail: 'Idea pitching only. No prototype is required at this stage' },
    { rule: 'Mode', detail: 'Offline, on campus' },
    { rule: 'Validity', detail: 'A minimum of 20 checked-in teams is required for the round to be valid' },
    { rule: 'Check-in', detail: 'Teams that show up to pitch are checked in on Nymble. Only checked-in teams count' },
    { rule: 'Date', detail: 'Any day between 10 February and 25 April 2027' },
  ],
  shortlistIntro:
    "Each college shortlists 20% of its checked-in teams, with a maximum of 20 teams. Registered teams that don't show up to pitch are not counted.",
  shortlistTable: [
    { checkedIn: 'Fewer than 20', shortlisted: '—', note: 'Round is not valid' },
    { checkedIn: '20', shortlisted: '4', note: 'Minimum valid round' },
    { checkedIn: '50', shortlisted: '10', note: '' },
    { checkedIn: '100', shortlisted: '20', note: 'Cap reached' },
    { checkedIn: '150', shortlisted: '20', note: 'Cap of 20 applies' },
  ],
  prototype: [
    'Shortlisted teams build a complete prototype of the idea they pitched.',
    "The prototype is submitted within 5 days of the college's campus round, through the college's Nymble page.",
    "Each college's 5-day window runs on its own. There is no common national timeline.",
    'Ignite Room reviews the prototype submissions and selects the teams for the Grand Finale.',
  ],
  finale: [
    { big: '36 hrs', small: 'Finale hackathon' },
    { big: '19–20 June', small: '2027 · Bangalore' },
    { big: '₹1.5 Lakh', small: 'Cash prize pool' },
  ],
  sponsors: 'Colleges may bring their own sponsors for the campus round, subject to approval from Ignite Room.',
  reporting: ['Recap reels', 'Event report', 'Feedback form'],
  certificates: 'Certificates will be given.',
  checklist: [
    'Applied at igniteroom.in/hackarena-2027 between 25 Nov 2026 and 5 Jan 2027',
    'Faculty SPOC (Dean / Faculty Coordinator / HOD) and Student Coordinator named',
    'Approval received from Ignite Room',
    'Private college page created on Nymble for registrations, check-in and submissions',
    'Campus round date fixed between 10 Feb and 25 Apr 2027',
    'Any college sponsor approved by Ignite Room',
    'Offline round held with at least 20 checked-in teams',
    'Shortlist (20% of checked-in teams, max 20) announced the same day',
    'Recap reels, event report and feedback form shared within 2 days',
    "Shortlisted teams' prototypes submitted within 5 days of the round",
  ],
};

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
    a: "Find your college in the campus events list and register on its HackArena page on Nymble. If your college isn't listed, ask your Dean, HOD or a faculty coordinator to apply before 5 January 2027.",
  },
  {
    q: "My college isn't on the list. Can I join another college's round?",
    a: "No. All team members must be from the same college, and you take part in your own college's round.",
  },
  { q: "What's the team size?", a: '2 to 5 members, all from the same college. There is no gender requirement for teams.' },
  {
    q: 'What happens in the campus round?',
    a: 'An offline idea-pitching round at your college. No prototype is needed at this stage. Teams that show up to pitch are checked in on Nymble.',
  },
  {
    q: "What's the theme?",
    a: 'Open Innovation: pitch an idea on any problem. Sponsored tracks will be announced soon.',
  },
  {
    q: 'How many teams get shortlisted?',
    a: "20% of the teams that check in and pitch, up to 20 per college. Registered teams that don't show up aren't counted. Results are announced the same day.",
  },
  {
    q: "What happens if we're shortlisted?",
    a: "You build a complete prototype and submit it on your college's Nymble page within 5 days of your campus round. Ignite Room reviews all submissions and picks the teams for the Grand Finale.",
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
  { q: 'Can we bring our own sponsor?', a: 'Yes, with approval from Ignite Room. The Faculty SPOC takes sponsor proposals to Ignite Room.' },
  { q: 'When can we hold our round?', a: 'Any date between 10 February and 25 April 2027.' },
  { q: "What's the minimum turnout?", a: 'At least 20 checked-in teams for the round to be valid. Only teams that show up to pitch count.' },
  {
    q: 'How do registrations and check-in work?',
    a: 'After approval, your college creates its own private HackArena page on Nymble. The Student Coordinator runs it: registrations, check-in on the day and prototype submissions.',
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
  { emoji: '🏆', title: 'A national stage for your students', body: 'Your best teams go on to a 36-hour Grand Finale in Bangalore with a ₹1.5 Lakh cash prize pool.' },
  { emoji: '🪶', title: 'Light to run', body: 'The campus round is offline idea pitching. No prototypes, no tech setup beyond a room and a mic.' },
  { emoji: '📍', title: 'Your college on the map', body: 'Every approved round gets its own page on igniteroom.in, listed alongside campuses across India.' },
  { emoji: '🤝', title: 'Bring your own sponsor', body: 'College sponsors are welcome with Ignite Room approval, and their logo shows on your campus page.' },
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
