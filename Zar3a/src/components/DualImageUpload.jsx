import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function DualImageUpload({ 
  label = "Upload Image",
  value = "", 
  onChange, 
  onFileChange,
  previewImage = "",
  placeholder = "Paste Image URL"
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="flex flex-col md:flex-row items-center gap-4">
        {(previewImage || value) && (
          <div className="w-24 h-24 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
            <img 
              src={previewImage || value} 
              alt="Preview" 
              className="w-full h-full object-cover animate-fade-in" 
            />
          </div>
        )}
        <div className="flex-1 w-full space-y-3">
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-2xl px-4 py-3.5 text-xs font-bold dark:text-white outline-none focus:border-green-500 transition-colors"
          />
          <div className="relative h-12 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition cursor-pointer">
            <span className="absolute text-[10px] font-bold text-gray-400 pointer-events-none">
              OR UPLOAD FILE (.JPG/.PNG)
            </span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={onFileChange}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
