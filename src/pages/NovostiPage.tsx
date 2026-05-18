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

export default function NovostiPage() {
  const { data: posts, loading, error } = useNews(10);

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            Novosti iz kluba
          </h1>
          <p className="text-lg text-gray-500">
            Najnovije s naših Facebook stranica
          </p>
        </motion.div>

        {error && !loading && (
          <p className="text-center text-gray-500">
            Trenutno nema dostupnih novosti.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl overflow-hidden bg-white shadow-sm"
                >
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
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
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
