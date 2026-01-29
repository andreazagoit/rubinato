'use client';

interface CreditsScreenProps {
    result: 'win' | 'lose';
    onBackToMenu: () => void;
}

export function CreditsScreen({ result, onBackToMenu }: CreditsScreenProps) {
    const isWin = result === 'win';

    const creditsList = [
        { role: "Sviluppo", name: "LoSviluppatorediTwitch & Claude Opus" },
        { role: "Immagini", name: "Nano Banana" },
        { role: "Design", name: "Nessuno (avete visto del design?? io no)" },
        { role: "Musica", name: "Suno.AI" },
        { role: "Calcolo Collisioni", name: "Genio Matematico" },
        { role: "Abusato", name: "Rubino" },
        { role: "Traditore", name: "Grenbaud" },
    ];

    return (
        <div className="w-full h-screen bg-black text-white flex overflow-hidden font-mono animate-fade-in">
            {/* Sidebar: Status & Message */}
            <div className={`w-1/3 h-full flex flex-col justify-center p-12 relative border-r-2 ${isWin ? 'border-green-800 bg-green-950/20' : 'border-red-900 bg-red-950/20'}`}>
                <h1 className={`text-6xl md:text-7xl font-black uppercase mb-6 tracking-widest break-words ${isWin ? 'text-green-500' : 'text-red-600'}`}>
                    {isWin ? 'Fugito.' : 'Rubinato.'}
                </h1>

                <p className="text-zinc-400 text-lg md:text-xl tracking-wider leading-relaxed mb-12">
                    {isWin
                        ? "Sei riuscito a scappare con i documenti. La verità è salva... per ora."
                        : "Non sei riuscito a sfuggire all'oscurità. I segreti rimangono sepolti."
                    }
                </p>

                <button
                    onClick={onBackToMenu}
                    className={`px-8 py-4 border-2 font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-black ${isWin ? 'border-green-600 text-green-500' : 'border-red-600 text-red-500'
                        }`}
                >
                    Torna al Menu
                </button>
            </div>

            {/* Main Content: Credits List */}
            <div className="w-2/3 h-full overflow-y-auto p-12 flex flex-col justify-center">
                <h2 className="text-4xl font-bold mb-12 uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-4">
                    Riconoscimenti
                </h2>

                <div className="grid grid-cols-1 gap-8">
                    {creditsList.map((credit, index) => (
                        <div key={index} className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-8 group">
                            <span className="text-zinc-500 uppercase tracking-widest text-sm w-48 shrink-0 group-hover:text-zinc-300 transition-colors">
                                {credit.role}
                            </span>
                            <span className="text-white text-xl md:text-2xl font-bold tracking-wide group-hover:text-red-500 transition-colors">
                                {credit.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
