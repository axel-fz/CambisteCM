"use client";

import { useState } from "react";

interface RatingModalProps {
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

export default function RatingModal({ onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(5);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4"> <div className="w-full max-w-sm rounded-2xl border border-slate-100  bg-white  p-6 shadow-2xl transition-colors">
        <h3 className="text-lg font-bold text-slate-800 ">Notez l&apos;échange</h3> <p className="mt-2 text-sm text-slate-500 ">
          Comment s&apos;est déroulé l&apos;échange avec votre partenaire ?
        </p>

        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="group transition-transform hover:scale-110"
            >
              <span
                className={`material-symbols-outlined text-4xl transition-colors ${
                  star <= rating ? "fill-1 text-amber-500" : "text-slate-300 "
                }`}
              >
                star
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => onSubmit(rating)}
            className="inline-flex items-center justify-center rounded-xl bg-[#005129] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004322] "
          >
            Valider la note
          </button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 "
          >
            Passer cette étape
          </button>
        </div>
      </div>
    </div>
  );
}
