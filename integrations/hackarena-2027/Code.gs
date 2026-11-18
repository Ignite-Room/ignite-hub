/**
 * HackArena – 2027 Edition · Google Sheet backend
 * ------------------------------------------------
 * One Google Sheet is the whole back office for igniteroom.in/hackarena-2027:
 *
 *   Applications      ← college application form (website writes rows)
 *   Partner Requests  ← "Partner with us" form (website writes rows)
 *   Campuses          → campus event cards (team edits, website reads)
 *   Sponsors          → sponsor / partner logos (team edits, website reads)
 *   Finalists         → finalists page (team edits, website reads)
 *
 * Setup: see SETUP.md next to this file. In short: paste this file into
 * Extensions → Apps Script, run `setup` once, then Deploy → Web app
 * (Execute as: Me, Who has access: Anyone) and send the /exec URL to the
 * developer (or set VITE_HACKARENA_API_URL in Vercel).
 */

// ── Settings you may edit ───────────────────────────────────────────────────
var CONFIG = {
  /** Gets a copy of every application and partner request. */
  ADMIN_EMAIL: 'admin@igniteroom.in',
  /** Reply-To on every email sent to colleges and partners. */
  REPLY_TO: 'admin@igniteroom.in',
  FROM_NAME: 'HackArena 2027 · Ignite Room',
  SITE_URL: 'https://www.igniteroom.in/hackarena-2027',
  /**
   * Google Drive file ID of the Campus Round Rule Book PDF (the long ID in the
   * file's share link). Leave blank to link to the web rule book instead of
   * attaching the PDF.
   */
  RULEBOOK_FILE_ID: '',
  /** Optional link to a Nymble how-to for colleges, used in the approval email. */
  NYMBLE_GUIDE_URL: '',
  TIMEZONE: 'Asia/Kolkata',
  /** Seconds the public data is cached. Edits also clear the cache immediately. */
  CACHE_SECONDS: 60,
};

// ── Sheet layout (don't rename headers; add new columns at the end) ─────────
var SHEETS = {
  applications: {
    name: 'Applications',
    headers: [
      'Ref', 'Submitted At', 'Status', 'Test?', 'College Name', 'City', 'State', 'Website', 'College Type',
      'Approx Tech Students', 'SPOC Name', 'SPOC Designation', 'SPOC Department', 'SPOC Email', 'SPOC Phone',
      'Student Name', 'Student Year', 'Student Branch', 'Student Email', 'Student Phone', 'Student LinkedIn',
      'Preferred Date', 'Backup Date', 'Expected Teams', 'Venue', 'Bringing Sponsor?',
      'Consent: Rule Book', 'Consent: Offline 20+ Teams', 'Consent: Reporting',
      'Possible Duplicate Of', 'Approval Email Sent At', 'Notes',
    ],
  },
  partners: {
    name: 'Partner Requests',
    headers: ['Submitted At', 'Status', 'Company', 'Contact Name', 'Email', 'Phone', 'Interested In', 'Message', 'Notes'],
  },
  campuses: {
    name: 'Campuses',
    headers: [
      'Published', 'Slug', 'College', 'Logo URL', 'City', 'Region', 'State', 'Round Date', 'Venue', 'Status',
      'Nymble URL', 'Shortlisted Teams (one per line)', 'Prototype Due', 'College Sponsor', 'College Sponsor Logo URL',
    ],
  },
  sponsors: {
    name: 'Sponsors',
    headers: ['Published', 'Name', 'Tier', 'Logo URL', 'Website', 'Track Name', 'Order'],
  },
  finalists: {
    name: 'Finalists',
    headers: ['Published', 'Team', 'College', 'City'],
  },
};

var APPLICATION_STATUSES = ['Applied', 'Approved', 'Nymble live', 'Round done', 'Reports in', 'Rejected'];
var APPROVED_LIKE = ['Approved', 'Nymble live', 'Round done', 'Reports in'];
var PARTNER_STATUSES = ['New', 'Contacted', 'In talks', 'Signed', 'Closed'];
var CAMPUS_STATUSES = [
  'Coming soon', 'Registrations open', 'Registrations closed', 'Round today',
  'Shortlist announced', 'Prototype round', 'Completed',
];
var SPONSOR_TIERS = ['Title', 'Track', 'Partner', 'Past partner'];

// ═════════════════════════════════════════════════════════════════════════════
// One-time setup
// ═════════════════════════════════════════════════════════════════════════════

/** Run once from the Apps Script editor. Safe to run again. */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(function (key) {
    var def = SHEETS[key];
    var sh = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
    var current = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
    if (!current[0]) {
      sh.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
    } else {
      // Append any header that's missing (keeps existing columns intact).
      def.headers.forEach(function (h) {
        if (current.indexOf(h) === -1) {
          sh.getRange(1, sh.getLastColumn() + 1).setValue(h);
          current.push(h);
        }
      });
    }
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#1a0d10').setFontColor('#ffffff');
  });

  var rows = 2000;
  setListValidation_(SHEETS.applications.name, 'Status', APPLICATION_STATUSES, rows);
  setListValidation_(SHEETS.partners.name, 'Status', PARTNER_STATUSES, rows);
  setListValidation_(SHEETS.campuses.name, 'Status', CAMPUS_STATUSES, rows);
  setListValidation_(SHEETS.sponsors.name, 'Tier', SPONSOR_TIERS, rows);
  ['campuses', 'sponsors', 'finalists'].forEach(function (k) {
    var sh = ss.getSheetByName(SHEETS[k].name);
    var col = colIndex_(sh, 'Published');
    sh.getRange(2, col, rows, 1).insertCheckboxes();
  });
  ['Round Date', 'Prototype Due'].forEach(function (h) {
    var sh = ss.getSheetByName(SHEETS.campuses.name);
    sh.getRange(2, colIndex_(sh, h), rows, 1).setNumberFormat('yyyy-mm-dd');
  });

  var blank = ss.getSheetByName('Sheet1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);

  // Installable edit trigger: sends approval emails and clears the cache.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onSheetEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(ss).onEdit().create();

  clearCache_();
  SpreadsheetApp.getUi && safeAlert_('HackArena 2027 sheet is ready. Next: Deploy → New deployment → Web app.');
}

// ═════════════════════════════════════════════════════════════════════════════
// Web app endpoints
// ═════════════════════════════════════════════════════════════════════════════

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'data';
  try {
    if (action === 'data') return json_(getPublicData_());
    if (action === 'ping') return json_({ ok: true, time: new Date().toISOString() });
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'Server error' });
  }
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Invalid request' });
  }
  // Honeypot: bots fill the hidden field. Pretend it worked, store nothing.
  if (body.hp) return json_({ ok: true, ref: 'HA27-OK' });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'Busy, please try again' });
  }
  try {
    if (body.action === 'apply') return json_(handleApply_(body.payload || {}, Boolean(body.preview)));
    if (body.action === 'partner') return json_(handlePartner_(body.payload || {}));
    return json_({ ok: false, error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: err && err.userMessage ? err.userMessage : 'Server error' });
  } finally {
    lock.releaseLock();
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// College application
// ═════════════════════════════════════════════════════════════════════════════

function handleApply_(p, isTest) {
  var required = [
    'collegeName', 'city', 'state', 'collegeType', 'techStudents', 'spocName', 'spocDesignation', 'spocDepartment',
    'spocEmail', 'spocPhone', 'studentName', 'studentYear', 'studentBranch', 'studentEmail', 'studentPhone',
    'preferredDate', 'expectedTeams', 'venue', 'bringingSponsor',
  ];
  required.forEach(function (k) {
    if (p[k] === undefined || p[k] === null || String(p[k]).trim() === '') throw userError_('Missing field: ' + k);
  });
  if (!isEmail_(p.spocEmail) || !isEmail_(p.studentEmail)) throw userError_('Invalid email');
  if (!p.consentRules || !p.consentOffline || !p.consentReporting) throw userError_('All consents are required');
  if (Number(p.expectedTeams) < 20) throw userError_('At least 20 teams are required');
  if (!inRoundWindow_(p.preferredDate) || (p.backupDate && !inRoundWindow_(p.backupDate))) {
    throw userError_('Round dates must be between 10 Feb and 25 Apr 2027');
  }

  var sh = sheet_('applications');
  var ref = 'HA27-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
  var dup = findDuplicate_(sh, p);

  var row = {
    'Ref': ref,
    'Submitted At': new Date(),
    'Status': 'Applied',
    'Test?': isTest ? 'TEST' : '',
    'College Name': p.collegeName,
    'City': p.city,
    'State': p.state,
    'Website': p.website || '',
    'College Type': p.collegeType,
    'Approx Tech Students': Number(p.techStudents) || p.techStudents,
    'SPOC Name': p.spocName,
    'SPOC Designation': p.spocDesignation,
    'SPOC Department': p.spocDepartment,
    'SPOC Email': String(p.spocEmail).trim().toLowerCase(),
    'SPOC Phone': p.spocPhone,
    'Student Name': p.studentName,
    'Student Year': p.studentYear,
    'Student Branch': p.studentBranch,
    'Student Email': String(p.studentEmail).trim().toLowerCase(),
    'Student Phone': p.studentPhone,
    'Student LinkedIn': p.studentLinkedin || '',
    'Preferred Date': p.preferredDate,
    'Backup Date': p.backupDate || '',
    'Expected Teams': Number(p.expectedTeams) || p.expectedTeams,
    'Venue': p.venue,
    'Bringing Sponsor?': p.bringingSponsor,
    'Consent: Rule Book': p.consentRules ? 'Yes' : 'No',
    'Consent: Offline 20+ Teams': p.consentOffline ? 'Yes' : 'No',
    'Consent: Reporting': p.consentReporting ? 'Yes' : 'No',
    'Possible Duplicate Of': dup || '',
  };
  appendRow_(sh, row);
  clearCache_();

  var subjectPrefix = isTest ? '[TEST] ' : '';
  var attachments = rulebookAttachment_();

  // 1. Confirmation to SPOC + Student Coordinator.
  try {
    MailApp.sendEmail({
      to: row['SPOC Email'],
      cc: row['Student Email'],
      replyTo: CONFIG.REPLY_TO,
      name: CONFIG.FROM_NAME,
      subject: subjectPrefix + 'We received your HackArena 2027 application (' + ref + ')',
      htmlBody: confirmationEmail_(p, ref, attachments.length > 0),
      attachments: attachments,
    });
  } catch (err) {
    console.error('Confirmation email failed', err);
  }

  // 2. Copy to the Ignite Room team.
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      replyTo: row['SPOC Email'],
      name: CONFIG.FROM_NAME,
      subject: subjectPrefix + 'New college application: ' + p.collegeName + ' (' + p.city + ')' + (dup ? ' · possible duplicate' : ''),
      htmlBody: adminEmail_('New college application', [
        ['Ref', ref], ['College', p.collegeName], ['City / State', p.city + ', ' + p.state], ['Type', p.collegeType],
        ['SPOC', p.spocName + ' (' + p.spocDesignation + ', ' + p.spocDepartment + ')'], ['SPOC contact', row['SPOC Email'] + ' · ' + p.spocPhone],
        ['Student Coordinator', p.studentName + ' (' + p.studentYear + ' year, ' + p.studentBranch + ')'], ['Student contact', row['Student Email'] + ' · ' + p.studentPhone],
        ['Preferred / backup date', p.preferredDate + ' / ' + (p.backupDate || '-')], ['Expected teams', String(p.expectedTeams)], ['Venue', p.venue],
        ['Bringing sponsor', p.bringingSponsor], ['Possible duplicate of', dup || '-'],
      ]),
    });
  } catch (err) {
    console.error('Admin email failed', err);
  }

  return { ok: true, ref: ref };
}

function findDuplicate_(sh, p) {
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return '';
  var h = data[0];
  var iRef = h.indexOf('Ref'), iCol = h.indexOf('College Name'), iSpoc = h.indexOf('SPOC Email'), iTest = h.indexOf('Test?');
  var college = norm_(p.collegeName), spoc = norm_(p.spocEmail);
  for (var r = 1; r < data.length; r++) {
    if (data[r][iTest] === 'TEST') continue;
    if (norm_(data[r][iCol]) === college || norm_(data[r][iSpoc]) === spoc) return data[r][iRef];
  }
  return '';
}

// ═════════════════════════════════════════════════════════════════════════════
// Partner request
// ═════════════════════════════════════════════════════════════════════════════

function handlePartner_(p) {
  ['company', 'name', 'email'].forEach(function (k) {
    if (!p[k] || !String(p[k]).trim()) throw userError_('Missing field: ' + k);
  });
  if (!isEmail_(p.email)) throw userError_('Invalid email');
  var interest = Array.isArray(p.interest) ? p.interest.join(', ') : String(p.interest || '');

  appendRow_(sheet_('partners'), {
    'Submitted At': new Date(),
    'Status': 'New',
    'Company': p.company,
    'Contact Name': p.name,
    'Email': String(p.email).trim().toLowerCase(),
    'Phone': p.phone || '',
    'Interested In': interest,
    'Message': p.message || '',
  });

  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      replyTo: p.email,
      name: CONFIG.FROM_NAME,
      subject: 'Partner request: ' + p.company + ' (' + interest + ')',
      htmlBody: adminEmail_('New partner request', [
        ['Company', p.company], ['Contact', p.name], ['Email', p.email], ['Phone', p.phone || '-'],
        ['Interested in', interest], ['Message', p.message || '-'],
      ]),
    });
  } catch (err) {
    console.error('Partner admin email failed', err);
  }
  try {
    MailApp.sendEmail({
      to: p.email,
      replyTo: CONFIG.REPLY_TO,
      name: CONFIG.FROM_NAME,
      subject: 'Thanks for your interest in HackArena 2027',
      htmlBody: shell_(
        '<p style="margin:0 0 16px">Hi ' + esc_(firstName_(p.name)) + ',</p>' +
        '<p style="margin:0 0 16px">Thanks for reaching out about partnering with <b>HackArena – 2027 Edition</b>. The Ignite Room team will get back to you shortly.</p>' +
        '<p style="margin:0">' + button_('See HackArena 2027', CONFIG.SITE_URL) + '</p>'
      ),
    });
  } catch (err) {
    console.error('Partner confirmation email failed', err);
  }
  return { ok: true };
}

// ═════════════════════════════════════════════════════════════════════════════
// Edits made by the team
// ═════════════════════════════════════════════════════════════════════════════

/** Installed by setup(). Runs on every manual edit in the spreadsheet. */
function onSheetEdit(e) {
  try {
    clearCache_();
    if (!e || !e.range) return;
    var sh = e.range.getSheet();
    if (sh.getName() !== SHEETS.applications.name) return;
    var statusCol = colIndex_(sh, 'Status');
    if (e.range.getColumn() > statusCol || e.range.getLastColumn() < statusCol) return;

    for (var r = e.range.getRow(); r <= e.range.getLastRow(); r++) {
      if (r === 1) continue;
      var rec = readRow_(sh, r);
      if (rec['Status'] === 'Approved' && !rec['Approval Email Sent At']) {
        sendApprovalEmail_(rec);
        sh.getRange(r, colIndex_(sh, 'Approval Email Sent At')).setValue(new Date());
      }
    }
  } catch (err) {
    console.error('onSheetEdit failed', err);
  }
}

function sendApprovalEmail_(rec) {
  var to = rec['SPOC Email'];
  if (!isEmail_(to)) return;
  var guide = CONFIG.NYMBLE_GUIDE_URL
    ? '<p style="margin:0 0 16px">Step-by-step guide: <a href="' + CONFIG.NYMBLE_GUIDE_URL + '" style="color:#E10E43">' + CONFIG.NYMBLE_GUIDE_URL + '</a></p>'
    : '';
  var opts = {
    to: to,
    replyTo: CONFIG.REPLY_TO,
    name: CONFIG.FROM_NAME,
    subject: (rec['Test?'] === 'TEST' ? '[TEST] ' : '') + 'Approved: ' + rec['College Name'] + ' is hosting a HackArena 2027 campus round',
    htmlBody: shell_(
      '<p style="margin:0 0 16px">Hi ' + esc_(firstName_(rec['SPOC Name'])) + ' and ' + esc_(firstName_(rec['Student Name'])) + ',</p>' +
      '<p style="margin:0 0 16px">Great news: <b>' + esc_(rec['College Name']) + '</b> is approved to host a <b>HackArena – 2027 Edition</b> campus round (ref ' + esc_(rec['Ref']) + ').</p>' +
      '<p style="margin:0 0 8px"><b>Next steps</b></p>' +
      '<ol style="margin:0 0 16px;padding-left:20px;line-height:1.7">' +
      '<li>Create your college\'s <b>private HackArena – 2027 Edition page on Nymble</b>. It handles registrations, check-in and submissions.</li>' +
      '<li>Set it up for teams of 2–5, open only to students of your college.</li>' +
      '<li>Reply to this email with your Nymble link and your confirmed round date and venue.</li>' +
      '<li>We add your college to <a href="' + CONFIG.SITE_URL + '#campuses" style="color:#E10E43">igniteroom.in/hackarena-2027</a>, and you can start sharing it.</li>' +
      '</ol>' + guide +
      '<p style="margin:0 0 16px">Remember: the round must have at least 20 checked-in teams, the shortlist (20% of checked-in teams, max 20) is announced the same day, and recap reels, an event report and the feedback form are due within 2 days.</p>' +
      '<p style="margin:0">' + button_('Read the rule book', CONFIG.SITE_URL + '/rules') + '</p>'
    ),
  };
  if (isEmail_(rec['Student Email'])) opts.cc = rec['Student Email'];
  MailApp.sendEmail(opts);
}

// ═════════════════════════════════════════════════════════════════════════════
// Public data for the website
// ═════════════════════════════════════════════════════════════════════════════

function getPublicData_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get('public-data');
  if (hit) return JSON.parse(hit);

  var campuses = rows_('campuses')
    .filter(function (r) { return isTrue_(r['Published']) && String(r['College']).trim(); })
    .map(function (r) {
      var college = String(r['College']).trim();
      return {
        slug: slugify_(r['Slug'] || college),
        college: college,
        logoUrl: imageUrl_(r['Logo URL']),
        city: String(r['City'] || '').trim(),
        region: String(r['Region'] || '').trim() || undefined,
        state: String(r['State'] || '').trim() || undefined,
        roundDate: ymd_(r['Round Date']),
        venue: String(r['Venue'] || '').trim() || undefined,
        status: statusSlug_(r['Status']),
        nymbleUrl: safeUrl_(r['Nymble URL']),
        shortlist: String(r['Shortlisted Teams (one per line)'] || '').split(/\r?\n|;/).map(function (s) { return s.trim(); }).filter(String),
        prototypeDue: ymd_(r['Prototype Due']),
        sponsorName: String(r['College Sponsor'] || '').trim() || undefined,
        sponsorLogoUrl: imageUrl_(r['College Sponsor Logo URL']),
      };
    });

  // De-duplicate slugs so every campus page URL is unique.
  var seen = {};
  campuses.forEach(function (c) {
    var base = c.slug, n = 2;
    while (seen[c.slug]) c.slug = base + '-' + n++;
    seen[c.slug] = true;
  });

  var tierMap = { 'title': 'title', 'track': 'track', 'partner': 'partner', 'past partner': 'past' };
  var sponsors = rows_('sponsors')
    .filter(function (r) { return isTrue_(r['Published']) && String(r['Name']).trim(); })
    .sort(function (a, b) { return (Number(a['Order']) || 999) - (Number(b['Order']) || 999); })
    .map(function (r) {
      return {
        name: String(r['Name']).trim(),
        tier: tierMap[String(r['Tier'] || '').trim().toLowerCase()] || 'partner',
        logoUrl: imageUrl_(r['Logo URL']),
        website: safeUrl_(r['Website']),
        trackName: String(r['Track Name'] || '').trim() || undefined,
      };
    });

  var finalists = rows_('finalists')
    .filter(function (r) { return isTrue_(r['Published']) && String(r['Team']).trim(); })
    .map(function (r) {
      return { team: String(r['Team']).trim(), college: String(r['College'] || '').trim(), city: String(r['City'] || '').trim() || undefined };
    });

  var approvedColleges = rows_('applications').filter(function (r) {
    return r['Test?'] !== 'TEST' && APPROVED_LIKE.indexOf(String(r['Status']).trim()) !== -1;
  }).length;
  var liveRounds = campuses.filter(function (c) { return c.status !== 'coming-soon'; }).length;

  var data = {
    ok: true,
    campuses: campuses,
    sponsors: sponsors,
    finalists: finalists,
    stats: { approvedColleges: approvedColleges, liveRounds: liveRounds },
    updatedAt: new Date().toISOString(),
  };
  try {
    cache.put('public-data', JSON.stringify(data), CONFIG.CACHE_SECONDS);
  } catch (err) {
    console.warn('Cache put failed (payload too large?)', err);
  }
  return data;
}

// ═════════════════════════════════════════════════════════════════════════════
// Email templates (Ignite Room brand: cream page, white card, crimson accent)
// ═════════════════════════════════════════════════════════════════════════════

function shell_(inner) {
  return '<div style="background:#F4EFE7;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;color:#171312">' +
    '<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #ECE6DE;border-radius:16px;overflow:hidden">' +
    '<div style="background:linear-gradient(135deg,#E10E43,#FF5B82);padding:24px 28px">' +
    '<div style="font-size:11px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.85);text-transform:uppercase">Ignite Room</div>' +
    '<div style="font-size:22px;font-weight:800;color:#fff;margin-top:4px">HackArena – 2027 Edition</div></div>' +
    '<div style="padding:28px;font-size:15px;line-height:1.6">' + inner + '</div>' +
    '<div style="padding:18px 28px;border-top:1px solid #ECE6DE;font-size:12px;color:#6E635E">Team Ignite Room · <a href="' + CONFIG.SITE_URL + '" style="color:#E10E43;text-decoration:none">igniteroom.in/hackarena-2027</a></div>' +
    '</div></div>';
}

function button_(label, href) {
  return '<a href="' + href + '" style="display:inline-block;padding:12px 24px;background:#E10E43;color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">' + esc_(label) + '</a>';
}

function confirmationEmail_(p, ref, attached) {
  var rulebook = attached
    ? 'The Campus Round Rule Book is attached to this email.'
    : 'You can read the Campus Round Rule Book at <a href="' + CONFIG.SITE_URL + '/rules" style="color:#E10E43">igniteroom.in/hackarena-2027/rules</a>.';
  return shell_(
    '<p style="margin:0 0 16px">Hi ' + esc_(firstName_(p.spocName)) + ' and ' + esc_(firstName_(p.studentName)) + ',</p>' +
    '<p style="margin:0 0 16px">Thank you for applying to host a <b>HackArena – 2027 Edition</b> campus round at <b>' + esc_(p.collegeName) + '</b>. We have received your application.</p>' +
    '<div style="margin:0 0 20px;padding:16px 20px;background:#F9F6F1;border-left:3px solid #E10E43;border-radius:8px">' +
    '<div style="font-size:12px;color:#6E635E">Reference</div><div style="font-size:18px;font-weight:700;font-family:monospace">' + esc_(ref) + '</div>' +
    '<div style="font-size:13px;color:#6E635E;margin-top:8px">Preferred date: ' + esc_(p.preferredDate) + (p.backupDate ? ' · Backup: ' + esc_(p.backupDate) : '') + '</div></div>' +
    '<p style="margin:0 0 8px"><b>What happens next</b></p>' +
    '<ol style="margin:0 0 16px;padding-left:20px;line-height:1.7">' +
    '<li>The Ignite Room team reviews your application.</li>' +
    '<li>Once approved, you get an email with the steps to set up your college\'s private Nymble page.</li>' +
    '<li>When your Nymble link is in, your college\'s card goes live on the HackArena 2027 site.</li></ol>' +
    '<p style="margin:0 0 20px">' + rulebook + '</p>' +
    '<p style="margin:0">' + button_('HackArena 2027', CONFIG.SITE_URL) + '</p>'
  );
}

function adminEmail_(title, pairs) {
  var rows = pairs.map(function (p) {
    return '<tr><td style="padding:6px 12px 6px 0;color:#6E635E;font-size:13px;vertical-align:top;white-space:nowrap">' + esc_(p[0]) +
      '</td><td style="padding:6px 0;font-size:14px">' + esc_(p[1]) + '</td></tr>';
  }).join('');
  return shell_('<p style="margin:0 0 12px;font-weight:700;font-size:17px">' + esc_(title) + '</p><table style="border-collapse:collapse;width:100%">' + rows + '</table>' +
    '<p style="margin:20px 0 0;font-size:13px;color:#6E635E">Full details are in the HackArena 2027 sheet.</p>');
}

function rulebookAttachment_() {
  if (!CONFIG.RULEBOOK_FILE_ID) return [];
  try {
    return [DriveApp.getFileById(CONFIG.RULEBOOK_FILE_ID).getAs(MimeType.PDF).setName('HackArena-2027-Campus-Round-Rule-Book.pdf')];
  } catch (err) {
    console.error('Rule book attachment failed', err);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(key) {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[key].name);
  if (!sh) throw new Error('Missing sheet "' + SHEETS[key].name + '". Run setup() first.');
  return sh;
}

function colIndex_(sh, header) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var i = h.indexOf(header);
  if (i === -1) throw new Error('Missing column "' + header + '" in ' + sh.getName());
  return i + 1;
}

function rows_(key) {
  var sh = sheet_(key);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  var h = data[0];
  return data.slice(1).map(function (r) {
    var o = {};
    h.forEach(function (k, i) { o[k] = r[i]; });
    return o;
  });
}

function readRow_(sh, r) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var v = sh.getRange(r, 1, 1, h.length).getValues()[0];
  var o = {};
  h.forEach(function (k, i) { o[k] = v[i]; });
  return o;
}

/** Appends by header name, so column order in the sheet doesn't matter. */
function appendRow_(sh, obj) {
  var h = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  sh.appendRow(h.map(function (k) { return k in obj ? cell_(obj[k]) : ''; }));
}

/** Stops spreadsheet formula injection from public form input and caps length. */
function cell_(v) {
  if (v instanceof Date || typeof v === 'number' || typeof v === 'boolean') return v;
  var s = String(v === undefined || v === null ? '' : v).slice(0, 2000);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function setListValidation_(sheetName, header, values, rows) {
  var sh = SpreadsheetApp.getActive().getSheetByName(sheetName);
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build();
  sh.getRange(2, colIndex_(sh, header), rows, 1).setDataValidation(rule);
}

function clearCache_() {
  CacheService.getScriptCache().remove('public-data');
}

function statusSlug_(s) {
  var v = String(s || '').trim().toLowerCase().replace(/\s+/g, '-');
  var ok = ['coming-soon', 'registrations-open', 'registrations-closed', 'round-today', 'shortlist-announced', 'prototype-round', 'completed'];
  return ok.indexOf(v) !== -1 ? v : 'coming-soon';
}

function ymd_(v) {
  if (!v) return undefined;
  if (v instanceof Date) return Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  var s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var d = new Date(s);
  return isNaN(d.getTime()) ? undefined : Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd');
}

function inRoundWindow_(s) {
  var d = String(s || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= '2027-02-10' && d <= '2027-04-25';
}

function slugify_(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'campus';
}

function safeUrl_(v) {
  var s = String(v || '').trim();
  if (!s) return undefined;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  return /^https?:\/\/[^\s"'<>]+$/i.test(s) ? s : undefined;
}

/** Accepts direct image URLs, site paths like /partners/github.png, or Google Drive share links. */
function imageUrl_(v) {
  var s = String(v || '').trim();
  if (!s) return undefined;
  if (s.charAt(0) === '/') return s;
  var m = s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/);
  if (m) return 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w600';
  return safeUrl_(s);
}

function isTrue_(v) {
  return v === true || /^(true|yes|y|1|✓)$/i.test(String(v).trim());
}

function isEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
}

function norm_(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function firstName_(s) {
  return String(s || '').trim().split(/\s+/)[0] || 'there';
}

function esc_(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function userError_(msg) {
  var e = new Error(msg);
  e.userMessage = msg;
  return e;
}

function safeAlert_(msg) {
  try { SpreadsheetApp.getUi().alert(msg); } catch (err) { console.log(msg); }
}

/** Optional: run from the editor to check emails + sheet writing end to end. */
function testApplication() {
  var res = handleApply_({
    collegeName: 'Test Institute of Technology', city: 'Delhi', state: 'Delhi', website: '', collegeType: 'Private', techStudents: 1200,
    spocName: 'Test Faculty', spocDesignation: 'HOD', spocDepartment: 'CSE', spocEmail: CONFIG.ADMIN_EMAIL, spocPhone: '9999999999',
    studentName: 'Test Student', studentYear: '3rd', studentBranch: 'CSE', studentEmail: Session.getActiveUser().getEmail() || CONFIG.ADMIN_EMAIL, studentPhone: '9999999998',
    preferredDate: '2027-02-15', backupDate: '2027-02-20', expectedTeams: 25, venue: 'Auditorium', bringingSponsor: 'No',
    consentRules: true, consentOffline: true, consentReporting: true,
  }, true);
  console.log(res);
}
