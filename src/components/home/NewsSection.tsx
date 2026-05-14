import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import { useNews } from "@/hooks/useHNSData";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsSection() {
  const { data: posts, loading, error } = useNews(6);

  // Don't render the section at all if there's an error or no data after load
  if (!loading && (error || posts.length === 0)) return null;

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Vijesti iz kluba
          </h2>
          <p className="text-lg text-gray-500">Najnovije s naših stranica</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))
            : posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.permalink_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                >
                  {post.full_picture && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.full_picture}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                      {formatDate(post.created_time)}
                    </p>
                    {post.message && (
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {post.message}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1 text-orange-500 text-xs font-semibold group-hover:text-orange-600 transition-colors">
                      <span>Pogledaj na Facebooku</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </motion.a>
              ))}
        </div>
      </div>
    </section>
  );
}
