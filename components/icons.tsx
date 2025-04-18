import type { LightbulbIcon as LucideProps } from "lucide-react"

export function ThumbTackIcon(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8a2 2 0 1 1 3.3 1.5L10 20l-1-1 5.3-10.5A2 2 0 0 1 12 8Z" />
      <path d="M16 2s.5 2 2 3c1.5 1 3 .5 3 .5s-.5 2-2 3c-1.5 1-3 .5-3 .5" />
      <path d="M10 6s-2 .5-3 2c-1 1.5-.5 3-.5 3s-2-.5-3-2c-1-1.5-.5-3-.5-3" />
    </svg>
  )
}
