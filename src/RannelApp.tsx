import React, { useMemo, useState } from "react";
import {
  Car,
  Home,
  Inbox,
  Bell,
  Settings,
  MapPin,
  Star,
  ChevronLeft,
  Send,
  CheckCircle2,
  CalendarDays,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * WashLink — Working Demo Prototype (Mobile-first)
 * What works:
 * - Landing -> Main tabs (Browse / My Cars / Inbox)
 * - Browse: generic DFW map mock + detailers list (logos + filled stars)
 * - My Cars: 3 cars, each can Schedule -> Booking flow
 * - Booking: choose date/time, optional notes, choose provider (if not preselected)
 * - Confirm booking: shows toast + drops a booking confirmation message into Inbox
 * - Inbox: thread list + chat view, send local messages
 */

// -----------------------------
// Types + mock data
// -----------------------------

type Detailer = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  etaMin: number;
  distanceMi: number;
  startingPrice: number;
  badge?: "Top Rated" | "Insured" | "Eco";
};

type CarItem = {
  id: string;
  displayName: string;
  year: string;
  makeModel: string;
  plate: string;
  color: string;
  accent: "blue" | "teal" | "purple";
};

type Thread = {
  id: string;
  title: string;
  subtitle: string;
  unread: number;
  messages: { id: string; from: "washlink" | "user"; text: string; ts: string }[];
};

const DETAILERS: Detailer[] = [
  {
    id: "mw",
    name: "MirrorWorks Mobile",
    rating: 4.9,
    reviews: 412,
    etaMin: 20,
    distanceMi: 1.2,
    startingPrice: 89,
    badge: "Top Rated",
  },
  {
    id: "cp",
    name: "Ceramiq Pro Detail",
    rating: 4.8,
    reviews: 268,
    etaMin: 30,
    distanceMi: 2.6,
    startingPrice: 99,
    badge: "Insured",
  },
  {
    id: "sc",
    name: "Sudsy City Mobile",
    rating: 4.7,
    reviews: 193,
    etaMin: 15,
    distanceMi: 0.9,
    startingPrice: 79,
    badge: "Eco",
  },
];

const CARS: CarItem[] = [
  {
    id: "911",
    displayName: "Porsche 911 Carrera 4S",
    year: "2020",
    makeModel: "Porsche 911 Carrera 4S",
    plate: "TX · 91A372",
    color: "Silver",
    accent: "blue",
  },
  {
    id: "gle",
    displayName: "Mercedes GLE 450",
    year: "2020",
    makeModel: "Mercedes GLE 450",
    plate: "TX · 55G912",
    color: "Black",
    accent: "teal",
  },
  {
    id: "mx",
    displayName: "Tesla Model X",
    year: "2022",
    makeModel: "Tesla Model X",
    plate: "TX · 18E201",
    color: "White",
    accent: "purple",
  },
];

function makeInitialThreads(): Thread[] {
  return [
    {
      id: "support",
      title: "WashLink Support",
      subtitle: "We’re here if you need anything",
      unread: 1,
      messages: [
        {
          id: "m1",
          from: "washlink",
          text: "Welcome to WashLink 👋 Want to schedule your first wash?",
          ts: "Today · 9:02 AM",
        },
      ],
    },
    {
      id: "promo",
      title: "Member Savings",
      subtitle: "Save $10 on your next booking",
      unread: 0,
      messages: [
        {
          id: "m1",
          from: "washlink",
          text: "Members save $10 on every booking. Want to activate membership?",
          ts: "Yesterday · 6:10 PM",
        },
      ],
    },
  ];
}

// -----------------------------
// Small UI pieces
// -----------------------------

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-blue-600/25 border border-blue-500/40 grid place-items-center">
        <Car className="w-5 h-5 text-blue-400" />
      </div>
      <div className="leading-tight">
        <div className="text-white font-semibold text-lg">WashLink</div>
        <div className="text-neutral-300 text-xs -mt-0.5">Car Wash, Anywhere, Anytime</div>
      </div>
    </div>
  );
}

function Header({ showActions = true }: { showActions?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <LogoMark />
      {showActions ? (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-neutral-400 rounded-xl">
            <Bell className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-neutral-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const frac = Math.max(0, Math.min(1, value - full));
  return (
    <div className="flex items-center gap-1" aria-label={`${value.toFixed(1)} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i < full ? 1 : i === full ? frac : 0;
        return (
          <div key={i} className="relative w-4 h-4">
            <Star className="absolute inset-0 w-4 h-4 text-neutral-600" strokeWidth={1.5} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
        );
      })}
      <span className="ml-1 text-xs text-neutral-200 tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function TempBusinessLogo({ name }: { name: string }) {
  const hue = (name.length * 41) % 360;
  return (
    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 grid place-items-center shrink-0">
      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id={`g-${hue}`} x1="0" x2="1">
            <stop offset="0%" stopColor={`hsl(${hue}, 90%, 60%)`} />
            <stop offset="100%" stopColor={`hsl(${(hue + 40) % 360}, 90%, 55%)`} />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#g-${hue})`} />
        <path d="M7.2 12h9.6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.6 15h6.8" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-blue-600/15 border border-blue-500/25 text-blue-200">
      {label}
    </span>
  );
}

function AccentCardTop({ accent }: { accent: CarItem["accent"] }) {
  const classes =
    accent === "blue"
      ? "from-sky-500/90 to-sky-700/70"
      : accent === "teal"
        ? "from-teal-400/90 to-emerald-700/70"
        : "from-violet-500/90 to-indigo-700/70";
  return (
    <div className={`h-28 rounded-2xl bg-gradient-to-br ${classes} relative overflow-hidden`}>
      <div className="absolute right-4 top-4 w-12 h-12 rounded-full bg-white/10" />
      <div className="absolute right-10 top-14 w-6 h-6 rounded-full bg-white/10" />
      <svg className="absolute left-3 bottom-3 opacity-25" width="120" height="48" viewBox="0 0 120 48" aria-hidden>
        <path
          d="M18 32c5-9 11-14 20-14h24c9 0 17 4 23 12l4 2h9c2 0 4 2 4 4v4h-10c-1 0-2-1-2-2v-1H32v1c0 1-1 2-2 2H10v-4c0-2 2-4 4-4h4z"
          fill="white"
        />
        <circle cx="36" cy="38" r="7" fill="white" />
        <circle cx="82" cy="38" r="7" fill="white" />
      </svg>
    </div>
  );
}

function GenericDFWMap() {
  return (
    <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950">
      <svg viewBox="0 0 400 260" className="w-full h-[240px] block">
        <defs>
          <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0a0a0c" />
            <stop offset="100%" stopColor="#141418" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="400" height="260" fill="url(#bg)" />

        {/* subtle grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 40} y1={0} x2={(i + 1) * 40} y2={260} stroke="#ffffff10" />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(i + 1) * 52} x2={400} y2={(i + 1) * 52} stroke="#ffffff10" />
        ))}

        {/* highways */}
        <path d="M28,210 C120,150 280,150 372,210" stroke="#9ca3af" strokeWidth={2.2} fill="none" opacity={0.7} />
        <path d="M70,40 C130,92 270,92 330,40" stroke="#9ca3af" strokeWidth={2.2} fill="none" opacity={0.7} />
        <path d="M60,190 C150,100 250,100 340,190" stroke="#e5e7eb" strokeWidth={2.6} fill="none" opacity={0.9} />
        <path d="M200,18 L200,244" stroke="#e5e7eb" strokeWidth={2.6} fill="none" opacity={0.9} />

        {/* lakes */}
        <path d="M105,75 q20,-20 45,2 t45,0 q-10,24 -45,28 t-45,-30" fill="#3b82f6" opacity="0.78" />
        <path d="M285,122 q28,-10 44,6 t8,36 q-18,10 -42,-6 t-10,-36" fill="#3b82f6" opacity="0.78" />

        {/* ring */}
        <circle cx={200} cy={130} r={42} stroke="#94a3b8" strokeWidth={1.5} fill="none" opacity={0.9} />
        <text x={200} y={135} textAnchor="middle" fill="#e5e7eb" fontSize={12} opacity={0.9}>
          DFW
        </text>

        {/* pins */}
        <g filter="url(#glow)">
          <Pin x={145} y={118} label="M" color="#f59e0b" />
          <Pin x={290} y={98} label="C" color="#fbbf24" />
          <Pin x={250} y={168} label="S" color="#a855f7" />
        </g>
      </svg>
    </div>
  );
}

function Pin({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path
        d="M0,-16 C8,-16 14,-10 14,-2 C14,10 0,22 0,22 C0,22 -14,10 -14,-2 C-14,-10 -8,-16 0,-16 Z"
        fill={color}
        opacity={0.95}
      />
      <circle cx={0} cy={-2} r={8} fill="#0b0b0d" opacity={0.9} />
      <text x={0} y={2} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>
        {label}
      </text>
    </g>
  );
}

type TabId = "browse" | "cars" | "inbox";

function Tabs({ tab, onChange }: { tab: TabId; onChange: (t: TabId) => void }) {
  const items: { id: TabId; label: string; icon: React.ComponentType<any> }[] = [
    { id: "browse", label: "Browse", icon: Home },
    { id: "cars", label: "My Cars", icon: Car },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ];
  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center gap-2 bg-neutral-900/80 border border-neutral-800 rounded-full px-2 py-1 shadow-lg">
        {items.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            onClick={() => onChange(id)}
            variant={tab === id ? "default" : "ghost"}
            className={`${
              tab === id ? "bg-blue-600 text-white" : "text-neutral-300"
            } rounded-full px-4 py-2 min-w-[96px] justify-center`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function Toast({ show, text, onClose }: { show: boolean; text: string; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-neutral-900 border border-neutral-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <div className="text-sm">{text}</div>
        <button className="ml-2 text-neutral-400 hover:text-white" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}

// -----------------------------
// Screens
// -----------------------------

type Screen =
  | { id: "landing" }
  | { id: "main"; tab: TabId }
  | { id: "booking"; carId: string; detailerId?: string }
  | { id: "thread"; threadId: string };

function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-[78vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/35 grid place-items-center mb-5">
        <Car className="w-9 h-9 text-blue-400" />
      </div>
      <div className="text-4xl font-bold text-white">WashLink</div>
      <div className="text-neutral-300 mt-2 text-lg">Car Wash, Anywhere, Anytime</div>
      <div className="text-neutral-400 mt-4 text-sm max-w-sm">
        Book vetted mobile detailers in minutes. Get quality care where your car is — home, office, or anywhere.
      </div>
      <Button onClick={onEnter} className="mt-8 rounded-2xl bg-blue-600 hover:bg-blue-500 px-8 py-6 text-base">
        Start Browsing
      </Button>
      <div className="mt-6 text-xs text-neutral-500">Demo prototype · No real payments</div>
    </div>
  );
}

function BrowseView({ onBook }: { onBook: (detailerId: string) => void }) {
  return (
    <div className="space-y-4">
      <GenericDFWMap />
      <div className="grid gap-3 sm:grid-cols-2">
        {DETAILERS.map((d) => (
          <Card key={d.id} className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <TempBusinessLogo name={d.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{d.name}</h3>
                        {d.badge ? <Badge label={d.badge} /> : null}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ETA {d.etaMin} min
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {d.distanceMi} mi
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Stars value={d.rating} />
                      <div className="text-[11px] text-neutral-400 mt-1">{d.reviews} reviews</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-neutral-300">
                      From <span className="font-semibold text-white">${d.startingPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="rounded-xl">
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                        onClick={() => onBook(d.id)}
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MyCarsView({ onSchedule }: { onSchedule: (carId: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white">My Cars</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {CARS.map((car) => (
          <Card key={car.id} className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <AccentCardTop accent={car.accent} />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{car.displayName}</div>
                  <div className="text-xs text-neutral-400 mt-1 truncate">
                    {car.year} {car.makeModel} · {car.color} · {car.plate}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0"
                  onClick={() => onSchedule(car.id)}
                >
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/25 grid place-items-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-300" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Pro tip</div>
            <div className="text-xs text-neutral-400 mt-1">
              Add a recurring schedule (weekly/biweekly) to keep your cars looking showroom-clean.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimeSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none text-white"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function BookingView({
  car,
  detailer,
  onBack,
  onPickDetailer,
  onConfirm,
}: {
  car: CarItem;
  detailer?: Detailer;
  onBack: () => void;
  onPickDetailer: (detailerId: string) => void;
  onConfirm: (payload: { carId: string; detailerId?: string; when: string; notes?: string }) => void;
}) {
  const [day, setDay] = useState<string>("2025-10-18");
  const [hour, setHour] = useState<string>("07");
  const [minute, setMinute] = useState<string>("00");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [notes, setNotes] = useState<string>("");

  const subtotal = 99.99;
  const memberDiscount = 10.0;
  const total = subtotal - memberDiscount;

  const whenLabel = useMemo(() => {
    const h = `${hour}`.padStart(2, "0");
    const m = `${minute}`.padStart(2, "0");
    return `${day} ${h}:${m} ${ampm}`;
  }, [day, hour, minute, ampm]);

  return (
    <div className="space-y-4">
      <Button variant="ghost" className="text-neutral-300 px-0" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <h2 className="text-3xl font-bold text-white">Schedule Wash</h2>

      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm text-neutral-300">Vehicle</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{car.displayName}</div>
              <div className="text-xs text-neutral-400">
                {car.color} · {car.plate}
              </div>
            </div>
            <div className="rounded-full px-3 py-1 text-xs bg-neutral-800 border border-neutral-700">Default</div>
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <div className="text-sm text-neutral-300">Provider</div>
            {detailer ? (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <TempBusinessLogo name={detailer.name} />
                  <div>
                    <div className="font-semibold">{detailer.name}</div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2">
                      <Stars value={detailer.rating} />
                      <span className="text-neutral-600">•</span>
                      <span>{detailer.etaMin} min ETA</span>
                    </div>
                  </div>
                </div>
                <Badge label="Vetted" />
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {DETAILERS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => onPickDetailer(d.id)}
                    className="rounded-2xl border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-950 transition px-3 py-3 text-left"
                  >
                    <div className="text-xs font-semibold text-white truncate">{d.name}</div>
                    <div className="text-[11px] text-neutral-400 mt-1">From ${d.startingPrice}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-300 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Date
            </div>
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="bg-black/40 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none text-white"
            />
          </div>

          <div className="text-sm text-neutral-300">Select time</div>
          <div className="bg-black/30 border border-neutral-700 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <TimeSelect value={hour} onChange={setHour} options={["07", "08", "09", "10", "11", "12"]} />
              <span className="text-neutral-400 font-semibold">:</span>
              <TimeSelect value={minute} onChange={setMinute} options={["00", "15", "30", "45"]} />
              <div className="ml-auto flex bg-neutral-900 border border-neutral-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setAmpm("AM")}
                  className={`px-4 py-2 text-sm ${ampm === "AM" ? "bg-blue-600 text-white" : "text-neutral-300"}`}
                >
                  AM
                </button>
                <button
                  onClick={() => setAmpm("PM")}
                  className={`px-4 py-2 text-sm ${ampm === "PM" ? "bg-blue-600 text-white" : "text-neutral-300"}`}
                >
                  PM
                </button>
              </div>
            </div>
            <div className="text-xs text-neutral-400 mt-2">Selected: {whenLabel}</div>
          </div>

          <div className="text-sm text-neutral-300 pt-2">Notes (optional)</div>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Gate code, special requests…"
            className="w-full bg-black/40 border border-neutral-700 rounded-xl px-3 py-2 text-sm focus:outline-none text-white"
          />
        </CardContent>
      </Card>

      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">Member discount</span>
            <span className="text-green-400">-${memberDiscount.toFixed(2)}</span>
          </div>
          <div className="h-px bg-neutral-800 my-3" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <Button
            className="w-full mt-4 rounded-2xl py-6 bg-blue-600 hover:bg-blue-500 text-lg"
            onClick={() =>
              onConfirm({ carId: car.id, detailerId: detailer?.id, when: whenLabel, notes: notes || undefined })
            }
          >
            Complete Booking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function InboxView({ threads, onOpen }: { threads: Thread[]; onOpen: (id: string) => void }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white">Inbox</h2>
      <div className="grid gap-3">
        {threads.map((t) => (
          <Card
            key={t.id}
            className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl cursor-pointer hover:border-neutral-700 transition"
            onClick={() => onOpen(t.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{t.title}</div>
                  <div className="text-xs text-neutral-400 mt-1 truncate">{t.subtitle}</div>
                </div>
                {t.unread > 0 ? (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs grid place-items-center">
                    {t.unread}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500"> </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-xs text-neutral-500 text-center pt-4">Tip: booking confirmation will auto-message your Inbox.</div>
    </div>
  );
}

function ThreadView({ thread, onBack, onSend }: { thread: Thread; onBack: () => void; onSend: (text: string) => void }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-4">
      <Button variant="ghost" className="text-neutral-300 px-0" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Button>
      <div className="text-2xl font-bold text-white">{thread.title}</div>

      <Card className="bg-neutral-900 border border-neutral-800 text-white rounded-2xl">
        <CardContent className="p-4 space-y-3">
          {thread.messages.map((m) => (
            <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm border ${
                  m.from === "user"
                    ? "bg-blue-600/20 border-blue-500/30 text-white"
                    : "bg-neutral-950 border-neutral-800 text-neutral-100"
                }`}
              >
                <div>{m.text}</div>
                <div className="text-[10px] text-neutral-400 mt-1">{m.ts}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none"
        />
        <Button
          size="icon"
          className="rounded-2xl bg-blue-600 hover:bg-blue-500"
          onClick={() => {
            const t = draft.trim();
            if (!t) return;
            onSend(t);
            setDraft("");
          }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-neutral-500">Demo: messages are local-only.</div>
    </div>
  );
}

// -----------------------------
// App shell
// -----------------------------

export default function WashLinkDemo() {
  const [screen, setScreen] = useState<Screen>({ id: "landing" });
  const [threads, setThreads] = useState<Thread[]>(() => makeInitialThreads());
  const [toast, setToast] = useState<string | null>(null);

  const tab: TabId = screen.id === "main" ? screen.tab : screen.id === "landing" ? "browse" : "browse";

  const selectedCar = screen.id === "booking" ? CARS.find((c) => c.id === screen.carId) : undefined;
  const selectedDetailer =
    screen.id === "booking" && screen.detailerId ? DETAILERS.find((d) => d.id === screen.detailerId) : undefined;

  function gotoMain(nextTab: TabId) {
    setScreen({ id: "main", tab: nextTab });
  }

  function timestampNow() {
    const d = new Date();
    const hh = d.getHours();
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    return `Today · ${h12}:${mm} ${ampm}`;
  }

  function addBookingMessage(payload: { carId: string; detailerId?: string; when: string; notes?: string }) {
    const car = CARS.find((c) => c.id === payload.carId);
    const det = payload.detailerId ? DETAILERS.find((d) => d.id === payload.detailerId) : undefined;

    const providerName = det?.name ?? "WashLink Marketplace";
    const title = det ? providerName : "WashLink Booking";
    const threadId = det ? `booking-${det.id}` : `booking-${payload.carId}`;

    const msg = {
      id: `m-${Date.now()}`,
      from: "washlink" as const,
      text:
        `✅ Booking confirmed with ${providerName}.\n` +
        `Car: ${car?.displayName ?? payload.carId}\n` +
        `When: ${payload.when}` +
        (payload.notes ? `\nNotes: ${payload.notes}` : ""),
      ts: timestampNow(),
    };

    setThreads((prev) => {
      const existing = prev.find((t) => t.id === threadId);
      if (existing) {
        return prev.map((t) =>
          t.id === threadId
            ? {
                ...t,
                unread: t.unread + 1,
                subtitle: `Booking confirmed · ${payload.when}`,
                messages: [...t.messages, msg],
              }
            : t
        );
      }
      const newThread: Thread = {
        id: threadId,
        title,
        subtitle: `Booking confirmed · ${payload.when}`,
        unread: 1,
        messages: [msg],
      };
      return [newThread, ...prev];
    });
  }

  function openThread(threadId: string) {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)));
    setScreen({ id: "thread", threadId });
  }

  const activeThread = screen.id === "thread" ? threads.find((t) => t.id === screen.threadId) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-white">
      {/* Mobile-first stage: centered, constrained width, no phone frame */}
      <div className="mx-auto w-full max-w-[420px] px-4 py-6">
        <Header showActions={screen.id !== "thread" && screen.id !== "booking"} />

        <div className="mt-4">
          {screen.id === "landing" ? (
            <Landing onEnter={() => gotoMain("browse")} />
          ) : screen.id === "booking" && selectedCar ? (
            <BookingView
              car={selectedCar}
              detailer={selectedDetailer}
              onBack={() => gotoMain("cars")}
              onPickDetailer={(detailerId) => setScreen({ ...screen, detailerId })}
              onConfirm={(payload) => {
                addBookingMessage(payload);
                setToast("Booking confirmed — check your Inbox");
                gotoMain("inbox");
              }}
            />
          ) : screen.id === "thread" && activeThread ? (
            <ThreadView
              thread={activeThread}
              onBack={() => gotoMain("inbox")}
              onSend={(text) => {
                setThreads((prev) =>
                  prev.map((t) =>
                    t.id === activeThread.id
                      ? {
                          ...t,
                          messages: [...t.messages, { id: `u-${Date.now()}`, from: "user", text, ts: timestampNow() }],
                        }
                      : t
                  )
                );
              }}
            />
          ) : (
            <div className="space-y-4">
              <Tabs tab={tab} onChange={(t) => gotoMain(t)} />

              {screen.id === "main" && screen.tab === "browse" ? (
                <BrowseView
                  onBook={(detailerId) => {
                    // mobile demo default: book for first car
                    setScreen({ id: "booking", carId: CARS[0].id, detailerId });
                  }}
                />
              ) : null}

              {screen.id === "main" && screen.tab === "cars" ? (
                <MyCarsView
                  onSchedule={(carId) => {
                    setScreen({ id: "booking", carId });
                  }}
                />
              ) : null}

              {screen.id === "main" && screen.tab === "inbox" ? (
                <InboxView threads={threads} onOpen={openThread} />
              ) : null}
            </div>
          )}
        </div>

        {/* extra bottom space so toast never overlaps content on mobile */}
        <div className="h-10" />
        <Toast show={!!toast} text={toast ?? ""} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
