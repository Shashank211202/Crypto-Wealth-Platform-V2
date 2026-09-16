const ProofModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300" onClick={onClose}>
             <div className="relative max-w-4xl w-full group" onClick={e => e.stopPropagation()}>
                <img 
                    src={imageUrl} 
                    alt="Payment Proof" 
                    className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl shadow-crypto-accent/20"
                />
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full shadow-xl hover:scale-110 transition-transform font-bold"
                >✕</button>
                <div className="absolute inset-x-0 -bottom-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-gray-400 text-xs font-medium">Payment Confirmation Screenshot</p>
                </div>
             </div>
        </div>
    );
};

export default ProofModal;
