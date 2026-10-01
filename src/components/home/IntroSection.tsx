import { motion } from "motion/react";
import Button from "../ui/Button";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function IntroSection() {
  const { text } = useSiteContent("home_intro");
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-lg text-gray-600 leading-relaxed">
            {text}
          </p>
          <Button href="/team" variant="primary" size="lg" className="mt-8">
            Upoznaj ekipu
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
