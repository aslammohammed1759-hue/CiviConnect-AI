import { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import { CivicIssue, IssueCategory, IssueStatus, IssueUrgency } from '../types';

// In-memory persistent civic issues store during dev server session
let issuesStore: CivicIssue[] = [
  {
    id: 'iss-101',
    trackingNumber: 'CIV-2026-0842',
    title: 'Deep hazardous pothole near elementary school crosswalk',
    description: 'A 10-inch deep pothole has opened up along the eastbound lane right before the pedestrian crossing at Oak Street & 4th Avenue. Bicyclists and cars are swerving into oncoming traffic to avoid rim damage.',
    category: 'Pothole & Roads',
    department: 'Department of Public Works - Asphalt Division',
    urgency: 'High',
    status: 'In Progress',
    severityScore: 8,
    location: {
      address: '412 Oak Street, at 4th Ave Crosswalk',
      neighborhood: 'Maple Heights',
      lat: 37.7749,
      lng: -122.4194
    },
    reporter: {
      name: 'Elena Rostova',
      email: 'elena.rostova@example.org',
      isAnonymous: false
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    upvotes: 42,
    upvotedBy: ['user-1', 'user-2', 'user-3'],
    createdAt: '2026-09-28T14:32:00Z',
    updatedAt: '2026-10-01T10:15:00Z',
    estimatedResolutionDays: 3,
    aiAnalysis: {
      summary: 'High safety risk due to proximity to school zone and forced lane deviation into oncoming traffic.',
      hazards: ['Pedestrian crosswalk obstruction', 'Vehicle tire blowout hazard', 'Cyclist fall risk'],
      actionSteps: ['Deploy temporary cold-patch asphalt filler within 24h', 'Schedule permanent milling and compaction crew', 'Notify school crossing guards'],
      citizenNotice: 'Your report has been expedited due to its proximity to a designated school corridor. Crew #4 has been scheduled for inspection.',
      triageConfidence: 96
    },
    updates: [
      {
        id: 'upd-1',
        timestamp: '2026-09-28T14:35:00Z',
        status: 'AI Triaged',
        author: 'CiviConnect AI Dispatch',
        role: 'AI Dispatch Engine',
        message: 'Incident evaluated with high urgency (Severity 8/10). Automatically assigned to Dept of Public Works Asphalt Division.'
      },
      {
        id: 'upd-2',
        timestamp: '2026-09-29T09:00:00Z',
        status: 'Assigned',
        author: 'Dispatch Officer Vance',
        role: 'Department Inspector',
        message: 'Work Order #WO-8910 generated. On-site field inspector confirmed measurement: 24" x 18" x 9.5". Safety cones placed.'
      },
      {
        id: 'upd-3',
        timestamp: '2026-10-01T10:15:00Z',
        status: 'In Progress',
        author: 'Crew Chief Morales',
        role: 'Public Works Crew',
        message: 'Pavement saw-cutting initiated. High-performance hot mix asphalt scheduled for final roller pass.'
      }
    ],
    comments: [
      {
        id: 'c-1',
        author: 'Marcus Brody',
        role: 'Local Resident',
        text: 'I hit this two nights ago in the rain and ruined a hubcap. Really glad this is getting prioritized!',
        timestamp: '2026-09-28T18:20:00Z'
      }
    ]
  },
  {
    id: 'iss-102',
    trackingNumber: 'CIV-2026-0911',
    title: 'Flickering streetlights creating dark zone on Elm Promenade',
    description: 'Four consecutive LED luminaires are dead or rapidly strobe-flickering from the 200 to 400 block of Elm Promenade. The footpath is pitch black after 7 PM, impacting evening commuters and bus riders.',
    category: 'Street Lighting',
    department: 'Bureau of Street Lighting & Electrical',
    urgency: 'Medium',
    status: 'Assigned',
    severityScore: 6,
    location: {
      address: '250 Elm Promenade',
      neighborhood: 'Downtown Arts Corridor',
      lat: 37.7833,
      lng: -122.4167
    },
    reporter: {
      name: 'Anonymous Citizen',
      email: 'citizen@civiconnect.local',
      isAnonymous: true
    },
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    upvotes: 28,
    upvotedBy: ['user-2'],
    createdAt: '2026-09-29T21:10:00Z',
    updatedAt: '2026-09-30T11:20:00Z',
    estimatedResolutionDays: 4,
    aiAnalysis: {
      summary: 'Multiple fixture failure suggests branch circuit breaker or photocell relay malfunction rather than single bulb failure.',
      hazards: ['Severe night pedestrian visibility drop', 'Increased vulnerability at public transit stops'],
      actionSteps: ['Check feeder distribution cabinet #B-14', 'Replace photo-sensor ballast units', 'Verify circuit load test'],
      citizenNotice: 'The Bureau of Street Lighting has queued this corridor for the next nighttime bucket-truck route.',
      triageConfidence: 91
    },
    updates: [
      {
        id: 'upd-4',
        timestamp: '2026-09-29T21:12:00Z',
        status: 'AI Triaged',
        author: 'CiviConnect AI Dispatch',
        role: 'AI Dispatch Engine',
        message: 'Grouped 4 fixture reports into single corridor ticket. Severity 6/10.'
      },
      {
        id: 'upd-5',
        timestamp: '2026-09-30T11:20:00Z',
        status: 'Assigned',
        author: 'Electrical Supervisor Klein',
        role: 'Department Inspector',
        message: 'Circuit schematics retrieved. Assigned to Night Shift Electrical Team.'
      }
    ],
    comments: []
  },
  {
    id: 'iss-103',
    trackingNumber: 'CIV-2026-0955',
    title: 'Illegal commercial dumping of construction drywall & paint',
    description: 'Someone dumped roughly 20 bags of drywall scraps, hazardous paint cans, and broken lumber in the alleyway behind Pine Street market. Some paint cans are leaking toward the storm drain.',
    category: 'Waste & Sanitation',
    department: 'Sanitation & Environmental Code Enforcement',
    urgency: 'Emergency',
    status: 'In Progress',
    severityScore: 9,
    location: {
      address: 'Alleyway 18 Pine Street',
      neighborhood: 'Industrial Harbor District',
      lat: 37.7650,
      lng: -122.4050
    },
    reporter: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@pinestore.com',
      isAnonymous: false
    },
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    upvotes: 65,
    upvotedBy: ['user-1', 'user-3', 'user-4'],
    createdAt: '2026-10-01T07:45:00Z',
    updatedAt: '2026-10-02T08:30:00Z',
    estimatedResolutionDays: 1,
    aiAnalysis: {
      summary: 'Critical environmental hazard: active chemical paint runoff threatening storm water filtration system.',
      hazards: ['Toxic storm drain contamination', 'Fire hazard from volatile solvent containers', 'Pedestrian alleyway blockage'],
      actionSteps: ['Deploy Hazmat absorbent boom around storm drain', 'Collect evidence/license plates for code enforcement fines', 'Dispatch heavy compactor and hazmat disposal truck'],
      citizenNotice: 'Urgent environmental remediation team dispatched immediately. Storm drain containment prioritized.',
      triageConfidence: 98
    },
    updates: [
      {
        id: 'upd-6',
        timestamp: '2026-10-01T07:48:00Z',
        status: 'AI Triaged',
        author: 'CiviConnect AI Dispatch',
        role: 'AI Dispatch Engine',
        message: 'Escalated to EMERGENCY level due to potential storm drain toxic ingress.'
      },
      {
        id: 'upd-7',
        timestamp: '2026-10-01T08:30:00Z',
        status: 'In Progress',
        author: 'Eco-Enforcement Officer Davis',
        role: 'Department Inspector',
        message: 'Absorbent socks installed around drain inlet. CCTV footage requested from surrounding loading docks.'
      }
    ],
    comments: [
      {
        id: 'c-2',
        author: 'Sara Lin',
        role: 'Environmental Advocate',
        text: 'Thank you for containing the paint runoff so quickly! That drain leads right to the bay inlet.',
        timestamp: '2026-10-01T12:05:00Z'
      }
    ]
  },
  {
    id: 'iss-104',
    trackingNumber: 'CIV-2026-1002',
    title: 'Broken swing set chain and sharp exposed metal at City Park',
    description: 'The toddler swing chain snapped on the left side, leaving a jagged galvanized link exposed at child eye height. The surrounding rubber mulch is also displaced.',
    category: 'Parks & Greenery',
    department: 'Parks & Recreation Facilities Maintenance',
    urgency: 'High',
    status: 'Resolved',
    severityScore: 7,
    location: {
      address: 'Sunset Community Park, Playground Zone 2',
      neighborhood: 'Sunset Hills',
      lat: 37.7580,
      lng: -122.4700
    },
    reporter: {
      name: 'Aisha Patel',
      email: 'aisha.p@communitymail.net',
      isAnonymous: false
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    upvotes: 34,
    upvotedBy: ['user-1'],
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-09-27T16:00:00Z',
    estimatedResolutionDays: 2,
    aiAnalysis: {
      summary: 'Direct child injury risk in high-traffic municipal play zone. Requires lockout-tagout until hardware replacement.',
      hazards: ['Laceration from jagged link', 'Tumble/impact from weakened swing structure'],
      actionSteps: ['Tape off equipment immediately', 'Replace full chain assembly with rubber-coated commercial chain', 'Inspect adjacent swings'],
      citizenNotice: 'Playground equipment has been tagged for safety replacement. High priority ticket opened.',
      triageConfidence: 94
    },
    updates: [
      {
        id: 'upd-8',
        timestamp: '2026-09-25T11:05:00Z',
        status: 'AI Triaged',
        author: 'CiviConnect AI Dispatch',
        role: 'AI Dispatch Engine',
        message: 'Classified under Parks & Recreation high-priority child safety protocol.'
      },
      {
        id: 'upd-9',
        timestamp: '2026-09-26T10:00:00Z',
        status: 'In Progress',
        author: 'Park Ranger Campbell',
        role: 'Department Inspector',
        message: 'Swing removed from harness, area secured with safety caution banner.'
      },
      {
        id: 'upd-10',
        timestamp: '2026-09-27T16:00:00Z',
        status: 'Resolved',
        author: 'Park Maintenance Crew',
        role: 'Public Works Crew',
        message: 'Brand-new heavy-duty pinchless chain installed and certified under ASTM safety guidelines. Mulch leveled.'
      }
    ],
    comments: [
      {
        id: 'c-3',
        author: 'Aisha Patel',
        role: 'Reporter',
        text: 'Checked it this morning during our walk - brand new swing installed and spotless! Amazing turn-around time.',
        timestamp: '2026-09-28T09:15:00Z'
      }
    ]
  },
  {
    id: 'iss-105',
    trackingNumber: 'CIV-2026-1048',
    title: 'Major water main seepage bubbling through road surface',
    description: 'Clean drinking water is steadily welling up from an expansion crack on Westview Boulevard. Water pressure in neighboring apartments dropped visibly this morning.',
    category: 'Water & Drainage',
    department: 'Municipal Water & Sewer Authority',
    urgency: 'Emergency',
    status: 'In Progress',
    severityScore: 9,
    location: {
      address: '880 Westview Boulevard',
      neighborhood: 'Marina Heights',
      lat: 37.8010,
      lng: -122.4350
    },
    reporter: {
      name: 'David Chen',
      email: 'david.chen@marinaview.com',
      isAnonymous: false
    },
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
    upvotes: 53,
    upvotedBy: ['user-1', 'user-4'],
    createdAt: '2026-10-02T06:15:00Z',
    updatedAt: '2026-10-02T08:45:00Z',
    estimatedResolutionDays: 1,
    aiAnalysis: {
      summary: 'Sub-surface water main rupture risking sinkhole formation and sub-base roadway erosion.',
      hazards: ['Roadway collapse / sinkhole formation', 'Potable water supply contamination / loss', 'Traffic detour required'],
      actionSteps: ['Acoustic leak detection team dispatch', 'Isolate 8-inch feeder valve', 'Setup traffic detour around Westview Blvd'],
      citizenNotice: 'Water Authority emergency response unit dispatched. Temporary water service shutdown notices being distributed.',
      triageConfidence: 97
    },
    updates: [
      {
        id: 'upd-11',
        timestamp: '2026-10-02T06:20:00Z',
        status: 'AI Triaged',
        author: 'CiviConnect AI Dispatch',
        role: 'AI Dispatch Engine',
        message: 'Critical infrastructure rupture pattern identified. Water Authority emergency dispatch notified within 30 seconds.'
      },
      {
        id: 'upd-12',
        timestamp: '2026-10-02T08:45:00Z',
        status: 'In Progress',
        author: 'Water Main Tech Reynolds',
        role: 'Public Works Crew',
        message: 'Excavation unit on site. Traffic diverted to 2nd Street. Valve isolated to stop asphalt undermining.'
      }
    ],
    comments: []
  },
  {
    id: 'iss-106',
    trackingNumber: 'CIV-2026-1102',
    title: 'Traffic signal stuck on red causing severe gridlock at intersection',
    description: 'The northbound signal light at King & 7th Street has been stuck on constant red for over 45 minutes. Drivers are getting impatient and running the red light into cross traffic.',
    category: 'Traffic & Signals',
    department: 'Department of Transportation - Traffic Operations',
    urgency: 'Emergency',
    status: 'Submitted',
    severityScore: 8,
    location: {
      address: 'Intersection of King St & 7th St',
      neighborhood: 'Mission Bay',
      lat: 37.7710,
      lng: -122.3980
    },
    reporter: {
      name: 'Priya Sharma',
      email: 'priya.sharma@transit.net',
      isAnonymous: false
    },
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    upvotes: 39,
    upvotedBy: ['user-3'],
    createdAt: '2026-10-02T08:50:00Z',
    updatedAt: '2026-10-02T08:50:00Z',
    estimatedResolutionDays: 1,
    updates: [
      {
        id: 'upd-13',
        timestamp: '2026-10-02T08:50:00Z',
        status: 'Submitted',
        author: 'Priya Sharma',
        role: 'Citizen',
        message: 'Issue submitted via mobile citizen portal.'
      }
    ],
    comments: []
  }
];

// Server-side AI triage engine helper
async function triageCivicIssue(data: {
  title: string;
  description: string;
  category?: string;
  urgency?: string;
  location?: string;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are the CiviConnect-AI municipal triage engine for smart city operations.
Analyze this citizen report:
Title: "${data.title}"
Description: "${data.description}"
Reported Category: "${data.category || 'Auto-detect'}"
Citizen Stated Urgency: "${data.urgency || 'Normal'}"
Location: "${data.location || 'Urban area'}"

Return ONLY valid JSON with keys:
category, department, severityScore (1-10), urgency ("Low"|"Medium"|"High"|"Emergency"), estimatedResolutionDays (number), summary, hazards (array of strings), actionSteps (array of strings), citizenNotice, triageConfidence (number 85-99).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Gemini server triage fallback triggered:', e);
    }
  }

  // Heuristic rule-based fallback
  const text = `${data.title} ${data.description}`.toLowerCase();
  let category: IssueCategory = 'Pothole & Roads';
  let urgency: IssueUrgency = 'Medium';
  let severity = 6;

  if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('bulb')) {
    category = 'Street Lighting';
    severity = 6;
  } else if (text.includes('trash') || text.includes('dump') || text.includes('waste') || text.includes('garbage')) {
    category = 'Waste & Sanitation';
    severity = text.includes('chemical') || text.includes('toxic') ? 9 : 6;
    if (severity >= 8) urgency = 'Emergency';
  } else if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drain')) {
    category = 'Water & Drainage';
    severity = 8;
    urgency = 'Emergency';
  } else if (text.includes('tree') || text.includes('branch') || text.includes('park') || text.includes('swing')) {
    category = 'Parks & Greenery';
    severity = 5;
  } else if (text.includes('signal') || text.includes('traffic') || text.includes('intersection')) {
    category = 'Traffic & Signals';
    severity = 8;
    urgency = 'High';
  } else if (text.includes('graffiti') || text.includes('vandalism') || text.includes('tag')) {
    category = 'Graffiti & Vandalism';
    severity = 4;
    urgency = 'Low';
  } else if (text.includes('danger') || text.includes('hazard') || text.includes('safety') || text.includes('fire')) {
    category = 'Public Safety';
    severity = 9;
    urgency = 'Emergency';
  }

  const deptMap: Record<string, string> = {
    'Pothole & Roads': 'Department of Public Works - Asphalt Division',
    'Street Lighting': 'Bureau of Street Lighting & Electrical',
    'Waste & Sanitation': 'Sanitation & Environmental Code Enforcement',
    'Water & Drainage': 'Municipal Water & Sewer Authority',
    'Parks & Greenery': 'Parks & Recreation Facilities Maintenance',
    'Traffic & Signals': 'Department of Transportation - Traffic Operations',
    'Graffiti & Vandalism': 'City Beautification & Graffiti Abatement',
    'Public Safety': 'Community Safety & Code Compliance Division'
  };

  return {
    category,
    department: deptMap[category] || 'Department of Public Works',
    severityScore: severity,
    urgency,
    estimatedResolutionDays: urgency === 'Emergency' ? 1 : urgency === 'High' ? 3 : 5,
    summary: `Civic issue automatically triaged under ${category} with severity priority ${severity}/10. Priority routed to ${deptMap[category]}.`,
    hazards: [
      'Impairment in municipal right-of-way',
      'Safety hazard to pedestrians and vehicles',
      'SLA escalation required if not inspected within 24h'
    ],
    actionSteps: [
      'Dispatch field technician for on-site assessment',
      `Issue priority work order to ${deptMap[category]}`,
      'Position traffic warning cones and safety markers'
    ],
    citizenNotice: `Your ticket has been logged and assigned to ${deptMap[category]}. You will receive automatic status alerts as repairs progress.`,
    triageConfidence: 94
  };
}

// Request Body Parser helper
async function parseJson(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res: ServerResponse, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(data));
}

// Main API Handler for Vite dev server / Connect middleware
export async function handleCivicApi(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  if (!url.startsWith('/api')) {
    return false; // let Vite handle static/app assets
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return true;
  }

  const parsedUrl = new URL(url, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // GET /api/issues
  if (pathname === '/api/issues' && req.method === 'GET') {
    const category = parsedUrl.searchParams.get('category');
    const status = parsedUrl.searchParams.get('status');
    const urgency = parsedUrl.searchParams.get('urgency');
    const search = parsedUrl.searchParams.get('search');

    let filtered = [...issuesStore];
    if (category && category !== 'All') filtered = filtered.filter(i => i.category === category);
    if (status && status !== 'All') filtered = filtered.filter(i => i.status === status);
    if (urgency && urgency !== 'All') filtered = filtered.filter(i => i.urgency === urgency);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.trackingNumber.toLowerCase().includes(q) ||
        i.location.address.toLowerCase().includes(q) ||
        i.location.neighborhood.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    sendJson(res, { issues: filtered, count: filtered.length });
    return true;
  }

  // POST /api/triage-preview
  if (pathname === '/api/triage-preview' && req.method === 'POST') {
    try {
      const body = await parseJson(req);
      const triage = await triageCivicIssue(body);
      sendJson(res, { triage });
    } catch (e: any) {
      sendJson(res, { error: e.message || 'Triage failed' }, 500);
    }
    return true;
  }

  // POST /api/issues
  if (pathname === '/api/issues' && req.method === 'POST') {
    try {
      const body = await parseJson(req);
      const triage = await triageCivicIssue(body);

      const newIssue: CivicIssue = {
        id: `iss-${Date.now().toString().slice(-6)}`,
        trackingNumber: `CIV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: body.title,
        description: body.description,
        category: (triage.category || body.category || 'Pothole & Roads') as IssueCategory,
        department: triage.department || 'Department of Public Works',
        urgency: (triage.urgency || body.urgency || 'Medium') as IssueUrgency,
        status: 'AI Triaged',
        severityScore: triage.severityScore || 6,
        location: {
          address: body.location?.address || 'City Right-of-Way',
          neighborhood: body.location?.neighborhood || 'Downtown Civic Core',
          lat: body.location?.lat || 37.7749 + (Math.random() - 0.5) * 0.04,
          lng: body.location?.lng || -122.4194 + (Math.random() - 0.5) * 0.04
        },
        reporter: {
          name: body.reporter?.name || 'Anonymous Citizen',
          email: body.reporter?.email || 'citizen@civiconnect.local',
          isAnonymous: Boolean(body.reporter?.isAnonymous)
        },
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        upvotes: 1,
        upvotedBy: ['current-user'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedResolutionDays: triage.estimatedResolutionDays || 3,
        aiAnalysis: {
          summary: triage.summary,
          hazards: triage.hazards || [],
          actionSteps: triage.actionSteps || [],
          citizenNotice: triage.citizenNotice,
          triageConfidence: triage.triageConfidence || 95
        },
        updates: [
          {
            id: `upd-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            status: 'Submitted',
            author: body.reporter?.name || 'Citizen',
            role: 'Citizen',
            message: 'Report submitted through civic mobile portal.'
          },
          {
            id: `upd-${Date.now()}-2`,
            timestamp: new Date(Date.now() + 1000).toISOString(),
            status: 'AI Triaged',
            author: 'CiviConnect AI Dispatch',
            role: 'AI Dispatch Engine',
            message: `Priority ${triage.severityScore}/10. Assigned to ${triage.department}.`
          }
        ],
        comments: []
      };

      issuesStore.unshift(newIssue);
      sendJson(res, { issue: newIssue }, 201);
    } catch (e: any) {
      sendJson(res, { error: e.message || 'Create issue failed' }, 500);
    }
    return true;
  }

  // POST /api/issues/:id/upvote
  if (pathname.match(/^\/api\/issues\/[^/]+\/upvote$/) && req.method === 'POST') {
    const parts = pathname.split('/');
    const issueId = parts[3];
    const issue = issuesStore.find(i => i.id === issueId);
    if (!issue) {
      sendJson(res, { error: 'Issue not found' }, 404);
      return true;
    }
    const body = await parseJson(req);
    const userId = body.userId || 'user-default';
    const idx = issue.upvotedBy.indexOf(userId);
    if (idx >= 0) {
      issue.upvotedBy.splice(idx, 1);
      issue.upvotes = Math.max(0, issue.upvotes - 1);
    } else {
      issue.upvotedBy.push(userId);
      issue.upvotes += 1;
    }
    issue.updatedAt = new Date().toISOString();
    sendJson(res, { issue, upvoted: idx < 0 });
    return true;
  }

  // POST /api/issues/:id/comments
  if (pathname.match(/^\/api\/issues\/[^/]+\/comments$/) && req.method === 'POST') {
    const parts = pathname.split('/');
    const issueId = parts[3];
    const issue = issuesStore.find(i => i.id === issueId);
    if (!issue) {
      sendJson(res, { error: 'Issue not found' }, 404);
      return true;
    }
    const body = await parseJson(req);
    const comment = {
      id: `c-${Date.now()}`,
      author: body.author || 'Citizen',
      role: body.role || 'Citizen',
      text: body.text || '',
      timestamp: new Date().toISOString()
    };
    issue.comments.push(comment);
    issue.updatedAt = new Date().toISOString();
    sendJson(res, { comment, issue }, 201);
    return true;
  }

  // PATCH /api/issues/:id/status
  if (pathname.match(/^\/api\/issues\/[^/]+\/status$/) && req.method === 'PATCH') {
    const parts = pathname.split('/');
    const issueId = parts[3];
    const issue = issuesStore.find(i => i.id === issueId);
    if (!issue) {
      sendJson(res, { error: 'Issue not found' }, 404);
      return true;
    }
    const body = await parseJson(req);
    if (body.status) issue.status = body.status;
    if (body.department) issue.department = body.department;

    let msg = body.note || `Status updated to ${issue.status}.`;
    const update = {
      id: `upd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: issue.status,
      author: body.author || 'Municipal Dispatch',
      role: 'Department Inspector' as const,
      message: msg
    };
    issue.updates.push(update);
    issue.updatedAt = new Date().toISOString();
    sendJson(res, { issue });
    return true;
  }

  // GET /api/analytics
  if (pathname === '/api/analytics' && req.method === 'GET') {
    const total = issuesStore.length;
    const resolved = issuesStore.filter(i => i.status === 'Resolved').length;
    const inProgress = issuesStore.filter(i => i.status === 'In Progress').length;
    const emergencies = issuesStore.filter(i => i.urgency === 'Emergency' && i.status !== 'Resolved').length;
    const totalUpvotes = issuesStore.reduce((a, b) => a + b.upvotes, 0);

    const departmentCounts: Record<string, number> = {};
    issuesStore.forEach(i => {
      departmentCounts[i.department] = (departmentCounts[i.department] || 0) + 1;
    });

    const categoryCounts: Record<string, number> = {};
    issuesStore.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    sendJson(res, {
      metrics: {
        total,
        resolved,
        inProgress,
        emergencies,
        totalUpvotes,
        avgResolutionDays: 2.4,
        aiTriageAccuracy: '95.8%'
      },
      departmentCounts,
      categoryCounts
    });
    return true;
  }

  return false;
}
