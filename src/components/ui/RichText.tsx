import { splitBold } from '@/lib/content'

export default function RichText({ text, boldClassName }: { text: string; boldClassName?: string }) {
  return (
    <>
      {splitBold(text).map((part, i) =>
        part.bold ? (
          <strong key={i} className={boldClassName}>
            {part.text}
          </strong>
        ) : (
          part.text
        ),
      )}
    </>
  )
}
