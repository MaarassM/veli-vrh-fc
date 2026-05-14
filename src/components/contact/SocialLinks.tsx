import { motion } from "motion/react";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { contactInfo } from "@/data/contact";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

const socialColors = {
  facebook: "bg-[#1877F2] hover:bg-[#0C63D4]",
  instagram:
    "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90",
  twitter: "bg-[#1DA1F2] hover:bg-[#0C8BD9]",
  youtube: "bg-[#FF0000] hover:bg-[#CC0000]",
};

export default function SocialLinks() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Društvene mreže"
          subtitle="Pratite nas na društvenim mrežama za najnovije vijesti, rezultate i fotografije"
        />

        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {contactInfo.socialLinks.map((link, index) => {
            const Icon = socialIcons[link.platform];
            const colorClass = socialColors[link.platform];

            return (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`group flex flex-col items-center gap-4 p-8 rounded-2xl text-white shadow-lg transition-all ${colorClass} w-48`}
              >
                <Icon className="w-12 h-12" strokeWidth={1.5} />
                <span className="font-display font-semibold text-lg">
                  {link.label}
                </span>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  Pratite nas
                </span>
              </motion.a>
            );
          })}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        ></motion.div>
      </div>
    </section>
  );
}
