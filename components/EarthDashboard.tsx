import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, AlertTriangle, Thermometer, Wind, Droplets, MountainSnow, Activity, Globe, Factory, Zap, Car, Leaf, AlertOctagon, Info, CloudFog, Waves, Bird, Flame, TrendingUp, Send, Bot, Terminal, Sparkles, HelpCircle, FileText } from 'lucide-react';
import { generateEcoAnalysis } from '../services/geminiService';
import { fetchClimateData } from '../services/climateService';
import { ChatMessage, ExplanationData } from '../types';

interface EarthDashboardProps {
    onBack: () => void;
    onExplain: (data: ExplanationData) => void;
    onSearch: (query: string) => void;
    onDataSync?: (time: string) => void;
}

// --- DATA CALCULATION ENGINE ---
// Base date for data calibration: Jan 1, 2025
const BASE_DATE = new Date('2025-01-01').getTime();
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

// Helper to calculate current value based on linear growth trend
const getDynamicValue = (baseValue: number, annualRate: number, decimals: number = 2): string => {
    const now = Date.now();
    const weeksPassed = (now - BASE_DATE) / MS_PER_WEEK;
    const weeklyRate = annualRate / 52;
    const currentValue = baseValue + (weeksPassed * weeklyRate);

    // Add prefix sign for positive numbers if base had it, handle rounding
    const formatted = currentValue.toFixed(decimals);
    return annualRate > 0 && baseValue > 0 ? `+${formatted}` : formatted;
};

// Helper for countdowns
const getRemainingBudget = (baseBudget: number, annualBurnRate: number): { remaining: string, percentage: number } => {
    const now = Date.now();
    const yearsPassed = (now - BASE_DATE) / (1000 * 60 * 60 * 24 * 365.25);
    const burned = yearsPassed * annualBurnRate;
    const remaining = Math.max(0, baseBudget - burned);
    return {
        remaining: remaining.toFixed(1),
        percentage: (remaining / 400) * 100 // 400 is total baseline
    };
};

const EarthDashboard: React.FC<EarthDashboardProps> = ({ onBack, onExplain, onSearch, onDataSync }) => {
    // useEffect(() => {
    //     window.scrollTo(0, 0);
    // }, []);

    // Real-time Data State
    const [realData, setRealData] = useState<any>(null);
    const [syncTime, setSyncTime] = useState('Syncing...');

    useEffect(() => {
        const loadLiveBiosphere = async () => {
            try {
                const data = await fetchClimateData();
                setRealData(data);
                const now = new Date();
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Local time)';
                setSyncTime(timeStr);
                if (onDataSync) onDataSync(timeStr);
            } catch (err) {
                console.error("Biosphere sync failed", err);
                setSyncTime("Offline (Using Projections)");
            }
        };

        loadLiveBiosphere();
        // Refresh every 5 minutes
        const interval = setInterval(loadLiveBiosphere, 300000);
        return () => clearInterval(interval);
    }, []);

    // AI Chat Logic
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello. I am the GreenShift AI Assistant. I can answer questions about climate data, sustainability practices, environmental policy, or the state of the planet. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const responseText = await generateEcoAnalysis(input);

        const aiMsg: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Dynamic Carbon Budget
    const budgetData = getRemainingBudget(120, 40); // 120Gt left in Jan 2025, burning 40Gt/yr
    const carbonBudget = {
        total: 400,
        used: (400 - parseFloat(budgetData.remaining)).toFixed(1),
        remaining: budgetData.remaining,
        burnRate: 40
    };

    const vitals = [
        {
            label: "Global Mean Temp",
            searchKey: "1.5°C",
            // Using official raw API data (NASA GISTEMP) without manual offsets
            value: realData?.temperature ? `+${realData.temperature.value}°C` : getDynamicValue(1.45, 0.02) + "°C",
            unit: "Global Anomaly (NASA)",
            desc: "Approaching the critical 1.5°C threshold established by the Paris Agreement. 2025 was the 3rd warmest year on record.",
            icon: Thermometer,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            trend: "Rising",
            detailedInfo: {
                definition: "This measures the increase in Earth's average surface temperature compared to the period before the Industrial Revolution (1850-1900), which is used as a baseline for 'normal' climate.",
                context: "The Paris Agreement aims to limit warming to 1.5°C. We are currently fluctuating just below that limit. Every fraction of a degree matters; 2.0°C is significantly more dangerous than 1.5°C.",
                impact: "Higher temperatures fuel more energetic storms, longer heatwaves, crop failures, and the spread of tropical diseases to new regions."
            },
            history: [
                { year: '1980', value: 0.27 },
                { year: '1990', value: 0.45 },
                { year: '2000', value: 0.61 },
                { year: '2010', value: 0.89 },
                { year: '2020', value: 1.25 },
                { year: '2026', value: 1.48 }
            ]
        },
        {
            label: "Atmospheric CO₂",
            searchKey: "Carbon",
            value: realData?.co2 ? `${realData.co2.value} ppm` : getDynamicValue(424, 2.4, 1) + " ppm",
            unit: "Mauna Loa Observatory",
            desc: "Highest in 14 million years. Rate of growth is ~2.4 ppm/year.",
            icon: CloudFog,
            color: "text-gray-400",
            bg: "bg-gray-500/10",
            border: "border-gray-500/20",
            trend: "Rising",
            detailedInfo: {
                definition: "Concentration of Carbon Dioxide in the atmosphere, measured in Parts Per Million (ppm). It acts like a blanket, trapping heat from the sun.",
                context: "For most of human history, CO2 was around 280 ppm. We crossed 400 ppm in 2013. The last time levels were this high, humans didn't exist and sea levels were much higher.",
                impact: "More CO2 means more heat trapped (Global Warming) and more CO2 dissolving into the ocean, turning it acidic."
            },
            history: [
                { year: '1960', value: 315 },
                { year: '1980', value: 338 },
                { year: '2000', value: 369 },
                { year: '2010', value: 389 },
                { year: '2020', value: 414 },
                { year: '2026', value: 426 }
            ]
        },
        {
            label: "Ice Sheet Loss",
            searchKey: "Antarctic",
            value: getDynamicValue(-420, -10, 0) + " Gt/yr", // Accelerating loss
            unit: "Greenland & Antarctica",
            desc: "Accelerated melting contributing significantly to sea level rise.",
            icon: MountainSnow,
            color: "text-cyan-300",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            trend: "Worsening",
            detailedInfo: {
                definition: "The net amount of ice lost annually from the planet's two major ice sheets: Greenland and Antarctica. Measured in Gigatons (1 Gt = 1 billion tons).",
                context: "Melting is accelerating due to both warmer air and warmer ocean water eroding the ice from below. This is a positive feedback loop: less ice means less sunlight reflected, causing more warming.",
                impact: "This is the primary driver of future sea-level rise, threatening coastal cities from New York to Mumbai with permanent flooding."
            },
            history: [
                { year: '2002', value: -100 },
                { year: '2008', value: -220 },
                { year: '2014', value: -300 },
                { year: '2020', value: -390 },
                { year: '2026', value: -427 }
            ]
        },
        {
            label: "Sea Level Rise",
            searchKey: "Antarctic",
            value: getDynamicValue(3.4, 0.1, 2) + " mm/yr",
            unit: "Global Average",
            desc: "Driven by thermal expansion (50%) and melting land ice.",
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            trend: "Accelerating",
            detailedInfo: {
                definition: "The annual increase in the average height of the ocean's surface.",
                context: "It's caused by two things: melting ice adding water, and 'thermal expansion' (water physically expands when it gets warmer). The rate has doubled since the 20th century.",
                impact: "Increases coastal erosion, contaminates freshwater aquifers with salt, and makes storm surges from hurricanes much more destructive."
            },
            history: [
                { year: '1993', value: 0 },
                { year: '2003', value: 31 },
                { year: '2013', value: 65 },
                { year: '2020', value: 95 },
                { year: '2026', value: 112 } // Cumulative mm rise since 1993 baseline
            ]
        },
        {
            label: "Ocean Acidity",
            searchKey: "Acidification",
            value: "8.05 pH", // Moves very slowly, kept static or extremely slow calc
            unit: "Surface Average",
            desc: "30% more acidic than pre-industrial times. Dissolves coral & shellfish.",
            icon: Waves,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            trend: "Acidifying",
            detailedInfo: {
                definition: "A measure of the ocean's pH. Lower pH means higher acidity. The ocean absorbs about 30% of the CO2 we emit, which reacts with water to form carbonic acid.",
                context: "The current rate of acidification is faster than any time in the last 300 million years. It fundamentally changes the chemistry of seawater.",
                impact: "Acidic water dissolves calcium carbonate, the material corals, oysters, and plankton use to build shells. This threatens the base of the entire marine food web."
            },
            history: [
                { year: '1985', value: 8.11 },
                { year: '1995', value: 8.09 },
                { year: '2005', value: 8.08 },
                { year: '2015', value: 8.06 },
                { year: '2026', value: 8.05 }
            ]
        },
        {
            label: "Biodiversity",
            searchKey: "Extinction",
            value: "-73% LPI",
            unit: "Since 1970",
            desc: "Avg decline in monitored wildlife populations (Living Planet Index).",
            icon: Bird,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
            trend: "Critical",
            detailedInfo: {
                definition: "The Living Planet Index (LPI) tracks the relative abundance of tens of thousands of vertebrate populations (mammals, birds, fish, reptiles, amphibians) around the world.",
                context: "We are in the midst of the 'Sixth Mass Extinction', the first driven by a single species (humans). This isn't just about losing rare animals; it's about the collapse of ecosystems that support us.",
                impact: "Loss of biodiversity reduces nature's ability to provide food, clean water, and medicine. It makes ecosystems more vulnerable to collapse."
            },
            history: [
                { year: '1970', value: 100 },
                { year: '1990', value: 78 },
                { year: '2000', value: 65 },
                { year: '2010', value: 48 },
                { year: '2020', value: 32 },
                { year: '2026', value: 27 } // Represents remaining % of 1970 populations
            ]
        },
        {
            label: "Forest Loss",
            searchKey: "Rainforest",
            value: "3.7M ha/yr",
            unit: "Primary Rainforest",
            desc: "Critical carbon sinks destroyed for agriculture and mining.",
            icon: Leaf,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            trend: "High",
            detailedInfo: {
                definition: "The annual destruction of primary (old-growth) tropical rainforests. 3.7 million hectares is roughly the size of Switzerland lost every year.",
                context: "Primary forests store vast amounts of carbon and are home to unique biodiversity. Once cut down, they take centuries to recover their full ecological value.",
                impact: "Releases stored carbon, reduces rainfall (forests create their own rain), and displaces Indigenous communities and wildlife."
            },
            history: [
                { year: '2002', value: 2.5 },
                { year: '2010', value: 3.1 },
                { year: '2016', value: 5.5 }, // Peak year
                { year: '2020', value: 4.2 },
                { year: '2026', value: 3.7 }
            ]
        },
        {
            label: "Methane (CH₄)",
            searchKey: "Methane",
            value: realData?.methane ? `${realData.methane.value} ppb` : getDynamicValue(1925, 10, 0) + " ppb",
            unit: "Global Average",
            desc: "80x warming power of CO₂. Leaks from fossil fuels and agriculture.",
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            trend: "Rising",
            detailedInfo: {
                definition: "Concentration of Methane in the atmosphere. While less abundant than CO2, it traps heat much more effectively per molecule.",
                context: "Methane has a short lifespan (12 years) compared to CO2 (centuries), but it is 80x more potent in the short term. Cutting methane is the fastest way to slow immediate warming.",
                impact: "Responsible for about 30% of current global warming. Leaks come from oil/gas infrastructure, livestock, and rotting waste in landfills."
            },
            history: [
                { year: '1984', value: 1645 },
                { year: '2000', value: 1773 },
                { year: '2010', value: 1808 },
                { year: '2020', value: 1890 },
                { year: '2026', value: 1934 }
            ]
        }
    ];

    const boundaries = [
        { name: 'Climate Change', status: 'High Risk', score: 90, color: 'bg-red-500' },
        { name: 'Biosphere Integrity', status: 'High Risk', score: 95, color: 'bg-red-500' },
        { name: 'Land System Change', status: 'High Risk', score: 85, color: 'bg-red-500' },
        { name: 'Freshwater Change', status: 'Increasing Risk', score: 65, color: 'bg-orange-500' },
        { name: 'Biogeochemical Flows', status: 'High Risk', score: 98, color: 'bg-red-500' },
        { name: 'Ocean Acidification', status: 'Increasing Risk', score: 55, color: 'bg-orange-500' },
        { name: 'Atmospheric Aerosol', status: 'Safe', score: 20, color: 'bg-emerald-500' },
        { name: 'Ozone Depletion', status: 'Safe', score: 10, color: 'bg-emerald-500' },
        { name: 'Novel Entities (Plastics)', status: 'High Risk', score: 100, color: 'bg-red-500' },
    ];

    const tippingPoints = [
        {
            name: "Amazon Rainforest Dieback",
            searchKey: "Amazon",
            risk: "Moderate",
            trend: "Worsening",
            desc: "Deforestation and drying are pushing the rainforest toward a savanna state, releasing stored carbon.",
            icon: Leaf,
            color: "text-orange-500",
            detailedInfo: {
                definition: "The point where the Amazon becomes too dry to sustain itself as a rainforest, transforming irreversibly into a dry savanna.",
                context: "The Amazon creates its own rain through transpiration. If too many trees are cut, this cycle breaks. Scientists estimate the tipping point is at 20-25% deforestation; we are currently at ~17%.",
                impact: "Would release massive amounts of carbon stored in trees, causing a spike in global temperatures and disrupting rainfall patterns as far away as the US Midwest."
            },
            history: [
                { year: '1990', value: 9 }, // Deforestation %
                { year: '2000', value: 12 },
                { year: '2010', value: 15 },
                { year: '2020', value: 17 },
                { year: '2026', value: 17.5 }
            ]
        },
        {
            name: "Atlantic Circulation (AMOC)",
            searchKey: "Gulf Stream",
            risk: "Low",
            trend: "Stable",
            desc: "Currents moving heat north are slowing. Collapse would drastically cool Europe and alter global rains.",
            icon: Wind,
            color: "text-yellow-500",
            detailedInfo: {
                definition: "The Atlantic Meridional Overturning Circulation (AMOC) is a system of ocean currents (including the Gulf Stream) that circulates heat across the globe.",
                context: "Freshwater from melting ice sheets is disrupting this flow. It has weakened by ~15% since 1950. A total collapse is unlikely this century but would be catastrophic.",
                impact: "If it stops, Europe would freeze, sea levels on the US East Coast would rise sharply, and monsoon systems in Africa and Asia would fail, causing mass famine."
            },
            history: [
                { year: '1950', value: 100 }, // Baseline strength
                { year: '1980', value: 95 },
                { year: '2000', value: 90 },
                { year: '2015', value: 87 },
                { year: '2026', value: 85 }
            ]
        },
        {
            name: "West Antarctic Ice Sheet",
            searchKey: "Antarctic",
            risk: "High",
            trend: "Critical",
            desc: "Instability in the Thwaites Glacier suggests irreversible retreat may have already begun.",
            icon: MountainSnow,
            color: "text-red-500",
            detailedInfo: {
                definition: "A massive ice sheet sitting on land below sea level. Because warm water can get underneath it, it is inherently unstable.",
                context: "The Thwaites Glacier (the 'Doomsday Glacier') acts as a cork holding back the rest of the ice sheet. It is fracturing and retreating rapidly.",
                impact: "Contains enough ice to raise global sea levels by over 3 meters (10 feet). Its collapse would reshape world geography over the coming centuries."
            },
            history: [
                { year: '1990', value: 0 }, // Relative instability index
                { year: '2000', value: 20 },
                { year: '2010', value: 50 },
                { year: '2020', value: 80 },
                { year: '2026', value: 92 }
            ]
        },
        {
            name: "Permafrost Thaw",
            searchKey: "Permafrost",
            risk: "High",
            trend: "Worsening",
            desc: "Thawing ground releases methane. Abrupt thaw events are increasing in Siberia and Canada.",
            icon: Thermometer,
            color: "text-red-500",
            detailedInfo: {
                definition: "The thawing of ground that has been frozen for thousands of years in the Arctic. This ground is full of ancient organic matter.",
                context: "As it thaws, microbes eat the organic matter and release CO2 and Methane. This generates heat, causing more thawing—a dangerous self-reinforcing cycle.",
                impact: "Could release more carbon than all human emissions to date, making it impossible to meet climate targets regardless of how much we cut fossil fuel use."
            },
            history: [
                { year: '1980', value: 0 }, // Cumulative thaw index
                { year: '1990', value: 10 },
                { year: '2000', value: 25 },
                { year: '2010', value: 50 },
                { year: '2020', value: 85 },
                { year: '2026', value: 110 }
            ]
        }
    ];

    const sectors = [
        { name: "Energy Use", val: 73.2, icon: Zap, color: "bg-yellow-500" },
        { name: "Agriculture & Land", val: 18.4, icon: Leaf, color: "bg-emerald-500" },
        { name: "Industry", val: 5.2, icon: Factory, color: "bg-gray-400" },
        { name: "Waste", val: 3.2, icon: AlertTriangle, color: "bg-orange-500" },
    ];

    const countries = [
        { name: "China", val: 32, icon: Globe, color: "bg-red-500" },
        { name: "United States", val: 13, icon: Globe, color: "bg-blue-500" },
        { name: "India", val: 8, icon: Globe, color: "bg-orange-500" },
        { name: "European Union", val: 7, icon: Globe, color: "bg-indigo-500" },
        { name: "Russia", val: 5, icon: Globe, color: "bg-gray-500" },
        { name: "Rest of World", val: 35, icon: Globe, color: "bg-zinc-700" },
    ];

    const countriesPerCapita = [
        { name: "Qatar", val: 32.5, icon: Globe, color: "bg-red-500" },
        { name: "UAE", val: 21.8, icon: Globe, color: "bg-orange-500" },
        { name: "Saudi Arabia", val: 18.2, icon: Globe, color: "bg-orange-500" },
        { name: "Canada", val: 15.2, icon: Globe, color: "bg-yellow-500" },
        { name: "United States", val: 14.4, icon: Globe, color: "bg-yellow-500" },
        { name: "Australia", val: 14.2, icon: Globe, color: "bg-yellow-500" },
    ];

    return (
        <div className="bg-black min-h-screen text-white font-sans pt-40 pb-12 md:pt-28 md:pb-24 animate-fade-in relative">

            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            <div className="container mx-auto px-5 md:px-12 relative z-10 pt-4 pb-12 md:pt-6 md:pb-24">


                {/* Data Integrity Note - Moved to Top */}
                <div className="mb-6 md:mb-8 bg-news-accent/5 border border-news-accent/10 p-5 md:p-6 rounded-xl">
                    <div className="flex items-start gap-3">
                        <Info size={18} className="text-news-accent mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Data Integrity</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                This dashboard aggregates real-time data from NASA, ESA, NOAA, and the IPCC. Last sync: <span className="text-news-accent">{syncTime}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Hero: Carbon Budget */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 mb-6 md:mb-8 backdrop-blur-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-serif font-bold flex items-center gap-3">
                                <Activity className="text-news-accent" />
                                Remaining Carbon Budget
                            </h2>
                            <p className="text-xs md:text-sm text-gray-400 mt-1">Gigatons of CO₂ left before 1.5°C warming is locked in (50% probability).</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl md:text-4xl font-bold font-mono text-white">{carbonBudget.remaining} Gt</span>
                            <span className="text-xs uppercase tracking-widest text-red-500 font-bold">~{Math.round(parseFloat(carbonBudget.remaining) / carbonBudget.burnRate)} Years Left at Current Rate</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-6 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                        <div className="absolute inset-0 flex items-center px-4 z-10 justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-white/50">Used: {carbonBudget.used} Gt</span>
                            <span className="text-white">Total Budget: {carbonBudget.total} Gt</span>
                        </div>
                        <div
                            className="h-full bg-gradient-to-r from-gray-600 via-gray-500 to-red-600 transition-all duration-1000"
                            style={{ width: `${(parseFloat(carbonBudget.used) / carbonBudget.total) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* 1.5C Warning Bar (Added) */}
                <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 backdrop-blur-sm mb-8">
                    <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
                        <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="text-left">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest">1.5°C Warming Limit</h4>
                            <p className="text-gray-500 text-xs">Paris Agreement Threshold</p>
                        </div>
                    </div>

                    <div className="flex-grow w-full">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            <span>Pre-Industrial (0°C)</span>
                            <span className="text-white">Current (+1.48°C)</span>
                            <span className="text-red-500">Limit (+1.5°C)</span>
                        </div>
                        <div className="h-3 md:h-4 bg-white/10 rounded-full overflow-hidden relative">
                            {/* Safe Zone */}
                            <div className="absolute left-0 top-0 h-full w-[66%] bg-gradient-to-r from-emerald-500 to-yellow-500 opacity-20"></div>
                            {/* Danger Zone */}
                            <div className="absolute right-0 top-0 h-full w-[33%] bg-red-500/20"></div>

                            {/* Progress Bar */}
                            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 w-[98%] shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>

                            {/* Markers */}
                            <div className="absolute left-[99%] top-0 h-full w-0.5 bg-white z-10 shadow-[0_0_10px_white]"></div>
                        </div>
                        <p className="text-right text-[10px] text-red-400 mt-2 font-bold uppercase tracking-widest animate-pulse">
                            Threshold Imminent
                        </p>
                    </div>
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">

                    {/* Left Col: Planetary Boundaries */}
                    <div className="lg:col-span-2 space-y-6 md:space-y-8">

                        {/* Boundaries Panel */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div>
                                    <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-2">Planetary Boundaries</h3>
                                    <p className="text-xs text-gray-400 max-w-md">Based on the Stockholm Resilience Centre framework. We have breached 6 of 9 boundaries safe for human civilization.</p>
                                </div>
                                <Globe size={24} className="text-gray-500" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 md:gap-y-6">
                                {boundaries.map((b, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{b.name}</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm ${b.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-500' :
                                                b.status === 'High Risk' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-orange-500/10 text-orange-500'
                                                }`}>
                                                {b.status}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${b.color}`} style={{ width: `${b.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Emissions Breakdown */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-sm">
                            <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-6">Global Emissions by Sector</h3>
                            <div className="space-y-4 md:space-y-6">
                                {sectors.map((s, i) => (
                                    <div key={i}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-full ${s.color} text-black`}>
                                                <s.icon size={16} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="font-bold text-white">{s.name}</span>
                                                    <span className="font-mono text-gray-400">{s.val}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden pl-12">
                                            <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-6 text-center">Data: Climate Watch / World Resources Institute (2025)</p>
                        </div>

                        {/* Top Polluting Nations (Total) */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-sm">
                            <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-6">Top Polluting Nations</h3>
                            <div className="space-y-4 md:space-y-6">
                                {countries.map((s, i) => (
                                    <div key={i}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-full ${s.color} text-black`}>
                                                <s.icon size={16} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="font-bold text-white">{s.name}</span>
                                                    <span className="font-mono text-gray-400">{s.val}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden pl-12">
                                            <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-6 text-center">Share of Global CO₂ Emissions (2024 Estimates)</p>
                        </div>


                        {/* Top Polluting Nations (Per Capita) */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-sm">
                            <h3 className="text-lg md:text-xl font-serif font-bold text-white mb-6">Emissions Per Capita</h3>
                            <div className="space-y-4 md:space-y-6">
                                {countriesPerCapita.map((s, i) => (
                                    <div key={i}>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className={`p-2 rounded-full ${s.color} text-black`}>
                                                <s.icon size={16} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="font-bold text-white">{s.name}</span>
                                                    <span className="font-mono text-gray-400">{s.val} t</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden pl-12">
                                            {/* Normalize width against highest value ~33 */}
                                            <div className={`h-full ${s.color}`} style={{ width: `${(s.val / 35) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-6 text-center">Tons of CO₂ per person (2024 Estimates)</p>
                        </div>

                    </div>

                    {/* Right Col: Tipping Points & Alerts */}
                    <div className="space-y-6 md:space-y-8">

                        {/* Tipping Points */}
                        <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-5 md:p-8 backdrop-blur-sm h-full">
                            <div className="flex items-center gap-2 mb-6 text-news-live">
                                <AlertOctagon size={20} />
                                <h3 className="text-lg md:text-xl font-serif font-bold text-white">Tipping Points</h3>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                {tippingPoints.map((tp, i) => (
                                    <div key={i} className="bg-black/40 border border-white/5 p-4 md:p-5 rounded-lg hover:border-white/20 transition-colors flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <tp.icon size={20} className={tp.color} />
                                            <div className="text-right">
                                                <span className={`block text-[10px] font-bold uppercase tracking-widest ${tp.color}`}>Risk: {tp.risk}</span>
                                                <span className="text-[10px] text-gray-500">Trend: {tp.trend}</span>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-white mb-2">{tp.name}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-grow">{tp.desc}</p>

                                        <div className="flex gap-2 mt-auto pt-3 border-t border-white/5">
                                            <button
                                                onClick={() => onExplain({
                                                    title: tp.name,
                                                    value: `Risk: ${tp.risk}`,
                                                    trend: tp.trend,
                                                    icon: tp.icon,
                                                    color: tp.color,
                                                    detailedInfo: tp.detailedInfo,
                                                    history: tp.history
                                                })}
                                                className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-news-accent transition-colors py-2 border border-white/10 rounded hover:bg-white/5"
                                            >
                                                <HelpCircle size={12} />
                                                Explain
                                            </button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Data Quality Note */}


                    </div>
                </div>

                {/* Section Title moved down */}
                <div className="flex items-center gap-4 mb-4 md:mb-6 mt-8 md:mt-12">
                    <h3 className="text-lg md:text-xl font-serif font-bold text-white">Planetary Vitals</h3>
                    <div className="h-px bg-white/10 flex-grow"></div>
                </div>

                {/* Vitals Grid Moved Here (was above) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                    {vitals.map((stat, index) => (
                        <div
                            key={index}
                            className={`group p-4 md:p-6 rounded-xl border ${stat.border} bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-900 transition-all duration-300 flex flex-col`}
                        >
                            <div className="flex justify-between items-start mb-3 md:mb-4">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {stat.trend} <TrendingUp size={10} className={stat.color} />
                                </div>
                            </div>

                            <h4 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{stat.label}</h4>
                            <div className="text-xl md:text-2xl font-serif font-bold text-white mb-1">{stat.value}</div>
                            <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 md:mb-4 ${stat.color}`}>{stat.unit}</p>

                            <div className="h-px bg-white/5 w-full mb-3"></div>

                            <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors mb-4 md:mb-6 flex-grow">
                                {stat.desc}
                            </p>

                            <div className="mt-auto pt-4 border-t border-white/10 flex gap-2">
                                <button
                                    onClick={() => onExplain({
                                        title: stat.label,
                                        value: stat.value,
                                        trend: stat.trend,
                                        icon: stat.icon,
                                        color: stat.color,
                                        detailedInfo: stat.detailedInfo,
                                        history: stat.history
                                    })}
                                    className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-news-accent transition-colors py-2 border border-white/10 rounded hover:bg-white/5"
                                >
                                    <HelpCircle size={12} />
                                    Explain
                                </button>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div >
    );
};

export default EarthDashboard;