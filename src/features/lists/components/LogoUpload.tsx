import { useRef } from 'react'

interface LogoUploadProps {
  currentUrl: string | null
  onFile: (file: File) => void
}

export default function LogoUpload({ currentUrl, onFile }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className="w-[70px] h-[70px] rounded-xl border-[1.5px] border-dashed border-[#2a2a2a] flex items-center justify-center cursor-pointer overflow-hidden shrink-0 transition-[border-color] duration-150 hover:border-primary"
      onClick={() => inputRef.current?.click()}
    >
      {currentUrl ? (
        <img src={currentUrl} alt="logo" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-[#555] text-[0.65rem]">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Logo</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
